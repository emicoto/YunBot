import { Context, RuntimeError, segment, Time } from "koishi";

import * as f from "./Function"
import * as s from "./Setting"
import { LingGenUtils } from "./lib/LingGen";
import { CountStats } from "./lib/CountStats";
import { getJrrp } from "./getluck";
import { NormalAtk } from "./lib/Attak";

export default function UserCom(ctx: Context) {

  function clearflag(pid, tid){
	let ptoday = s.getToday(pid);
	let ttoday = s.getToday(tid);

	ptoday.flag['切磋'] = null;
	ptoday.flag['切磋对象'] = null;
	ttoday.flag['切磋'] = null;
	ttoday.flag['切磋对象'] = null;
	s.saveToday();
  }

  ctx.command("切磋邀请 <target>", '与同门弟子切磋')
	.action(async ({ session }, target) => {
		const parsedTarget = target ? segment.parse(target)[0] : null;

		if (!parsedTarget || !parsedTarget.data.id) {
		return "没有切磋对象哦。";
		}

		let pid = session.userId;
		let tid = parsedTarget.data.id;

		f.CountUsage(pid, "切磋邀请");

		let ply = await s.getUser(ctx, pid);
		let tar = await s.getUser(ctx, tid);

		let ptoday = s.getToday(pid);
		let ttoday = s.getToday(tid);

		//邀请方的flag计入,先清理残留的旧flag。
		clearflag(pid,tid)

		if (!tar) return `没有切磋对象哦。`;
		if ( ply.AP == 0) return 'AP不足。';
		if ( tar.AP == 0) return '对方AP不足。';

		ptoday.flag['切磋'] = true;
		ptoday.flag['切磋对象'] = tid;
		s.saveToday();

		await session.send(`${ply.name}对${tar.name}发出切磋邀请。\n被邀请方请输入 .回应切磋 @挑战方 则作为应答。应答后开始切磋。`)

		return '已邀请，请等待对方应答。'
		
	})

  ctx.command("回应切磋 <target>", "与同门弟子切磋")
	.action(async ({ session }, target) => {
		const parsedTarget = target ? segment.parse(target)[0] : null;

		if (!parsedTarget || !parsedTarget.data.id) {
		return "没有切磋对象哦。";
		}

		let pid = session.userId;
		let tid = parsedTarget.data.id;

		f.CountUsage(pid, "回应切磋");

		let tar = await s.getUser(ctx, pid);
		let ply = await s.getUser(ctx, tid);

		if (!tar) return `没有切磋对象哦。`;

		let ptoday = s.getToday(pid)
		let ttoday = s.getToday(tid)

		// 被挑战方的应答流程。
		if( ttoday.flag['切磋对象'] == pid ){
			ply.AP --
			tar.AP --
			await s.setUser(ctx, tid, ply)
			await s.setUser(ctx, pid, tar)
		}
		else{
			clearflag(pid,tid)
			return '不在对方的邀请对象中。'
		}

		//三局两胜。
		const fight = function(A, B){
			let result = NormalAtk(A,B)
			let msg

			let re = {
				msg : '',
				win : true,
				dmg : (result.lstdmg ? result.lstdmg : 0),
			}

			msg = `${A.name}对${B.name}试图攻击。`
			//console.log('re.dmg',re.dmg)

			if(!result.hit){
				if(result.critcal) msg += `\n${result.txt}并遭遇反击，并且${B.name}对${A.name}造成${result.critcal}。`;
				else msg += `\n可惜，${result.txt}。被${B.name}敏捷地躲开了。`
				
				if(result.fb){
					msg += `\n${B.name}敏捷地闪开后，`
					msg += f.either(['一个巴掌呼过来，','一拳挥过来，','一个飞踢过来，','一个转身踹过来，'])
					msg += `在对${A.name}造成${result.lstdmg}点伤害之前，停了下来。`
				}
				re.win = false
				re.msg = msg

				return re
			}
			else{
				msg += `${result.txt}。`

				if(result.critcal) msg += `并且对${B.name}打出了${result.critcal}。`
				msg += `\n在对${B.name}准备造成${result.lstdmg}点伤害之前，${A.name}停了下来。`
				re.win = true
				re.msg = msg

				return re
			}
		}

		let txt, pwin=0, twin=0, round=1

		const setRound = function(ply, tar){
			let round_p = fight(ply, tar)
			let round_t = fight(tar, ply)
			let pdmg = 0, tdmg = 0
			let txt = []

			if( round_p.win === true ) pdmg += round_p.dmg;
			else tdmg += round_p.dmg;

			if(round_t.win === true ) tdmg += round_t.dmg;
			else pdmg += round_t.dmg

			txt[0] = round_p.msg
			txt[1] = round_t.msg

			//console.log(pdmg, tdmg)

			//P胜出。
			txt[2] = `第${f.intoChar(round.toString())}回合最终结果：`
			if( pdmg > tdmg ){
				txt[2] += `${ply.name}胜出。`
				pwin ++
			}
			else if ( tdmg > pdmg ){
				txt[2] += `${tar.name}胜出。`
				twin ++
			}
			else {
				txt[2] += `双方平手。`
				pwin ++
				twin ++
			}
			round ++
			return txt.join('\n')
		}

		txt = setRound(ply, tar) //第一回合
		await session.sendQueued(txt)

		txt = setRound(ply, tar) //第二回合
		await session.sendQueued(txt,500)

		txt = setRound(ply, tar) //第三回合
		txt += `\n最终结果：`
		if(pwin > twin) txt += `${ply.name}胜出。`
		else if( twin > pwin ) txt += `${tar.name}胜出。`
		else txt += '平手。'

		clearflag(pid,tid)

		session.sendQueued(txt,500)
		return

	});

  ctx.command('setnick <nick:text>', '设置路昀对你的昵称。优先于用户名。')
	.alias('callme')
	.shortcut('叫我')
	.userFields(['id', 'nick'])
	.action(async ({ session }, nick) => {
		const { user } = session;
		if (!nick) {
		if (user.nick) {
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

		if (nick.includes("[CQ:")) {
		return '禁止包含纯文本以外的内容'
		}
		if (nick.match(/((?=[\x21-\x7e]+)[^A-Za-z0-9])/)) {
		return '不能含有特殊字符'
		}
		let check = await ctx.database.get('user', { nick: nick })
		if (check.length >= 1 && check[0].onebot != session.userId) {
		return '不能重名。'
		}
		try {
		user.nick = nick;
		await user.$update();
		return txt
		}
		catch (error) {
		if (RuntimeError.check(error, "duplicate-entry")) {
			return '昵称跟别人的重复了哦。'
		} else {
			ctx.logger("common").warn(error);
			return "因不明原因设置失败了。详情请看后台日志。"
		}
		}
	})

  ctx.command("username <username:text>", "设置用户名")
	.userFields(['id', 'name'])
	.action(async ({ session }, username) => {
		const { user } = session;
		if (!username) {
		if (user.name) {
			return '你的用户名为：' + user.name
		}
		return '你的用户名为空。'
		}

		let txt = `${username}……吗？\n了解了，已经记录到门派档案。`
		if (username.includes("[CQ:")) {
		return '禁止包含纯文本以外的内容'
		}
		if (username.match(/((?=[\x21-\x7e]+)[^A-Za-z0-9])/)) {
		return '不能含有特殊字符'
		}
		try {
		user.name = username;
		await user.$update();
		return txt
		}
		catch (error) {
		if (RuntimeError.check(error, "duplicate-entry")) {
			return '……不能重名。'
		} else {
			ctx.logger("common").warn(error);
			return "因不明原因设置失败了。详情请看后台日志。"
		}
		}
	})

  ctx.command("入门申请", '填写入门申请表。')
	.alias('sign')
	.action(async ({ session }) => {
		let uid = session.userId
		let data

		data = await s.getUser(ctx, uid)

		if (data.flag?.signed) return '已经注册过了哦。';

		data = await s.newUser(ctx, uid)

		await session.send('好的，麻烦先在这里填个名字……\n……嗯，要注意的是，不可以有特殊字符或图片、表情哦')

		let username = await session.prompt(Time.minute * 2)
		if (!username) return '……写个名字太久了，目前流程已经失效了。'

		if (username.includes("[CQ:")) return '禁止纯文本意外的内容。'
		if (username.match(/((?=[\x21-\x7e]+)[^A-Za-z0-9])/)) return '不能含有特殊字符。'

		let check = await ctx.database.get('user', { name: username })
		if (check.length >= 1 && check[0].onebot != uid) return '不能重名。'

		await ctx.database.setUser(session.platform, uid, { name: username })

		await session.send(`……名字是【${username}】吗？\n了解了，接下来麻烦填个小问卷，检测下是什么灵根吧。`)
		await session.send(`不知道${username}一年四季觉得最舒服的是什么时期呢？\n1.春 2.夏 3.秋 4.冬 5.季节变换时`)

		let answer = await session.prompt(Time.minute * 2)
		if (!answer) return '……填太慢了，目前流程已经失效了……'

		let today = s.getToday(uid)
		today.flag = { qa: 0, qb: 0 }

		if (answer.match(/1|春/)) today.flag.qa = 1; //木
		else if (answer.match(/2|夏/)) today.flag.qa = 2; //火
		else if (answer.match(/3|秋/)) today.flag.qa = 3; //金
		else if (answer.match(/4|冬/)) today.flag.qa = 4; //水
		else if (answer.match(/5|季节/)) today.flag.qa = 5; //土
		else return '……呃，输入无效。请从头来过吧……'

		await session.send(`……原来如此。那么，东南西北中，你觉得哪个方位让你最舒服？\n1.东 2.南 3.西  4.北  5.中 `)

		answer = await session.prompt(Time.minute * 2)
		if (!answer) return '……填太慢了，目前流程已经失效了……'

		if (answer.match(/1|东/)) today.flag.qb = 1; //木
		else if (answer.match(/2|南/)) today.flag.qb = 2; //火
		else if (answer.match(/3|西/)) today.flag.qb = 3; //金
		else if (answer.match(/4|北/)) today.flag.qb = 4; //水
		else if (answer.match(/5|中/)) today.flag.qb = 5; //土
		else return '……呃，输入无效。请从头来过吧……'

		await session.send(`……了解了。最后，告诉我一个100以内你喜欢的数字。`)

		answer = await session.prompt(Time.minute * 2)
		if (!answer) return '……填太慢了，目前流程已经失效了……'

		let a = answer.match(/\d+/)
		let d = parseInt(a[0])

		if (!d) return '……呃，输入无效。请从头来过吧……'

		today.flag.qc = d
		s.saveToday()

		let result = today.flag.qa + today.flag.qb + today.flag.qc

		result = result % 5

		data.flag['signed'] = true

		let txt = `……好了，信息已经填好了。${username}的灵根是：`

		let rate = f.random(100) + (today['luck'] > 0 ? today['luck'] / 10 : 0);
		console.log(username, '灵根测试', rate)

		let qa = today.flag.qa-1
		let qb = today.flag.qb-1

		const linggen = LingGenUtils.getLingGen(rate)
		const utils = new LingGenUtils({linggen, result,qa,qb});
		data.soul = utils.getSoul();

		await s.setUser(ctx, uid, data)
		return txt + f.printSoul(data.soul)

	})

  ctx.command('小灵通', '个人面板', { minInterval: Time.minute*2})
	.userFields(['name'])
	.action(async ({ session }) => {
		let uid = session.userId
		let data = await CountStats(ctx,uid)

		if( !data.flag?.signed ) return '……这位道友，你还没有本宗门的小灵通。麻烦先通过.入门申请吧……' ;

		let today = s.getToday(uid)	

		let user = await ctx.database.getUser(session.platform, uid)
		let rate = await f.getBreakRate(ctx,uid)
		let txt = []		

		if( !today.usage['小灵通'] ) today.usage['小灵通'] = 0;

		f.CountUsage(uid,'小灵通')

		let level = f.getLevelChar(data.level)
		let needexp = f.expLevel(data.level)
		let soul = f.printSoul(data.soul)

		txt = [
			`· ${user.name}的个人面板：\n`,
			`${ (user.nick.length > 1 ? `· 昵称 ${user.nick}\n` : '') }`,
			`${ data.title.length >1 ? `· 头衔：${data.title}\n` : ''}`,
			`· 灵根：${soul}\n`,
			`· 境界：${level}\n`,
			`· 悟道值：${data.exp}/${needexp}\n`,
			`· 战斗力：${data.BP}\n`,
			`· 幸运：${ today['luck'] > 0 ? `${today['luck']}` : `未检测` }\n`,
			`${ data.lastluck > 0 ? `· 昨日幸运：${data.lastluck}\n` : '' }`,
			`· 突破概率：${rate}%\n`,
			`———————————————\n`,
			`HP：${data.HP}/${data.maxHP}  SP：${data.SP}/${data.maxSP}　AP：${data.AP}/${data.maxAP}\n`,
			`ATK：${data.ATK}  DEF：${data.DEF}  SPD：${data.SPD}\n`,
			`———————————————\n`,
			`${ data.core.id > 0 ? `· 主修心法：${data.core.name}\n` : ''}`,
			`${ data.equip.weapon.id > 0 ? `· 装备法器：${data.equip.weapon.name}\n` : ""}`,
			`· 持有灵石：${data.money}\n`,
			]
			
		let msg = txt.join("")
		
		session.sendQueued(msg,1000)
	})

	ctx.command('查看路昀','路昀的个人面板',{ minInterval: Time.minute*5})
	.action(async ({ session }) => {
		let time = f.cnTime()
		let zone = f.getTimeZone(time.getHours())

		let data = await CountStats(ctx,s.yunbot,1)
		let luck = getJrrp(s.yunbot)
		let rate = await f.getBreakRate(ctx,s.yunbot, 1)
		let level = f.getLevelChar(data.level)
		let mood = ''
		if(s.yunstate.mood >= 70) mood = '愉快';
		else if(s.yunstate.mood > 50 && s.yunstate.mood < 70) mood = '普通';
		else mood = '不爽';

		let dress = 'normal'

		if (['凌晨','黎明','晚上','深夜'].includes(zone)) dress = 'sleep';
		if(['凌晨','黎明'].includes(zone) && f.random(100) > 90 ) dress = 'sp';

		let user = await s.getUser(ctx,session.userId)

		let txt = [
			'路昀的状态 --- | Yunbot ver0.9.0',
			f.images(`Yunstand_${dress}_${mood}.png`),
			`· 心情：${'♥'.repeat(Math.floor(data.mood/20+0.5))}`,
			`· 特征：${data.talent.join('、')}`,
			`· 灵根：天 · 水灵根`,
			`· 境界：${level}`,
			`· 战斗力：${data.BP}`,
			`· 悟道值：${data.exp}/${f.expLevel(data.level)}`,
			`· 幸运值：${luck}`,
			`· 突破概率： ${rate}`,
			`——————————————`,
			`HP：${data.HP}/${data.maxHP}  SP:${data.SP}/${data.maxSP}`,
			`AP：${data.AP}/${data.maxAP}　SAN：${data.san}/${data.maxsan}`,
			`ATK：${data.ATK}  DEF:${data.DEF}  SPD:${data.SPD}`,
			`——————————————`,
			`主修心法：${data.core.name}`,
			`装备法器：${data.equip.weapon.name}`,
			`持有灵石：${data.money}`,
			`——————————————`,
			`对你的信赖：${user.trust/10}`,
			`对你的好感：${user.favo/10}`,
			]
		
		session.sendQueued(txt.join("\n"))
		return 
	})

}
