import { Context, segment, Session } from "koishi"
import { getUser } from "./Setting";

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


export function getLevelChar(lv){
	let level = [
		'入门','破幻','灵动','开元','结丹','解灵','归一','通天','大乘'
	]
	let char = [
		'一','二','三','四','五','六','七','八','九','十'
	]

	lv = Math.min(lv-1,90)

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
	let a = Math.max(Math.floor(75/20+0.5),1.5)
	let result = (level+1)*10 + Math.pow(level,2.5) + (Math.pow(level,a))
	result = Math.floor(result/20)*20
	return result
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

//获取灵根对修炼加值
export function getExpBuff(string){
	let type, chara
	type = string.match(/天/)
	chara = string.match(/金|木|水|火|土/g)

	let list = [1.5,1.25,1,0.8,0.6]

	let buff = list[chara.length-1]
	if(type) buff += 0.5

	return buff
}

//获取灵根加值
export function SoulBuff(str){
	let type, chara, count, buff
	type = str.includes("天")
	chara = str.match(/金|木|水|火|土/g)
	count = str.replace("天","".length)

	switch (count) {
		case 1:
			buff = 1
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
	if(type) buff *= 2
	return buff	
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

export function expCount(getexp,data){
	getexp *= Math.min((data.level/5),1)
	getexp *= getExpBuff(data.soul)
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

export async function CountStats(ctx:Context, uid:string){
	let data = await getUser(ctx, uid)
	let level = data.level
	let souldata = getSoulInfo(data.soul)

	//先获得各数值的基础运算
	let BP = level*5 + (level/10)*100
	let HP = 20 + level*10
	let SP = 5+ level*5
	let ATK = 5 + Math.floor(level/2) + Math.floor(level/10)*10
	let DEF = 5 + Math.floor(level/2) + Math.floor(level/10)*10

	//计算灵根加成
	if(data.soul.includes('木')) HP *= SoulBuff(data.soul);
	if(data.soul.includes('水')) SP *= SoulBuff(data.soul);
	
	if(data.soul.includes("金") && data.soul.includes("火")) ATK *= SoulBuff(data.soul)*2 ;
	else if(data.soul.includes('金')||data.soul.includes('火')) ATK *= SoulBuff(data.soul);

	if(data.soul.includes('土')) DEF *= SoulBuff(data.soul);

	let hpbuff=0, spbuff=0, atkbuff=0, defbuff=0, bpbuff=0

	//计算装备加成
	let list = ['head','coat','middle','skin','weapon']
	for(let i in list){
		let equip = data.equip[list[i]]

		if(equip?.ATK > 0){
			ATK += equip.ATK
		}
		if(equip?.DEF > 0){
			DEF += equip.DEF
		}
		if(equip?.BP > 0){
			BP += equip.BP
		}
		if(equip?.ATKbuff){
			atkbuff += equip.ATKbuff
		}
		if(equip?.DEFbuff){
			defbuff += equip.DEFbuff
		}
		if(equip?.HPbuff){
			hpbuff += equip.HPbuff
		}
		if(equip?.SPbuff){
			spbuff += equip.SPbuff
		}
	}


}