import { Computed, Dict } from "koishi";
import fs from "fs"
import { Yun, bot, Upgrade, getUser, getJrrp} from "../unit";
import { join, resolve } from "path";

export interface Today{
	genTime:string;
	day:number; month:number;
	yun:YunDaily;
	totaltrain:number;
	totalbreak:number;
	totalwork:number;
	shopinit:Computed<number>;

	rank:any;
	lvrank:any;
	luckrank:any;
}

export interface DailyData{
	sign?:boolean;
	luck:number;
	kuji:Kuji;

	record:record;
	items:Dict<number>;
	usage:Dict<number>;
	timer:Dict<number>;

	flag:todayFlags;
	upgrade:Upgrade;
	temp:any;

	stats:{
		com:string;
		due:number;
		result:string;
	};
	lastDay:Date;
}

export interface record{
	gift:number;  //送礼次数
	favo:number;  //当日累计
	trust:number; //当日累计
	exp:number;   //当日累计
}

export interface Kuji{
	pot:string;
	no:number;
}

export interface YunDaily{
	dotrain:number;
	loads:number;
	break:number;
	rest:number;
}

export interface todayFlags{
	party?:string[],
	pkflag?:boolean,
	pkTarget?:string,
	Mapfield?:string,
}

export class DailyData{
	constructor(){
		this.luck = 0;
		this.kuji = {
			pot:'', no:null,
		};
		this.record = {
			gift:0, favo:0, trust:0, exp:0
		};
		this.usage = {};
		this.timer = {};
		this.flag = {};
		this.upgrade = {
			HP:0, SP:0, ATK:0, DEF:0, SPD:0,
			HPbuff:0, SPbuff:0, ATKbuff:0, DEFbuff:0, SPDbuff:0,
		};
		this.temp = {};
		this.stats = {
			com:'free',
			due:-1,
			result:'',
		}
		this.items = {};
		this.lastDay =  new Date();
	}
}

export class Today{
	public static data: Today;
	public static baseDir: string = "";
	public static getDataPath() {
		return resolve(Today.baseDir, 'data', "yunSaves");
	}
	public static get TodayPath() : string {
		return join(Today.getDataPath(), 'UserToday.json');
	}
	

	public static async get(uid:string):Promise<DailyData>{
		const chk = await getUser(uid)
		return chk.daily
	}

	public static async set(uid:string, data:DailyData){
		await bot.db.set('user', {userID:uid}, {daily: data})
	}

	public static load(){		
		let timetick = new Date()
		let data: Today = Today.data
		let isNewday

		if (!data) {
		
			fs.readFile(Today.TodayPath,"utf-8", (err,file)=>{
				if(!file) return;
				if(err) throw new Error("error occured while reading file:UserToday.json");
				data = JSON.parse(file.toString());

				if(data){
					Today.data = data;
					console.log("从UserToday.json中读取完毕");

					if(data.day !== timetick.getDate() || data.month !== timetick.getMonth()){
						Today.new();
						isNewday = true
					}
					if(Today.data && isNewday){
						Today.save()
					}
				}
				else{
					console.log("从UserToday.json中读取失败，等待2秒后再试");
				}
			})
		}
		if(data){
			bot.v = Today.data
		}
		return Today.data
	}

	public static async save(){
		const data = JSON.stringify(Today.data);
		if(!fs.existsSync(Today.getDataPath())) fs.mkdirSync(Today.getDataPath(),{recursive:true})
		await fs.writeFileSync(Today.TodayPath, data);
		console.log('已保存本地数据：UserToday.json');
	}

	public static new(){
		let timetick = new Date()

		Today.data = new Today(timetick)
		Yun.state.mood = Yun.mood();
		Yun.state.AP = Yun.state.maxAP;
		Yun.state.luck = getJrrp(Yun.selfId)

		return Today.data
	}

	constructor(timetick:Date){
		this.genTime = timetick.toLocaleString();
		this.day = timetick.getDate();
		this.month = timetick.getMonth();

		this.yun = {
			dotrain:0,  break:0, rest:0, loads:0,
		}
		this.totalbreak = 0;
		this.totaltrain = 0;
		this.totalwork = 0;

		this.rank = [];
		this.luckrank = [];
		this.lvrank = [];
		this.shopinit = 0;
	}
}
