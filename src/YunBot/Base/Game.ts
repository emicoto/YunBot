import { Context, Dict } from "koishi";
import { CountStats, CoreLib, printSoul, SkillLib, random, expCount } from "../index"

export interface Game{
	name:string;	nick:string;
	title:string;	soul:string;

	favo:number;	trust:number;

	level:number;	exp:number;
	luck:number;	lastluck:number;
	stats:string;

	HP:number;	maxHP:number;
	SP:number;	maxSP:number;
	AP:number;	maxAP:number;
	BP:number;

	ATK:number;	DEF:number;	SPD:number;
	INT:number;	WIL:number;

	mine:number;
	plant:number;	medicine:number;
	craft:number;	research:number;

	core:any;	equip:Equip;
	skill:any;	upgrade:any;
	items:any;	storage:Array<any>;

	flag:any;	cflag:any;
	memory:Array<any>;
	signed:boolean;
}

export interface Flags{
	breakBuff: number;
}

export interface Cflags{
	stats: string;
	cooldown: Dict<number>;
	condition: any;
}

export interface Equip{
	weapon	: any; 	head	: any;
	cloth	: any; 	shoes	: any;
	neck	: any; 	hands	: any;
	waist	: any;
}

export class Game{
	public static setCore(data:Game, name:string){
		let core = CoreLib[name]
		data.core = {
			id: core.id, name: core.name,
			level: 1, exp:0, maxlevel: core.maxlevel,
			grade: core.grade,
		}
		return data
	}

	public static setSkill(data:Game, name:string){
		let skill = SkillLib[name];
		data.skill[name] = JSON.parse(JSON.stringify(skill));
		return data
	}

	public static setFavo(data:Game, min, max?){
		if(!max) max = min;
		data.favo =+ random(min,max);
	}

	public static setTrust(data:Game, min, max?){
		if(!max) max= min;
		data.trust =+ random(min,max);
	}

	public static setExp(data:Game, min, max?){
		if(!max) max=min;
		let exp = random(min,max) + (data.luck ? data.luck/10 : 0);
		exp = expCount(exp, data);
		data.exp =+ exp;
	}

	public static Count(data:Game){
		return CountStats(data)
	}

	public static save( ctx:Context, platform:string, uid:string){
		//保存到YunSave里
	}

	get charaname(){
		if(this.nick) return this.nick;
		return this.name
	}

	get soulchar(){
		return printSoul(this.soul);
	}

	constructor(name:string, nick?:string){
		this.name = name;		this.nick= (nick? nick: "");
		this.title = "";
		
		this.soul = "金木水火土";
		this.favo = 0;	this.trust = 0;
		
		this.level = 1;	this.exp = 0;
		this.luck = 0;	this.lastluck = 0;
		this.stats = "";

		this.HP = 30;	this.maxHP = 30;
		this.SP = 10;	this.maxSP = 10;
		this.AP = 8;	this.maxAP = 8;
		this.BP = 5;

		this.ATK = 5;	this.DEF = 5;	this.SPD = 5;
		this.INT = 5;	this.WIL = 5;

		this.mine = 5;	this.plant = 5;
		this.medicine = 5;	this.craft = 5;
		this.research = 5;

		this.core = {};
		this.equip = { weapon:{},	head:{},	cloth:{},
			shoes:{},	neck:{},	hands:{},	waist:{},}
		
		this.skill = {};	this.upgrade = {};
		this.items = {};	this.storage = [];

		this.flag = {};		this.cflag = {};
		this.memory = [];	this.signed = false
	}
}

export const setFavo = Game.setFavo;
export const setTrust = Game.setTrust;
export const setCore = Game.setCore;
export const setSkill = Game.setSkill;
export const setExp = Game.setExp;