import { Context,segment } from "koishi"
import { createHash } from "crypto"
import fs from 'fs'

export var userdata
export var yunstate
export var usertoday

export function initData(){
    let timetick = new Date()
    fs.readFile('user.json','utf-8',(err,data)=>{
        if(err){
            throw err;
        }
        if(!data) return;
        userdata = JSON.parse(data.toString());
    })
    fs.readFile('yunstate.json','utf-8',(err,data)=>{
        if(!data) return;
        yunstate = JSON.parse(data.toString());
        console.log("yunstate",yunstate)
    })
    fs.readFile('usertoday.json','utf-8',(err,data)=>{
        if(!data) return;
        usertoday = JSON.parse(data.toString());

        if(usertoday.day != timetick.getDate() || usertoday.month != timetick.getMonth()+1){
            NewToday()
        }
        if(!usertoday["1794362968"]){
            initUserToday("1794362968")
        }
        console.log("usertoday",usertoday)
    })

    if(yunstate && usertoday.day != timetick.getDate()){
        yunstate.mood = getMood()
    }
}


export function random(min:number,max?:number){
    if(!max){
        max = min;
        min = 0;
    }
    return Math.floor(Math.random()*(max-min+1)+min)
}

export function either(arr) {
    let max = arr.length
    let id = random(1,max)-1
    return arr[id]
}

export function faceicon(str){
    let path = `file:///H:/_Yunbot/data/images/Yun_${str}.png`
    return segment("image",{url:path})
}

export function images(str){
    let path = `file:///H:/_Yunbot/data/images/${str}`
    return segment("image",{url:path})
}

export function textinclude(text,arr){
    for(let i in arr){
        if(text.includes(arr[i])){
            return true
        }
    }
    return false
}

export function textmatch(text,arr){
    for(let i in arr){
        if(text === arr[i]){
            return true
        }
    }
    return false
}


export function getMood(){
	const hash = createHash('sha256')
	hash.update('185632406')
	hash.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0))
	hash.update('6688')

	let val = parseInt(hash.digest('hex'),16) % 101
	return val
}

export function yunsave(){
    const data = JSON.stringify(yunstate)
    fs.writeFileSync('yunstate.json',data)
}

export function saveUserdata(){
    const data = JSON.stringify(userdata)
    fs.writeFileSync('user.json',data) 
}

export function saveToday(){
    const data = JSON.stringify(usertoday)
    fs.writeFileSync('usertoday.json',data)   
}

export function saveAll(){
    yunsave()
    saveUserdata()
    saveToday()
}

export function NewToday(){
    let timetick = new Date()
    usertoday = {
        month : timetick.getMonth()+1,
        day : timetick.getDate()
    }
}

export function WordLink(text,key1,key2){
    if(text.includes(key1) && text.includes(key2)){
        if(text.indexOf(key2) - (text.indexOf(key1)+key1.length) <= 1 ){
            return 1
        } //直接关联
        else{
            return text.indexOf(key2) - (text.indexOf(key1)+key1.length)
        } //弱关联
    }

    return 9999
}

export function WordLinkList(text,arr1,arr2){
    let a=0,i=0
    for(a=0; a<arr1.length; a++){
        if(text.includes(arr1[a])){
            for(i=0; i<arr2.length; i++){
                if(text.includes(arr2[i]) && text.indexOf(arr2[i]) - (text.indexOf(arr1[a]+arr1[a].length <= 1 && text.indexOf(arr2[i]) > text.indexOf(arr1[a])))) return 1; //直接关联
                if(text.includes(arr2[i]) && text.indexOf(arr2[i]) - (text.indexOf(arr1[a])+arr1[a].length) > 1) return text.indexOf(arr2[i]) - (text.indexOf(arr1[a])+arr1[a].length)//弱关联;
            }            
        }
    }
    return 9999
}

export function YunCall(text){
    if((textinclude(text,["小昀","路昀"]) && text.length <= 4 && text.indexOf("[CQ:image,file=") == -1 )|| WordLinkList(text,["小昀","路昀"],["过来","出来","在吗","打招呼"]) <= 4 || (textinclude(text,["小昀","路昀"]) && text.indexOf("[CQ:image,file=") == 0 && text.length <= 70 )) return true
    return false
}

export function At(uid:string){
    return segment('at', { id: uid } )
}

export function getUser(uid){
    if (!usertoday[uid]){
        initUserToday(uid)
        saveToday()
    }

    if (!userdata[uid]){
        initUserData(uid)
        saveUserdata()
    }
    if(!userdata[uid]?.level){
        userdata[uid].level = 1;
        userdata[uid].exp = 0
        saveUserdata()
    }
    return userdata[uid]
}

export function getToday(uid){
    if (!usertoday[uid]){
        initUserToday(uid)
        saveToday()
    }
    return usertoday[uid]
}

export function initUserToday(uid){
    usertoday[uid] = {
        roll:0, sign:false
    }
}

export function initUserData(uid){
    userdata[uid] = {
        lastdice:0, money:0, fav:0, level:0, exp:0
    }
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

export function between(int:number,a:number,b:number){
    return int >= a && int <= b;
}
