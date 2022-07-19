import { Context, segment } from "koishi"
import * as f from "./Function"
import * as s from "./Setting"
import * as r from "./Reply"

import getluck from "./getluck"
import YunAI from "./AI"
import Daily from "./Daily"
import Com from "./Com"
import UserCom from "./UserCom"

const notignore = ['channel','help','schedule','test','timer','usage','user','小灵通']
 

export default async function YunCore(ctx: Context){

    //先完成数据设定的初始化    
    s.__extend(ctx)

    //加载各个模块
    ctx.plugin(getluck)
    ctx.plugin(Daily)
    ctx.plugin(Com)
    ctx.plugin(UserCom)    
    /*
    ctx.plugin(Dice)
    ctx.plguin(ADRoles)
     */
    ctx.plugin(YunAI) //避免误触，放最下面吧。各种关键词事件和自动回复都在这个插件里

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
			`${time.toLocaleString()}`,
			`路昀bot已正常启动……`,
			`已读取自动回复${r.getResCount()}条。`,
			`本地控制台：http://localhost:5140/`
		]

		let text1 = res.join('\n')
		let text2 = ``

		let now = time.getHours()
		let zone = f.getTimeZone(now)

        console.log('初始化中？',s.yunstate,s.usertoday)

        setTimeout(()=>{
            if(s.yunstate.stats == 'sleep'){
                s.yunstate.stats = 'wake'
                s.yunsave()
                console.log('路昀苏醒了。')
            }
        },2000)


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
                let text = `${f.images('yunneoki.png')}\n路昀从睡眠中苏醒，懒洋洋地打了个哈欠：`

                let now = f.getChinaTime().getHours()
                let zone = f.getTimeZone(now)

                if(['晚上','深夜','凌晨'].includes(zone)) text += '“师父……还有同门的各位晚上好……”\n“……啊，这午觉好像睡过头了……”';
                if(zone == '黎明') text += '“师父……还有各位早上好……”\n“呜……我好像起得太早了……”'
                if(zone == '上午') text +='“师父……还有各位……早啊……”'
                if(zone == '中午') text +='“师父……还有各位……中午好……”'
                if(['下午','傍晚'].includes(zone)) text += '“师父……还有各位……下午好……”\n“……？我是不是起太晚了……？”'

                ctx.broadcast(text)
                console.log('路昀bot已启动完毕。')
                botstatus = 'botrunning'
        }},2000)
        botupdated ++
        console.log('……机器人动态更新了，次数：', botupdated, "状态：",botstatus)
	})
}