import { Argv, Command, Context, Dict, Session, Time, User } from 'koishi'
import { adminUser } from '@koishijs/helpers'
import {} from '@koishijs/plugin-help'
import { Yun, printTime, setUsage, MaxUsage, TimerRes, textp, LongActRes, FinishAction, bot, getUser, waitTime } from '../unit';

declare module 'koishi' {
	namespace Command {
		interface Config{
			usageName?: string;
			maxUsage?:	Computed<number>;
			minInterval?: Computed<number>;
			longAction?: Computed<number>;
			system?: boolean;
		}
	}
	namespace Argv {
		interface OptionConfig {
			notUsage?: boolean
		}
	}
}

export function RateLimit(ctx: Context) {
	ctx.i18n.define('zh', require('../locales/zh'))

	ctx.command("mylogs [key] [value:posint]","-指令记录  显示指令的次数记录", { authority:1, usageName:'指令记录' , system:true })
		.alias('指令记录')
		.shortcut(/我(今天|今日)都{0,1}(做了|做|干|干了)(什么|啥)\S{0,2}$/,{prefix:true})
		.option('clear','-c', { authority: 4 })
		.option('set','-s',{ authority: 4 })
		.userFields(['authority','name', 'daily'])
		.action( async ({ session, options }, name, value) =>{
			if(!session?.user) return '没有用户资料';
			const { daily } = session.user
			const { usage } = daily;

			setUsage('指令记录', session.user);

			if(options?.clear && Object.keys(usage).length ){
				daily.usage = {}
				await session.user.$update()
				return '已清除使用记录。'
			}

			if(options?.set){
				if(!name|| !value) return '缺少需要的参数。';
				usage[name] = value
				
				return `指令${name}已设置使用次数：${value}`
			}

			let txt:Array<any> = [], msg;
			if(Object.keys(usage).length > 0){
				for(let i in usage){
					let t = `· ${i}： ${usage[i]}`;
					txt.push(t)
				}
				msg = `${session.user.name}的指令记录：\n${txt.join('　|　')}`;
			}
			else{
				msg = `@${session.user.name} ……嗯，没找到记录呢。`;
			}
			return msg;
		})
	
	ctx.command("cdtimer [key] [value:date]","-计时器  显示指令的冷却CD",{ authority: 1, usageName:"计时器", system:true } )
		.alias('计时器')
		.shortcut(/(还有多久|什么时候|啥时候|何时)(能|可以){0,1}(\S+)(啊？|呀？){0,1}$/,{args:['$3'], prefix:true})
		.option('clear','-c', { authority:4 })
		.option('set','-s',{ authority:4 })
		.userFields(['authority','daily','name'])
		.use(adminUser)
		.action(async({ session, options }, name, value)=>{
			if(!session || !session.user) return;
			const { user } = session

			if(options?.clear && user.authority >= 4){
				name? delete user.daily.timer[name] : user.daily.timer = {}
				return '计时器已清空'
			}

			if(options?.set && user.authority >= 4){
				if(!value) return '缺少需要的参数。'
				user.daily.timer[name] =+ value
				return `${name}的计时器已设置：${value}`
			}

			const now = Date.now()
			setUsage('计时器',session.user);

			if(name && user){
				const delta = user.daily.timer[name] - now
				if(delta > 0) return session.text('.present',[name, delta])
				return session.text('.absent', [name])
			}

			const output: string[] = []
			for(const name of Object.keys(user.daily.timer).sort()){
				if(name.startsWith('_')) continue;
				output.push(session.text('.item',[name,user.daily.timer[name]-now]))
			}
			if(!output.length) return session.text('.none')
			output.unshift(session.text('.list',[user.name]))
			return output.join('\n')
	})

	//extend command help
	ctx.on('help/command', (output, command, session: Session<'daily' | 'name'>) => {
		if(!session.user) return

		const name = getUsageName(command)
		let maxUsage = command.getConfig('maxUsage', session) ?? 0 
		let minInterval = command.getConfig('minInterval', session) ?? 0

		if(maxUsage > 0){
			const usage = getUsage(name, session.user)

			if(session.platform !== 'onebot') maxUsage += 1;

			output.push(`已使用次数： ${usage}/${maxUsage}`)
		}

		if(minInterval > 0){
			const due = session.user.daily.timer[name]
			const left =  due ? (Math.max(0, due - Date.now()) / 1000).toFixed() : 0
			
			if(session.platform !== 'onebot') minInterval /= 2

			output.push(`剩余冷却时间： ${left}/${Math.floor(minInterval/1000)}秒`)
		}

	})

	// extend command option
	ctx.on('help/option', (output, option, command, session) => {
		const maxUsage = command.getConfig('maxUsage', session)
		if (option.notUsage && maxUsage !== Infinity) {
			output += session.text('internal.option-not-usage')
		}
		return output
	})

}

//------------------- PluginEnd --------------------------------->>

export function ComUsage({daily}:Pick<User, 'daily'>, str: string, limit: number) {

	if (!daily.usage[str]) daily.usage[str] = 0;
	if (daily.usage[str] >= limit) return false;

	daily.usage[str]++
	console.log(daily.usage)
	
	return true;
}

export function getUsage(comname:string, {daily}:Pick<User, 'daily'>){
	if(!daily.usage[comname]){
		daily.usage[comname] = 0
	}
	return daily.usage[comname]
}

export function getLeftTime(name:string, { daily }: Pick<User, 'daily'>, minInterval){
	const now = Date.now()
	if(now <= daily.timer[name]){
		return daily.timer[name] - now
	}
	else{
		return minInterval
	}
}

export function checkTimer(name: string, { daily }: Pick<User, 'daily'>, offset?: number) {
	const now = Date.now()

	if (!(now <= daily.timer._date)) {
		for (const key in daily.timer) {
			if (now > daily.timer[key]) delete daily.timer[key]
		}
		daily.timer._date = now + Time.day
	}

	if (now <= daily.timer[name]) return true

	if (offset !== undefined) {
		daily.timer[name] = now + offset
	}
}

export function getUsageName(command: Command){
	return command.config.usageName || command.name
}

export function checkLongAction({ daily }:Pick<User,'daily'>){

	if(daily?.stats.com === 'free') return 'free';
	
	const now = Date.now()
	if(now < daily?.stats?.due) return 'busy';
	else return 'finish';
}

export function checkUsageEvent( session:Session<'daily'|'game'>, options, command:Command ){
	if( !command || (options && options?.help)) return;
	
	const { daily } = session.user
	let isUsage = true
	if(options){
		for(const{ name, notUsage } of Object.values(command._options)){
			if(name in options && notUsage) isUsage = false
		}			
	}
	if(!isUsage) return;

	let minInterval = command.getConfig("minInterval", session)
	let maxUsage = command.getConfig("maxUsage", session);
	let longAction = command.getConfig("longAction", session);
	const yunAction = command.getConfig("yunAction", session);
	const system = command.getConfig('system',session);
	const notQQ = command.getConfig('notQQ', session);
	const comname = getUsageName(command)

	//如果设置为系统指令，则直接返回。
	if(system || command.name == 'help') return;

	if(notQQ && session.platform == 'onebot'){
		return '当前平台不能使用。'
	}

	//处于持续动作间直接返回对应情景与倒计时。
	if( checkLongAction(session.user) == 'busy' ){
		const now = Date.now()
		const left = daily.stats.due - now
		return sendHint(session, 'longterm', daily.stats.com, left)

	//如果动作刚好结束了，则返回完成提示，到对应的指令下领取结果。
	//只用settimeout的话，怕会出什么奇怪的问题……？
	}else if( checkLongAction(session.user) == 'finish' && daily.stats.com != comname){
		return sendHint(session, 'finish', daily.stats.com)
	}

	//没有设置的情况立刻返回。
	if(!maxUsage && !minInterval && !longAction ) return;

	//在小昀处于休息/修炼状态时不会做后续处理。
	if( Yun.isBusy() ) return;

	//小昀的AP不足时
	if(yunAction && Yun.state.AP <= 0){
		return '呼啊……我累了……（路昀的AP不足了）'
	}

	//计数器的运作。指令中途取消时则恢复次数。
	if(maxUsage > 0){
		if(session.platform !== 'onebot') maxUsage += 1
		if(!ComUsage(session.user, comname, maxUsage)){
			return sendHint(session, 'maxUsage', comname)
		}
	}

	//计时器的运作。非QQ平台冷却时间缩短。
	if(minInterval > 0){
		minInterval = waitTime(minInterval)

		if(checkTimer(comname, session.user, minInterval)){
			let left = getLeftTime(comname, session.user, minInterval)
			return sendHint(session, 'Timer', comname, left)
		}
	}

	//长期动作的运作。中途取消时直接清除。非QQ平台的话，等待时间缩短。
	if( longAction > 0){
		longAction = waitTime(longAction);

		daily.stats.com = comname;
		daily.stats.due = Date.now() + longAction
		console.log(session.user.game.name, daily.stats)
		session.user.$update()
	}
}


export function sendHint( session:Session<'game'|'daily'>, type, command, time?):string{
	let leftime = printTime(time)
	const { daily, game } = session.user
	
	if(type == 'maxUsage')return MaxUsage[command] ?? `……已超过次数了。`;
	if(type == 'Timer'){
		if(TimerRes[command]){
			return textp(TimerRes[command], [leftime])
		}
		return `……剩余冷却时间：${leftime}`
	}
	if(type == 'longterm') return textp(LongActRes[command],[leftime])
	if(type == 'finish'){

		const retext = daily.stats.result

		daily.stats.com = 'free';
		daily.stats.due = -1;
		daily.stats.result = '';

		session.user.$update()

		if(FinishAction[command]){
			return textp(FinishAction[command],[retext, game.name])
		}
		else if(retext && retext.length){
			return retext
		}
		else{
			return `……${command}已经结束了。具体结果还是用.${command}检查吧。`
		}
	}
	
	return `未知错误：t${type},c${command},t${time}`
}

export async function clearStats(uid){
	const user = await getUser(uid)
	const { daily } = user
	daily.stats = {
		com: 'free',
		due: -1,
		result : ''
	}
	await bot.db.set('user', { userID: uid,}, { daily: user.daily})
}