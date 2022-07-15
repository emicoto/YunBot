import { Context, Next, template, segment, Random, User, s, Time } from "koishi";
import { Lunar, Tao } from "lunar-javascript"
const { createHash } = require('crypto')
import * as f from "./function"

//require("@koishijs/command-utils")
const joption = {
	'level-0':"还是闷头睡觉吧……",
	'level-20':"摆烂了，就好了。",
	'level-40':'普通地渡过普通的一天就好了吧……',
	"level-60":'小赌怡情，大赌伤心……不如出门走走寻找机遇？',
	"level-80":'可以试试赌一把，但不一定有SSR',

	'jackpot-0':"……某种程度来说，也是很厉害。",
	"jackpot-39":"不知为何，这个数字感觉很绿。",
	"jackpot-42":"……宇宙的真理？",
	"jackpot-66":"666，是魔鬼，还是天使？",
	"jackpot-77":"……如果是老虎机，就能中奖了吧。",
	'jackpot-100':"……这是，紫微星天降了！",
}
const levels = [0,20,40,60,80]
const jackpot = [0,39,42,66,77,100]

function intoChar(str: string){
	const N = [
		'〇','一','二','三','四','五','六','七','八','九'
	]
	let s = ""
	for(var i=0; i<str.length; i++){
		s+= N[parseInt(str[i])]
	}
	return s
}

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


function getJrrp(uid){
	  f.getUser(uid)

    const luck = createHash('sha256')
	  luck.update(uid)
    luck.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0))
    luck.update('908')

    let luckvar = parseInt(luck.digest('hex'),16) % 101

    f.usertoday[uid]['jrrp'] = luckvar
    f.saveToday()

    return luckvar
}


function getJrrpComment(luck){

	let comment = ''

	const jackpotIndex = jackpot.indexOf(luck)
	if (jackpotIndex != -1){
		let indexkey = `jackpot-${luck}`
		comment = joption[indexkey]
	}

	if(!comment){
		let key

		const keyIndex = levels.findIndex(level => luck <= level)

		if(keyIndex == -1 ){
			key = levels[levels.length - 1]
		}
		else{
			key = levels[keyIndex - 1]
		}

		let indexkey = `level-${key}`

		comment = "我的建议是："+joption[indexkey]
	}
	
	return comment
}

export default function com(ctx: Context){

    // 更新用户名
    /**
    ctx.middleware(async (session ,next)=>{
    let user = await ctx.database.getUser(session.platform, session.userId)
    if(!user.name) user.name = session.author.nickname
    if(user.name.length < 1) user.name = session.author.username

    const QQAdmin = ['1794362968','1034826119'].includes(session.userId)

    if(QQAdmin && user.authority < 4){
			user.authority = session.userId == '1794362968' ? 5 : 4
    }

    await ctx.database.setUser(session.platform, session.userId, user)
    return next()

})
    ctx.command('my-command')
		.option('writer', '-w <id>')
		.option('writer', '--anonymous', { value: 0 })
		.action(({ options }) => JSON.stringify(options))

    ctx.command('setrole <message> [target] [username]','管理指令。可以设置被艾特群员的权限。')
    .action(async ({ session },message, target, username) => {
		let level = {
			owner:5, admin:4, leader:3, high:2, member:1, banned: 0
		}
		let userdata
		let order = await ctx.database.getUser(session.platform, session.userId)

		if(session.userId !== '1794362968' || (session.userId !== '1794362968' && order.authority < 4) ){
			return '没有权限。'
		}
		else{
			const parsedTarget = target ? s.parse(target)[0] : null

			console.log(message,username,parsedTarget)

			if(parsedTarget){
				userdata = await ctx.database.getUser(session.platform, parsedTarget.data.id);

				console.log('\nbefore:',userdata);

				userdata['authority'] = level[message];
				if(username) userdata['name'] = username;
				if(!userdata.name) userdata['name'] = "";

				console.log('\nafter:',userdata);

				await ctx.database.setUser(session.platform, parsedTarget.data.id, userdata);

				userdata = await ctx.database.getUser(session.platform, parsedTarget.data.id);
			}
			else{
				userdata = order;
				userdata['authority'] = level[message];
				if(username) userdata['name'] = username;
				if(!userdata.name) userdata['name'] = "";

				await ctx.database.setUser(session.platform, session.userId, userdata)
				userdata = await ctx.database.getUser(session.platform, session.userId);
			}
		
			return JSON.stringify(userdata)			
		}     
    })

    ctx.command('checkdata <message>','debug指令，可以在控制台看到指定类型的数据。')
    .action(async ({ session }, message) => {
		 const data = await ctx.database.get(message,null)
		 console.log(data);
		 return 'please check in the log.'
    })

    ctx.command('editdata <message>', 'debug')
		.action(async ({ session }, message) => {

				let stats = await ctx.database.stats()
				console.log(stats)
				if ( !stats.tables?.keywords ){
						ctx.model.extend("keywords",{
						id:"unsigned",
						name:"string",
						group:"list"
				},{
						autoInc: true
				})
				}
				let data = await ctx.database.get('keywords', { id: 1 })
				console.log(data)

				let data = await ctx.database.get('keywords',{name:'送礼'})
				console.log(data)
				data[0].group.push('送礼')
				await ctx.database.set('keywords', {name:'送礼'} , { group: data[0].group })

				let newdata = await ctx.database.get('keywords', {name:'送礼'})
				console.log(newdata)
		})

    /*ctx.command('cleardata <message>')
    .action(async ({ session },message)=>{
		ctx.database.remove(message,null)
		let data = await ctx.database.get(message,null)
		console.log(data)
		return 'all data is cleared, please check in the log.'
    })
*/
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
				console.log(parsedTarget.data.id,parsedTarget)
				return s('poke', {qq: parsedTarget.data.id})
			}
		})
    
    ctx.command('poke','teach事件专用版戳一戳。')
		.action(({ session }) => {

				ctx.bots.get(`onebot:185632406`).sendMessage(session.channelId,'o(-。- o)===3 ) σ- . -)σ')
				return s('poke', {qq: session.userId})

		})

	ctx.command("jrrp","今日人品")
		.shortcut('今日气运',{prefix:false})
		.action(({ session }, target) =>{
			let name
			if (!name) name = session.author.nickname
			if (!name) name = session.author.username

			const luckValue = getJrrp(session.userId)

			const renderResult = comment => {
					let text = `${f.faceicon("普通")}\n……要检测气运值嘛？那麻烦把手放到这边……\n（指了指放在桌子上的镜子）\n嗯……今天${name}的气运值是${luckValue}啊……\n${comment}`
				return text
			}

			let comment = getJrrpComment(luckValue)

			return renderResult(comment)
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
			console.log(f.usertoday[uid]['jrrp'])
				luck = getJrrp(uid)
				text += `……好像还没检测今日气运呢。来，麻烦把手放到检测器上。\n嗯……今天的气运有${luck}呢。\n`+getJrrpComment(luck)+"\n然后，"
			}
			else{
				luck = f.usertoday[uid]['jrrp']
			}

			text += "签到是吗？在这里打个卡就可以去领镐子了。\n"

			let num = f.random(3,10) + luck
		console.log(luck,num)
			text += `\n你拿起镐子，辛勤地在灵矿峰下挥舞。最后获得了${num}个灵石。`
			
			user['money'] += num
			f.usertoday[uid]['sign'] = true
			f.saveUserdata()

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
				console.log(Time.minute)
				return "只是个测试"
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
				if (!name) name = session.author.username
			}

			let user = f.getUser(uid)
			let today = f.getToday(uid)

			if(!today?.jrrp) {
				getJrrp(uid)
				today = f.getToday(uid)
				}


			let getexp = Math.max(Math.floor(today.jrrp/10),1) + f.random(1,30)

			let text = `@${name} 你静心打坐，领悟到了${getexp}的悟道值。\n悟道经验变化：${user.exp}=>${user.exp+getexp}`

			console.log(name,getexp,today.jrrp)

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
			}

			let user = f.getUser(uid)
			let goal = 50 - Math.floor(Math.min(user.level,90)/2)
			console.log('goal',goal)

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
