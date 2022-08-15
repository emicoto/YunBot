import { Dict } from "koishi";
import { copy, fixed, GradeName, textp, random, Soul } from "../unit";


type wType = '刀剑' | '暗器' | '扇' | '乐器' | '法杖' | '枪械' | '长柄刀剑' | '鞭绳' | ''
type range = '短距离' | '中距离' | '长距离' | '全距离' | '可变' | ''
type eType = '衣服' | '鞋子' | '手饰' | '头饰' | '腰饰' | '首饰' | ''

export interface Weapon{
	id:number; name:string;
	des:string; type:wType; grade:number;

	range:range;

	HP?:number;	HPbuff?:number;
	SP?:number;	SPbuff?:number;

	ATK?: number; ATKbuff?: number;
	DEF?: number; DEFbuff?: number;
	SPD?: number; SPDbuff?: number;

	skill?:string;
	value?:number;

	exp?:number; level?:number;
	unique:boolean;
	owner?:string;

	soul?:string[];
	lvstats?:natalstats
}

export interface natalstats{
	HP?:number[];	HPbuff?:number[];
	SP?:number[];	SPbuff?:number[];

	ATK?: number[]; ATKbuff?: number[];
	DEF?: number[]; DEFbuff?: number[];
	SPD?: number[]; SPDbuff?: number[];
	gradesp?:grades[];	
}

export interface upGrade{
	HP?:number;	HPbuff?:number;
	SP?:number;	SPbuff?:number;

	ATK?: number; ATKbuff?: number;
	DEF?: number; DEFbuff?: number;
	SPD?: number; SPDbuff?: number;

	skill?:string;
	soul?:string[];
}

export interface grades{
	require:number;
	rename?:string;
	add:upGrade;
}

export interface Equip{
	id:number; name:string;
	des:string; type:eType; grade:number;

	HP?:number;	HPbuff?:number;
	SP?:number;	SPbuff?:number;
	ATK?: number; ATKbuff?: number;
	DEF?: number; DEFbuff?: number;
	SPD?: number; SPDbuff?: number;

	mine?:number; medicine?:number;
	plant?:number; craft?:number;
	research?:number;

	breakbuff?:number;
	Expbuff?:number;
	value?:number;
	unique:boolean;

	soul?:string[];
}

//指武器的普攻范围
const Range:Dict<range> = {
	'刀剑':'短距离', '暗器':'中距离', '扇':'可变', '乐器':'短距离',
	'法杖':'中距离', '枪械':'全距离', '长柄刀剑':'中距离', '鞭绳':'中距离',
	'':''
}

//物品价值换算？
//每提升1战斗力，价值50灵石？
//

export class Weapon{
	setHP?(int:number){
		this.HP = int
		return this
	}
	setHPbuff?(int:number){
		this.HPbuff = int
		return this
	}
	setSP?(int:number){
		this.SP = int;
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
	setSoul?(str:string[]){
		this.soul = str
		return this
	}
	setRandomSoul?(str?){
		this.soul = Soul.Random(str)
		return this
	}
	setSkill?(str:string){
		this.skill = str
		return this
	}
	setValue?(int:number){
		this.value = int
		return this
	}
	setLevel?(any:natalstats){
		this.level = 1;
		this.exp = 0;
		this.lvstats = any
		return this
	}
	setUnique?(){
		this.unique = true
		return this
	}

	public static data:Dict<Weapon> = {}
	public static templet:Dict<Weapon> = {}
	public static get(name:string){
		let newItem = copy(Weapon.data[name])
		return newItem
	}
	public static make(name:string, creator:string, type:wType, grade:number, des?:string){
		const id = 1000;
		if(!des){
			des = `一把由${creator}打造的${type}。`
		}
		else{
			des = textp(des,[creator,type])
		}
		let newitem = new Weapon(id,name, des, type, grade)
		return newitem
	}

	public static add(name:string, des:string, type:wType, grade:number){
		const list = Object.keys(Weapon.templet)
		let id = 0
		if(list.includes(name)){
			id = list.indexOf(name)
		}else{
			id = list.length
		}
		Weapon.templet[name] = new Weapon(id, name, des, type, grade);
		return Weapon.templet[name]
	}

	public static set(name:string, des:string, type:wType, grade:number, ){
		const list = Object.keys(Weapon.data)
		let id = 0
		if(list.includes(name)){
			id = list.indexOf(name)
		}else{
			id = list.length
		}
		Weapon.data[name] = new Weapon(id, name, des, type, grade);
		return Weapon.data[name]
	}
	public static nextExp(weapon:Weapon){
		return Math.pow(weapon.level+1,2)*10*Math.pow(weapon.grade,2)
	}

	public static gradeUP(weapon:Weapon){
		if(weapon.level == 10 && weapon.grade < 10){
			weapon.exp = 0;
			weapon.level = 1;
			weapon.grade++

			const list = ['HP','SP','ATK','DEF','SPD']
			const listb = ['HPbuff','SPbuff','ATKbuff','DEFbuff','SPDbuff']
			for(let i in weapon.lvstats){
				const lvs = weapon.lvstats[i]

				if(list.includes(i)){
					let max = weapon.lvstats[i][1]
					let newmin = max + Math.max(Math.floor(max*0.1+0.5),1)
					weapon.lvstats[i][0] = newmin
					weapon.lvstats[i][1] = Math.floor(newmin*1.5+0.5)
					weapon[i] = newmin
				}
				
				if(listb.includes(i)){
					let max = weapon.lvstats[i][1]
					let newmin = max+0.01
					weapon.lvstats[i][0] = Math.clamp(newmin,0.01,0.8)
					weapon.lvstats[i][1] = Math.clamp(newmin+0.1,0.01,0.8)
					weapon[i] = newmin
				}

				if(i=='gradesp'){
					for(let k in lvs.gradesp){
						this.gradeSP(weapon,k)
					}
				}
			}
		}
		return weapon
	}

	public static gradeSP(weapon:Weapon, key){
		const { lvstats } = weapon
		const { gradesp } = lvstats
		if(weapon.grade == gradesp[key].require ){
			const up = gradesp[key]
			if(up?.rename){
				weapon.name = up.rename
			}
			for(let i in up.add){
				weapon[i] = up.add[i]
			}
		}
	}

	public static levelUP(weapon:Weapon){
		if(weapon.level < 10 && weapon.exp >= this.nextExp(weapon)){
			weapon.exp -= this.nextExp(weapon);
			weapon.exp = Math.max(Math.floor(weapon.exp/2),0);
			weapon.level++
			const list = ['HP','SP','ATK','DEF','SPD','HPbuff','SPbuff','ATKbuff','DEFbuff','SPDbuff']

			for(let i in weapon.lvstats){
				if(list.includes(i)){
					let min = weapon.lvstats[i][0]
					let max = weapon.lvstats[i][1]
					let newvalue = ((max-min)/10)*(weapon.level-1)+min

					if(i.includes('buff')){
						newvalue = fixed(newvalue)
					}
					else{
						newvalue = Math.floor(newvalue+0.5)
					}
					weapon[i] = newvalue
				}
			}
		}
		return weapon
	}
	constructor(id:number, name:string, des:string, type:wType, grade:number){
		this.id = id;
		this.name = name;
		this.des = des;
		this.type = type;
		this.range = Range[type] ;
		this.grade = grade;
	}
}


export class Equip{
	setHP?(int:number){
		this.HP = int
		return this
	}
	setHPbuff?(int:number){
		this.HPbuff = int
		return this
	}
	setSP?(int:number){
		this.SP = int;
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
	setMine?(int:number){
		this.mine = int
		return this
	}
	setMedicine?(int:number){
		this.medicine = int
		return this
	}
	setPlant?(int:number){
		this.plant = int
		return this
	}
	setCraft?(int:number){
		this.craft = int
		return this
	}
	setResearch?(int:number){
		this.research = int
		return this
	}
	setSoul?(str:string[]){
		this.soul = str
		return this
	}
	setRandomSoul?(str?){
		this.soul = Soul.Random(str)
		return this
	}
	setBreakbuff?(int:number){
		this.breakbuff = int
		return this
	}
	setExpbuff?(int:number){
		this.Expbuff = int
		return this
	}
	setValue?(int:number){
		this.value = int
		return this
	}
	setUnique?(){
		this.unique = true
		return this
	}
	public static data:Dict<Equip> = {}
	public static templet:Dict<Equip> = {}

	public static get(name:string){
		let newItem = copy(Equip.data[name])
		return newItem
	}
	public static make(name:string, creator:string, type:eType, grade:number, des?:string){
		const id = 1000;
		if(!des){
			des = `一把由${creator}打造的${type}。`
		}
		else{
			des = textp(des,[creator,type])
		}
		let newitem = new Equip(id,name, des, type, grade)
		return newitem
	}
	public static add(name:string, des:string, type:eType, grade:number){
		const list = Object.keys(Equip.templet)
		let id = 0
		if(list.includes(name)){
			id = list.indexOf(name)
		}else{
			id = list.length
		}
		Equip.templet[name] = new Equip(id, name, des, type, grade)
		return Equip.templet[name]
	}
	public static set(name:string, des:string, type:eType, grade:number, ){
		const list = Object.keys(Equip.data)
		let id = 0
		if(list.includes(name)){
			id = list.indexOf(name)
		}else{
			id = list.length
		}
		Equip.data[name] = new Equip(id, name, des, type, grade)
		return Equip.data[name]
	}
	constructor(id:number, name:string, des:string, type:eType, grade:number){
		this.id = id;
		this.name = name;
		this.des = des;
		this.type = type;
		this.grade = grade;
	}
}

export function EquipDes(equip:Equip) {
	let txt = [
	`【${equip.name}】\n`,
	`类型：${equip.type} 　品阶：${GradeName[equip.grade]}品\n`,
	`${equip.des}\n`,
	];

	const list = {
		soul	: { name:'需求灵根',	value: equip.soul.join('') },
		HP		: { name:'生命',		value: equip.HP		},
		SP		: { name:'法力',		value: equip.SP		},
		ATK		: { name:'攻击',		value: equip.ATK	},
		DEF		: { name:'防御',		value: equip.DEF	},
		SPD		: { name:'速度',		value: equip.SPD	},

		HPbuff	: { name:'生命加成',	value: equip.HPbuff * 100 +'%' },
		SPbuff	: { name:'法力加成',	value: equip.SPbuff * 100 +'%' },
		ATKbuff	: { name:'攻击加成',	value: equip.ATKbuff* 100 +'%' },
		DEFbuff	: { name:'防御加成',	value: equip.DEFbuff* 100 +'%' },
		SPDbuff	: { name:'速度加成',	value: equip.SPDbuff* 100 +'%' },

		mine	: { name:'挖矿加成',	value: equip.mine + '%' },
		plant	: { name:'种植加成',	value: equip.plant + '%' },
		medicine: { name:'炼丹加成',	value: equip.medicine + '%' },
		craft	: { name:'炼器加成',	value: equip.craft + '%' },
		research: { name:'研究加成',	value: equip.research + '%' },
		breakbuff:{ name:'突破加成',	value: equip.breakbuff + '%'},
		Expbuff : { name:'修炼加成',	value: equip.Expbuff*100 + '%'},
		value   : { name:'价值',		value: equip.value + '灵石' },

	}

	let c = 0
	for(let i in list){
		if(equip[i]){
			let text = `${list[i].name}：${list[i].value}`
			c++
			if(c%3==0){
				text += '\n'
			}
			else{
				text += ' ｜ '
			}
			txt.push(text)
		}
	}

	return txt.join("");
}

export function WeaponDes(equip:Weapon) {
	let txt = [
	`【${equip.name}】\n`,
	`类型：${equip.type} 　品阶：${GradeName[equip.grade]}品\n`,
	`${equip.des}\n`,
	];

	const list = {
		soul	: { name:'需求灵根',	value: equip.soul.join('') },
		HP		: { name:'生命',		value: equip.HP		},
		SP		: { name:'法力',		value: equip.SP		},
		ATK		: { name:'攻击',		value: equip.ATK	},
		DEF		: { name:'防御',		value: equip.DEF	},
		SPD		: { name:'速度',		value: equip.SPD	},

		HPbuff	: { name:'生命加成',	value: equip.HPbuff * 100 +'%' },
		SPbuff	: { name:'法力加成',	value: equip.SPbuff * 100 +'%' },
		ATKbuff	: { name:'攻击加成',	value: equip.ATKbuff* 100 +'%' },
		DEFbuff	: { name:'防御加成',	value: equip.DEFbuff* 100 +'%' },
		SPDbuff	: { name:'速度加成',	value: equip.SPDbuff* 100 +'%' },

		skill	: { name:'装备技能',	value: equip.skill},
	}

	let c = 0
	for(let i in list){
		if(equip[i]){
			let text = `${list[i].name}：${list[i].value}`
			c++
			if(c%3==0){
				text += '\n'
			}
			else{
				text += ' ｜ '
			}
			txt.push(text)
		}
	}

	return txt.join("");
}