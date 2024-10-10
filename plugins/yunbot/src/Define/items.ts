import { Dict, Session } from "koishi"
import { between, category, copy, expCount, Game, LevelExp, LevelKan, random } from "../unit"


export type iTypes = '丹药' | '灵果' | '至宝' | '食物' | '灵材' | '植物' | '矿物' | '素材' | '道具'
export type methods = '恢复' | '永久提升' | '暂时提升' | '经验' | '突破' | '万能' | '合成'
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
	category:category;
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
	category:category;
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
	setGetexpB?(prob:number){
		this.getexpb = prob
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
	setCategory?(string:category){
		this.category = string;
		return this
	}
	public static data:Dict<Items> = {}
	public static use(session:Session<'game'|'daily'>, item:Items){

		switch(item.method){
			case '永久提升':
				return this.setUpgrade(session, item )

			case '恢复':
				return this.recovery(session, item)

			case '暂时提升':
				return

			case '突破':
				return this.Breakhelper(session, item )

			case '经验':
				return this.getExp(session, item )

			case '万能':
				return 
		}
	}

	public static recovery(session:Session<'game'|'daily'>, item:Items){
		const { game } = session.user
		let retext = '恢复'
		this.setUsage(session, item.name)

		if(item.HP) {
			game.HP += item.HP;
			retext += `HP+${item.HP}　`
		}
			

		if(item.reHP) {
			const recover = Math.floor(item.reHP*game.maxHP)
			game.HP += recover;
			retext += `HP+${recover}　`
		}
			

		if(item.SP) {
			game.SP += item.SP;
			retext += `SP+${item.SP}　`
		}

		if(item.reSP) {
			const recover = Math.floor(item.reSP=game.maxSP)
			game.SP += recover;
			retext += `SP+${recover}　`
		}

		return retext
	}

	public static Breakhelper(session:Session<'game'|'daily'>, item:Items){
		const { game } = session.user
		this.setUsage(session, item.name)

		game.flag.breakbuff += item.breakbuff;
		item.num--
		return `突破概率 +${item.breakbuff}%`
	}

	public static getExp(session:Session<'game'|'daily'>, item:Items){
		const { game } = session.user
		this.setUsage(session, item.name)
		let exp = 0

		if(item.getexp) exp += random(item.getexp[0],item.getexp[1])
		if(item.getexpb) exp += Math.max( Math.floor(item.getexpb*LevelExp( game.level)) ,  expCount(random(10,30),game) )

		game.exp += Math.floor(exp)
		item.num--

		return `经验获得 +${exp}=>${game.exp}`
	}

	public static setUpgrade(session:Session<'game'|'daily'>, item:Items, mode?){
		const { game } = session.user
		const name = item.upgrade
		let retxt = ''

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
				retxt += ` ${k.replace('buff','')}从根本上永久提升了${ k.match('buff') ? item[k]*100+'%' : item[k] }。\n`
			}
		}
		
		return retxt
	}

	public static setUsage(session:Session<'daily'>, name:string){
		const { daily } = session.user
		if(!daily?.items) daily.items = {}
		if(daily.items[name]) daily.items[name] ++;
		else daily.items[name] = 1
	}

	public static checkRequire(level:number,item:Items){
		if(item?.require){
			return between(level,item.require[0],item.require[1])
		}
		else{
			return true
		}
	}

	public static checkUsage(session:Session<'game'|'daily'>, item:Items){
		const { game, daily } = session.user
		if(!daily?.items){
			daily.items = {}
		}
		if(!daily.items[item.name]){
			daily.items[item.name] = 0
		}

		switch(item.method){
			case '永久提升':
				console.log(game.upgrade[item.upgrade]?.count, item.lifeUsage, ( game.upgrade[item.upgrade] &&  game.upgrade[item.upgrade].count >= item.lifeUsage) )
				return ( game.upgrade[item.upgrade] &&  game.upgrade[item.upgrade]?.count < item.lifeUsage)
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
	public static get(game:Game, item:string, num:number){
		if(!game.items[item]){
			game.items[item] = copy(Items.data[item])
		}
		game.items[item].num += num
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
		this.category = 'items'
	}
}

export function ItemDes(items:Items){
	let txt = [
		`【${items.name}】\n`,
		`类型：${items.type}　　使用效果：${items.method}\n`,
		`${items.des}\n`,
	]

	const list = {
		lifeUsage:	{ name:'最大使用次数',	value: items.lifeUsage+'次' },
		dayUsage :	{ name:'每日使用限制',	value: items.dayUsage+'次'},

		HP:		{ name:items.method == '恢复' ? '恢复生命' : '生命提升',		value: items.HP		},
		SP:		{ name:items.method == '恢复' ? '恢复法力' : '法力提升',		value: items.SP		},
		reHP:	{ name:'恢复生命',		value: items.reHP*100+'%'},
		reSP:	{ name:'恢复法力',		value: items.reSP*100+'%'},
		HPbuff: { name:'生命提升',		value: items.HPbuff*100+'%'},
		SPbuff: { name:'法力提升',		value: items.SPbuff*100+'%'},

		ATK:	{ name:'攻击提升',		value: items.ATK	},
		DEF:	{ name:'防御提升',		value: items.DEF	},
		SPD:	{ name:'速度提升',		value: items.SPD	},

		ATKbuff	: { name:'攻击提升',	value: items.ATKbuff* 100 +'%' },
		DEFbuff	: { name:'防御提升',	value: items.DEFbuff* 100 +'%' },
		SPDbuff	: { name:'速度提升',	value: items.SPDbuff* 100 +'%' },

		getexp : { name:'获得经验',		value: items.getexp ? `${items?.getexp[0]}~${items?.getexp[1]}` : ''},
		getexpb: { name:'获得经验',		value:`${items.getexpb*100}%`},

		breakbuff:{ name:'突破概率',	value: items.breakbuff	},
		recipie: { name:'制作配方',		value: items.recipie ? items.recipie.join('，').replace(new RegExp(/(\s)/g),'x') +'\n' : ''},
		require: { name:'使用等级',		value: items.require ? `最低 ${LevelKan(items.require[0])} 最高 ${LevelKan(items.require[1])}\n` : ''}
	}

	let c = 0
	for(let i in list){
		if(items[i]){
			let t = `${list[i].name}：${list[i].value}`
			c++
			if(c%2==0){
				t += '\n'
			}
			else{
				t += ' | '
			}
			txt.push(t)
		}
	}
	return txt.join('')
}