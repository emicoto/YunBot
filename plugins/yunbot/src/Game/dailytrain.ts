import { Context, Time } from "koishi";
import { clearStats } from "../Plugin";
import { breakProces, Common, ComReply, FinishAction, Game, getBreakRate, LevelKan, LevelExp, Minds, txtp, random, resetUsage, Today, waitTime, Yun, YunReply, YunCom } from "../unit"

export function DailyTraining(ctx: Context){

	ctx.command('train','-修炼  进行日常修炼。',{ minInterval: Time.minute*10 , maxUsage:5, usageName:'修炼', signed: true, hidden:true})
		.alias('修炼')
		.shortcut(/我(\S){0,3}(去|要|得){0,2}修(炼|练)\S{0,2}(时间|时候){0,1}\S{0,6}$/,{ prefix:true })
		.shortcut(/^\S{0,3}(我|又到|到|开始)\S{0,3}(修炼|修练|修仙)的{0,1}(时间|时候)\S{0,5}$/)
		.userFields(['game','userID','daily','role'])
		.action( async ({ session })=>{
			const uid = session.user.userID
			const { game, role } = session.user
			const name = (game.nick ? game.nick : game.name)

			let txt = ComReply['单独修炼'](name,role)
			const rate = random(10000)

			if(rate < 30){
				txt += '\n修炼时一名师兄路过给了你些许指点，你顿时阔然开朗。下次的突破概率提升了2%!'
				game.flag.breakbuff += 2
			}

			if( Yun.trainCheck()){
				await session.send( txtp(YunCom['开始修炼'],[name]) )
				Yun.setYunTrain(session)
			}

			Today.data.totalwork++
			
			let retext = Game.getExp(game, 3,45)
			retext = txtp(FinishAction['修炼'],[retext, name])

			session.send(txt+'\n'+retext)

			/*daily.stats.result = Game.getExp(game, 3, 45)	
			const retext = daily.stats.result
			const time = waitTime(Time.minute*10)
			console.log(retext)
			
			setTimeout(async () => {
				await session.send(txtp(FinishAction['修炼'],[retext, name]))
				console.log('定时反馈')
				await clearStats(uid)
			}, time);
			
			return txt*/

		})

	
	ctx.command('learn', '-修习心法  进行主心法的修习。', { minInterval : Time.minute*10, maxUsage:3, usageName:'修习心法', signed: true, hidden:true })
		.alias('修习心法')
		.shortcut(/^我(\S){0,3}(去|要|得){1,2}修心法\S{0,8}$/,{ prefix:true })
		.shortcut(/^(我|又到|到)(\S){0,3}(修|练|修炼|修习)心法的(时间|时候)\S{0,5}$/)
		.userFields(['game','userID','daily'])
		.action(async({ session })=>{
			const uid = session.user.userID
			const { game, daily } = session.user
			const name =( game.nick ? game.nick :  game.name)

			if(game.level < 5) {
				await resetUsage(session, '修习心法', 1)
				return ComReply['等级不足：心法']
			}

			if(!game.core?.id){
				const text = txtp(ComReply['获取心法：上'].join('\n'),[name]);
				const pool = ['灵犀心法','灵空心法','灵虚心法'];
				const newCore = pool[random(2)];
				const text2 = txtp(ComReply['获取心法：下'].join('\n'),[name,newCore])

				game.core = Minds.get(newCore)
				await resetUsage(session, '修习心法', 1)

				session.send(text)
				session.sendQueued(text2)
				return;
			}

			const txt = txtp(ComReply['修习心法'].join('\n'),[name])
			let retext = Game.getExp(game,1,20) + '\n' + Minds.getExp(game)
			retext = txtp(FinishAction['修习心法'], [retext,name])

			let next
			
			if(random(100) < 50){
				next = Minds.levelUP(game.core)
			}

			if(next) retext += next
			
			session.send(txt+'\n'+retext)

			/*daily.stats.result = Game.getExp(game, 1, 20) +'\n'+ Minds.getExp(game)
			await session.user.$update()

			const time = waitTime(Time.minute*10)

			setTimeout(async() => {
				session.send(txtp(FinishAction['修习心法'],[daily.stats.result, name]))
				await clearStats(uid)
			}, time);
			
			return txt*/
		})
	
	ctx.command('break', '-突破  尝试突破境界。', { minInterval: Time.minute*10 , maxUsage:2, signed:true, hidden:true, usageName:"突破"})
		.alias('突破')
		.shortcut(/^我(准备){0,1}(要|该|得)突破\S{0,5}$/,{prefix:true})
		.shortcut(/^突破\S{0,2}$/,{prefix:false})
		.shortcut(/^((突破的(时候|时机)到了|(是时候|该)去{0,1}突破了))\S{0,3}$/,{prefix:false})
		.userFields(['userID','game','daily'])
		.action(async({ session })=>{
			const uid = session.user.userID
			const { game } = session.user
			const name = game.nick ?? game.name

			let txt = ComReply['单独突破'](name,uid);
			
			
			const goal = getBreakRate(game, uid)
			const rate = random(100)
			console.log(name, '突破概率', goal, '/',rate)

			if(game.exp >= LevelExp(game.level) && rate <= goal ){
				
				txt += txtp(ComReply['突破成功'],[LevelKan(game.level), LevelKan(game.level+1)])

				breakProces(game)
			}
			else{
				const exptxt = Game.setExp(game,1,10,true,true)

				txt += txtp(ComReply['突破失败'],[exptxt]);
			}
			await session.user.$update()

			return txt

		})
	
	ctx.command('yunTrain', '-陪同修炼  和路昀一起修炼', { minInterval: Time.hour/2, ignore:true,usageName:"陪同修炼", yunAction:true, hidden:true})
		.alias('陪同修炼').alias('共同修炼')
		.shortcut(/^(我们){0,1}(要不要){0,1}一起(去){0,1}修炼\S{0,4}$/,{prefix:true})
		.userFields(['daily','game','role'])
		.action( async ({ session })=>{
			const { game, role} = session.user
			const name = game.nick ?? game.name

			if(!game?.signed){
				await resetUsage(session, '陪同修炼')
				return Common['notsigned']
			}

			await session.send(`${game.name}向路昀提出了一起修炼的提议。\n`)

			let txt = YunReply['共同修炼：上'](name,role)

			await session.send(txt)

			const plretxt = Game.getExp(game, 5,60)
			const ynretxt = Game.getExp(Yun.state, 5, 60)

			txt = YunReply['共同修炼：下'](name,role)

			txt += '\n'+plretxt
			txt += '\n'+ynretxt

			Yun.setTrust(game, 1, 5)
			Yun.state.AP--
		
			await Yun.save()
			await session.user.$update()
			
			await session.send(txt)
			return

		})
	
	ctx.command('yunBreak','-共同突破  和路昀一起突破',{ minInterval: Time.hour/2, ignore:true, usageName:"共同突破", yunAction:true, hidden:true})
		.alias('共同突破')
		.shortcut(/^(我们){0,1}(要不要){0,1}一起(去){0,1}突破\S{0,4}$/, {prefix:true})
		.userFields(['daily','game', 'role','userID'])
		.action(async ({ session }) => {
			const { game, role, userID } = session.user
			const name = (game.nick ? game.nick : game.name)

			const isBreak = ( game.exp >= LevelExp(game.level))

			if(!game?.signed){
				await resetUsage(session, '共同突破')
				return Common['not-signed']
			}

			if( !Yun.isBreak() && !isBreak ){
				await resetUsage(session, '共同突破')
				return Common['not-the-time']
			}

			await session.send(`${game.name}向路昀提出了一起突破的提议。\n`)

			let txt = YunReply['共同突破：上'](name,role,
				( Yun.isBreak() && isBreak ? 'both'
				: Yun.isBreak() ? 'yun' : 'player'))
			
			await session.send(txt)

			txt = YunReply['共同突破：下'](name,role)

			const plrate = getBreakRate(game, userID) + random(5,12)
			const ynrate = getBreakRate(Yun.state, Yun.selfId) + random(5,12)

			const lv = [LevelKan(game.level),LevelKan(game.level+1)]
			const ylevel = Yun.state.level
			const ylv = [LevelKan(ylevel),LevelKan(ylevel+1)]

			const r = random(100)
			const yr = random(100)

			let getfavo = 0

			console.log(name,'突破', r,'/',plrate)
			console.log('路昀突破',yr,'/',ynrate)

			if( isBreak && Yun.isBreak() && r <= plrate && yr <= ynrate ){
				txt += txtp(YunReply['突破成功：同时'].join('\n'),[lv[0],lv[1],ylv[0],ylv[1]])+'\n'

				getfavo = random(5,10)
			}
			else{

				//双方都失败了。
				if( isBreak && Yun.isBreak && r > plrate && yr > ynrate ){
					txt += YunReply['突破失败：同时']+'\n'
				}

				//只有玩家成功了，或失败了。
				if( isBreak && r <= plrate){
					txt += '在路昀的见证下，'+txtp(ComReply['突破成功'],[lv[0],lv[1]])+'\n'

				}
				else if(isBreak){
					txt += txtp(YunReply['突破失败'],[ '你', '路昀' ])+'\n'
				}

				//只有小昀成功了，或失败了。
				if(Yun.isBreak() && yr<= ynrate ){
					const t = `在${name}的陪同下，`
					txt += txtp(YunCom['突破成功'].join('\n'), [ t, ylv[0], ylv[1] ])+'\n'
					getfavo = random(3)

				}
				else if(Yun.isBreak()){
					txt += txtp(YunReply['突破失败'],[ '路昀', '你'])+'\n'
				}

				if(yr > ynrate || r > plrate ){
					txt += `\n${Game.setExp(game, 5, 30)}`
					txt += `\n${Game.setExp(Yun.state, 5, 40)}`
				}
				
			}

			if(isBreak && r <= plrate) breakProces(game);
			if(Yun.isBreak() && yr <= ynrate ) breakProces(Yun.state);
			
			Yun.state.AP--
			
			if(getfavo){
				txt+= '\n路昀对你的好感增加了点。'
				Yun.setFavo(game,getfavo)
			}

			txt += '\n路昀对你的信赖度增加了点。'
			Yun.setTrust(game, 5, 15)

			await session.user.$update()
			await Yun.save()

			console.log(txt)
			return txt
			
		})
}
