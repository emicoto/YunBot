import * as f from './Function'
import * as s from "./Setting"


const Restype = {
	'晚安语':/^((?!还没|没有|没想|不困|说到这个).)*((困了|睡了|睡去|睡觉|晚安|去睡|睡啦|眠去|眠了|安安啦|歇了)\.{0,8}$|^安{1,5}$)/,
	'召唤语':/(小昀|路昀)~{0,2}\S{0,5}(出来|在吗|过来|招呼|接客|见客|客人来啦)\S{0,5}$|(小昀|路昀)\S{0,5}$/,
	'叫醒语':/(小昀|路昀).+(醒醒|醒来|不给睡|起床|起来)|(醒醒|醒来|不给睡|起床|起来).+(小昀|路昀)/,
	'早安语':/(醒来|醒了|睡醒|起床|吓醒|惊醒|困醒|帅醒)\S{0,3}$|早啊|早安|早上好|大家早|^早\S{0,2}$|[床]\S{0,5}[起来]\S{0,3}$|[床]\S{0,5}[出来]\S{0,3}$/,
}

export const Res = [

{ //id.0
	m:'天王盖地虎',
	re:'宝塔镇河妖'
},
{ //id.1
	m:/新年|除夕|新春|春节/,
	re:f.images("yun_newyear.png"),
},
{ //id.2
	m:Restype['叫醒语'],
	re:(str,uid,ctx)=>{
		if(f.random(100) < 60){

			s.yunstate.stats = 'wake'
			s.yunsave()

			return f.either([
				"……呜……醒了。",
				"……呼啊，早啊。" +
				(uid == s.master ? "师父" : uid == s.senior ? "师叔" :f.At(uid)),
				f.images("hardwake.jpg"),
			])
		}else{
			return f.either([
				"……呜。再五分钟。（翻身过去继续睡）",
				f.faceicon("睡眠") + "\n……呼……呼……（依然在睡）",
			])
		}
	}
},
{ //id.3
	m:/(\S{2})一时爽[\S+](\S{2})[火葬场]/,
	re:(str,uid,ctx)=>{
		let txt = str.match(/(\S{2})一时爽/)
		return f.maybe([
			[`next`,30],
			[`……但是，一直${txt[1]}一直爽？`,75],
			])
	},
},
{ //id.4
	m:/^(.+)一时爽$/,
	re:(str,uid,ctx)=>{
		let txt = str.match(/^(.+)一时爽$/)

		if(str.match('挖坑')) txt[1] = '填坑';
		if(str.match('草稿')) txt[1] = '线稿';
		if(str.match('线稿')) txt[1] = '上色';
		if(str.match('追妻')) txt[1] = '虐妻';

		if(f.random(10)>=5) return `一直${txt[1]}一直爽`

		return `${txt[1]}火葬场？`
	}
},
{ //id.5
	m:'awsl',
	re:f.maybe([
		['next',10],		
		[f.images('cat_cross.jpg')+'\n各位同门师兄弟，我们来为每日赴死的《阿伟》送上鲜花与祝福吧……',6],		
		['阿伟死了',30],
		["阿伟死了又死……",30],
		['……啊，伟又双叒叕死了。',30],
		['awsl',30],
		['……阿伟乱葬岗？',40],
		['next',50]
	])
},
{ //id.6
	m:Restype['早安语'],
	re:(str,uid,ctx)=>{
		let text = 'next'

		if(uid == s.master ){
			text = f.either(['早啊……师父。','师父，早安。','师父，早？']);

			if(s.yunstate.stats == 'sleep'){
				text = '呼啊……（打着哈欠）\n'+text+'\n我也才起床……';
				s.yunstate.stats = 'wake';
				s.yunsave();
			}
		}else{
			text = f.maybe([
				['next',25],
				[`……早安，${f.At(uid)}`,50],
				[`……早，${f.At(uid)}`,50],
				[`……${f.At(uid)}，早上好`,50],
			]);
		}
		return text
	}
},
{ //id.7
	m:Restype['晚安语'],
	re:(str,uid,ctx)=>{
		if (uid == s.master && f.random(100) < 50 ){
			s.yunstate.stats = 'sleep'
			s.yunsave()
			return f.either([
				'……呜啊，我也困了……\n我也睡啦，师父晚安(¦3[▓▓]',
				'……师父晚安，那……我也去睡好了……（打哈欠',
				'……晚安师父（打哈欠），我也睡了_(:3」∠)_',
				'要睡了吗……？\n那……师父晚安。我也睡了……（打哈欠',
			])
		}
		
		if(f.random(100) < 60){
			return f.either([`……晚安，${ uid == s.master ? "师父" : f.At(uid)}`,`……要睡了吗？那，${ uid == s.master ? "师父" : f.At(uid) }晚安。`])
		}

		return 'next'
	}
},
{ //id.8
	m:/^哈{2,}$|^\S{0,1}乐\S{0,4}$|^h{3,}$|^23{2,}$|^w{1,}$|^\S{0,5}生草了\S{0,3}哈{0,}$|^艹{1,}\S{0,3}$/,
	re:(str,uid,ctx)=>{

		if(str.match(/^\S{0,5}生草了\S{0,3}哈{0,}$/)){
			str = f.images('kusa.jpg')
		}

		return f.maybe([
			['next',30],
			['艹',10],			
			['hhh',20],
			['乐',30],
			[f.images('doge.jpg'),30],
			[f.images('dance.gif'),30],
			[str,30],
		])
	}
},
{ //id.9
	m:/^\[CQ:image,file=(.+)term=3\]$|^\[CQ:image,file=(.+)term=3\].{1,24}/,
	re:(str,uid,ctx)=>{

		if(str.match(/^\[CQ:image,file=(.+)\].{1,24}/)){
			let u = str.match(/\[CQ:image,file=(.+)\]/)
			let url = u[1]
			str = `[CQ:image,file=${url}term=3]`
		}

		if(f.random(100) < 20){
			return str
		}
		return "next"
	},
},
{ //id.10
	m:/涩涩|色色|瑟瑟|透透|很色|很涩|色爆|涩爆|射爆|蛇爆|涩图|色图|瑟图/,
	re: f.maybe([
		[f.images("nosese.jpg"),40],
		['next',80],
		])
},
{//id.11
	m:/情人节快乐|情人节|恋人|伴侣/,
	re:(str,uid,ctx)=>{
		let txt = f.maybe([
			["next",10],
			[`${f.faceicon("害羞笑")}\n……听说今天是给人送巧克力的节日……嗯，所以……我会有吗？`,15],				
			[`情人节啊……那么${f.At(uid)}有恋人吗？`,20],
			[`……今天好像是和恋人一起渡过的日子。……可是我没有恋人。\n${f.faceicon("不安")}\n嗯？你问我阿宵？我们、只是普通的青梅竹马啦……`,30],
			[`${f.faceicon('微笑')}\n……情人节快乐。会庆祝这一天的话，那么你是有恋人了吗？\n……那挺好的。`,30],
			["情人节快乐？",50],			
			[`${f.faceicon('微笑')}\n嗯，单身情人节快乐。`,50],
		])

		if(str.includes("情人节快乐")) return txt;
		if( Date().includes("Feb 14") || (Date().includes("Feb 13") && new Date().getHours() > 9)) return txt;

		return 'next'
	}
},
{ //id.12
	m:/(小昀|路昀|有人).+(来玩|来打|一起|联机)\S{0,4}(游戏|丧尸|僵尸|环世界|MC|我的世界|PZ|僵毁)/,
	re:(str,uid,ctx)=>{
		let m = str.match(Res[12].m)
		let game = m[3]

		if(uid == s.master && ['路昀','小昀'].includes(m[1])){
			//yunstate.stats = 'gaming'
			return `${f.faceicon("开心")}\n好的师父，一起玩吧。`

		}
		return f.maybe([
			[`next`,30],
			[`${game}吗？我也有在玩。要联机吗？`,30],
			[`………${game}联机？先等我打完这局……`,30],
			[`${f.faceicon("微笑")}\n……好啊，一起玩${game}`,30]
		])
	}
},
{ //id.13
	m:/(玩|打|联机)\S{0,3}(PZ|僵毁|丧毁|僵尸毁灭计划|丧尸毁灭计划|丧尸|僵尸)/,
	re:(str,uid,ctx)=>{
		return f.maybe([
			['next',20],
			[`Project Zomboid，这个游戏挺硬核的，同时也很有趣呢。\n${f.faceicon("微笑")}\n在末日的黄昏下，人在圈中悠闲地种菜，外面确尸山遍野什么的……不觉得这样的挺有种矛盾感、一种特别的末日浪漫吗？`,10],			
			[`${f.At(uid)} ？缺队友吗？ 我也在玩，刚好可以一起。`,30],
			[` ？ 打丧尸吗？丧尸挺好玩的……有一阵子我还挺沉迷呢……。`,50],			
			[`${f.images("yungaming.png")}\n……不要打扰我，丧尸快接近了。`,60]
		])
	}
},
{//id.14
	m:/(小昀|路昀)\S{0,2}(笨蛋|傻逼|蠢蛋|傻瓜|笨笨|傻蛋)|(死|蠢|笨|傻|臭)\S{0,2}(小昀|路昀)/,
	re: async (str,uid,ctx)=>{

		let favo = f.random(10,30)
		let trust = f.random(10,30)

		let txt = f.either([
			"……呜，你这是在骂我吗？",
			"……呜，骂人是不对的……",
			"……哎，说脏话是不好的……",
			"………你真讨厌……",
		])		

		if(str.match(/宝|亲亲|摸摸/)){
			favo = f.random(3,10)
			s.setFavo(ctx, uid, -favo)
			return f.faceicon("生气") + "…………。好好地称呼人就不行吗？\n（好感下降了）"
		}

		if(str.match(/(死|蠢|笨|傻|臭)\S{0,2}(小昀|路昀)/)){
			txt = f.either([
				'……骂人是不好的。',
				'……我生气了。',
				'你这个人真讨厌……！',
				'……你好没礼貌啊。',
				'……你礼貌吗？',
				'……麻烦你好好地称呼人。'
			])

			txt += '\n（好感度与信赖度都大幅下降了）'
			favo = f.random(20,50)
			trust = f.random(20,50)

			s.setFavo(ctx,uid,-favo)
			s.setTrust(ctx,uid,-trust)

			return f.faceicon('愤怒')+txt
		}

		txt = f.faceicon('生气') + txt + "\n（好感度与信赖度都下降了）"
		s.setFavo(ctx,uid,-favo)
		s.setTrust(ctx,uid,-trust)

		return txt
	}
},
{ //id.15
	m:Restype['召唤语'],
	re:(str,uid,ctx)=>{
		let txt = f.faceicon("普通")+"\n……在叫我吗？" + (uid== s.master? '师父' : '')
		return txt
	}
},
{//id.16 摸了 => 摸，都可以摸
	m: /^(\[CQ:image,file=(.+)term=3\]){0,1}\s{0,2}(\S{1,2}了$|……\S{1,3}了$|\S{1,3}了.(jpg|png|gif)$)/,
	re:(str,uid,ctx)=>{

		if(str.match(/睡|困|起来|走|累|死|来|去|回/)) return 'next';

		let mask
		str = str.replace("都","")

		if(str.match(/\[CQ:image,file=(.+)term=3\]/)){
			mask = str.match(/[^A-Z][^0-9](\S{1,2})了/)
		}else{
			mask = str.match(/(\S{1,2})了/)
		}
		str = mask[1]
		return f.maybe([
			['next',30],
			[`${str[0]}，都可以${str}`,40],
			])
	}
}
]

export function Respond(str,uid,ctx){
	for(let i in Res){
		if(str.match(Res[i].m)){
			if(typeof(Res[i].re)=='function') return Res[i].re(str,uid,ctx);
			return Res[i].re
		}
	}
	return 'next'
}

export function getResCount(){
	return Res.length
}

export function whileSleeping(mode, session?){
	if(mode == "command"){
		return f.maybe([
			["休眠中……",60],			
			["休息中……",60],
			["睡觉中……",60],
			[`${f.faceicon('睡眠')}\n（睡觉中……）`,20],
		])
	}
	else{
		if(session.content.match(Restype['晚安语']) && f.random(100) > (100-25) ){
			return `${f.faceicon("睡眠")}\n（也在睡了）`
		}
		if(session.content.match(Restype['召唤语'])){
			return `${f.faceicon("睡眠")}\n（已经睡着了，叫不动的样子……）`
		}
		if(f.random(1000) > (1000-25) && session.content.length > 4){
			return f.either([
				`${f.faceicon("睡眠")}\n……呼……呼……（睡觉中）`,
				`${f.faceicon("睡眠")}\n……呼……呼……（睡得挺香的样子）`,
			])
		}
		return 'next'
	}
}

export function whileWorking(mode, session?){
	if(mode=="command"){
		return f.maybe([
			['（打坐中，勿扰）',30],
			['（冥思中，勿扰）',30],
			['（修行中，勿扰）',30],
			[false,30],
		])
	}
	else{

		let res1 = f.either([
			"…………静心。（打坐中）",
			"…………勿扰。（冥思中）",
			"……摒除杂念。（修炼中）",
		])

		let res2 = f.either([
			"……在、在好好修行了。",
			"…………在修行了，不要打扰。",
			"……静心。",
			"……应该还好。",
		])
		
		let face = f.maybe([
			['闭眼',50],
			['普通',50],
		])

		if(mode=='询问修炼进度'){
			return `${f.faceicon(face)}\n${res2}\n(剩余进度：${s.yunstate.work})`
		}

		if (f.random(1000) > (1000-30) && session.content.length > 2){
			return `${f.faceicon(face)}\n${res1}}`
		}
	}
}

export function whileGaming(mode, session?){

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
			let getexp = Math.floor(f.random(3,60)*(1+(s.yunstate.level/10))*1.5+0.5)
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

export function wakeYunUp(txt){
	return(txt.match(Restype['叫醒语']) || txt.match(Restype['早安语']))
}