//每日的修行
import { Context, segment, Time } from "koishi";
import { getJrrp, getJrrpComment } from "./getluck";

import * as f from "./Function";
import * as s from "./Setting";
import { setYunWork } from "./Event";
import { CoreLib } from "./lib/Library";
import { CountStats } from "./lib/CountStats";

export default function Daily(ctx: Context) {
	ctx.command("每日签到", "每日签到。签到前最先找小昀算一卦。")
		.shortcut("签到")
		.shortcut("打卡")
		.action(async ({ session }) => {
			let uid = session.userId;
			let data = await s.getUser(ctx, uid);
			let name = s.getName(data);

			let today = s.getToday(uid);

			if (today.sign === true) {
				return "……今天已经打过卡了。";
			}

			if (!data.flag?.signed) {
				return "签到之前麻烦先填份入门信息吧……";
			}

			let luck;
			let text = "路昀：“";

			if (today.luck <= 0) {
				luck = getJrrp(uid);
				text += `……还没算气运吧？来，先抽个签吧……”（指了指一旁的签筒）。\n “嗯……今天${name}的气运有${luck}呢。”\n小昀的今日一言：${getJrrpComment(
					luck
				)}\n\n“然后，`;
			}

			luck = today.luck;

			text += "打卡对吗？ 在这里刷一下小灵通就可以去领稿子了。”";

			let num = f.random(3, 10) + Math.max(Math.floor(luck / 3 + 0.5), 1);

			text += `\n@${name} 你拿起稿子，辛勤地在灵矿峰下挥舞。\n最后获得了${num}灵石。`;

			today.sign = true;
			data["money"] += num;

			today.usage["每日签到"] = 1;
			data.AP = data.maxAP

			await s.setUser(ctx, uid, data);
			s.saveToday();

			session.sendQueued(text, 1000);
			return;
		});

	ctx.command("每日任务 [message]", "每日可以做的任务。")
		.action(async ({ session }, message) => {
			let uid = session.userId;
			let text = "";
			let data = await s.getUser(ctx, uid);
			let name = await s.getUserName(ctx, session);

			if (!message || ["帮助", "help"].includes(message)) {
				session.sendQueued("本功能还没做完。");
				return;
			}
		});

	ctx.command("修炼", "进行日常修炼", { minInterval: Time.minute * 10 })
		.action(async ({ session }) => {
			let uid = session.userId;
			let data = await s.getUser(ctx, uid);
			let name = s.getName(data);
			let luck;

			let today = s.getToday(uid);

			if (!data.flag?.signed) {
				return "……嗯？这位道友，是我们灵虚派的门生弟子吗？麻烦先填个表吧……";
			}

			if (f.ComUsage(today, "修炼", 5) === false) {
				return "一天最多只能修炼五次而已……";
			} else {
				f.CountUsage(uid, "修炼");
			}

			if (today.luck <= 0) {
				luck = getJrrp(uid);
			}
			luck = today.luck;

			//修炼的获取exp
			let exp = f.getExp(data.level, luck, 3, 45)
			console.log(`${name}的修炼结果：exp`,exp, 'result', f.expCount(exp, data))

			exp = f.expCount(exp, data);

			let txt = `@${name} 你${f.maybe([
				["静心打坐", 30],
				["打扫整理", 10 + (uid == s.cleaner ? 70 : 0)],
				["静坐冥思", 30],
				["参阅经书", 30 + (uid == s.senior ? 30 : 0)],
				["吞纳吸气", 30],
				["奋笔疾书", 20 + (uid == s.brother ? 50 : 0)],
			])}，对修心之道有了些许领悟。\n悟道经验变化：${data.exp}+${exp}=>${data.exp + exp}/${f.expLevel(data.level)}`;

			let rate = f.random(103) + (s.yunstate.mood > 60 ? s.yunstate.mood/10 : 0-s.yunstate.mood/5)
			
			if ( s.usertoday.userwork >= 5 && ["free", "wake"].includes(s.yunstate.stats) && s.usertoday.yunwork < 5 && rate > 80
			) {
				let txt1 = `不知是否被同门师兄弟的修炼热情感染，路昀也稍微打气精神，跟着${name}一起开始修炼了。`;

				await session.send(txt1);
				setYunWork(session);
			}

			data.exp += exp;
			await s.setUser(ctx, uid, data);

			s.usertoday.userwork++;
			s.saveToday();

			session.sendQueued(txt, 100);
			return;
		});

	ctx.command("境界突破", "境界突破", { minInterval: Time.minute * 10 })
		.alias("突破")
		.action(async ({ session }) => {
			let uid = session.userId;
			let data = await s.getUser(ctx, uid);
			let name = s.getName(data);
			let today = s.getToday(uid);

			if (f.ComUsage(today, "突破", 2) === false) {
				session.sendQueued("一天只能尝试突破两次哦。");
				return;
			} else {
				f.CountUsage(uid, "突破");
			}

			if (!data.flag?.signed) {
				session.sendQueued(
					"……嗯？这位道友，是我们灵虚派的门生弟子吗？麻烦先填个表吧……"
				);
				return;
			}

			let getexp;
			let text =
				`在一个黄道吉日里，@${name} 你沐浴更衣后，` +
				f.maybe([
					["盘腿而坐，闭目冥思感应天地", 30],
					[
						"收拾整顿，用抹布细心打扫道观的所有角落",
						10 + (uid == s.cleaner ? 70 : 0),
					],
					["金鸡独立，在瀑布下洗涤身心", 30],
					["点燃熏香，细细品读经文", 30 + (uid == s.senior ? 30 : 0)],
					["吞纳吸气，感受体内灵气的运作", 30],
					["奋笔疾书，将所思所想归纳总结", 20 + (uid == s.brother ? 50 : 0)],
				]);

			text += `，试图从中捕捉一丝道理……\n`;

			let goal = await f.getBreakRate(ctx, uid);
			console.log(name, "突破概率", goal);

			if (data.exp >= f.expLevel(data.level) && f.random(100) <= goal) {
				text += `你领悟了一丝天地之道！ 你突破了，从${f.getLevelChar( data.level )}变成${f.getLevelChar(data.level + 1)}了！`;
				
				f.breakProces(data)

			} else {
				getexp = f.random(2, 25) + Math.max(today.luck / 5, 1);
				getexp = Math.floor(getexp * f.getExpBuff(data) + 0.5);

				text += `你没悟到什么，只是获得了一点心得。\n悟道经验 +${getexp}`;
				data.exp += getexp;
			}
			await s.setUser(ctx, uid, data);
			session.sendQueued(text);
			return;
		});

	ctx.command("修习心法", "修习主心法", { minInterval: Time.hour / 3 })
		.action(async ({ session }) => {
			let uid = session.userId;
			let data = await CountStats(ctx, uid);
			let name = s.getName(data);
			let today = s.getToday(uid);
			let txt = "";

			if (data.level < 5) return "……等级不够，起码要入门五阶才能修习心法吧。";

			if (!data.core?.id) {
				txt = `……嗯？${name}似乎还没有主修的心法的样子……\n本门派有三种基础心法，灵犀、灵空、灵虚。\n灵犀心法主修攻击，灵空心法主修防御，灵虚心法主修敏捷。\n至于修哪套……\n（看了看几本基础心法秘诀的封面，居然都没有写名字）\n没办法了，只好随便抽一本了。抽到什么是什么了……`;

				let pool = ["灵犀心法", "灵空心法", "灵虚心法"];
				let id = f.random(2);
				let n = pool[id];
				let newcore = {};

				newcore = JSON.parse(JSON.stringify(CoreLib[n]));
				data.core = newcore;
				await s.setUser(ctx, uid, data);

				txt += `\n嗯，就这本吧。\n(${name}获得了心法：${n}）`;

				session.sendQueued(txt, 1000);
				return;
			}

			if (f.ComUsage(today, "修习心法", 3) === false) {
				session.sendQueued("……欲速则不达，心法的修习一天最多3次而已……", 500);
				return;
			} else {
				today.usage["修习心法"]++;

				let core = data.core;
				let luck = (data.luck ? data.luck : getJrrp(uid))

				let exp = 1 + f.random(data.core.grade+1);
				let bexp = 3 + f.getExp(data.level, luck, 1, 20);
				bexp = f.expCount(bexp, data);

				let nexexp = Math.floor( core.level * 10 * Math.pow(core.grade,2)+0.5);
				nexexp = Math.floor(nexexp/20+0.5)*20

				txt = `灵气流转，通过自身天地八脉灵脉，气息沉淀过后，多少获得了一些心得。\n悟道经验变化：${ data.exp }+${bexp}=${data.exp + bexp}\n心法修炼进度：${core.exp}+${exp}=${ exp + core.exp }/${nexexp}`;

				data.exp += bexp;
				data.core.exp += exp;

				let rate = f.random(100);

				if (data.core.exp > nexexp && core.level < core.maxlevel && rate < 50) {
					txt += `\n日积月累，滴水成河。你对心法的研修达到了一个圆满阶段！你的心法获得了升华，从${
						core.level
					}升级为${core.level + 1}了。`;
					data.core.level++;
					data.core.exp -= nexexp;
					data.core.exp = Math.max(Math.floor(data.core.exp / 2), 0);
				}

				await s.setUser(ctx, uid, data);
				s.saveToday();

				session.sendQueued(txt, 1000);
				return;
			}
		});


  ctx.command("陪同修炼", "和路昀一起修炼", { minInterval: Time.hour / 2 })
	.action(async ({ session }) => {
		let uid = session.userId;
		let data = await s.getUser(ctx, uid);
		let name = await s.getUserName(ctx, session);
		let today = s.getToday(uid);

		if (f.ComUsage(today, "陪同修炼", 2) === false) {
			session.send("……我已经累了……（一天只能两次）");
			return;
		}

		if(s.yunstate.AP <= 0){
			session.send("……今天已经够了吧。（路昀的AP不足了）");
			return;
		}

		if(!data.flag?.signed){
			return '……？我们认识吗？'
		}

		f.CountUsage(uid,'陪同修炼')

		await session.sendQueued(`@${name}你向路昀提出了一起修炼的提议。`)

		let txt
		
		txt = [
			`${f.faceicon('困惑')}`,
			`……修炼？（心感困惑，犹豫良久后）`,
			`行吧……那就，一起修炼吧……`
			]
		
		await session.sendQueued(txt.join("\n"))

		let luck = today.luck
		let exp = f.getExp(data.level,luck,5,60)
		exp = f.expCount(exp,data)

		let expl =f.random(5,60) + Math.floor(s.yunstate.mood/10+0.5)
		expl = f.expCount(expl,s.yunstate)

		txt = `${name}邀请路昀共同修炼，`
			  + f.maybe([
				["在练功房中一起静心打坐", 30],
				["在弟子观中一起打扫整理", 10 + (uid == s.cleaner ? 70 : 0)],
				["在冥想室中一起静坐冥思", 30],
				["在藏经阁中一起参阅经书", 30 + (uid == s.senior ? 30 : 0)],
				["在洞天中一起吞纳吸气", 30],
				["在学堂中一起奋笔疾书", 20 + (uid == s.brother ? 50 : 0)],
			  ]) + `。`
			+`\n不知是否有人陪同修炼的关系，领悟比平时获得的更多。\n${name}的悟道经验变化：${data.exp}+${exp}=>${data.exp+exp}`
			+`\n路昀的悟道经验变化：${s.yunstate.exp}+${expl}=>${s.yunstate.exp+expl}\n路昀的信赖稍微提高了一点。`;
		
		data.exp += exp
		s.yunstate.exp += expl
		s.yunstate.AP --
		await s.yunsave()
		await s.setUser(ctx,uid,data)
		await s.setTrust(ctx,uid,f.random(1,3))

		await setTimeout(() => {
			session.sendQueued(txt)
		}, 2000);
		return

	});

	ctx.command("共同突破","和路昀一起突破", { minInterval: Time.hour / 2 })
		.action(async ({ session }) => {
			let uid = session.userId;
			let data = await s.getUser(ctx,uid);
			let name = s.getName(data);
			let today = s.getToday(uid);

			let breakflag = (data.exp >= f.expLevel(data.level))
			let yunbreak = (s.yunstate.exp >= f.expLevel(s.yunstate.level))

			if(f.ComUsage(today,'共同突破',2) === false){
				return '……今天已经够了吧？(一天只能两次）';
			}

			if(s.yunstate.AP <= 0){
				session.send("……今天我已经累了……（路昀的AP不足了）");
				return;
			}

			if(!data.flag?.signed){
				return '……？我们认识吗？'
			}

			if( !breakflag && !yunbreak){
				return '……还没到突破的时机吧……？'
			}

			f.CountUsage(uid,'共同突破')


			let txt = `@${name} 你对路昀提出了共同突破的提议。`

			await session.sendQueued(txt,500)

			txt = `${f.faceicon('困惑')}\n`
				+ ( breakflag && yunbreak ? `……一起突破吗？`
				: yunbreak ? `……${name}是要陪我突破吗？`
				: `……${name}是希望我陪你突破吗？`)
				+`\n……（犹豫了会），好吧。`
			
			await session.sendQueued(txt)

			txt = `在一个黄道吉日里，${name} 你沐浴更衣后，邀请路昀一起到灵虚山的洞天峰进行突破。`
				+ `\n你们`+f.maybe([
					["盘腿而坐，闭目冥思感应天地", 30],
					["点燃熏香，细细品读经文", 30 + (uid == s.senior ? 30 : 0)],
					["吞纳吸气，感受体内灵气的运作", 30],
					["奋笔疾书，将所思所想归纳总结", 20 + (uid == s.brother ? 50 : 0)],
				])
				+`，试图从中捕捉一丝道理……\n`;		

			let goal = await f.getBreakRate(ctx,uid) + f.random(3,12)
			let ygoal = await f.getBreakRate(ctx,'',true) + f.random(5,12)

			let r = f.random(100)
			let yr = f.random(100)

			console.log(name,'突破',r,'/',goal)
			console.log('路昀突破',yr,'/',ygoal)

			if( breakflag && r <= goal && yunbreak && yr <= ygoal){
				txt += `你们领悟了一丝天地之道！你和路昀都突破了！\n`
					+ `你从${f.getLevelChar( data.level)}变成${f.getLevelChar(data.level + 1)}了！\n`
					+ `路昀从从${f.getLevelChar(s.yunstate.level)}变成${f.getLevelChar(s.yunstate.level+1)}了！`
				
				txt += '\n同时突破的你们十分高兴，情不自禁地抱在了一块。但很快就分离了。\n（好感与信赖都增加了。）'
				await s.setFavo(ctx,uid,f.random(5,15))
				await s.setTrust(ctx,uid,f.random(5,10))
			}
			else if(breakflag && r <= goal){
				txt += `你领悟了一丝天地之道！在路昀的见证下， 你突破了，从${f.getLevelChar( data.level)}变成${f.getLevelChar(data.level + 1)}了！`;
			}

			else if(yunbreak && yr <= ygoal){
				txt += `路昀领悟了一丝天地之道！在你的见证下，路昀突破了，从${f.getLevelChar(s.yunstate.level)}变成${f.getLevelChar(s.yunstate.level+1)}了！`

			}
			else{

				let exp = f.random(5,30) + Math.max(today.luck/5,1)
				exp = Math.floor(exp*f.getExpBuff(data) + 0.5)

				let yexp = f.random(5,40) + s.yunstate.mood/5
				yexp = Math.floor(yexp*f.getExpBuff(s.yunstate,1)+0.5)

				if(breakflag && yunbreak) txt += `可惜，你们都突破失败了。看来仙路漫漫长……\n`
				else if(yunbreak) txt += `可惜，路昀突破失败了，只是获得了些许领悟。同时你也从中获得些许心得。\n`
				else txt += `可惜，你突破失败了，只是从中获得些许心得。在一旁围观你的突破的路昀也从中受益良多。\n`

				txt+=`你的悟道经验 +${exp} = ${data.exp+exp}\n`
				txt+=`路昀的悟道经验 +${yexp} = ${s.yunstate.exp+yexp}`

				data.exp += exp
				s.yunstate.exp += yexp

			}

			if(breakflag && r<= goal) f.breakProces(data)

			if(yunbreak && yr <= goal){
				f.breakProces(s.yunstate)
				s.yunstate.flag.levelup = false
				s.yunstate.AP--
			}

			txt += `小昀对你的信赖度增加了一点。`
			let trust = f.random(5,15)
			data.trust += trust
			await s.setUser(ctx,uid,data)
			await s.yunsave()
			
			await setTimeout(() => {
				session.sendQueued(txt)
			}, 2000);

			return
		})
}
