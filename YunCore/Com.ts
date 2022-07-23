//一些便利功能指令
import { Context,  segment, Time } from "koishi";
import { Lunar, Tao } from "lunar-javascript";
import * as f from "./Function"
import { CoreDes, CoreLib, SkillDes, SkillLib, WeaponDes, WeaponLib } from "./lib/Library";
import * as s from "./Setting"


export default function Com(ctx: Context){

    ctx.command("黄历", "查看黄历时间以及宜忌信息等。")
        .action(({ session })=>{
			let ly = Lunar.fromDate(f.cnTime())
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

			f.CountUsage(session.userId,'黄历')

			session.sendQueued(text)
        })
	
	ctx.command("时间","查看服务器时间")
		.alias('servertime')
		.action( ( { session }) => {
			let time = new Date()
			let str = time.toLocaleString('cn-ZH')
			session.sendQueued(`本机服务器时间为：`+str)
			return
		})
    
    ctx.command('戳戳 <target>','戳一戳')
		.shortcut('戳我')
		.action(({ session }, target) => {
			const parsedTarget = target ? segment.parse(target)[0] : null

			f.CountUsage(session.userId,'戳一戳')
		
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
    
    ctx.command('test [message]', '后台测试专用。')
		.action( async({ session }, message)=>{
			//s.usertoday.user = {}
			//console.log(s.usertoday.user[session.userId])
			//s.usertoday.yunbreak = 0
			return `测试结果请看LOG`
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
				session.sendQueued('……我已经累了……')
				return
			}
			else{
				//f.CountUsage(uid,'陪同修炼')
				session.sendQueued('本功能还没做完。')
				return
			}
			
        })
	
	ctx.command('指令记录','显示指令的次数记录')
		.alias('mylogs')
		.action(async( { session }) =>{
			let uid = session.userId
			let today = s.getToday(uid)
			let name = await s.getUserName(ctx, session)
			let usage = today.usage
			let txt = []
			let msg
			console.log(today.usage)
			if( Object.keys(usage).length > 0 ){

				for(let i in usage){
					let t = `· ${i}： ${usage[i]}`
					txt.push(t)
				}

				msg = `${name}的指令记录：\n`+txt.join("\n")
				
			}
			else{
				msg = '没有对应记录。'
			}
			session.sendQueued(msg, 1000)
			return
		})
	
	ctx.command('查询 <type> [msg]','查询功法、心法、技能等效果')
		.alias('library')
		.option('name','-n')
		.action(({ session }, type, msg, option) =>{
			let txt
			if(!type && !msg){
				txt = [ 
					`……？是需要什么帮助吗？`,
					`.library [类型] [名字]`,
					` 目前可查询的类型：心法，技能，法器`,
					` 不输入对应的名字的话，可以看到目前已记载的心法、技能、法器一览。`
				]
				session.sendQueued(txt.join("\n"))
				return
			}

			if(!msg && ['心法','技能','法器'].includes(type)){
				txt = `目前有的${type}：\n`
				if(type=='心法'){
					for(let k in CoreLib){
						txt += `${k}、 `
					}
				}
				if(type=='技能'){
					for(let k in SkillLib){
						txt += `${k}、 `
					}
				}
				if(type=="法器"){
					for(let k in WeaponLib){
						txt += `${k}、 `
					}
				}
				session.sendQueued(txt)
				return
			}
			
			if(!msg){
				return '……嗯，好像没有你要找的东西。'
			}

			let list

			if(type == '心法') list = Object.keys(CoreLib);
			if(type == '技能') list = Object.keys(SkillLib);
			if(type == '法器') list = Object.keys(WeaponLib);

			if(list.includes(msg) === false) return '……嗯，好像没有你要找的东西。'

			if(type == '心法'){
				return CoreDes(CoreLib[msg])
			}
			if(type == '技能'){
				return SkillDes(SkillLib[msg])
			}
			if(type == '法器'){
				return WeaponDes(WeaponLib[msg])
			}
			
		})

}