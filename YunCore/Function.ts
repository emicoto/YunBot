import { Context, segment, Session } from "koishi"
import { getJrrp } from "./getluck";
import { getToday, getUser, saveToday, yunbot, yunstate } from "./Setting";

export function between(int:number,a:number,b:number){
	return int >= a && int <= b;
}

export function random(min:number,max?:number){
	if(!max){
		max = min;
		min = 0;
	}
	return Math.floor(Math.random()*(max-min+1)+min)
}

export function either(arr:Array<any>){
	let max = arr.length
	let i = random(1,max)-1
	return arr[i]
}

export function At(uid:string){
	return segment('at', { id: uid } )
}

export function faceicon(str){
	let path = `file:///H:/_Yunbot/data/images/Yun_${str}.png`
	return segment("image",{url:path})
}


export function images(str){
	let path = `file:///H:/_Yunbot/data/images/${str}`
	return segment("image",{url:path})
}

export function include(str,arr){
	for(let i in arr){
		if(str.includes(arr[i])){
			return true
		}
	}
	return false
}

export function gmatch(a,arr:Array<any>){
	for(let i in arr){
		if(a===arr[i]) return true;
	}
	return false
}

export function maybe(arr:Array<any>){
	let txt
	arr.forEach((v,i)=>{
		if(random(100) < v[1]) txt = v[0]
	})

	if(!txt){
		return arr[0][0]
	}
	return txt
}

export function compare(key){
	return function(m,n){
		let a = m[key];
		let b = n[key];
		return b - a
	}
}

export function intoChar(str: string){
	const N = [
		'〇','一','二','三','四','五','六','七','八','九'
	]
	let s = ""
	for(var i=0; i<str.length; i++){
		s+= N[parseInt(str[i])]
	}
	return s
}

export function getShichen(){
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


export function getChinaTime(){
  var cn = new Date().toLocaleString('jpn',{ timeZone:"Hongkong" })
  var cntime = new Date(cn)
  return cntime
}


export function ComUsage(utoday, str:string, limit:number){
	if ( !utoday.usage[str] ) utoday.usage[str] = 0;
	if ( utoday.usage[str] >= limit ) return false
	//console.log(utoday.usage)
	return true
}

export function CountUsage(uid, str){
	let today = getToday(uid)
	if(!today.usage[str]) today.usage[str] = 0;
	today.usage[str] ++
	saveToday()
}


export function getLevelChar(lv){
	let level = [
		'入门','破幻','灵动','开元','结丹','解灵','归一','通天','大乘',"真仙"
	]
	let char = [
		'一','二','三','四','五','六','七','八','九','十'
	]

	lv = Math.min(lv-1,100)

	let m = Math.min(Math.floor(lv/10),8)
	let i = lv%10

	let t = `${char[i]}阶`

	if (lv == 90) {
		t = "大圆满"
	}

	let text = `${level[m]} ${t}`
	return text
}

export function expLevel(level){
	let a = Math.max(Math.floor(level/20+0.5),1.5)
	let result = (level+1)*10 + Math.pow(level+1,2.5) + (Math.pow(level+1,a))
	result = Math.floor(result/20)*20
	return result
}

export async function getBreakRate(ctx:Context, uid:string, mode?){
	let goal = 90
	let data, today, luck, level

	if(!mode){
		data = await getUser(ctx, uid)
		today = getToday(uid)
		luck = today.luck
		level = data.level
	}
	else{
		data = yunstate
		luck = getJrrp(yunbot)
		level = yunstate.level
	}

	goal -= Math.max((level/10),1)*(5-getExpBuff(data,1))
	goal -= level/2
	
	goal /= 1+level/20
	if(level%10==0) goal /= 2

	if(data.flag?.breakbuff) goal += data.flag.breakbuff
	if(luck > 0) goal += luck/15

	return Math.max(Math.floor(goal+0.5),2)
}


export function getTimeZone(hour){
	if(between(hour,2,4)) return '凌晨'
	if(between(hour,5,7)) return '黎明'
	if(between(hour,8,10)) return '上午'
	if(between(hour,11,13)) return '中午'
	if(between(hour,14,16)) return '下午'
	if(between(hour,17,19)) return '傍晚'
	if(between(hour,20,22)) return '晚上'
	return '深夜'
}

//获取灵根和主功法对修炼加值
export function getExpBuff(data,mode?){
	let type, chara
	type = data.soul.match(/天/)
	chara = data.soul.match(/金|木|水|火|土/g)

	let list = [1.5,1.25,1,0.8,0.6]

	let buff = list[chara.length-1]
	if(type) buff += 0.5
	if( !mode && data.core?.id){
		let core = data.core.lvstats[data.core.level-1]
		if(core?.Expbuff) buff += core.Expbuff;
	}

	return buff
}

//获取灵根加值
export function getSoulBuff(str){
	let type, chara, count, buff
	type = str.includes("天")
	chara = str.match(/金|木|水|火|土/g)
	count = chara.length

	switch (count) {
		case 1:
			buff = 1.05
			break
		case 2:
			buff = 0.5
			break
		case 3:
			buff = 0.3
			break
		case 4:
			buff = 0.2
			break
		case 5:
			buff = 0.1
			break
	}
	if(type) buff *= 1.5
	
	let result = {
		HP:(chara.includes('木') ? buff : 0) + ( chara.includes('水') ? buff * 0.3 : 0),
		SP:(chara.includes('水') ? buff : 0) + (chara.includes('金') ? buff * 0.3 : 0),
		
		ATK: (chara.includes('火') ? buff : 0) + (chara.includes('木') ? buff * 0.3 : 0),
		DEF:(chara.includes('土') ? buff : 0) + (chara.includes('火') ? buff * 0.3 : 0),
		SPD:(chara.includes('金') ? buff : 0) + (chara.includes('土') ? buff * 0.3 : 0),
	}
	return result
}

export function printSoul(str){
	let type, chara,text
	type = str.match(/天/)
	chara = str.match(/金|木|水|火|土/g)

	let list = ['单','双','三','杂',"杂"]
	
	text = chara.join("")

	if(!type) text += ` · ${list[chara.length-1]}灵根`;
	else text = `${type} · ${text}灵根`;

	return text
}


export function LevelBuff(level){
	if( level/10 > 1){
		return Math.pow(Math.floor(level/10),1.25)
	}
	return 1
}

export function expCount(getexp,data){
	getexp *= Math.max((data.level/5),1)*Math.max(LevelBuff(data.level)*0.5,1)
	getexp *= getExpBuff(data)
	getexp = Math.floor(getexp+0.5)

	return getexp
}

export function getSoulInfo(str){
	let type, chara ,count
	type = str.match(/天/)
	chara = str.match(/金|木|水|火|土/g)
	count = str.replace("天","").length()

	let info = {
		t: false,
		chara:chara,
		count:count,
	}

	if(type) info.t = true;
	
	return info
}
