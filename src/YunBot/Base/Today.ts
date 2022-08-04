import { Dict } from "koishi";
import { getMood, master, today, writeFileSync, Yun} from "../index"
import fs from "fs"

export interface Today{
	genTime:string;
	day:number; month:number;

	user:Dict<UserToday>;
	yuntoday:YunToday;

	rank:any; luckrank:any; lvrank:any;
}

export interface UserToday{
	name:string;

	sign:boolean;
	luck:number;
	daily:any;
	kuji:Kuji;
	usage:Dict<number>;
}

export interface Kuji{
	pot:string;
	no:number;
}

export interface YunToday{
	work:number;
	break:number;
	rest:number;
}

export class UserToday{
	constructor(name:string){
		this.name = name;
		this.sign = false;
		
		this.luck = 0;

		this.daily = {};
		this.usage = {};

		this.kuji = {
			pot:"", no:0,
		};
	}
}

export class Today{
	public static data:Today;

	public static getUser(uid:string, name:string):UserToday{
		let user = Today.data.user[uid] ?? new UserToday(name)

		if(!Today.data.user[uid]){
			Today.data.user[uid] = new UserToday(name)
		}

		return Today.data.user[uid] ?? user
	}

	public static get(uid:string){
		return Today.data.user[uid] ?? new UserToday('')
	}

	public static load(){
		let timetick = new Date()
		let data: Today = Today.data

		if(!data){
			fs.readFile("UserToday.json","utf-8", (err,file)=>{
				if(!file) return;
				if(err) throw new Error("error occured while reading file:UserToday.json");
				data = JSON.parse(file.toString());

				if(data){
					Today.data = data;
					console.log("从UserToday.json中读取完毕");

					if(data.day !== timetick.getDate() || data.month !== timetick.getMonth()+1){
						Today.new();
					}

					if(!Today.data.user[master]){
						Today.data.user[master] = new UserToday('时月')
					}
				}
				else{
					console.log("从UserToday.json中读取失败，等待2秒后再试");
				}
			})
		}
		return Today.data
	}

	public static async save(){
		const data = JSON.stringify(Today.data);
		await writeFileSync("UserToday.json", data);
		console.log('已保存本地数据：UserToday.json');
	}

	public static new(){
		let timetick = new Date()
		Today.data = new Today(timetick);

		Yun.state.mood = getMood();
		Yun.state.AP = Yun.state.maxAP;

		return Today.data
	}

	get data(){
		return today
	}
	get yunwork(){
		return this.yuntoday.work
	}
	get yunbreak(){
		return this.yuntoday.break
	}
	get yunrest(){
		return this.yuntoday.rest
	}
	get mastertoday(){
		return this.user[master]
	}
	set yunwork(arg:number){
		this.yuntoday.work += arg
	}
	set yunbreak(arg:number){
		this.yuntoday.break += arg
	}
	set yunrest(arg:number){
		this.yuntoday.rest += arg
	}
	constructor(timetick:Date){
		this.genTime = timetick.toLocaleString();
		this.day = timetick.getDate();
		this.month = timetick.getMonth();

		this.user = {};
		this.yuntoday = {
			work:0, break:0, rest:0
		}

		this.rank = [];
		this.luckrank = [];
		this.lvrank = [];
	}
}
