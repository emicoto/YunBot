import { Context, s, Time } from "koishi";
import { Lunar, Tao } from "lunar-javascript"
import * as f from "./function"

import getluck from "./getluck-fork";
import { getJrrp, getJrrpComment } from "./getluck-fork"
import { setFavo } from "./YunCore/Setting";

function getShichen(){
	const gan = [
		'子', '丑', '寅','卯','巳','午','未','申','酉','戌','亥'
	]
	const ke = [
		'一','二','三','四','五','六','七','八'
	]

	let now = getChinaTime()

	let h = Math.floor(now.getHours()/2)
	let m = Math.floor(now.getMinutes()/15)

	let s = gan[h] + '时'
	
	if(h%2 === 0){
		s += ke[m]
	}
	else {
		s += ke[m+4]
	}

	return s + '刻'
	
}

function getChinaTime(){
  var cn = new Date().toLocaleString('jpn',{ timeZone:"Hongkong" })
  var cntime = new Date(cn)
  return cntime
}

export default function com(ctx: Context){

	ctx.plugin(getluck)

	ctx.command("黄历时间","显示现在的黄历时间")
		.shortcut("黄历", {prefix: true})
		.action(()=>{
			let ly = Lunar.fromDate(getChinaTime())
			let year = `${ly.getYearInChinese()}年，天运${ly.getGan()+ly.getZhi()}，生肖 ${ly.getYearShengXiao()}\n${ly.getMonthInGanZhi()}月，${ly.getDayInGanZhi()}日，${ly.getHou()}，月相 ${ly.getYueXiang()}\n${ly.getMonthInChinese()}月 ${ly.getDayInChinese()}日 ${getShichen()}\n`

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
		.shortcut('戳我',{prefix:false})
		.shortcut('戳一戳',{prefix:false, fuzzy:true})
		.action(({ session }, target) => {
			const parsedTarget = target ? s.parse(target)[0] : null
		
			if(!parsedTarget){
				return s('poke', { qq: session.userId })
			}
			else {
				return s('poke', {qq: parsedTarget.data.id})
			}
		})
    
    ctx.command('poke','teach事件专用版戳一戳。')
		.action(({ session }) => {

				ctx.bots.get(`onebot:185632406`).sendMessage(session.channelId,'o(-。- o)===3 ) σ- . -)σ')
				return s('poke', {qq: session.userId})

		})

	ctx.command('个人面板',"个人面板")
	.shortcut('查看面板')
	.action(async({ session }, target)=>{
		let uid = session.userId
		let text = ""
		let user = f.getUser(uid)

			let data = await ctx.database.getUser(session.platform, uid)
			let name = ""

			if(data.name && data.name.length >= 1 ){
				name = data.name
			}
			else{
				name = session.author.nickname
				if (!name) name = session.author.username
			}

			let level = f.getLevelChar(user['level'])
			let needexp = f.expLevel(user)

		text += `· ${name}的个人面板：\n· 境界：${level}\n· 悟道值：${user.exp}/${needexp}\n· 灵石：${user['money']}\n· 小昀的好感度：${user['fav']}`

		return text
	})

	ctx.command('每日签到',"每日签到")
    	.shortcut('签到')
    	.action(({ session }, target) => {
			let uid = session.userId
		let user = f.getUser(uid)

			let luck, name
			let text = ""

			if (!name) name = session.author.nickname
			if (!name) name = session.author.username

			if (f.usertoday[uid]?.sign === true ) {
				return "今天已经签到过了。"
			}

			if(!user['newbonus']){
				user['newbonus'] = true
				user['money'] += 100

				text += "……啊，原来是第一次报道吗？所有新人弟子都能获得100灵石。\n"
			}

			if( !f.usertoday[uid]['jrrp'] || f.usertoday[uid]['jrrp'] == -1){
				luck = getJrrp(uid)
				text += `……好像还没检测今日气运呢。来，麻烦把手放到检测器上。\n嗯……今天的气运有${luck}呢。\n`+getJrrpComment(luck)+"\n然后，"
			}
			else{
				luck = f.usertoday[uid]['jrrp']
			}

			text += "签到是吗？在这里打个卡就可以去领镐子了。\n"

			let num = f.random(3,10) + luck
			text += `\n你拿起镐子，辛勤地在灵矿峰下挥舞。最后获得了${num}个灵石。`
			
			user['money'] += num
			f.usertoday[uid]['sign'] = true
			f.saveUserdata()
			f.saveToday()

			return text

		})


    ctx.command('入门申请 <message>',"用户信息注册")
		 .shortcut('注册 <message>')
		 .action(({ session, options }, message) => {
			//console.log(session,options,message);		 

				let uid = session.userId
				//let user = f.getUser(uid)
				session.send("……名字是【"+message+"】吗……？了解了。接下来麻烦填个问卷，测验下是什么灵根吧。")

				/*const dispose = ctx.middleware((session) => {
				// 仅当接收到的消息包含了对机器人的称呼时才继续处理（比如消息以 @机器人 开头）
				if (session.content=="测试灵根") {
						return '是天灵根呢。'
				} else {
						// 如果去掉这一行，那么不满足上述条件的消息就不会进入下一个中间件了
						dispose()
						return "应该能进入下面了吧？"
				}
				})*/

				return "看看如何"

			})

    
    ctx.command('username [username]','确认以及修改自己的名字')
    .action(async ({ session }, username) => {
			let userdata = await ctx.database.getUser(session.platform, session.userId);
			if(username){
				//userdata.name = username;
				await ctx.database.setUser(session.platform, session.userId, {name:username});

				return '已经将你的用户名改为：' + username;
			}
			else{
				return '你的用户名为：' + userdata.name
			}
    })

    ctx.command('test', '测试')
		.action( async({ session }, message)=>{
				ctx.model.extend("user",{
					YunData:"json",
					nick:"string",
				})
				setFavo(ctx, session.userId, 10)
				return '测试结果详细请看Log.'
		})
    
    ctx.command('打坐修炼','打坐修炼', { maxUsage:5,minInterval: Time.minute*10})
    .action(async({ session }, username) =>{
			let uid = session.userId
			let data = await ctx.database.getUser(session.platform, uid)
			let name = ""

			if(data.name && data.name.length >= 1 ){
				name = data.name
			}
			else{
				name = session.author.nickname
				if(!name) name = session.author.username
				await ctx.database.setUser(session.platform, uid, {name: name})
			}

			let user = f.getUser(uid)
			let today = f.getToday(uid)

			if(!today?.jrrp) {
				getJrrp(uid)
				today = f.getToday(uid)
				}


			let getexp = Math.max(Math.floor(today.jrrp/10),1) + f.random(1,30)

			let text = `@${name} 你静心打坐，领悟到了${getexp}的悟道值。\n悟道经验变化：${user.exp}=>${user.exp+getexp}`

			user.exp += getexp

			if ( user.exp >= f.expLevel(user)){
				//user.level += 1
				//user.exp = 0
				//text += `\n一阵惊雷落下在你身上，你的境界突破了！从${f.getLevelChar(user.level-1)}变成${f.getLevelChar(user.level)}了！`
				text+= `\n悟道经验似乎足够提升境界了……找个黄道吉日突破吧。`
			}

			f.saveUserdata()

			return text			
    })

    ctx.command('境界突破','突破境界', {maxUsage:2})
		.shortcut('顿悟',{prefix:true})
		.action(async({ session }, username) => {
			let uid = session.userId
			let data = await ctx.database.getUser(session.platform, uid)

			let name = ""
			let text = ""
			let getexp

			if(data.name && data.name.length >= 1){
				name = data.name
			}
			else{
				name = session.author.nickname
				if(!name) name = session.author.username
				await ctx.database.setUser(session.platform, uid, {name: name})
			}

			let user = f.getUser(uid)
			let goal = 50 - Math.floor(Math.min(user.level,90)/2)
			console.log(name,'goal',goal)

			if( user.exp >= f.expLevel(user)){
				text = `@${name} 你沐浴更衣，在一个黄道吉日中，选择了个洞天福地释放灵识与天地连接，试图参悟些什么……\n`

				if(f.random(1,100) < goal){
						text += `你顿悟了一丝天地道理！你突破了，从${f.getLevelChar(user.level)}变成${f.getLevelChar(user.level+1)}了！`

						user.level += 1
						user.exp = 0

				}else{

						getexp = f.random(5,30)

						text += `可惜，你什么都没悟到……\n获得悟道经验${getexp}`
						user.exp += getexp
				}
			}
			else{

				getexp = f.random(1,10)

				text = `@${name} 你沐浴更衣，在一个黄道吉日中，试着释放灵识与天地连接，尝试参悟些什么……\n可惜，你经验还不够，没法参悟些什么。悟道经验+${getexp}`
				user.exp += getexp
			}
			f.saveUserdata()
			return text
    })

}
