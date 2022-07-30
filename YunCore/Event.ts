// 事件设置

import { Context } from "koishi"
import * as s from "./Setting"
import * as f from "./Function"


export async function setYunBreak(ctx:Context, session, mode?){
	let exp = s.yunstate.exp
	let level = s.yunstate.level
	let txt = '历时多日的修行，路昀总算也迎来了突破的时机……\n路昀选择了一个吉日佳时，仔细地沐浴过后，\n再换上白净的衣服浸泡在灵泉中感受自身天地灵脉的转动……\n'
	let name = await s.getUserName(ctx, session.userId)

	let goal = await f.getBreakRate(ctx, s.yunbot, 1) + ( mode? f.random(5,10) : 0)
	let rate = f.random(100)
	console.log("小昀的突破概率:",goal,rate)
	s.usertoday.yunbreak ++

	let txt1 = ''

	if( rate <= goal){
		if(mode){
			txt += `在${name}的陪同下，`
		}else{
			txt += `在${name}的见证下，`
		}
		txt += `小昀顺利突破了！从${f.getLevelChar(level)}变成${f.getLevelChar(level+1)}了！`

		f.breakProces(s.yunstate)
		s.yunstate.flag.levelup = false
		s.yunsave()

		if(mode){
			txt += `小昀对你的信赖度增加了一点。`
			let trust = f.random(1,5)
			s.setTrust(ctx,session.uid,trust)
		}

		txt1 = '“终于……！”'

	}
	else{
		let get = f.random(5,40)+Math.max(s.yunstate.mood/5,1)
		get = Math.floor(get*f.getExpBuff(s.yunstate,1)+0.5)

		txt += '可惜，突破失败了。看来仙路漫漫长……\n获得了一点心得。悟道经验+'+get
		s.yunstate.exp += get
		s.yunsave()

		txt1 = "“……失败了吗……？那……摸了。”"
	}

	setTimeout(()=>{
		session.sendQueued(txt1)
	},1500)

	session.sendQueued(txt)
	return
	
}

export function setYunWork(session){

	if(s.yunstate.stats == 'working') return;
	
	s.yunstate.work = 150
	s.yunstate.stats = 'working'
	s.yunsave()
	
	s.usertoday.yunwork ++
	s.saveToday()

	const stop = function(work){
		clearInterval(work)
		console.log('修炼已停止。')
	}

	const work = setInterval(()=>{
		s.yunstate.work --;
		s.yunsave()

		if( s.yunstate.work <= 0 ){
			let getexp = f.random(5,60)
			getexp += Math.max(Math.floor(s.yunstate.mood/10+0.5),1)
			getexp = f.expCount(getexp, s.yunstate)
			s.yunstate.exp += getexp

			s.yunstate.stats = 'free'
			s.yunstate.work = 0
			s.yunsave()

			session.send(`${f.faceicon("普通")}\n……好了，今天就修炼到这里吧……。\n(路昀的悟道经验+${getexp}， 目前进度：${s.yunstate.exp}/${f.expLevel(s.yunstate.level)})`)

			if ( s.yunstate.exp >= f.expLevel(s.yunstate.level)){
				s.yunstate.flag.levelup = true
				session.send(`嗯……好像已经到瓶颈了。得找个时间去突破了……`)
			}

			stop(work)
		}

	},1200)

	console.log('自主修炼已设置。')

}
