import { Dict } from "koishi";
import { copy, fixed, Game, getINTbuff, GradeName, random, Soul } from "../unit";

export interface Minds{
	id?:number;
	name:string;
	des:string;
	grade:number;
	level:number;
	exp:number;
	maxlevel:number;
	lvstats:Array<corebuffs>
}

export interface PlayerCore{
	id?:number;
	name?:string;
	grade?:number;
	level?:number;
	exp?:number;
	maxlevel?:number;
}

export interface corebuffs{
	ATKbuff?:number;
	DEFbuff?:number;
	SPDbuff?:number;
	HPbuff?:number;
	SPbuff?:number;
	Expbuff?:number;
}

type buff = 'ATKbuff' | 'DEFbuff' | 'SPDbuff' | 'HPbuff' | 'SPbuff' | 'Expbuff'

export class Minds{
	setbuff(buff:buff, base:number, max:number){
		let p = (max-base)/(this.maxlevel-1)

		for(let i=0; i< this.maxlevel; i++){
			let re = base+p*i
			re = Math.floor((re*100)+0.5)/100
			this.lvstats[i][buff] = fixed(re,2)
		}
		return this
	}
	public static data:Dict<Minds> = {}

	public static set(name:string, des:string, grade:number, maxlevel:number){
		const list = Object.keys(Minds.data)
		let id = 0
		if(list.includes(name)){
			id = list.indexOf(name)
		}else{
			id = list.length
		}
		Minds.data[name] = new Minds(id,name, des, grade, maxlevel)
		return Minds.data[name]
	}

	public static get(name:string){
		const core = Minds.data[name]
		let newCore:PlayerCore = {
			id: core.id, name: core.name,
			level: 1, exp:0, maxlevel: core.maxlevel,
			grade: core.grade,
		}
		return newCore
	}

	public static getExp(game:Game){

		let exp = 1+random(game.core.grade) + (game.luck > 60 ? 1 : 0)
		exp *= getINTbuff(game.INT)
		exp = Math.max(Math.floor(exp+0.5),1)

		game.core.exp = Math.floor(game.core.exp+exp+0.5)
		
		return `${game.name}的心法进度 + ${exp}=>${game.core.exp}/${this.nextExp(game.core)}`
	}

	public static nextExp(core:PlayerCore){
		return core.level * 10 * Math.pow(core.grade,2)
	}
	public static levelUP(core:PlayerCore){
		if(core.level < core.maxlevel && core.exp >= this.nextExp(core)){
			console.log('心法升级',core.level,core.maxlevel)
			core.exp -= this.nextExp(core);
			core.exp = Math.max(Math.floor(core.exp/2),0);
			core.level ++
			return `\n日积月累，滴水成河。你对心法的研修达到了一个圆满阶段！你对心法的理解更加深入了，从${ core.level }层升级为${core.level + 1}层了。`
		}
		else{
			return false
		}
	}
	constructor(id:number, name:string, des:string, grade:number, maxlevel:number){
		this.id = id;
		this.name = name;
		this.des = des;
		this.grade = grade;
		this.level = 1;
		this.exp = 0;
		this.maxlevel = maxlevel
		this.lvstats = []
		for(let i=0; i < maxlevel; i++){
			this.lvstats[i] = {}
		}
	}
}

export function CoreDes(core:Minds, level?) {
	if(!level) level = core.maxlevel-1 ;
	else level -= 1;

	const _core = core.lvstats[level]

	let txt = [
	`【${core.name}】 品级：${GradeName[core.grade]}品　层数：${core.maxlevel}\n`,
	`说明：${core.des}\n`,
	];

	const list = {
		HPbuff: '生命加成', SPbuff:'法力加成',
		ATKbuff:'攻击加成', DEFbuff:'防御加成', SPDbuff:'速度加成',
		Expbuff:'经验加成'
	}

	let c = 0
	for(let i in list){
		if(_core[i]){
			let text = `${list[i]}： ${_core[i] * 100}%`
			c++
			if(c%3==0){
				text += '\n'
			}
			else{
				text += ' | '
			}
			txt.push(text)
		}
	}
	console.log(core)

	return txt.join("");
}