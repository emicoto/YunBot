import { Context, segment, Session } from "koishi"
import fs from 'fs'
import { createHash } from 'crypto';
import { compare } from "./Function";

export default class YunBot {
	public static yunstate: YunState;
	public static usertoday: any;

	public static getYunData() {
		if ( !yunstate ){
			fs.readFile('Yunstate.json','utf-8',(err,data)=>{
				if(!data) return;
				if(err) throw new Error("error occured while reading file:Yunstate.json");
					yunstate = JSON.parse(data.toString());
			})
		}
		if(yunstate) {
			yunstate.mood = getMood()
			return yunstate
		}
	}
	public static getUsertoday(){
		let timetick = new Date()
		if( !usertoday ){
			fs.readFile('Yunstate.json','utf-8',(err,data)=>{
				if(!data) return;
				if(err) throw new Error("error occured while reading file:usertoday.json");
				usertoday = JSON.parse(data.toString());

				if(usertoday.day != timetick.getDate() || usertoday.month != timetick.getMonth()+1){
					NewToday()
				}
				if(!usertoday["1794362968"]){
					initUserToday("1794362968")
				}
				console.log("getUsertoday:",usertoday)
			})
		}
		if(usertoday) return usertoday
	}
}

export var yunstate : YunState = YunBot.yunstate
export var usertoday : any = YunBot.usertoday
export const master: string = '1794362968'
export const yunbot: string = '185632406'
export const senior: string = '1742029094'
export const cleaner: string = '1632519382'
export const brother: string = '541084126'

if(!yunstate){
	YunBot.getYunData()
	YunBot.getUsertoday()
	console.log('数据同步中……')
}


export interface UserData{
	money: number; 
	favo: number; trust: number;

	luck: number; lastluck: number; lastroll: string;

	title:string;

	level: number; exp: number; soul: string;

	HP: number; maxHP: number;
	AP: number; maxAP: number;
	SP: number; maxSP:number;	
	BP: number;

	ATK:number; DEF:number;

	equip: any;  items: any;
	skill: Array<any>;
	storage: Array<any>;
	titles: string[];
	flag: any;
}

interface UserToday{
	luck: number;
	sign: boolean;
	roll: number;
	daily: UserDaily;
	kuji: Kuji;
}

interface UserDaily {
	work: number;  //打工次数
	gift: number;  //送礼次数
	talk: number;  //聊天事件触发次数
	clean: number; //打扫次数
	go:   boolean;  //每日历练
}

interface Kuji{
	no : number;
	pot: string
}

export interface YunState {
	level: number; exp: number; soul:string;
	talent: string[]; mood: number;

	money: number;
	HP: number; maxHP: number;   
	san: number;
	maxsan: number;	
	BP: number;

	stats: string;

	shops: Array<any>;
	work: number;
	flag: any;
}


export function __extend(ctx){
	ctx.model.extend("user",{
		YunData:"json",
		nick:"string",
	})
}
/*
export function initData(){
	let timetick = new Date()
	fs.readFile('Yunstate.json','utf-8',(err,data)=>{
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
}*/

export function getMood(){
	const hash = createHash('sha256')
	hash.update('185632406')
	hash.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0))
	hash.update('6688')

	let val = Math.max(parseInt(hash.digest('hex'),16) % 101,1)
	return val
}

export function yunsave(){
	const data1 = JSON.stringify(yunstate)
	fs.writeFileSync('Yunstate.json',data1)
}

export function saveToday(){
	const data = JSON.stringify(usertoday)
	fs.writeFileSync('usertoday.json',data)   
}

export function NewToday(){
	let timetick = new Date()
	usertoday = {
		month : timetick.getMonth()+1,
		day : timetick.getDate(),
		yunwork: 0,
		userwork:0,
		rank:[],
		luckrank:[],
	}
}

export async function makeRank( ctx:Context ){
	const data = await ctx.database.get('user',null)
	let rank = []
	let luck = []

	for(let i in data){
		if(data[i]['YunData']?.level){
			rank[i] = { level: data[i]['YunData'].level , user: data[i]['name'] }
			luck[i] = { luck: data[i]['YunData'].luck, user: data[i]['name'] }
		}
	}

	rank.sort(compare("level"))
	luck.sort(compare("luck"))

	YunBot.usertoday['rank'] = rank
	YunBot.usertoday['luckrank'] = luck
}

export async function getUser(ctx:Context, uid:string) {
	let data, user:UserData

	data = await ctx.database.getUser('onebot', uid)
		
	if(!data.YunData?.money){
		user = {
			money: 100, favo: 0, trust: 0,
			luck: 0, lastluck: 0, lastroll: '',
			level: 1, exp: 0,
			soul:'杂金木水火土',
			title:'',

			HP:30, maxHP:30,
			AP:5, maxAP:5,
			SP:10, maxSP:10,

			BP:5,  ATK:5, DEF: 5,
		
			skill:[],
			equip:{ head:{}, coat:{}, middle:{}, skin:{}, weapon:{}, },
			items:{},
			storage:[],
			titles:[],
			flag:{},
		}
		data.YunData = user
		await ctx.database.setUser('onebot', uid, { YunData: user })
	}
	
	user = data.YunData
	return user
}

export async function setUser(ctx:Context, uid: string, data) {
	await ctx.database.set('user',{ onebot : uid}, { YunData: data})
	let d = await ctx.database.getUser('onebot', uid)
	console.log('存档中',d)
}


export async function getUserName(ctx:Context, session:Session ) {
	let user, name
		
	user = await ctx.database.getUser(session.platform, session.userId)

	if(user.name && user.name.length >= 1) name = user.name;
	if(user.nick && user.nick.length >= 1) name = user.nick;

	if(!name){
		name = session.author.nickname;
		if(!name) name = session.author.username;
		await ctx.database.setUser(session.platform, session.userId, { name: name})
	}

	return name
}


export async function setFavo(ctx:Context, uid:string, val:number) {
	let data = await getUser(ctx, uid)

	data['favo'] += val
	console.log(data['favo'])
	
	await ctx.database.setUser('onebot', uid, { YunData: data})
}

export async function setTrust(ctx:Context, uid:string, val:number) {
	let data = await getUser(ctx, uid)

	data['trust'] += val
	console.log(data['trust'])
	
	await ctx.database.setUser('onebot', uid, { YunData: data})
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

