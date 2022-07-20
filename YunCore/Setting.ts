import { Context, Session } from "koishi"
import fs from 'fs'
import { createHash } from 'crypto';
import { compare } from "./Function";


export default class YunBot {
	public static yunstate: YunState;
	public static usertoday: TodayData;

	public static getYunData() {
		if ( !yunstate ){
			fs.readFile('Yunstate.json','utf-8',(err,data)=>{
				if(!data) return;
				if(err) throw new Error("error occured while reading file:Yunstate.json");
					yunstate = JSON.parse(data.toString());
					console.log("getYunState:",yunstate)
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
			fs.readFile('usertoday.json','utf-8',(err,data)=>{
				if(!data) return;
				if(err) throw new Error("error occured while reading file:usertoday.json");
					usertoday = JSON.parse(data.toString());

				if(usertoday.day != timetick.getDate() || usertoday.month != timetick.getMonth()+1){
					YunBot.NewToday()
				}
				
				if( usertoday && !usertoday?.user[master]){
					usertoday.user[master] = new UserToday()
				}
				console.log("getUsertoday:",usertoday)
			})
		}
		if(usertoday) return usertoday
	}

	public static NewToday(){
		let timetick = new Date()
		usertoday = new TodayData(timetick)
	}

	constructor(){
		YunBot.yunstate = YunBot.getYunData()
		YunBot.usertoday = YunBot.getUsertoday()
	}
}

export class TodayData{
	constructor( day: Date){

		this.month = day.getMonth()+1;
		this.day = day.getDate();
		this.genTime = day.toLocaleString();

		this.yunwork = 0; this.userwork = 0;
		this.rank = []; this.luckrank = [];

		this.user = {};
	}
}

export var yunstate : YunState = YunBot.yunstate
export var usertoday : TodayData = YunBot.usertoday
export const master: string = '1794362968'
export const yunbot: string = '185632406'
export const senior: string = '1742029094'
export const cleaner: string = '541084126'
export const brother: string = '1632519382'

if(!yunstate){
	new YunBot()
	console.log('数据同步中……')
	setTimeout(() => {
		yunsave()
	}, 2000);
}

export interface TodayData{
	month: number; day: number;
	genTime: string;

	yunwork: number;
	userwork: number;
	rank: Array<any>;
	luckrank: Array<any>;
	
	user:any;
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

	equip: any;  accesory: any; items: any;
	skill: Array<any>; core:any;
	storage: Array<any>;
	titles: string[];
	flag: any;
}

export class UserData{
	constructor(){
		this.money = 100;
		this.favo = 0;	this.trust = 0;
		this.luck = 0;	this.lastluck = 0;	this.lastroll = "";

		this.title = "";
		this.level = 1;	this.exp = 0;
		this.soul = "金木水火土";

		this.HP = 30; this.maxHP = 30;
		this.AP = 5; this.maxAP = 5;
		this.SP = 10; this.maxSP = 10;

		this.BP = 5; this.ATK = 5; this.DEF = 5;

		this.skill = []; this.core = {}
		this.equip = { head:{}, coat:{}, middle:{}, skin:{}, weapon:{},};
		this.accesory={ face:{}, ear:{}, hand:{}, leg:{}};
		this.items = {};
		this.storage = [];
		this.titles = [];
		this.flag = {};
	}
}

interface UserToday{
	luck: number;  //jrrp
	sign: boolean; //签到
	roll: number; //骰点次数
	daily: any; //每日任务
	kuji: any;  //每日一签
	flag: any;  //一些临时flag
	usage:any; //指令使用次数
}

class UserToday{
	constructor(){
		this.sign = false;
		this.roll = 0;
		this.daily = {};
		this.flag = {};
		this.usage = {};
		this.kuji = {};
		this.luck = -1;
	}
}

interface UserDaily {
	work: number;  //打工次数
	gift: number;  //送礼次数
	talk: number;  //聊天事件触发次数
	clean: number; //打扫次数
	go:   boolean;  //每日历练
}

export interface YunState {
	level: number; exp: number; soul:string;
	talent: string[]; mood: number;
	title:string;

	money: number;
	HP: number; maxHP: number;
	AP: number; maxAP: number;
	SP: number; maxSP: number;
	san: number;
	maxsan: number;	
	BP: number;

	ATK:number; DEF:number; core:any
	equip:any; accesory:any; skill:Array<any>;
	items:any;

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

	const data = JSON.stringify(usertoday)
	fs.writeFileSync('usertoday.json',data)  
}

export function saveToday(){
	const data = JSON.stringify(usertoday)
	fs.writeFileSync('usertoday.json',data)   
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
	let data, user

	data = await ctx.database.getUser('onebot', uid)

	if( data.YunData?.money > 0 && !data.YunData?.accesory ){
		data.YunData['accesory'] = { face:{}, ear:{}, hand:{}, leg:{} }	
	}

	if( data.YunData?.money > 0 && data.YunData?.core ){
		data.YunData['core'] = {}
	}
		
	if(!data.YunData?.money){
		user = new UserData()
		data.YunData = user
	}	

	user = data.YunData;
	await setUser(ctx, uid, user)

	return user
}

export async function setUser(ctx:Context, uid: string, data) {
	await ctx.database.set('user',{ onebot : uid}, { YunData: data})
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
	console.log('好感变化',data['favo'])
	
	await setUser(ctx, uid, data)
}

export async function setTrust(ctx:Context, uid:string, val:number) {
	let data = await getUser(ctx, uid)

	data['trust'] += val
	console.log('信赖变化',data['trust'])
	
	await setUser(ctx, uid, data)
}

export function getToday(uid:string) : UserToday {
	if (!usertoday.user[uid]){
		usertoday.user[uid] = new UserToday()
		saveToday()
	}
	return usertoday.user[uid]
}
