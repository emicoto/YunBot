import { Context, Session, Time } from "koishi";
import { bot, Common, faceicon, Game, getCall, txtp, random, Soul, UserMessage, getSaves, DailyData, copy, isInvalid, LevelKan, LevelExp, checkData } from "../unit";
import {  } from  "@koishijs/plugin-adapter-kook"

export function UserRegistry(ctx:Context){
	
	ctx.command('regist [name]', '-入门申请  仅限第一次时。用于初始化数据。',{ hidden:true, usageName:'入门申请' })
		.alias('用户注册')
		.alias('入门申请')
		.shortcut(/^(喂|喂？){0,1}(你好|你们好|有人吗|在吗){0,1}(\S){0,5}我{0,1}(\S){0,3}加入(灵虚派|你们门派|你们派|你门派|这个门派)\S{0,5}$/)
		.userFields(['game', 'daily', 'userID', 'role', 'chara','name'])
		.action( async ({ session })=>{
			const { game, daily, role, userID } = session.user;
			await checkData(session, userID)
			const chk = await getSaves(userID)

			if(Object.keys(chk).length >= 2) return '【最多两个人物】'

			if( game?.signed ){
				const call = getCall(role, game.nick ? game.nick : game.name ) ?? ''
				return txtp(Common['already-signed'],[call, ( role.length ? '你怎么来这啦？' : '你已经是弟子啦。')])
			};
			let next

			if(!daily.temp['chara']){
				await session.send( UserMessage['注册：场景'].join('\n'))
				await session.send( UserMessage['注册：名字'].join('\n') )
				next = await askCharaName(session)
				if(!next) return
			}
			else {
				await session.send(session.text('yunbot.continue-to-regist1'))
			}

			const chara = daily.temp['chara']


			if(!daily.temp['qa']){
				await session.send(
					txtp(UserMessage['注册：准备'].join('\n'), [chara])
				)				
				 next = await questionA(session,chara)
				if(!next) return
			}
			else if(!daily.temp['qb']){
				await session.send(session.text('yunbot.continue-to-regist2'))
			}

			if(!daily.temp['qb']){
				 next = await questionB(session)
				if(!next) return
			}
			else if(!daily.temp['qc']){
				await session.send(session.text('yunbot.continue-to-regist2'))
			}

			if(!daily.temp['qc']){
				next = await questionC(session)
				if(!next) return	
			}

			if(!daily.temp['newsoul']){
				next = await genNewSoul(session)
			}

			await session.send(
				UserMessage['注册：用户名'].join('\n')
			)

			const username = await session.prompt(Time.minute*3)
			//console.log(username)

			if(!username) 
				return session.text('internal.times-out');
			else if( isInvalid(username) )
				return session.text('internal.invalid-input');

			session.user.name = username	
			session.user.chara = chara
			session.user.game = await Game.new(session,daily.temp['newsoul'],  chara)
			session.user.game.signed = true;
			session.user.daily.temp = {};
			await session.user.$update()

			session.send(
				txtp( UserMessage['注册：完成'].join('\n'), [chara])
			)

		})
	
	ctx.command('recallex', '-回忆前尘  从旧档中继承。',{ hidden:true })
		.alias('回忆前尘')
		.alias('继承旧档')
		.userFields(['userID','chara','flags','game','name'])
		.action( async ({ session })=>{
			const { userID, chara } = session.user
			await checkData(session, userID)

			if(session.user.flags?.reborn){
				return '……你想起了以前的往事，摇了摇头回到现在的工作。（已经继承过了）'
			}

			let answer

			await session.send( UserMessage['继承：开始'].join('\n') )

			await session.send( UserMessage['继承：询问'].join('\n') )
			
			answer = await session.prompt()
			if(answer=='不是'){
				return '啊……只是错觉吧。'
			}
			else if(answer != '是'){
				return session.text('internal.invalid-input')
			}

			const oldsave = await loadOld(userID)
			if(!oldsave){
				return UserMessage['继承：回忆失败'].join('\n')
			}

			const newsave = Game.initOldSave(oldsave)
			session.user.chara = newsave.savename
			session.user.flags['reborn'] = true
			await session.user.$update()

			await await ctx.database.remove('oldsave', { uid:userID })

			await Game.setChara(userID, newsave)
			await Game.delet(userID,chara)				
			await Game.save(session, newsave, newsave.savename)
			const cname = (oldsave.nick ? oldsave.nick : oldsave.name)

			await session.send(
				txtp(UserMessage['继承：回忆'].join('\n'),[cname])
			)
			session.send(
				txtp(UserMessage['继承：结束'].join('\n'), [cname])
			)

		})
	
	ctx.command('savechara', '-写日记  更新人物存档', { signed:true, hidden:true, usageName:'写日记' })
		.alias('写日记')
		.alias('保存人物')
		.userFields(['game','userID','chara','name'])
		.action( async ({ session })=>{
			const { userID, chara} = session.user
			await checkData(session, userID)//保存前先检查一下存档		

			await session.send(`@${chara} 你回到了自己的房间，把最近经历记录下来。`)

			await Game.save(session)
			return '……这样就可以了吧。（保存完毕）'

		})
	
	/*ctx.command('checksave', '-查看日记  查看存档情况', { signed:true, hidden:true, system:true })
		.alias('查看日记')
		.userFields(['userID','chara','name','game'])
		.action( async ({ session })=>{
			const { userID, chara } = session.user
			await checkData(session, userID) //总之先读档做个检测

			const cli = await getSaves(userID)
			const nli = Object.keys(cli)			

			if(!nli.length) return '你翻了翻自己的日记，一片空白。'

			const char = ['','一','两']
			const sav = cli[chara]

			const txt = readDairy(sav,char[nli.length], nli[0], nli[2])
			return txt

		})*/
	
	function readDairy(sav, char?, nn1?, nn2?, mode?){
		const txt = [
			`桌上摆放着${char}本日记。上面标着日记主人的名字：${nn1}${nn2? '、'+nn2 : ''}。`,
			`你拿起了自己那本看了看，确认了下内容。`,
		]

		const txt2 = [
			`-----------------------------`,
			`${sav.name}　${LevelKan(sav.level)}　${new Soul(sav.soul).print}`,
			`悟道值：${sav.exp}/${LevelExp(sav.level)}`,
			`灵石：${sav.money}`,
			`解锁记忆一览：${ sav.memory.length ? sav.memory.join('，') : '暂无'}`
		]
		if(!mode){
			return txt.join('\n')+'\n'+txt2.join('\n')
		}
		return txt2.join('\n')
	}
	
	ctx.command('loadsave','-查看日记　读取人物档案', { hidden:true, system:true, usageName:"查看日记"})
		.alias('查看日记').alias('阅读日记')
		.userFields(['userID', 'chara', 'name', 'game'])
		.action( async ({ session })=>{
			const { userID, chara, game } = session.user
			await checkData(session, userID) //老样子，先做个检测。
			
			const cli = await getSaves(userID)
			const nli = Object.keys(cli)

			if(!nli.length) return '你翻了翻桌面上的日记本，一片空白。'

			const char = ['','一','两','三','四','五']
			let sav:Game

			let txt = readDairy(cli[nli[0]], char[nli.length], nli[0], nli[1])
			if(nli[1]) txt += '\n'+readDairy(cli[nli[1]], '', '', '', 1);
			
			txt+= `\n\n要读取哪本日记呢？\n1.${nli[0]}的日记  ${nli[1] ? `2.${nli[1]}的日记` : ' '}\n【请输入数字，输入其他退出】`

			await session.send(txt)
			let getid = await session.prompt(Time.minute*3)
			if( !getid || !parseInt(getid) || !['1','2'].includes(getid)) return '你合上了日记。（取消读档）'

			const id = parseInt(getid)-1
			const n = nli[id]

			sav = cli[n]
			
			if(game && game.signed){
				await Game.save(session, game, chara)
			}
			
			session.user.game = sav
			session.user.chara = n
			session.user.$update()
			
			return '你确认了最近发生的事情，回到了日常的工作中。（读档成功）'

		})

	
	ctx.command('switchchara', '-工作交接  切换到存档中的另一个人物', { signed:true, hidden:true, usageName:'工作交接' })
		.alias('工作交接')
		.alias('切换人物')
		.shortcut(/我(要|得|去){0,1}换班了，有什么事找(\S+)吧\S{0,3}$/,{prefix:true})
		.userFields(['userID','chara'])
		.action( async ({ session })=>{
			const { userID, chara} = session.user

			const check = await getSaves(userID)
			const namelist = Object.keys(check)
			let target

			if(namelist.length < 2){
				return '好像也没有可以交接的人……（你没有两个角色）'
			}
			
			if(namelist.indexOf(chara)==0) target = namelist[1]
			else target = namelist[0]

			await session.send(`@${chara} 你回到住处，与${target}打了声招呼后，把剩下的工作交给了对方。`)
			await Game.change(session)

			return `接下来的事，就拜托${target}了。`

		})
	
	ctx.command('newchara', '-新弟子报道  新建一个人物', { signed:true, hidden:true, usageName:'介绍新人' })
		.alias('新建人物').alias('新弟子报道').alias('介绍新人')
		.shortcut(/^看{0,2}我带(来了谁|谁来了|新人来了)\S{0,3}$/,{prefix:true})
		.userFields(['game', 'daily', 'userID', 'role', 'chara','name','reset'])
		.action( async ({ session })=>{
			//新建人物时先保存现有档案。
			const { userID, chara, game, name, reset, role, daily } = session.user
			await checkData(session, userID)

			await Game.save(session)

			//检查现有存档。满卡位就返回。
			const chk = await getSaves(userID)
			console.log(Object.keys(chk))
			if(Object.keys(chk).length >= 2){
				return `……${name}的房间太小了，没法住更多人了。（最多两人物）`
			}
			if(reset >= 3){
				return `……${name}的灵魂已经无法承载更多经历了。（已到达最大重置数）`
			}

			const call = getCall(role, (game.nick ? game.nick : game.name)) ?? game.name

			await session.send(
				'你带着一名新人，来到了入门申请处。'
				+'这里只是一个临时设立的亭子，等身大的掌门立牌依然在凉亭前。杂役弟子坚守自己岗位坐在桌前，阴凉处你发现路昀在这里躲懒。'
				+( random(5) == 0 ? '你试着戳了戳立牌，结果传来一阵电流把你电得酥麻麻。无奈，' : '欣赏了一秒掌门的尊容后，')
				+'你敲了敲桌子与杂役弟子打招呼。'
			)

			let next 

			if(!daily.temp['chara']){
				await session.send(
					`杂役弟子戳了戳路昀，路昀连忙坐直身子，揉了揉惺忪的睡眼迷迷糊糊地看向你：“…………呜？${call} 怎么来新弟子报道处了？……旁边的这位是……？”\n（请输入新人物名字）`
					)
				next = await askCharaName(session)
				if(!next) return
			}
			else{
				await session.send(session.text('yunbot.continue-to-regist1'))
			}
			
			const newchara = daily.temp['chara']

			if(!daily.temp['qa']){
				await session.send(
					`路昀拍了拍脸，调整成营业微笑与新人打招呼。\n\n${faceicon('微笑')}\n “……你好，${newchara}。”\n“……嗯？所以你是被${call}介绍来我们派的？欢迎。”\n“在等待检测灵根的时候，就先做点小问卷吧……”`
				)
				next = await questionA(session,newchara)
				if(!next) return
			}
			else if(!daily.temp['qb']){
				await session.send(session.text('yunbot.continue-to-regist2'))
			}

			if(!daily.temp['qb']){
				next = await questionB(session)
				if(!next) return
			}
			else if(!daily.temp['qc']){
				await session.send(session.text('yunbot.continue-to-regist2'))
			}

			if(!daily.temp['qc']){
				next = await questionC(session)
				if(!next) return
			}

			if(!daily.temp['newsoul']){
				next = await genNewSoul(session)
			}

			session.user.chara = newchara
			session.user.game = await Game.new(session, daily.temp['newsoul'], newchara)
			session.user.game.signed = true;
			session.user.daily.temp = {};
			await session.user.$update()

			session.send(
				txtp( UserMessage['注册：完成'].join('\n'), [newchara])
			)

		})
	
	ctx.command('delchara', '-离开宗门  删除当前角色', { signed:true, hidden:true, usageName:'离开宗门'})
		.alias('删除角色')
		.alias('离开宗门')
		.shortcut(/我(要|想)(走了|离开)(这里|灵虚派){0,1}\S{0,10}$/,{prefix:true})
		.userFields(['game', 'daily', 'userID', 'reset', 'chara','name'])
		.action( async ({ session })=>{
			const { chara, reset, userID} = session.user
			await checkData(session, userID)
			await Game.save(session) //规避奇怪的bug。试试删除前先保存一次看看。
			const oldsave = await Game.load(session, userID, chara)
			console.log('存档检测',oldsave?.name)

			if(reset >= 5) return '好像也没什么地方好去。（已到达最大重置数）'

			await session.send('你收拾了行李，准备离开这里去更广阔的的地方发展。\n输入：[离开/留下]\n（提示：离开了就真的彻底删除当前角色的档案了。）')
			const answer = await session.prompt(Time.minute*3)

			if(!answer.match('离开')){
				return '但收拾着收拾着，你还是有点不舍的这里。最后还是放弃了。'
			}

			const oldchara = chara

			//重置每日，同时增加重置数
			session.user.reset ++
			await session.user.$update()

			if(oldsave?.name){ //如果库里存在角色就删除。
				console.log('旧档删除')
				await Game.delet(userID, oldchara)
			}

			//检测剩余角色是否存在。在就读取。

			const chk = await getSaves(userID)
			const namelist = Object.keys(chk)
			let second = ''

			if(namelist.length){ //读取另一个角色并更新。

				second = namelist[0]
				console.log('namelist',namelist[0])
				session.user.game = await Game.load(session,userID, second)

				if(session.user.game?.flag?.daily?.lastDay){
					session.user.daily = session.user.game.flag.daily
					delete session.user.game.flag.daily
				}
				else{
					session.user.daily = new DailyData()
				}
				session.user.chara = second

				await session.user.$update()

				return '你收拾好东西离开了。剩下的事情，就交给'+second+'吧。'

			}

			//清空现有档案。
			session.user.daily = new DailyData()
			session.user.game = new Game('')
			session.user.chara = ''
			session.user.$update()
			return '你头也不回的离开了。'

		})

	
	async function loadOld(uid:string) {
		const chk = await ctx.database.get('oldsave', { uid: uid })
		if(!chk.length){
			return false
		}

		const save = Object.keys(chk[0].charalist)[0]
		if(save){
			return chk[0].charalist[save]
		}
	}

	async function askCharaName(session:Session<'daily'|'userID'>){
		const { daily, userID} = session.user

		const chara = await session.prompt(Time.minute*3)
		if(chara === undefined || !chara || chara.length < 1){
			await session.send(session.text('internal.times-out'));
			return
		}

		if( isInvalid(chara) ){
			await session.send(session.text('internal.invalid-string'))
			return
		}

		if(chara.length > 5) return '最大五个字。'
		
		const chk = await ctx.database.get('user', { 'game.name': chara })
		if(chk.length && chk[0].userID !== userID){
			await session.send('不能重名。')
			return
		}
		

		daily.temp['chara'] = chara
		await session.user.$update()

		return 1;
	}

	async function questionA(session:Session<'daily'>,chara){
		const { daily } = session.user

		await session.send(
			txtp( UserMessage['注册：问答A'].join('\n'),  [chara])
		)

		const qa = await session.prompt(Time.minute*3)
		if(!qa){
			await session.send(session.text('internal.times-out'))
			return
		}
		if(['1','2','3','4','5'].includes(qa)===false){
			await session.send(session.text('internal.invalid-input'))
			return
		}

		daily.temp['qa'] = parseInt(qa)
		await session.user.$update()

		return 1
	}

	async function questionB(session:Session<'daily'>) {
		const { daily } = session.user

		await session.send( UserMessage['注册：问答B'].join('\n') )

		const qb = await session.prompt(Time.minute*3)
		if(!qb){
			await session.send(session.text('internal.times-out'))
			return
		}
		if(['1','2','3','4','5'].includes(qb)===false){
			await session.send(session.text('internal.invalid-input'))
			return
		}

		daily.temp['qb'] = parseInt(qb)
		await session.user.$update()
		return 1
	}

	async function questionC(session:Session<'daily'>) {
		const { daily } = session.user
		await session.send( UserMessage['注册：问答C'].join('\n') )

		let qc:any = null
		qc = await session.prompt(Time.minute*3)
		if(!qc || !qc.match(/\d+/) || !parseInt(qc)){
			await  session.send(session.text('internal.invalid-input'))
			return
		}

		qc = parseInt(qc)
		daily.temp['qc'] = qc
		await session.user.$update()
		return 1
	}

	async function genNewSoul(session:Session<'daily'>) {
		const { daily } = session.user
		const qa = daily.temp.qa
		const qb = daily.temp.qb
		const qc = daily.temp.qc
		const chara = daily.temp.chara
		//console.log(daily.temp)
		const result = (qa + qb + qc)%5

		const rate = random(100) + (daily.luck ? Math.floor(daily.luck / 12 +0.5) : 0);
		console.log(chara, '灵根测试', rate)

		const newsoul = Soul.genNew(rate, { result, qa, qb })
		daily.temp['newsoul'] = newsoul
		console.log(newsoul)
		await session.user.$update()

		const soul = new Soul(newsoul)

		await session.send(
			txtp(UserMessage['注册：灵根'].join('\n'), [ chara, soul.print ])
		)
	}

}
