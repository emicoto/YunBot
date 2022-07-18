import { Context, segment } from "koishi"
import * as f from "./Function"
import * as s from "./Setting"
import * as r from "./lib/reply"

import getluck from "./getluck"
import YunAI from "./AI"

const notignore = ['channel','help','schedule','test','timer','usage','user','小灵通']

export default function YunCore(ctx: Context){

    //先完成数据设定的初始化    
    s.__extend(ctx)
    s.initData()
    s.yunstate.mood = s.getMood()
    s.saveAll()


	var botstatus
	var botupdated = 0

    //指令触发前的事件
    ctx.before('command/execute', ({session, command})=>{
        if(!session.user) return;
        if(s.yunstate.stats == 'sleep' && !notignore.includes(command.name)){
            return r.whileSleeping('command')
        }
        if(s.yunstate.stats == 'working' && !notignore.includes(command.name)){
            let text = r.whileWorking('command')
            if(text) return text
        }
    })

    //启动事件
	ctx.on('bot-added', async(session)=>{

		botstatus = 'boton'
		console.log('路昀bot已正常启动。数据库准备中……')

		let time = new Date()
		let res = [
			`${time.toLocaleString}`,
			`路昀bot已正常启动……`,
			`已读取自动回复${r.getResCount()}条。`,
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

		session.sendPrivateMessage( s.master, text1)

		setTimeout(() => {
			session.sendPrivateMessage( s.master, text2)
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

    //加载各个模块
    ctx.plugin(getluck)
    /*
    ctx.plugin(Users)
    ctx.plugin(Daily)
    ctx.plugin(Com)
    ctx.plugin(Dice)
    ctx.plguin(ADRoles)
     */
    ctx.plugin(YunAI) //避免误触，放最下面吧。各种关键词事件和自动回复都在这个插件里
}