import { Argv, Command, Context, Dict, Session, Time, User } from 'koishi'
import { adminUser } from '@koishijs/helpers'
import {} from '@koishijs/plugin-help'
import { printTime, Today, yundata } from "../index"

declare module 'koishi' {
	interface User{
		timers:Dict<number>;
	}
	namespace Command {
		interface Config{
			usageName?: string;
			maxUsage?:	Computed<number>;
			minInterval?: Computed<number>;
		}
	}
	namespace Argv {
		interface OptionConfig {
			notUsage?: boolean
		}
	}
}

export default function RateLimit(ctx: Context) {
	ctx.i18n.define('zh', require('../locales/zh'))
	ctx.model.extend("user",{
		timers:"json"
	})
		
	// add user fields
	ctx.before('command/attach-user', ({ command, options = {} }, fields) => {
		if (!command) return
		const { maxUsage, minInterval } = command.config
		let shouldFetchUsage = !!(maxUsage || minInterval)
		for (const { name, notUsage } of Object.values(command._options)) {
			if (name in options && notUsage) shouldFetchUsage = false
		}
		if (shouldFetchUsage) {
			if (minInterval) fields.add('timers')
		}
	})

	//check user
	ctx.before("command/execute", (argv: Argv<'timers'>) => {
		const{ session, options, command} = argv

		if(!session || !command	|| !session?.user|| (options && options?.help)) return;

		let isUsage = true
		if(options){
			for(const{ name, notUsage } of Object.values(command._options)){
				if(name in options && notUsage) isUsage = false
			}			
		}
		if(!isUsage) return;
		
		const minInterval = command.getConfig("minInterval", session)
		const maxUsage = command.getConfig("maxUsage", session);
		
		//没有设置的情况立刻返回。
		if(!maxUsage && !minInterval) return;
		//在小昀处于休息/修炼状态时不会做后续处理。
		if(yundata.isBusy) return;

		const uid = session.userId ?? ""
		const comname = getUsageName(command)

		//maxUsage不做计数处理。只在指令释放前进行提醒。
		if(maxUsage && !ComUsage(uid, comname, maxUsage)){
			return sendHint('maxUsage', comname)
		}

		//计时器的运作。
		if(minInterval && checkTimer(comname, session.user, minInterval)){
			let left = getLeftTime(comname, session.user, minInterval)
			return sendHint('Timer', comname, left)
		}

	ctx.command("指令记录","显示指令的次数记录",{ minInterval: Time.minute, authority:1 })
		.alias('usage').alias('mylogs')
		.option('clear','-c', { notUsage: true, authority: 4 })
		.option('set','-s',{ notUsage:true, authority: 4 })
		.option('key','-k <key>',{value:''})		
		.option('var','-v <value>',{ value: 0 ,notUsage:true, authority:4 })
		.userFields(['authority','name'])
		.use(adminUser)
		.action( async ({ session, options }) =>{
			if(!session?.user) return;
			const { user } = session
			const uid = session.userId ?? ""
			const t = Today.getUser(uid, user.name)

			if(options?.clear && Object.keys(t.usage).length ){
				t.usage = {}
				await Today.save()
				return '已清除使用记录。'
			}

			if(options?.set){
				if(!options.var || !options.key) return '缺少需要的参数。';
				t.usage[options.key] = options.var
				return `指令${options.key}已设置使用次数：${options.var}`
			}

			let usage = Today.getUser(uid, user.name);
			let txt:Array<any> = [], msg;
			if(Object.keys(usage).length > 0){
				for(let i in usage){
					let t = `· ${i}： ${usage[i]}`;
					txt.push(t)
				}
				msg = `${user.name}的指令记录：\n${txt.join('\n')}`;
			}
			else{
				msg = `@${user.name} ……嗯，没找到记录呢。`;
			}
			session.sendQueued(msg);
			return;
		})
	
	ctx.command("计时器 [key] [value:date]","显示指令的冷却CD",{ authority: 1} )
		.alias('checkTimer')
		.shortcut('ctimer')
		.option('clear','-c', { authority:4 })
		.option('set','-s',{ authority:4 })
		.userFields(['authority','timers','name'])
		.use(adminUser)
		.action(({ session, options }, name, value)=>{
			if(!session || !session.user) return;
			const { user } = session

			if(options?.clear && user){
				name? delete user.timers[name] : user.timers = {}
				return '计时器已清空'
			}

			if(options?.set && user){
				if(!value) return '缺少需要的参数。'
				user.timers[name] =+ value
				return `${name}的计时器已设置：${value}`
			}

			const now = Date.now()
			if(name && user){
				const delta = user.timers[name] - now
				if(delta > 0) return session.text('.present',[name, delta])
				return session.text('.absent', [name])
			}

			const output: string[] = []
			for(const name of Object.keys(user.timers).sort()){
				if(name.startsWith('_')) continue;
				output.push(session.text('.item',[name,user.timers[name]-now]))
			}
			if(!output.length) return session.text('.none')
			output.unshift(session.text('.list',[user.name]))
			return output.join('\n')
		})
	})

	//extend command help
	ctx.on('help/command', (output, command, session: Session<'timers' | 'name'>) => {
		if(!session.user) return

		const name = getUsageName(command)
		const maxUsage = command.getConfig('maxUsage', session) ?? 0
		const minInterval = command.getConfig('minInterval', session) ?? 0
		const uid = session.userId ?? ""

		if(maxUsage > 0){
			const usage = getUsage(name, uid, session.user.name)
			output.push(`已使用次数： ${usage}/${maxUsage}`)
		}

		if(minInterval > 0){
			const due = session.user.timers[name]
			const left =  due ? (Math.max(0, due - Date.now()) / 1000).toFixed() : 0
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

export function ComUsage(uid:string, str: string, limit: number) {
	let t = Today.get(uid);
	if (!t.usage[str]) t.usage[str] = 0;
	if (t.usage[str] >= limit) return false;
	//console.log(today.usage)
	return true;
}

export function setUsage(uid: string, str: string) {
	let t = Today.get(uid);
	
	if (!t.usage[str]) t.usage[str] = 0;
	t.usage[str]++;
	
	console.log(t.usage);
	Today.save()
}


function getUsage(comname:string, uid:string, username: string){
	let t = Today.getUser(uid, username)
	if(!t?.usage[comname]){
		t.usage[comname] = 0
	}
	return t?.usage[comname]
}

function getLeftTime(name:string, { timers }: Pick<User, 'timers'>, minInterval){
	const now = Date.now()
	if(now <= timers[name]){
		return timers[name] - now
	}
	else{
		return minInterval
	}
}

function checkTimer(name: string, { timers }: Pick<User, 'timers'>, offset?: number) {
	const now = Date.now()

	if (!(now <= timers._date)) {
		for (const key in timers) {
			if (now > timers[key]) delete timers[key]
		}
		timers._date = now + Time.day
	}

	if (now <= timers[name]) return true

	if (offset !== undefined) {
		timers[name] = now + offset
	}
}

export function getUsageName(command: Command){
	return command.config.usageName || command.name
}

function sendHint( type, command, time?):string{
	let leftime = printTime(time)
	const MaxUsage = {
		'每日签到':'……今天已经打过卡了。',
		'修炼':'……仙路漫漫长，生命有限，每天最多能修炼五次而已……',
		'突破':'……仙路漫漫长，灵气有限，每天最多能尝试突破三次而已……',
		'修习心法':'……欲速则不达，心法的修习一天最多三次而已……',
		'陪同修炼':'……够了吧？（一天只能两次）',
		'共同突破':'……够了吧？（一天只能两次）',
		'抽签':'……抽签问卦要心诚才灵，不是抽多几次就好的。（所有签加起来一天最多三次）'
	}

	const Timer = {
		'修炼':`……你已经在修炼中了。\n距离这次修炼完毕还有:${leftime}`,
		'突破':`……你还没准备好下一次突破。\n距离灵气恢复还有：${leftime}`,
		'修习心法':`……你已经在修习中了。\n距离这次修习完毕还有：${leftime}`,
		'陪同修炼':`……我累了，先让我休息休息吧。\n距离下次邀请时间：${leftime}`,
		'共同突破':`……我累了，先让我休息休息吧。\n距离下次邀请时间：${leftime}`,
	}

	if(type == 'maxUsage') return MaxUsage[command] ?? `……已超过次数了。`;
	if(type == 'Timer') return Timer[command] ?? `……剩余冷却时间：${leftime}`;
	
	return `未知错误：t${type},c${command},t${time}`
}
