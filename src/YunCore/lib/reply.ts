import{ random, either, images, maybe, At, faceicon }  from '../Function'
import { yunstate, yunsave } from '../Setting'

const Res = [

{
	m:'天王盖地虎',
	re:'宝塔镇河妖'
},
{
	m:/新年|除夕|新春|春节/,
	re:images("yun_newyear.png"),
},
{
	m:/醒来\S{0,3}$|醒了\S{0,2}$|睡醒\S{0,3}$|早啊|早安|早上好|大家早|困醒|帅醒|^早$|起床\S{0,3}$|[床]\S{0,5}[起来]\S{0,3}$|[床]\S{0,5}[出来]\S{0,3}$/,
	re:(str,uid)=>{
		let text
		if(uid=='1794362968'){
			text = either(['早啊……师父。','师父，早安。','师父，早？']);

			if(yunstate.stats == 'sleep'){
				text = '呼啊……（打着哈欠）\n'+text+'\n我也才起床……';
				yunstate.stats = 'wake';
				yunsave();
			}
		}else{
			text = maybe([
				['',25],
				[`……早安，${At(uid)}`,50],
				[`……早，${At(uid)}`,50],
				[`……${At(uid)}，早上好`,50],
			]);
		}
		return text
	}
},
{
	m:/(\S{2})一时爽[\S+](\S{2})[火葬场]/,
	re:(str,uid)=>{
		let txt = str.match(/(\S{2})一时爽/)
		return `……但是，一直${txt[1]}一直爽？`
	},
},
{
	m:/^(.+)一时爽$/,
	re:(str,uid)=>{
		let txt = str.match(/^(.+)一时爽$/)

		if(str.match('挖坑')) txt[1] = '填坑';
		if(str.match('草稿')) txt[1] = '线稿';
		if(str.match('线稿')) txt[1] = '上色';
		if(str.match('追妻')) txt[1] = '虐妻';

		if(random(10)>=5) return `一直${txt[1]}一直爽`

		return `${txt[1]}火葬场？`
	}
},
{
	m:'awsl',
	re:maybe([
		['',60],	
		['……阿伟乱葬岗？',40],
		["阿伟死了又死……",30],
		['……啊，伟又双叒叕死了。',30],
		['awsl',30],
		['阿伟死了',30],
		[images('cat_cross.jpg')+'\n各位同门师兄弟，我们来为每日赴死的《阿伟》送上鲜花与祝福吧……',10],
	])
},
{
	m:/(小昀|路昀).+(醒醒|醒来|不给睡|起床|起来)|(醒醒|醒来|不给睡|起床|起来).+(小昀|路昀)/,
	re:(str,uid)=>{
		let txt
		if(random(100) < 60){
			txt = either([
				"……呜……醒了。",
				"……呼啊，早啊。" +
				(uid == "1794362968" ? "师父" : At(uid)),
				images("hardwake.jpg"),
			])
		}else{
			txt = either([
				"……呜。再五分钟。（翻身过去继续睡）",
				faceicon("睡眠") + "\n……呼……呼……（依然在睡）",
			])
		}
		return txt
	}
},
{
	m:/\S{0,3}修炼|修行\S{0,5}$/,
	re:(str,uid)=>{
		let txt = ''
		if(random(100) <= 30){
			yunstate.work = 5;
			txt = either([
				"……静心，打坐……",
				"……摒除杂念……入定……",
				"……呼纳……吸气……",
			]);
			yunsave();
		}
		else{
			txt = either([
				"……呜……不想修炼……",
				'……呜，'+(uid=='1794362968' ? '师父……' : uid=='1742029094' ? '师叔……' : '')
				+ '活着都这么累了……今天不如休息吧？好不好？',
				'……好困（揉揉眼睛',
			]);
		}
		return txt
	}
},
]


function Respond(str,uid){
	for(let i in Res){
		if(str.match(Res[i].m)){
			if(typeof(Res[i].re)=='function') return Res[i].re(str,uid);
			return Res[i].re
		}
	}
	return 'next'
}

function getResCount(){
	return Res.length
}

function whileSleeping(mode, session?){
	if(mode == "command"){
		return maybe([
			["休眠中……",60],			
			["休息中……",60],
			["睡觉中……",60],
			[`${faceicon('睡眠')}\n（睡觉中……）`,20],
		])
	}
	else{
		if(random(1000) > 980 && session.content.length > 4){
			return either([
				`${faceicon("睡眠")}\n……呼……呼……（睡觉中）`,
				`${faceicon("睡眠")}\n……呼……呼……（睡得挺香的样子）`,
			])
		}
	}
}

export {Res, Respond, getResCount, whileSleeping}