import { Context, segment, Time } from 'koishi'
import { bot, Combat, CritType, DailyData, either, Game, getUser, intKan, setDaily } from '../unit'



export function PlayerCombat(ctx:Context){
	async function clearflag(uid){
		const user = await getUser(uid)
		user.daily.flag.pkTarget = null
		await setDaily(uid, user.daily)
	}

ctx.command('invitepk <target>','-切磋邀请 与同门弟子切磋',{ hidden:true})
	.alias('邀请切磋').alias('切磋邀请')
	.userFields(['userID','game','daily'])
	.action( async ({ session }, target) =>{

		const { userID, game, daily } = session.user
		const parsedTarget = target ? segment.parse(target)[0] : null;

		const tg = await checkTarget(parsedTarget)
		if(tg == 'not-user') return '【不存在切磋对象】'
		if(tg == 'not-player') return '【邀请对象不是游戏玩家】'

		//先清理双方残留的旧flag
		await clearflag(userID)
		await clearflag(tg.userID)

		if(game.AP <= 0 ) return `【${game.name}的行动点不足】`
		if(tg.game.AP <= 0) return `【${tg.game.name}的行动点不足】`

		daily.flag.pkTarget = tg.userID

		await session.user.$update()
		await setDaily(tg.userID, tg.daily)

		await session.send(
			`${game.name}对${tg.game.name}发出切磋邀请。\n被邀请方请输入 -回应切磋 @挑战方 则作为应答。应答后才开始切磋。`
		)

		return '已邀请，请等待对方应答。'
	
	})

ctx.command('startpk <target>','-应邀切磋 与同门弟子切磋',{ hidden:true })
	.alias('应邀切磋').alias('回应切磋')
	.userFields(['userID', 'game', 'daily'])
	.action( async ({ session }, target)=>{
		const { userID, game, daily } = session.user
		const parsedTarget = target ? segment.parse(target)[0] : null;

		const tg = await checkTarget(parsedTarget)
		if(tg == 'not-user') 
			return '【不存在切磋对象】';

		if(tg == 'not-player')
			return '【应邀对象不是游戏玩家】';

		if(userID !== tg.daily.flag.pkTarget )
			return '【你没有被对方邀请】';
		
		daily.flag.pkTarget = null; // 先清除flag以及扣除双方AP
		tg.daily.flag.pkTarget = null; //

		game.AP--
		tg.game.AP--

		let round = 1, pwin=0, twin=0, defeat
		const pid = session.userId
		const tid = tg.id

		const setRound = function(a:Game, b:Game){
			const round_A = pkfight(a,b)
			const round_B = pkfight(b,a)

			let admg = 0, bdmg = 0
			let txt = []

			if(round_A.win) admg += round_A.dmg;
			else bdmg += round_A.dmg;

			if(round_B.win) bdmg += round_B.dmg;
			else admg += round_B.dmg;

			txt[0] = round_A.msg;
			txt[1] = round_B.msg;

			txt[2] = `第${intKan(round)}回合最终结果：`
			if(admg > bdmg ){
				txt[2] += `${a.name}胜出。`
				pwin ++
			}
			else if(bdmg > admg){
				txt[2] += `${b.name}胜出。`
				twin ++
			}
			else{
				txt[2] += `双方平手。`
			}
			round ++
			return txt
		}
		
		for (let i=0; i<3; i++){
			let retxt = setRound(game, tg.game) //第一回合。
			await session.sendQueued(retxt[0],1000)
			await session.sendQueued(retxt[1],1000)
			await session.sendQueued(retxt[2],1000)
			
			let msg = [
				`【第${intKan(round-1)}回合结束。5秒后进入下一回合。】`,
				`【等待期间其中一方输入‘认输’可提前结束。】`,
			]
			await session.send(msg.join('\n'))
			let count=1
			const counter = setInterval(()=>{
				if(session.platform!=='onebot'){
					session.send('下一回合倒计时：'+(5-count))
				}
				count++
				if(count==5){
					clearInterval(counter)
					count = 0
				}
			},1000)
			
			const wait = ctx.middleware(async (session,next)=>{
					if(session.content.match('认输') && session.userId == pid){
						defeat = pid;
						session.send( `${game.name}已认输，${tg.game.name}获胜。`)
						wait()
					}
					if(session.content.match('认输') && session.userId == tid){
						defeat = tid;
						session.send(`${tg.game.name}已认输，${game.name}获胜。`)
					}
					console.log('PK流程进行中……')
					setTimeout(() => {
						clearInterval(counter)
						wait()
					}, Time.second*5);
			},true)	
			let answer = await session.prompt(Time.second*6)
			if(defeat){
				break
			}
		}

		if(!defeat){
			let txt = '最终结果：'
			if(pwin > twin){
				txt += `${game.name}胜出。`
				game.flag.pkwin ++
			}
			else if(twin > pwin){
				txt += `${tg.game.name}胜出。`
				tg.game.flag.pkwin ++
			}
			else txt += `双方平手。`
			session.send(txt)
		}
		else{
			if(defeat == pid) game.flag.pkwin ++;
			else if(defeat == tid) tg.game.flag.pkwin ++;
		}

		await clearflag(userID)
		await clearflag(tg.userID)

		await session.user.$update()
		await ctx.database.setUser(session.platform, tid, { game: tg.game })

		return '切磋已结束'

	})

async function checkTarget(parsedTarget){
	if(parsedTarget){
		const id = parsedTarget.data.id
		const user = await ctx.database.getUser(bot.pf, id)
		if (!user.game.signed) return 'not-player'

		const { userID, game, daily } = user
		
		return { userID, game, daily, id}
	}
	return 'not-user'
}

function pkfight(a:Game, b:Game){
	const fight = new Combat(a, b)
	const result = fight.NormalAtack()
	const { hit, fb, crit, dmg, shd, lstdmg, txt } = result

	let re ={
		msg:'',
		win:true,
		dmg:lstdmg ? lstdmg : 0,
	}

	let msg = `${a.name}对${b.name}试图攻击。`
	if(!hit){
		if(crit) msg += `\n${txt}并遭遇反击，并差点${b.name}对${a.name}造成${CritType[crit]}。`
		else msg += `\n可惜，${txt}。被${b.name}敏捷地躲开了。`

		if(fb){
			msg += `\n在${b.name}躲闪后，`
			msg += either(['一个巴掌呼过来，','一拳挥过来，','一个飞踢过来，','一个转身踹过来，'])
			msg += `在对${a.name}造成${lstdmg}点伤害之前，停了下来。`
		}
		re.win =false
		re.msg = msg
	}
	else{
		msg += txt
		if(crit) msg += `并差点对${b.name}打出了${CritType[crit]}。`
		msg += `\n然后在对${b.name}造成${lstdmg}点伤害之前，${a.name}停了下来。`

		re.win = true
		re.msg = msg
	}
	return re
}


}