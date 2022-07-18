import fs from 'fs'
import { createHash } from 'crypto';

var yunstate: YunState, usertoday, userdata

export {
	yunstate, userdata, usertoday
}

interface UserData{
	id: number;
	name: string;
	nick: string;
	money: number;
	favo: number;

	luck: number;
	lastluck: number;
	lastroll: string;

	level: number;
	exp: number;
	nextexp: number;

	HP: number[];
	BP: number[];
	AP: number[];

	equip: Array<any>;
	items: Array<any>;
	skill: Array<any>;
}

interface UserToday{
	luck: number;
	sign: boolean;
	roll: number;
	daily: number[];
    kuji: Kuji;
}

interface Kuji{
    no : number;
    pot: string
}

interface YunState {
	level: number;
	exp: number;
	money: number;

	mood: number;
	sanity: number[];

	stats: string;
	acount: string;

	shops: Array<any>;
    work: number;
}

export function __extend(ctx){
    ctx.model.extend("keywords",{
        id:"unsigned",
        name:"string",
        group:"list",
    })

    ctx.model.extend("YunUser",{
        id:"unsigned",
        name:"string",
        nick:"string",
        money:"number",
        favo:"number",

        luck:"number",
        lastluck:"number",
        lastroll:"string",

        level:"number",
        exp:"number",

        HP: "list",
        BP: "list",
        AP: "list",

        equip:"json",
        items:"json",
        skill:"json",
    })
}


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
            yunstate.mood = getMood()
        }
        if(!usertoday["1794362968"]){
            initUserToday("1794362968")
        }
        console.log("usertoday",usertoday)
    })
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
