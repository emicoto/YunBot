
import { segment } from "koishi"

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


export function expLevel(user){
    return Math.max(Math.floor((user.level+1)*10+Math.pow(user.level+1,2.5)+0.5),20)
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
