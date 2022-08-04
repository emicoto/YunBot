import { Context, Time } from "koishi"
import { createHash } from "crypto" 
import * as f from "./Function"
import * as s from "./Setting"

import { huandaxian,hdxlq } from "./lib/huandaxian"
import { zhougong, zglq} from "./lib/zhougong"

const levels = [0,20,40,60,80]
const jackpot = [1,39,42,66,77,100]
const zgpot = [1]
const hdxpot = [98,99,100]

const YunOpinion = {
	"level-0":"还是闷头睡觉吧……",
	"level-20":"摆烂了，就好了。",
	"level-40":'普通地渡过普通的一天就好了吧……',
	"level-60":'小赌怡情，大赌伤心……不如出门走走寻找机遇？',
	"level-80":'可以试试赌一把，但不一定有SSR',

	"jackpot-0":"……某种程度来说，也是很厉害。",
	"jackpot-39":"不知为何，这个数字感觉很绿。",
	"jackpot-42":"……宇宙的真理？",
	"jackpot-66":"666，是魔鬼，还是天使？",
	"jackpot-77":"777……如果是老虎机，就能中奖了吧。",
	"jackpot-100":"……这是，紫微星天降了！",

	"zg-1":"……能抽到这个签，某种程度来说也很厉害。看着山穷水尽，或许暗处还藏着转机吧。",
	"hdx-98":"……花好，月圆。这个签更偏向人……人际关系上或许有新的开始或好的变化呢。",
	"hdx-99":"……春风得意马蹄疾。好的开始，新的转机。如果有什么还在犹豫，建议现在就下决定吧。",
	"hdx-100":"……居然！是头签？！……看来今天运气爆棚，心想事成吧。",
}

export function getJrrp(uid){

	
	let today = s.getToday(uid)

	const lk = createHash('sha256')
	lk.update(uid)
	lk.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0))
	lk.update('908')

	let luck = Math.max(parseInt(lk.digest('hex'),16) % 101,1)

	today.luck = luck
	s.saveToday()

	return luck
}

export function getJrrpComment(luck,pot?){
	let comment

	if(pot =='黄大仙' && hdxpot.indexOf(luck)){
		comment = YunOpinion[`hdx-${luck}`]
	}
	if(pot == '周公' && zgpot.indexOf(luck)){
		comment = YunOpinion[`zg-${luck}`]
	}

	const jackpotIndex = jackpot.indexOf(luck)
	if(!comment && jackpotIndex != -1){
		let indexkey = `jackpot-${luck}`
		comment = YunOpinion[indexkey]
	}

	if(!comment){
		let key
		const keyIndex = levels.findIndex(level => luck <= level)

		if(keyIndex == -1){
			key = levels[levels.length - 1]
		}
		else{
			key = levels[keyIndex - 1]
		}

		let indexkey = `level-${key}`

		comment = YunOpinion[indexkey]
	}

	return comment
}

export function getOmikuji(luck,uid){
	let kuji
	let txt
	let pot = ''

	let user = s.getToday(uid)

	if(user.kuji?.no){

		pot = user.kuji.pot

		if(user.kuji.pot=="黄大仙"){
			kuji = hdxlq[user.kuji.no]
		}
		else{
			kuji = zglq[user.kuji.no]
		}

	}else{
		if(s.yunstate.mood < 66){
			kuji = huandaxian(luck)
			pot = '黄大仙'
			user.kuji={
				pot:pot,
				no:kuji.id-1
			}
		}
		else{
			kuji = zhougong(luck)
			pot = '周公'
			user.kuji={
				pot:pot,
				no:kuji.id-1
			}
		}
		s.saveToday()
	}

	txt = `第${kuji.no}签呢。我看看……（拿起签文读了起来。）\n${kuji.luck}签 ${kuji.title}\n${kuji.text}\n`

	txt += `小昀的一言：${getJrrpComment(luck,pot)}`

	return txt
}

export default function getluck(ctx: Context){

	ctx.command("每日一卦","jrrp。小昀帮你算今天一卦。")
		.alias("jrrp")
		.shortcut('卜卦')
		.action(async({ session })=>{
			let uid = session.userId

			f.CountUsage(uid,'每日一卦')

			let data = await s.getUser(ctx, uid)
			let name = await s.getUserName(ctx, session)

			const luck = getJrrp(uid)

			if(data['lastluck'] !== data['luck']) {
				data['lastluck'] = data['luck'];
			}
			data['luck'] = luck
			s.setUser(ctx,uid,data)

			let res1 = [
				`${f.faceicon("普通")}`,
				`嗯？${name}想检测下今天的气运吗？ 那……麻烦先抽个签吧。\n（指了指放在桌子上的签筒）`,
				]
			
			let res2 = [
				`……结果出来了呢。今天${name}的气运值大概是：${luck}。`,
				`然后你抽到的是……${getOmikuji(luck,uid)}`,
			]
			
			let text1 = res1.join('\n')
			let text2 = res2.join('\n')


			session.sendQueued(text1)
			setTimeout(()=>{session.sendQueued(text2)},2500)
			return
		})
	
	ctx.command("黄大仙灵签","黄大仙灵签",{minInterval: Time.hour, maxUsage:3})
		.alias("hdxlq")
		.action(({ session })=>{
			let no = f.random(99)
			let kuji = hdxlq[no]
			let txt = `第${kuji.no}签  ${kuji.luck}签 ${kuji.title}\n${kuji.text}\n 解签链接：https://www.zgjm.org/chouqian/huangdaxian/${kuji.no}.html\n${f.images(`hdxlq/${kuji.no}.png`)}`

			let uid = session.userId
			f.CountUsage(uid, '黄大仙灵签')
			
			session.sendQueued(f.At(session.userId)+txt)
			return
		})
	
	ctx.command("周公灵签","周公灵签",{minInterval: Time.hour})
		.alias("zglq")
		.action(({ session })=>{
			let no = f.random(99)
			let kuji = zglq[no]
			let txt = `第${kuji.no}签  ${kuji.luck}签 ${kuji.title}\n${kuji.text}\n 解签链接：https://www.zgjm.org/chouqian/zhougong/${kuji.no}.html\n${f.images(`zglq/${kuji.no}.png`)}`

			let uid = session.userId
			f.CountUsage(uid, '周公灵签')
			
			session.sendQueued(f.At(session.userId)+txt)
			return 
		})
}