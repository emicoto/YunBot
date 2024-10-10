import { Context, segment, Session } from "koishi";
import { between, either, getName, images, random, Respond, save, Today, wakeYunUp, whileSleeping, whileWorking, Yun } from "./unit";
const bannedChannelId =["79074766" ,"297169602","661494893","575820136"]
export async function YunAI(ctx:Context) {

	ctx.on('guild-member-added',(session)=>{
		console.log('新人进入')
		session.send('……欢迎新人？')
	})

	ctx.on('guild-member-updated',(session)=>{
		console.log('member updated')
		session.send('……？')
	})

	ctx.on('guild-updated',(session)=>{
		console.log('guild updated')
		session.send('。')
	})

	ctx.on('reaction-added',(session)=>{
		console.log('reaction add！')
		session.send('?')
	})

	// ctx.on('guild-emoji-added',(session)=>{
	// 	console.log('new emoji!')
	// 	session.send('……似乎多了什么新东西？')
  //
	// })


	ctx.middleware( async(session:Session, next)=>{
		if (bannedChannelId.includes(session.channelId)) {
			
			return next();
		} else {
			let timetick = new Date()
		if(Today.data?.day !== timetick.getDate()){
			Today.new()
			save()
		}

		const user = await ctx.database.getUser(session.platform,session.userId)
		const uid = user.userID
		const role = user.role
		const name = await getName(uid)

		let txt = await Respond(session.content, uid,role)

		if(Yun.isSleeping() && !wakeYunUp(session.content)){
			txt = whileSleeping('session', session)
		}
		else if(Yun.stats == 'working'){
			txt = whileWorking('session', session)
		}

		if(Yun.stats == 'working' && session.content.match(/(小昀|路昀)\S{0,2}(修行|修炼)\S{0,5}(怎样|如何|什么样|哪里|进度|吗)\S{0,3}$/)){
			return whileWorking('询问修炼进度', session)
		}

		if(session.content.match(/^(小昀|路昀)\S{0,5}突破\S{0,8}$/)){
			if(Yun.breakCheck()){
				Yun.setYunBreak(session, name)

			}else{
				return either([
				`……呜，今天气运不顺，摸了……`,
				'……卦象说，今天不宜突破……',
				'……呜，'+(role == 'master' ? '师父……' : role == 'senior' ? '师叔……' : '')
				+ '卦象说，今天突破会失败……所以，今天就休息了好不好？',
			])
			}
		}

		if( session.content.match(/^(小昀|路昀)\S{0,5}(修炼|修行)\S{0,5}$/)){
			if(Yun.trainCheck()){
				Yun.setYunTrain(session)
				return either([
					"……静心，打坐……",
					"……摒除杂念……入定……",
					"……呼纳……吸气……",
				])
			}
			else{
				return either([
					"……呜……不想修炼……",
					'……呜，'+(role== 'master' ? '师父……' : role== 'senior' ? '师叔……' : '')
					+ '活着都这么累了……今天不如休息吧？好不好？',
					'……好困（揉揉眼睛',
				])
			}
		}
		
		if (!txt || txt == 'next') {
			
			if(session.content.length > 1 && between( random(1000),666,696)  ){
				session.send('o(-。- o)===3 ) σ- . -)σ"')
				return segment("poke", { qq: session.userId });
			}
			else if( session.content.length > 1 && between( random(1000),666,696 ) ){
				return either([
					images("doge.jpg"),
					images("seekinside.png"),
					images("moyu.png"),
					images("cat_drink.jpg"),
					images('dance.gif'),
					images('cat.gif'),
					images('yun_xqjd.png')
				])
			}
		}

		if(txt){
			if(Yun.stats == 'goodnight'){
				Yun.stats = 'sleeping';
			}
			if (txt == "next") return next();
			if (txt.length >= 1)  return txt;
		}
		else{
			return next()
		}
		}
		
		return next()
	})

}
