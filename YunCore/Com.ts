import { Context, RuntimeError, segment, Time } from "koishi";
import { Lunar, Tao } from "lunar-javascript";
import { CountStats } from "./lib/CountStats";
import { CoreLib } from "./lib/Skill"
import * as f from "./Function"
import  YunBot, * as s from "./Setting"

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

				session.send('o(-。- o)===3 ) σ- . -)σ')
				return segment('poke', {qq: session.userId})

		})
    
    ctx.command('test [message]', '测试')
		.action( async({ session }, message)=>{
			//s.usertoday.user = {}
			//console.log(s.usertoday.user[session.userId])
			s.usertoday = YunBot.getUsertoday()
			s.yunstate.flag['breakbuff'] = 40
			console.log(s.usertoday)
			return `本地档案已更新。`
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
            
			if(f.ComUsage(today,'陪同修炼',2) === false ){
				return '……我已经累了……'
			}
			else{
				//today.usage['陪同修炼'] ++
				return '本功能还没做完。'
			}
			
        })
	
	ctx.command('修习心法','修习主心法', { minInterval: Time.hour/3})
		.action(async ({ session })=>{
			let uid = session.userId
			let data = await CountStats(ctx, uid)
			let name = await s.getUserName(ctx, session)
			let today = s.getToday(uid)
			let txt = ''

			if(data.level < 5) return '……等级不够，起码要入门五阶才能修习心法吧。' ;

			if(!data.core?.id){
				txt = `……嗯？${name}似乎还没有主修的心法的样子……\n本门派有三种基础心法，灵犀、灵空、灵虚。\n灵犀心法主修攻击，灵空心法主修防御，灵虚心法主修敏捷。\n至于修哪套……（看了看基本基础心法秘诀的封面，居然都没有写名字）\n没办法了，只好随便抽一本了。抽到什么是什么了……`;
				
				let pool = ['灵犀心法','灵空心法','灵虚心法']
				let id = f.random(2)
				let n = pool[id]
				let newcore = {}

				newcore = JSON.parse(JSON.stringify(CoreLib[n]));
				data.core = newcore;
				await s.setUser(ctx, uid, data)

				txt += `\n嗯，就这本吧。\n(${name}获得了心法：${n}）`
				return txt
			}

			if(f.ComUsage(today,'修习心法',3) === false){
				return '……欲速则不达，心法的修习一天最多3次而已……'
			}
			else{
				today.usage['修习心法']++

				let core = data.core
				let exp = 1 + f.random(data.core.grade+1)
				let getexp = 3 + f.random(20) + (today.luck > 0 ? Math.floor(today.luck/20+0.5) : 0)
				getexp = f.expCount(getexp,data)

				let nexexp = Math.floor(core.level*10*Math.pow(core.grade+0.5,2)+0.5)

				txt = `灵气流转，通过自身天地八脉灵脉，气息沉淀过后，多少获得了一些心得。\n悟道经验变化：${data.exp}+${getexp}=${data.exp+getexp}\n心法修炼进度：${exp+core.exp}/${nexexp}`

				data.exp += getexp
				data.core.exp += exp

				await s.setUser(ctx, uid, data)
				s.saveToday()

				return txt
			}
		})
}