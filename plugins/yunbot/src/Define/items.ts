import { Dict, Session, User } from "koishi"
import { copy, DailyData, expCount, Game, LevelExp, random } from "../unit"


export type iTypes = '丹药' | '灵果' | '至宝' | '食物' | '灵材' | '植物' | '矿物' | '素材' | '道具'
export type methods = '恢复' | '永久提升' | '暂时提升' | '经验' | '突破' | '万能'
export type uTypes = '至宝' | '灵材' | '丹药' | '灵果'

export interface Upgrade{
	type?:uTypes | iTypes;
	count?:number;

	HP?:number;		SP?:number;
	ATK?:number;	DEF?:number;	SPD?:number;
	INT?:number;	WIL?:number;

	HPbuff?:number;	SPbuff?:number;
	ATKbuff?:number; DEFbuff?:number; SPDbuff?:number;
}

export interface Items{
	id?:number;
	name:string;	des:string;
	type:iTypes;	method:methods;

	num:number;		lifeUsage?:number; dayUsage?:number;
	value:number;

	HP?:number; SP?:number; // 固定回复量
	reHP?:number; reSP?:number; //百分比回复量
	HPbuff?:number; SPbuff?:number; //永久提升量

	ATK?:number; DEF?:number; SPD?:number;
	ATKbuff?:number; DEFbuff?:number; SPDbuff?:number;

	getexp?:number[];
	getexpb?:number;
	breakbuff?:number;
	
	recipie?:Array<Array<string>>;
	upgrade?:string;
	require?:number[];
}

export interface Material{
	name:string;	des:string;
	type:string;

	num:number;
	value:number;
}

export class Items{
	setLifeUsage?(int:number){
		this.lifeUsage = int;
		return this
	}
	setDayUsage?(int:number){
		this.dayUsage = int;
		return this
	}
	setValue?(int:number){
		this.value = int;
		return this
	}
	setHP?(int:number){
		this.HP = int;
		return this;
	}
	setReHP?(int:number){
		this.reHP = int;
		return this;
	}
	setHPbuff?(int:number){
		this.HPbuff = int
		return this
	}
	setSP?(int:number){
		this.SP = int;
		return this
	}
	setReSP?(int:number){
		this.reSP = int;
		return this
	}
	setSPbuff?(int:number){
		this.SPbuff = int;
		return this
	}
	setATK?(int:number){
		this.ATK = int
		return this
	}
	setDEF?(int:number){
		this.DEF = int
		return this
	}
	setSPD?(int:number){
		this.SPD = int
		return this
	}
	setATKbuff?(int:number){
		this.ATKbuff = int
		return this
	}
	setDEFbuff?(int:number){
		this.DEFbuff = int
		return this
	}
	setSPDbuff?(int:number){
		this.SPDbuff = int
		return this
	}
	setGetexp?(min:number, max:number){
		this.getexp = [min,max];
		return this
	}
	setBreakbuff?(int:number){
		this.breakbuff = int;
		return this
	}
	setRecipie?(arr:string[]){
		if(!this.recipie){
			this.recipie = []
		}
		this.recipie.push(arr);
		return this
	}
	setRequire(min:number, max:number){
		this.require = [min, max]
		return this
	}
	isUpGradeItem?(name:string){
		this.upgrade = name;
		return this
	}
	public static data:Dict<Items> = {}
	public static use(session:Session<'game'|'daily'>, item:Items){
		switch(item.method){
			case '永久提升':
				this.setUpgrade(session, item )
				break
			case '恢复':
				this.recovery(session, item)
				break
			case '暂时提升':
				break
			case '突破':
				this.Breakhelper(session, item )
				break
			case '经验':
				this.getExp(session, item )
				break
			case '万能':
				break
		}
		return item
	}

	public static recovery(session:Session<'game'|'daily'>, item:Items){
		const { game } = session.user
		this.setUsage(session, item.name)

		if(item.HP) 
			game.HP += item.HP;

		if(item.reHP) 
			game.HP += item.reHP*game.maxHP;

		if(item.SP) 
			game.SP += item.SP;

		if(item.reSP) 
			game.SP += item.reSP*game.maxHP;
	}

	public static Breakhelper(session:Session<'game'|'daily'>, item:Items){
		const { game } = session.user
		this.setUsage(session, item.name)

		game.flag.breakbuff += item.breakbuff;
		item.num--
	}

	public static getExp(session:Session<'game'|'daily'>, item:Items){
		const { game } = session.user
		this.setUsage(session, item.name)

		if(item.getexp) game.exp += random(item.getexp[0],item.getexp[1])
		if(item.getexpb) game.exp += Math.max( Math.floor(item.getexpb*LevelExp( game.level)) ,  expCount(random(10,30),game) )
		item.num--
	}

	public static setUpgrade(session:Session<'game'|'daily'>, item:Items, mode?){
		const { game } = session.user
		const name = item.upgrade

		if(!mode)this.setUsage(session, name)
		item.num--

		if(game.upgrade[name]){
			game.upgrade[name].count ++
		}

		game.upgrade[name] = {
			type: item.type,
			count: 1,
		}

		const list = ['HP','SP','ATK','DEF','SPD','INT','WIL','HPbuff','SPbuff','ATKbuff','DEFbuff','SPDbuff']

		for(let i=0; i<list.length; i++){
			let k = list[i]
			if(item[k]){
				game.upgrade[name][k] = item[k]
			}
		}
	}

	public static setUsage(session:Session<'daily'>, name:string){
		const { daily } = session.user
		if(!daily?.items) daily.items = {}
		if(daily.items[name]) daily.items[name] ++;
		else daily.items[name] = 1
	}

	public static checkUsage(session:Session<'game'|'daily'>, item:Items){
		const { game, daily } = session.user
		switch(item.method){
			case '永久提升':
				return game.upgrade[item.upgrade]?.count < item.lifeUsage
			default:
				if(item.dayUsage > 0){
					return daily.items[item.name] < item.dayUsage	
				}
				else{
					return true
				}
		}
	}
	public static make(item:string, num:number){
		let newItem:Items = copy(Items.data[item])
		newItem.num = num
		return newItem		
	}
	public static set(name:string, des:string, type:iTypes, method:methods){
		const list = Object.keys(Items.data)
		let id = 0
		if(list.includes(name)){
			id = list.indexOf(name)
		}else{
			id = list.length
		}
		Items.data[name] = new Items(id,name,des,type,method)
		return Items.data[name]
	}
	constructor(id:number,name:string, des:string, type:iTypes, method:methods){
		this.id = id;
		this.name = name;
		this.des = des;
		this.type = type;
		this.method = method;
		this.num = 0;
		this.value = 100;
	}
}

export class Upgrade{
	constructor(type:uTypes){
		this.type = type;
		this.count = 0;
	}
}