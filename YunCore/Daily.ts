import { Context, segment, Time} from "koishi";
import { getJrrp, getJrrpComment } from "./getluck";

import * as f from "./Function"
import * as s from "./Setting"
import { setYunWork } from "./Reply";

export default function Daily(ctx: Context){

    ctx.command("每日签到","每日签到。签到前最先找小昀算一卦。")
        .shortcut("签到")
        .shortcut("打卡")
        .action( async ({ session }) =>{
            let uid = session.userId
            let data = await s.getUser(ctx, uid)
            let name = await s.getUserName(ctx, session)

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

            await s.setUser(ctx, uid, data)
            s.saveToday()

            return text

        })
    
    ctx.command("每日任务 [message]","每日可以做的任务。")
        .action(async ({ session }, message) => {
            let uid = session.userId
            let text = ""
            let data = await s.getUser(ctx, uid)
            let name = await s.getUserName(ctx, session)

            if(!message || ["帮助",'help'].includes(message)){

            }

        })
    
    ctx.command("修炼","进行日常修炼", { minInterval: Time.minute*10})
        .action( async({ session }) =>{
            let uid = session.userId
            let data = await s.getUser(ctx, uid)
            let name = await s.getUserName(ctx,session)
            let luck
            
            let today = s.getToday(uid)

            if(!data.flag?.signed){
                return "……嗯？这位道友，是我们灵虚派的门生弟子吗？麻烦先填个表吧……"
            }

            if(f.ComUsage(today, '修炼', 5) === false){
                return "一天最多只能修炼五次而已……"
            }else{
                today.usage['修炼']++
            }

            if(today.luck <= 0){
                luck = getJrrp(uid)
            }
            luck = today.luck

            let getexp = Math.max(Math.floor(luck/10+0.5),1) + f.random(3,30)
            getexp = f.expCount(getexp,data)

            let txt = `@${name} 你${f.maybe([
                ['静心打坐',30],
                ['打扫整理',10 + ( uid==s.cleaner ? 70 : 0)],
                ['静坐冥思',30],
                ['参阅经书',30 + ( uid==s.senior ? 30 : 0)],
                ['吞纳吸气',30],
                ['奋笔疾书',20 + ( uid==s.brother ? 50 : 0)]]
                )}，对修心之道有了些许领悟。\n悟道经验变化：${data.exp}+${getexp}=>${data.exp+getexp}`
            
            if(s.usertoday.userwork >= 5 && (s.yunstate.stats == 'wake' || s.yunstate.stats == ' free') && s.usertoday.yunwork < 5 && f.random(100) > 70 ){

                let txt1 = `不知是否被同门师兄弟的修炼热情感染，路昀也稍微打气精神，跟着${name}一起开始修炼了。`

                await session.send(txt1)
                setYunWork(session)

            }

            data.exp += getexp
            await s.setUser(ctx,uid,data)

            s.usertoday.userwork ++
            s.saveToday()

            return txt
        })
    
    ctx.command('境界突破',"境界突破", { minInterval: Time.minute*10})
        .alias('突破')
        .action( async({ session })=>{
            let uid = session.userId
            let data = await s.getUser(ctx,uid)
            let name = await s.getUserName(ctx, session)
            let today = s.getToday(uid)

            if ( f.ComUsage(today, '突破', 2) === false ){
                return '一天只能尝试突破两次哦。'
            }
            else{
                today.usage['突破'] ++
                s.saveToday()
            }

            if(!data.flag?.signed){
                return "……嗯？这位道友，是我们灵虚派的门生弟子吗？麻烦先填个表吧……"
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

            let goal = 50 - Math.floor(Math.min(data.level,90)/2)
            console.log(name,'goal',goal)

            if( data.exp >= f.expLevel(data.level) && f.random(100) - today.luck/10 < goal){

                text+= `你领悟了一丝天地之道！ 你突破了，从${f.getLevelChar(data.level)}变成${f.getLevelChar(data.level+1)}了！`
                data.exp -= f.expLevel(data.level)
                data.exp = Math.max(Math.floor(data.exp/3+0.5),0)
                data.level += 1

            }
            else{
                getexp = f.random(2,25) + Math.max(today.luck/5,1)
                getexp = Math.floor(getexp * f.getExpBuff(data)+0.5)

                text += `你没悟到什么，只是获得了一点心得。\n悟道经验 +${getexp}`
                data.exp += getexp
            }
            await s.setUser(ctx, uid, data)
            return text
        })

}
