import { Yun } from "../Define"
import { cnTime, getTimeZone, faceicon, maybe } from "../Utils"

export function getCall(role:string, name:string){

	if( role == 'master' && (name == '时月' || name == '师父')){
		return '师父'
	}
	else if( role == 'brother' && ( name == '公祈裕' || name == '裕师弟'))
		return '裕师弟';

	else if( role == 'senior' && ( name.match('周天')) || name == '周天师叔')
		return '周天师叔';

	else if ( role && role.length)
		return name;
}

export function getMorningCall(role, nick){
	const name = getCall(role, nick)
	const now = cnTime().getHours()
	const zone = getTimeZone(now)

	const txt = `……啊，是${name}，`+(
		['晚上','深夜','凌晨'].includes(zone) ? '晚上好啊。这么晚打卡……是有别的事忙吗？':
		zone == '黎明' ? '早上好……这也太早了点。呼啊……（揉眼睛）' :
		zone == '上午' ? '早上好……' :  '午安……'
	)
	
	return txt+'\n'
}

export const YunCom = {
	'开始修炼':'不知是否被师兄弟们的修炼热情感染，路昀也提起干劲，跟着{0}一起开始修炼了。',
	'修炼完毕':
		[
			`${faceicon('普通')}`,
			`……呼，今天就修炼到这里吧……`,
			`路昀的{0}`
		],

	'准备突破':
		[
			'嗯……好像已经到瓶颈了。',
			'得找个时间去突破了……'
		],

	'开始突破':
		[
			'历时多日的修行，路昀总算也迎来了突破的时机……',
			'路昀选择了一个吉日佳时，仔细地沐浴过后，',
			'再换上白净的衣服浸泡在灵泉中感受自身天地灵脉的转动…'
		],
	'突破成功':
		[
			'路昀凝聚心神，聆听天地之音时捕捉到一丝宇宙真理！',
			'……终于！{0}路昀顺利突破了！从{1}变成{2}了！'
		],
	'突破失败':'可惜，突破失败了。看来仙路漫漫长……',

	'突破成功：台词':'“……终于！”',

	'突破失败：台词':"“……失败了……吗？那……摸了。"
}

export const YunReply = {
	'共同修炼：上':(name, role)=>{
		if(['master','senior','brother'].includes(role)){
			const call = getCall(role, name)
			return maybe([
				[`${faceicon('困惑')}\n……呜啊，是${call}……\n好、好的。这就来修炼。`,30],
				[`${faceicon('普通')}\n……好吧，那就，跟${call}一起修炼吧。`,20+(Yun.state.mood/20)],
				[`${faceicon('开心')}\n……嗯，好的${call}。一起修炼吧。`,10+(Yun.state.mood/20)]
			])
		}
		else{
			const txt = [
				`${faceicon('困惑')}`,
				'……修炼？（心感困惑，犹豫些许后）',
				`行吧……${name}。那就，一起修炼吧……`,			
			]
			return txt.join('\n')
		}
	},

	'共同修炼：下':(name,role)=>{
		return `${name}邀请路昀共同修炼，`
			  + maybe([
				["在练功房中一起静心打坐", 30],
				["在弟子观中一起打扫整理", 10 + (role == 'cleaner' ? 70 : 0)],
				["在冥想室中一起静坐冥思", 30],
				["在藏经阁中一起参阅经书", 30 + (role == 'senior' ? 30 : 0)],
				["在洞天中一起吞纳吸气", 30],
				["在学堂中一起奋笔疾书", 20 + (role == 'brother' ? 50 : 0)],
			  ]) + `。\n不知是否有人陪同修炼的关系，领悟比平时获得的更多。`
	},

	'共同突破：上':(name, role, who)=>{
		const call = getCall(role, name)
		let txt1, txt2,txt3

		if(role.length > 1){
			txt1 = maybe([
				[`${faceicon('困惑')}\n……呜啊，是${call}……`,30],
				[`${faceicon('普通')}\n……啊，是${call}……`,20+(Yun.state.mood/20)],
				[`${faceicon('开心')}\n……${call}，有什么事吗？`,10+(Yun.state.mood/20)]
			])
		}
		else{
			txt1 = `${faceicon('困惑')}\n……${name}，`
		}

		txt2 = (who=='both' ? '是要一起突破吗？' :
			who =='yun' ? '是说要陪我突破吗……？' : '是说要我陪你突破吗……？')
		
		if(['master','senior','brother'].includes(role)){
			txt3 = '\n好的吧。那就一起去突破吧…'
		}
		else{
			txt3 = '\n……（思索了会），好的吧。那就……一起突破？'
		}

		return txt1+txt2+txt3
	},

	'共同突破：下':(name, role)=>{
		return `在一个黄道吉日里，${name} 你沐浴更衣后，邀请路昀一起到灵虚山的洞天峰进行突破。`
				+ `\n你们`+ maybe([
					["盘腿而坐，闭目冥思感应天地", 30],
					["点燃熏香，细细品读经文", 30 + (role == 'senior' ? 30 : 0)],
					["吞纳吸气，感受体内灵气的运作", 30],
					["奋笔疾书，将所思所想归纳总结", 20 + (role == 'brother' ? 50 : 0)],
				])
				+`，试图从中捕捉一丝道理……\n`
	},

	'突破成功：同时':
		[
			'你们领悟了一丝天地之道！你和路昀都突破了！',
			'你从{0}变成{1}了！',
			'路昀从{2}变成{3}了！',
			'同时突破成功的你们十分高兴，情不自禁地抱在了一起，但很快就分开了……'
		],
	
	'突破失败：同时': '可惜……你们都突破失败了。看来仙路漫漫长……',
	'突破失败': '可惜，{0}突破失败了，但多少收获些许心得。而在一旁观察的{1}也从中获得些许感悟。',

}