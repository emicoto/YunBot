import { Context, segment } from "koishi";
import * as f from "./Function"
import * as s from "./Setting"
import { Respond, getResCount } from "./lib/reply"


if( !s.usertoday || !s.yunstate || !s.userdata ) s.initData();

export default async function YunAI(ctx: Context) {

	var botstatus
	var botupdated = 0

	ctx.on('bot-added', async(session)=>{

		botstatus = 'boton'
		console.log('路昀bot已正常启动。数据库准备中……')

		let time = new Date()
		let res = [
			`${time.toLocaleString}`,
			`路昀bot已正常启动……`,
			`已读取自动回复${getResCount()}条。`,
			`本地控制台：http://localhost:5140/`
		]

		let text1 = res.join('\n')
		let text2 = ``

		let now = time.getHours()
		let zone = f.getTimeZone(now)

		if(s.yunstate.stats == 'sleep'){
			s.yunstate.stats = 'wake'
		}

		if(['晚上','深夜'].includes(zone)) text2 = '师父，晚上好。';
		if(f.between(now,4,6)) text2 = '……师父，早上好？这时间肯定是通宵了吧，可不要熬太久，请注意休息……';
		if(f.between(now,7,8)) text2 = '师父，早上好……呼啊……起得也太早了吧……（揉眼睛'
		if(f.between(now,9,13)) text2 ='……师父，早上好。'
		if(['下午','傍晚'].includes(zone)) text2 = '午安，师父。'

		text2 += '请问今天有什么吩咐吗？'

		session.sendPrivateMessage('1794362968', text1)

		setTimeout(() => {
			session.sendPrivateMessage('1794362968', text2)
		}, 1000);

	})

	ctx.on('bot-status-updated',async (session) => {
        setTimeout(()=>{
            if (botstatus == 'boton'){
            ctx.broadcast(f.images('yunneoki.png')+'\n路昀从睡眠中苏醒，懒洋洋地打了个哈欠：“师父、各位师兄弟们，早啊……”')
            console.log('机器人已正常启动。')
            botstatus = 'botrunning'
        }},2000)
        botupdated ++
        console.log('……机器人动态更新了，次数：', botupdated, "状态：",botstatus)
	})

	ctx.on('attach-user', async ( session ) => {

	})

	ctx.middleware(async(session, next)=>{
		let timetick = new Date()
		if( s.usertoday?.day != timetick.getDate()) {
			s.NewToday()
		}
		
		let uid = session.userId
		let text = Respond(session.content, uid)

		if (text){
			if (text == "next") return next();
			if (text.length >= 1) return text;
		}

	})

}