import { Context, segment } from "koishi";
import * as f from "./Function"
import * as s from "./Setting"
import * as r from "./lib/reply"

export default async function YunAI(ctx: Context) {

	if( !s.usertoday || !s.yunstate ) s.initData();

	ctx.middleware(async(session, next)=>{
		let timetick = new Date()
		if( s.usertoday?.day != timetick.getDate()) {
			s.NewToday()
			s.yunstate.mood = s.getMood()
			s.yunsave()
		}
		
		let uid = session.userId
		let text = r.Respond(session.content, uid, ctx)

		// text = e.ChatEvent(session)

		if(s.yunstate.stats == "sleep"){
			text = r.whileSleeping("session",session)
		}

		if(s.yunstate.stats == "working"){
			text = r.whileWorking('session', session)
		}

		if( session.content.match(/(小昀|路昀).+(修行|修炼)\S{0,2}(怎样|如何|什么样|吗)\S{0,3}$/)){
			return r.whileWorking('询问修炼进度', session)
		}

		if( session.content.match(/\S{0,3}修炼|修行\S{0,5}$/) ){
			if(f.random(100) <= 30){
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

		if (text){
			if (text == "next") return next();
			if (text.length >= 1) return text;
		}else{
			return next()
		}

	})

}