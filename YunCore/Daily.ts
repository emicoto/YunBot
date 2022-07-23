//每日的修行

import { Context, segment, Time} from "koishi";
import { getJrrp, getJrrpComment } from "./getluck";

import * as f from "./Function"
import * as s from "./Setting"
import { setYunWork } from "./Event";
import { CoreLib } from "./lib/Library";
import { CountStats } from "./lib/CountStats";

export default function Daily(ctx: Context){

    ctx.command("每日签到","每日签到。签到前最先找小昀算一卦。")
        .shortcut("签到")
        .shortcut("打卡")
        .action( async ({ session }) =>{
            let uid = session.userId
            let data = await s.getUser(ctx, uid)
            let name = s.getName(data)

            let today = s.getToday(uid)

            if(today.sign === true){
                return "……今天已经打过卡了。"
            }

            if(!data.flag?.signed){
                return "签到之前麻烦先填份入门信息吧……"
            }

            let luck
            let text = "路昀：“"

            if(today.luck <= 0){
                luck = getJrrp(uid)
                text += `……还没算气运吧？来，先抽个签吧……”（指了指一旁的签筒）。\n “嗯……今天${name}的气运有${luck}呢。”\n小昀的今日一言：${getJrrpComment(luck)}\n\n“然后，`
            }

            luck = today.luck

            text += "打卡对吗？ 在这里刷一下小灵通就可以去领稿子了。”"

            let num = f.random(3,10) + Math.max(Math.floor(luck/3+0.5),1)
            
            text += `\n@${name} 你拿起稿子，辛勤地在灵矿峰下挥舞。\n最后获得了${num}灵石。`

            today.sign = true
            data['money'] += num

            today.usage['每日签到'] = 1

            await s.setUser(ctx, uid, data)
            s.saveToday()

            session.sendQueued(text,1000)
            return 
        })
    
    ctx.command("每日任务 [message]","每日可以做的任务。")
        .action(async ({ session }, message) => {
            let uid = session.userId
            let text = ""
            let data = await s.getUser(ctx, uid)
            let name = await s.getUserName(ctx, session)
          
            if(!message || ["帮助",'help'].includes(message)){
                session.sendQueued('本功能还没做完。')
                return
            }

        })
    
    ctx.command("修炼","进行日常修炼", { minInterval: Time.minute*10})
        .action( async({ session }) =>{
            let uid = session.userId
            let data = await s.getUser(ctx, uid)
            let name = s.getName(data)
            let luck
            
            let today = s.getToday(uid)

            if(!data.flag?.signed){
                return "……嗯？这位道友，是我们灵虚派的门生弟子吗？麻烦先填个表吧……"
            }

            if(f.ComUsage(today, '修炼', 5) === false){
                return "一天最多只能修炼五次而已……"
            }else{
                f.CountUsage(uid,'修炼')
            }

            if(today.luck <= 0){
                luck = getJrrp(uid)
            }
            luck = today.luck

            let rate = f.random(3,45)
            let getexp = Math.max(Math.floor(luck/10+0.5),1) + rate
             console.log(name,'修炼结果:','base',getexp, 'roll',rate,'result',f.expCount(getexp,data))            
            getexp = f.expCount(getexp,data)
           

            let txt = `@${name} 你${f.maybe([
                ['静心打坐',30],
                ['打扫整理',10 + ( uid==s.cleaner ? 70 : 0)],
                ['静坐冥思',30],
                ['参阅经书',30 + ( uid==s.senior ? 30 : 0)],
                ['吞纳吸气',30],
                ['奋笔疾书',20 + ( uid==s.brother ? 50 : 0)]]
                )}，对修心之道有了些许领悟。\n悟道经验变化：${data.exp}+${getexp}=>${data.exp+getexp}/${f.expLevel(data.level)}`
            
            if(s.usertoday.userwork >= 5 && (['free','wake'].includes(s.yunstate.stats)) && s.usertoday.yunwork < 5 && f.random(100) > 70 ){

                let txt1 = `不知是否被同门师兄弟的修炼热情感染，路昀也稍微打气精神，跟着${name}一起开始修炼了。`

                await session.send(txt1)
                setYunWork(session)

            }

            data.exp += getexp
            await s.setUser(ctx,uid,data)

            s.usertoday.userwork ++
            s.saveToday()

            session.sendQueued(txt,100)
            return
        })
    
    ctx.command('境界突破',"境界突破", { minInterval: Time.minute*10})
        .alias('突破')
        .action( async({ session })=>{
            let uid = session.userId
            let data = await s.getUser(ctx,uid)
            let name = s.getName(data)
            let today = s.getToday(uid)

            if ( f.ComUsage(today, '突破', 2) === false ){
                session.sendQueued('一天只能尝试突破两次哦。')
                return
            }
            else{
                f.CountUsage(uid,'突破')
            }

            if(!data.flag?.signed){
                session.sendQueued("……嗯？这位道友，是我们灵虚派的门生弟子吗？麻烦先填个表吧……")
                return
            }

            let getexp
            let text = `在一个黄道吉日里，@${name} 你沐浴更衣后，`+ f.maybe([
                ['盘腿而坐，闭目冥思感应天地',30],
                ['收拾整顿，用抹布细心打扫道观的所有角落',10 + ( uid == s.cleaner ? 70 : 0)],
                ['单脚独立，在瀑布下洗涤身心',30],
                ['点燃熏香，细细品读经文',30 + (uid==s.senior ? 30 : 0)],
                ['吞纳吸气，感受体内灵气的运作',30],
                ['奋笔疾书，将所思所想归纳总结',20 + (uid==s.brother ? 50 : 0)],
            ])

            text += `，试图从中捕捉一丝道理……\n`

            let goal =  await f.getBreakRate(ctx, uid)
                console.log(name,'突破概率',goal)

            if( data.exp >= f.expLevel(data.level) && f.random(100) < goal){

                text+= `你领悟了一丝天地之道！ 你突破了，从${f.getLevelChar(data.level)}变成${f.getLevelChar(data.level+1)}了！`
                data.exp -= f.expLevel(data.level)
                data.exp = Math.max(Math.floor(data.exp/3+0.5),0)
                data.level += 1

                if(data.flag?.breakbuff) data.flag.breakbuff = 0;

            }
            else{
                getexp = f.random(2,25) + Math.max(today.luck/5,1)
                getexp = Math.floor(getexp * f.getExpBuff(data)+0.5)

                text += `你没悟到什么，只是获得了一点心得。\n悟道经验 +${getexp}`
                data.exp += getexp
            }
            await s.setUser(ctx, uid, data)
            session.sendQueued(text)
            return 
        })

	
	ctx.command('修习心法','修习主心法', { minInterval: Time.hour/3})
		.action(async ({ session })=>{
			let uid = session.userId
			let data = await CountStats(ctx, uid)
			let name = s.getName(data)
			let today = s.getToday(uid)
			let txt = ''

			if(data.level < 5) return '……等级不够，起码要入门五阶才能修习心法吧。' ;

			if(!data.core?.id){
				txt = `……嗯？${name}似乎还没有主修的心法的样子……\n本门派有三种基础心法，灵犀、灵空、灵虚。\n灵犀心法主修攻击，灵空心法主修防御，灵虚心法主修敏捷。\n至于修哪套……\n（看了看几本基础心法秘诀的封面，居然都没有写名字）\n没办法了，只好随便抽一本了。抽到什么是什么了……`;
				
				let pool = ['灵犀心法','灵空心法','灵虚心法']
				let id = f.random(2)
				let n = pool[id]
				let newcore = {}

				newcore = JSON.parse(JSON.stringify(CoreLib[n]));
				data.core = newcore;
				await s.setUser(ctx, uid, data)

				txt += `\n嗯，就这本吧。\n(${name}获得了心法：${n}）`
				
				session.sendQueued(txt,1000)
				return
			}

			if(f.ComUsage(today,'修习心法',3) === false){
				
				session.sendQueued('……欲速则不达，心法的修习一天最多3次而已……',500)
				return
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

                let rate = f.random(100)

                if(data.core.exp > nexexp && core.level < core.maxlevel && rate < 50 ){
                    txt += `\n日积月累，滴水成河。你对心法的研修达到了一个圆满阶段！你的心法获得了升华，从${core.level}升级为${core.level+1}了。`
                    data.core.level ++
                    data.core.exp -= nexexp
                    data.core.exp = Math.max(Math.floor(data.core.exp/2),0)
                }

				await s.setUser(ctx, uid, data)
				s.saveToday()

				session.sendQueued(txt, 1000)
				return
			}
			
		})

}
