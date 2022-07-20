import { Context, RuntimeError, segment, Time } from "koishi";
import { Lunar, Tao } from "lunar-javascript";

import * as f from "./Function"
import YunBot, * as s from "./Setting"

export default function Com(ctx: Context){

    ctx.command("黄历", "查看黄历时间以及宜忌信息等。")
        .action(()=>{
			let ly = Lunar.fromDate(f.getChinaTime())
            let year = `${ly.getYearInChinese()}年，`
            year += `天运${ly.getGan()+ly.getZhi()}，`
            year += `生肖 ${ly.getYearShengXiao()}\n`
            year += `${ly.getMonthInGanZhi()}月，`
            year += `${ly.getDayInGanZhi()}日，`
            year += `${ly.getHou()}，月相 ${ly.getYueXiang()}\n`
			year += `${ly.getMonthInChinese()}月 ${ly.getDayInChinese()}日 ${f.getShichen()}\n`

			let jiyi = `宜：${ly.getDayYi().join("、")}\n忌：${ly.getDayJi().join("、")}`

			let tao = Tao.fromLunar(ly)
			let text = year+jiyi

			if(tao.getFestivals().length >= 1){
				let fes = tao.getFestivals()
				text += '\n道历节日：'
				for(let i=0; i<fes.length; i++){
					text += `${fes[i].getName()}　${fes[i].getRemark()}`
				}
			}

			return text
        })
    
    ctx.command('戳戳 <target>','戳一戳')
		.shortcut('戳我')
		.action(({ session }, target) => {
			const parsedTarget = target ? segment.parse(target)[0] : null
		
			if(!parsedTarget){
				return segment('poke', { qq: session.userId })
			}
			else {
				return segment('poke', {qq: parsedTarget.data.id})
			}
		})
    
    ctx.command('poke','teach事件专用版戳一戳。')
		.action(({ session }) => {

				ctx.bots.get(`onebot:185632406`).sendMessage(session.channelId,'o(-。- o)===3 ) σ- . -)σ')
				return segment('poke', {qq: session.userId})

		})
    
    ctx.command('test [message]', '测试')
		.action( async({ session }, message)=>{
				//s.setFavo(ctx, s.master, 10)
				console.log(s.yunstate, s.usertoday)
				return '测试结果详细请看Log。'
		})
    
    ctx.command('At [target]','让路昀bot艾特任意人。')
        .shortcut('艾特我')
        .action(({ session }, target)=>{
            const parsedTarget = target ? segment.parse(target)[0] : null

            if(!parsedTarget){
                return f.At(session.userId)
            }
            else{
                return f.At(parsedTarget.data.id)
            }
        })
    
    ctx.command('陪同修炼','和路昀一起修炼',{ minInterval: Time.hour/2})
        .action(async ({ session }) => {
            let uid = session.userId
            let data = await s.getUser(ctx, uid)
            let name = await s.getUserName(ctx, session)
			let today = s.getToday(uid)
            
			if(f.ComUsage(today,'陪同修炼',2)){
				return '……我已经累了……'
			}
			else{
				today.usage['陪同修炼'] ++
			}
			
        })
}