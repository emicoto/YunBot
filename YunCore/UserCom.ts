import { Context, RuntimeError, segment, Time } from "koishi";

import * as f from "./Function"
import * as s from "./Setting"

export default function UserCom(ctx: Context){
	
	ctx.command('setnick <nick:text>', '设置路昀对你的昵称。优先于用户名。')
		.alias('callme')
		.shortcut('叫我')
		.userFields(['id','nick'])
		.action( async ({ session }, nick)=>{
			const { user } = session;
			if(!nick){
				if(user.nick){
					let txt = f.either([
						`……怎么了，${user.nick}？`,
						`……有什么事吗？${user.nick}？`,
						`……好的，${user.nick}。`,
					])
					return txt
				}
				return '还没有设置昵称'
			}

			let txt = `${nick}……吗？\n了解了，那么以后就这么称呼${nick}了。\n……还请多多指教。`
			
			if(nick.includes("[CQ:")){
				return '禁止包含纯文本以外的内容'
			}
			if(nick.match(/((?=[\x21-\x7e]+)[^A-Za-z0-9])/)){
				return '不能含有特殊字符'
			}
			let check = await ctx.database.get('user',{ nick : nick })
			if(check.length >= 1 && check[0].onebot!= session.userId){
				return '不能重名。'
			}
			try{
				user.nick = nick;
				await user.$update();
				return txt
			}
			catch(error){
				if(RuntimeError.check(error,"duplicate-entry")){
					return '昵称跟别人的重复了哦。'
				}else{
					ctx.logger("common").warn(error);
					return "因不明原因设置失败了。详情请看后台日志。"
				}
			}	
		})
    
    ctx.command("入门申请",'填写入门申请表。')
        .alias('sign')
        .action(async ({ session }) => {
            let uid = session.userId
            let data = await s.getUser(ctx,uid)

            if(data.flag?.signed) return '已经注册过了哦。';
            
            await session.send('好的，麻烦先在这里填个名字……\n……嗯，要注意的是，不可以有特殊字符或图片、表情哦')

            let username = await session.prompt(Time.minute*2)
            if(!username) return '……写个名字太久了，目前流程已经失效了。'

            if( username.includes("[CQ:")) return '禁止纯文本意外的内容。'
            if( username.match(/((?=[\x21-\x7e]+)[^A-Za-z0-9])/)) return '不能含有特殊字符。'

            let check = await ctx.database.get('user',{name:username})
            if(check.length >= 1 && check[0].onebot != uid) return '不能重名。'

            await ctx.database.setUser(session.platform, uid, { name: username })

            await session.send(`……名字是【${username}】吗？\n了解了，接下来麻烦填个小问卷，检测下是什么灵根吧。`)
            await session.send(`不知道${username}一年四季觉得最舒服的是什么时期呢？\n1.春 2.夏 3.秋 4.冬 5.季节变换时`)

            let answer = await session.prompt(Time.minute*2)
            if(!answer) return '……填太慢了，目前流程已经失效了……'

            if(!s.usertoday[uid]) s.initUserToday(uid);
            s.usertoday[uid]['flag'] = {qa:0, qb:0}

            if(answer.match(/1|春/)) s.usertoday[uid]['flag']['qa'] = 1; //木
            else if(answer.match(/2|夏/)) s.usertoday[uid]['flag']['qa'] = 2; //火
            else if(answer.match(/3|秋/)) s.usertoday[uid]['flag']['qa'] = 3; //金
            else if(answer.match(/4|冬/)) s.usertoday[uid]['flag']['qa'] = 4; //水
            else if(answer.match(/5|季节/)) s.usertoday[uid]['flag']['qa'] = 5; //土
            else return '……呃，输入无效。请从头来过吧……'

            await session.send(`……原来如此。那么，东南西北中，你觉得哪个方位让你最舒服？\n1.东 2.南 3.西  4.北  5.中 `)

            answer = await session.prompt(Time.minute*2)
            if(!answer) return '……填太慢了，目前流程已经失效了……'

            if(answer.match(/1|东/)) s.usertoday[uid]['flag']['qb'] = 1; //木
            else if(answer.match(/2|南/)) s.usertoday[uid]['flag']['qb'] = 2; //火
            else if(answer.match(/3|西/)) s.usertoday[uid]['flag']['qb'] = 3; //金
            else if(answer.match(/4|北/)) s.usertoday[uid]['flag']['qb'] = 4; //水
            else if(answer.match(/5|中/)) s.usertoday[uid]['flag']['qb'] = 5; //土
            else return '……呃，输入无效。请从头来过吧……'

            await session.send(`……了解了。最后，告诉我一个100以内你喜欢的数字。`)

            answer = await session.prompt(Time.minute*2)
            if(!answer) return '……填太慢了，目前流程已经失效了……'

            let a = answer.match(/\d+/)
            let d = parseInt(a[0])

            if(!d) return '……呃，输入无效。请从头来过吧……'

            s.usertoday[uid]['flag']['qc']  = d

            let result = s.usertoday[uid]['flag']['qa'] + s.usertoday[uid]['flag']['qb'] + s.usertoday[uid]['flag']['qc']

            result = result%5

            let list = ['木','火','金','水','土']
            data.flag['signed'] = true

            let txt = `……好了，信息已经填好了。${username}的灵根是：`

            let rate = f.random(100) + ( s.usertoday[uid]['luck'] > 0 ? s.usertoday[uid]['luck']/10 : 0);
            console.log(username,'灵根测试',rate)

            let qa = s.usertoday[uid]['flag']['qa']-1
            let qb = s.usertoday[uid]['flag']['qb']-1

            if(rate >= 90 ){ //单

                data.soul = list[result]

                if(f.random(100) > 90){
                    data.soul = '天'+list[result]
                }

                await s.setUser(ctx,uid,data)
                return txt+f.printSoul(data.soul)
        
            }
            if(rate >= 80 ){ //双
                
                data.soul = list[result]
                
                if(result == qb && result != qa ){

                    data.soul += list[qa]

                }else if(result == qa && result != qb){

                    data.soul += list[qb]

                }
                else{
                    
                    let str = list.join("").replace(data.soul,"")
                    str = str[f.random(3)]
                    data.soul += str
                    
                }

                await s.setUser(ctx, uid, data)
                return txt+f.printSoul(data.soul)
            }
            if( rate >= 60 ){ //三

                if( result != qb &&  result != qa && qa != qb ){
                    data.soul = list[result]+list[qb]+list[qa]
                }
                else{

                    data.soul = list[result]
                    let str = '金木水火土'

                    if(result != qb){
                        data.soul += list[qb]
                    }
                    else if(result != qa){
                        data.soul += list[qa]
                    }

                    str.replace(list[result],"")

                    if(data.soul.length > 1){
                        str = str.replace(data.soul[1],"")
                        str = str[f.random(2)]
                        data.soul += str
                    }
                    else{
                        let a = str[f.random(3)]
                        data.soul += a

                        let b = str.replace(a,"")
                        b = b[f.random(2)]
                        data.soul += b
                    }                   
                }
                await s.setUser(ctx,uid,data)
                return txt+f.printSoul(data.soul)
            }
            if( rate > 40){ //四
                let str = '金木水火土'
                str = str.replace(list[result],"")
                data.soul = str
                return txt + f.printSoul(data.soul)
            }

            data.soul = '杂金木水火土'
            return txt+f.printSoul(data.soul)

        })
    
    ctx.command('小灵通','个人面板')
        .userFields(['name'])
        .action( async ({session})=>{
            let uid = session.userId
            let txt = ''
            let user = await ctx.database.getUser(session.platform, uid)
            let data = await s.getUser(ctx,uid)

            let level = f.getLevelChar(data.level)
            let needexp = f.expLevel(data.level)
            let soul = f.printSoul(data.soul)

            txt = `· ${user.name}的个人面板：\n· 昵称：${user.nick}\n${ data.title.length >1 ? `· 头衔：${data.title}\n` : ''}· 灵根：${soul}\n· 境界：${level}\n· 悟道值：${data.exp}/${needexp}\n· 战斗力：${data.BP}\n· 幸运： ${data.luck}\n—————————————————\nHP：${data.HP}/${data.maxHP}  SP:${data.SP}/${data.maxSP}\nAP: ${data.AP}/${data.maxAP}\nATK:${data.ATK} DEF:${data.DEF}\n—————————————————\n· 持有灵石：${data.money}\n`
            return txt
        })

}