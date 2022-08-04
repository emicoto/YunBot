import { CoreLib, Equip, getMood, printSoul, LevelExp, getBreakRate, copy, WeaponLib, SkillLib, writeFileSync, YunConfig} from "../index";
import fs from "fs"

export interface Yun{
	name:string;	title:string;
	talent:string[];	soul:string;

	level:number;	exp:number;
	mood: number;	stats:string;
	money:number;

	HP:number;	maxHP:number;
	SP:number;	maxSP:number;
	AP:number;	maxAP:number;
	san:number;	maxsan:number;
	BP:number;

	ATK:number;	DEF:number;	SPD:number;
	INT:number;	WIL:number;	

	mine:number;
	plant:number;	medicine:number;
	craft:number;	research:number;

	core:any;	equip:Equip;
	skill:any;	upgrade:any;
	items:any;

	flag:any;	memory:Array<any>;
	shops:Array<any>;
	work:number;
}

export type botstats = 'onLoading' | 'failed' | 'botOn' | 'botOff' | 'Running' | ''

export class Yun{
	public static state:Yun;
	public static botstats:botstats;

	public static selfId:string = '185632406';
	public static masterId:string = '1794362968';
	public static master:string = '时月';
	public static callmaster:string = '师父';
	public static nick:string = '小昀';

	public static Config: YunConfig;

	public static load(){
		let data:Yun = Yun.state
		if(!data){
			fs.readFile("YunData.json","utf-8", (err, file)=>{
				if(!file) return;
				if(err) throw new Error("error occured while reading file:YunData.json")
				data = JSON.parse(file.toString());

				if(data){
					Yun.state = data
					console.log("从YunData.json中读取完毕");
				}
				else {
					console.log("从YunData.json中读取失败，等待2秒后再试");
					Yun.botstats = 'failed'
				}
			});
		}
		else{
			Yun.state.mood = getMood();
		}

		return Yun.state;
	}
	public static async save(){
		const data = JSON.stringify(Yun.state);
		await writeFileSync("YunData.json", data);
		console.log("已保存本地数据:YunData.json");
	}
	public static init(){
		Yun.state = new Yun()
		return Yun.state
	}
	get soulchar(){
		return printSoul(this.soul)
	}
	get _mood(){
		return getMood()
	}
	set shopitem(arg){
		this.shops.push(arg)
	}
	set solditem(arg:number){
		this.shops.splice(arg,1)
	}
	get shopcount(){
		return this.shops.length
	}
	get isBreak(){
		return (this.exp >= LevelExp(this.level))
	}
	get isBusy(){
		return ['work','learn','sleep'].includes(this.stats)
	}
	get isSleeping(){
		return (this.stats === 'sleep')
	}
	get breakrate(){
		return getBreakRate(Yun.state,'yun')
	}
	get luck(){
		return //getJrrp(Yun.selfId)
	}
	get breakbuff(){
		return this.flag.breakbuff
	}
	constructor(){
		//初始化用。

		this.name = '路昀';
		this.title = '掌门之子';
		this.talent = ['灵兽','灵泉','内向','淡漠','散漫'];
		this.soul = '天水';

		this.level = 21; this.exp = 0;	

		this.mood = getMood();	this.stats = 'sleep';
		this.money = 500;

		this.HP = 1000; this.maxHP = 1000;
		this.SP = 7000; this.maxSP = 7000;
		this.AP = 20;	this.maxAP = 20;
		this.san = 20;	this.maxsan = 20;
		this.BP = 500;

		this.ATK = 100;	this.DEF = 90; this.SPD = 70;
		this.INT = 100; this.WIL = 70;

		this.mine = 10;	this.plant = 50;
		this.medicine = 30; this.craft = 30;
		this.research = 100;

		let book = CoreLib['天泉心法'];
		this.core = {
			id: book.id, name: book.name,
			level: 3,
			exp: 0,
			maxlevel:book.maxlevel,
			grade: book.grade,
		};

		this.equip = {
			weapon : copy(WeaponLib['净玉扇']),
			head:{}, cloth:{}, shoes:{},
			neck:{}, hands:{}, waist:{},
		};

		this.skill = {
			'灵泉之体': copy(SkillLib['灵泉之体']),
			'天泉幻法': copy(SkillLib['天泉幻法']),
		};

		this.upgrade = {};
		this.items = {};
		this.flag = {
			breakbuff: 5,
			breakbuffByEquip:0,
		};

		this.memory = [];
		this.shops = [];

		this.work = 0
	}
}
