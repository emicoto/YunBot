import { Context, segment } from "koishi";
import * as f from "./Function"
import * as s from "./Setting"
import * as r from "./Reply"
import YunBot from "./Setting";


export default async function YunAI(ctx: Context) {

	ctx.middleware(async(session, next)=>{

		let timetick = new Date()
		if( s.usertoday.day != timetick.getDate()) {
			YunBot.NewToday()
			s.yunstate.mood = s.getMood()
			s.yunsave()
		}
		
		let uid = session.userId
		let name = await s.getUserName(ctx, session)
		let text = r.Respond(session.content, uid, ctx)

		// text = e.ChatEvent(session)
		
		if(s.yunstate.stats == "sleep" && !(r.wakeYunUp(session.content))){
			text = r.whileSleeping("session",session)
		}
		else if(s.yunstate.stats == "working"){
			text = r.whileWorking('session', session)
		}

		if( s.yunstate.stats == "working" && session.content.match(/(小昀|路昀).+(修行|修炼)\S{0,5}(怎样|如何|什么样|哪里|进度|吗)\S{0,3}$/)){
			return r.whileWorking('询问修炼进度', session)
		}

		if( s.yunstate.flag.levelup === true && session.content.match(/突破/) && f.random(100) < 66 && s.usertoday.yunbreak < 5){
			return r.setYunBreak(ctx, session)
		}else if( s.yunstate.flag.levelup === true && session.content.match(/突破/) && s.usertoday.yunbreak < 5 ){
			return f.either([
				`……呜，今天气运不顺，摸了……`,
				'……卦象说，今天不宜突破……',
				'……呜，'+(uid== s.master ? '师父……' : uid== s.senior ? '师叔……' : '')
				+ '卦象说，今天突破会失败……所以，今天就休息了好不好？',
			])
		}

		if( s.yunstate.stats != "working" && session.content.match(/\S{0,3}修炼|修行\S{0,5}$/) && s.usertoday.yunwork < 10){
			if(f.random(100) > 80 && s.usertoday.yunwork < 10 ){
				r.setYunWork(session)
				return f.either([
					"……静心，打坐……",
					"……摒除杂念……入定……",
					"……呼纳……吸气……",
				])

			}else{
				return f.either([
				"……呜……不想修炼……",
				'……呜，'+(uid== s.master ? '师父……' : uid== s.senior ? '师叔……' : '')
				+ '活着都这么累了……今天不如休息吧？好不好？',
				'……好困（揉揉眼睛',
				]);
			}
		}

		if( !text || text == "next"){
			if(session.content.length > 1 && f.random(1000) < 20){
				session.send('o(-。- o)===3 ) σ- . -)σ"')
				return segment("poke", { qq: session.userId });
			}
			else if( session.content.length > 1 && f.random(1000) < 20){
				return f.either([
					f.images("doge.jpg"),
					f.images("seekinside.png"),
					f.images("moyu.png"),
					f.images("cat_drink.jpg"),
					f.images('dance.gif'),
					f.images('cat.gif')
				])
			}
		}

		if (text){
			if (text == "next") return next();
			if (text.length >= 1) return text;
		}else{
			return next()
		}

	})

}