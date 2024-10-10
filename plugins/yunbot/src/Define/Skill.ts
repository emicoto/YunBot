//cost = maxSP*cost, cost是 n%

import { Dict } from "koishi";
import { Game, playerStats } from "../unit";

//costSP 具体值
type Category = '被动' | '主动' | '自动' | '恢复'| '特殊' | ''
type sType = '身法' | '体质' | '护盾' | '剑法' | '箭术' | '枪击' | '操控' | '术法' | '操控' | '效果' | ''
type range = '近距离' | '远距离' | '全范围'
type coverage = '全体' | '随机多人' | '单排' | '单列' | '单体'

export const SkillAct = {
	tiandu: (skill, target?) => {
	if (!target) {
		return `使对象陷入天毒状态，每回合失去10%的HP与SP，持续${skill.debuff}回合。`;
	}
	if (target.flag.stats.includes("天毒") == false) {
		target.flag.stats += "【天毒】";
		target.flag.debuff["天毒"] = {
		turn: skill.debuff, DwHP: target.maxHP / 10, DwSP: target.maxSP / 10,
		};
	} else {
		target.flag.debuff["天毒"].turn += skill.debuff;
	}
	},
};

export function useSkill(player, skill, target?) {
	let txt;
	if (skill.type.includes("被动")) return; //被动技能作为常态常驻。不会执行。

	if (skill.type.includes("特殊")) return;
	if (skill.type.includes("攻击")) return;
	if (skill.tyle.includes("防御")) return;
	if (skill.type.includes("回复")) return;
}


export interface Skill {
	id?:number; name:string;
	des:string; effectDes?:string;

	category:Category; 	type:sType;
	range?:range; 	coverage?:coverage;

	HP?:number; HPbuff?:number;
	SP?:number; SPbuff?:number;

	ATK?:number; ATKbuff?:number; ATKdebuff?:number;
	DEF?:number; DEFbuff?:number; DEFdebuff?:number;
	SPD?:number; SPDbuff?:number; SPDdebuff?:number;

	ATKRoll?:number[];
	
	rate?:number; condType?:playerStats;
	bufftime?:number;

	upHP?:number; reHP?:number; dwHP?:number; redHP?:number;
	dwSP?:number; redSP?:number;

	BP?:number; BPbuff?:number;
	costSP?:number; costSPper?:number;

	action?:Function;
}

export class Skill{
	setEffectDes(str:string){
		this.effectDes = str;
		return this
	}
	setRange(str:range){
		this.effectDes = str;
		return this
	}
	setCoverage(str:coverage){
		this.effectDes = str;
		return this
	}
	setHP(int:number){
		this.HP = int;
		return this
	}
	setHPbuff(int:number){
		this.HPbuff = int;
		return this
	}
	setupHP(int:number){
		this.upHP = int;
		return this
	}
	setreHP(int:number){
		this.reHP = int;
		return this
	}
	setdwHP(int:number){
		this.dwHP = int;
		return this
	}
	setredHP(int:number){
		this.redHP = int;
		return this
	}
	setSP(int:number){
		this.SP = int;
		return this
	}
	setSPbuff(int:number){
		this.SPbuff = int;
		return this
	}
	setdwSP(int:number){
		this.dwSP = int;
		return this
	}
	setredSP(int:number){
		this.redSP = int;
		return this
	}
	setATK(int:number){
		this.ATK = int;
		return this
	}
	setATKbuff(int:number){
		this.ATKbuff = int;
		return this
	}
	setATKdebuff(int:number){
		this.ATKdebuff = int;
		return this
	}
	setDEF(int:number){
		this.DEF = int;
		return this
	}
	setDEFbuff(int:number){
		this.DEFbuff = int;
		return this
	}
	setDEFdebuff(int:number){
		this.DEFdebuff = int;
		return this
	}
	setSPD(int:number){
		this.SPD = int;
		return this
	}
	setSPDbuff(int:number){
		this.SPDbuff = int;
		return this
	}
	setSPDdebuff(int:number){
		this.SPDdebuff = int;
		return this
	}
	setATKRoll(time:number, max:number){
		this.ATKRoll = [time, max]
		return this
	}
	setrate(int:number){
		this.rate = int;
		return this
	}
	setCondType(str:playerStats){
		this.condType = str;
		return this
	}
	setBufftime(int:number){
		this.bufftime = int;
		return this
	}
	setBP(int:number){
		this.BP = int;
		return this
	}
	setBPbuff(int:number){
		this.BPbuff = int;
		return this
	}
	setcostSP(int:number){
		this.costSP = int;
		return this
	}
	setcostSPper(int:number){
		this.costSPper = int;
		return this
	}
	setAct( callback:Function ){
		this.action = callback
		return this
	}
	public static set(name:string, des:string, cate:Category, type: sType){
		Skill.data[name] = new Skill(name,des,cate,type)
		return Skill.data[name]
	}
	public static use(skill:Skill, target:Game){

	}

	public static get(name:string, skills:string[]){
		if(!skills.includes(name)){
			skills.push(name)
		}
		return skills
	}

	public static unset(name:string, skills:string[]){
		let i = skills.indexOf(name)
		skills.splice(i,1)
		return skills
	}

	public static data:Dict<Skill> = {}

	constructor(name:string, des:string, cate:Category, type:sType){
		this.id = Object.keys(Skill.data).length+1;
		this.name = name;
		this.des = des;

		this.category = cate;
		this.type = type;
	}
}

export function SkillDes(skill:Skill) {
	let txt = [
	`【${skill.name}】\n`,
	`技能种类：${skill.type}　`,
	`${skill?.range ? `作用范围：${skill.range}-${skill.coverage}` : '' }`,
	'\n',
	`说明：${skill.des}\n`,
	`${skill?.effectDes ? `技能效果：${skill.effectDes}\n` : ""}`,
	];

	const list = {
		rate	: { name:'成功概率',	value: skill.rate + '%'	},

		HP		: { name:'HP回复',		value: skill.HP			},
		reHP	: { name:'HP恢复',		value: skill.reHP + '%'	},

		ATK		: { name:'伤害',		value: skill.ATK		},
		DEF		: { name:'抵抗',		value: skill.DEF		},
		SPD		: { name:'敏捷',		value: skill.SPD		},

		HPbuff	: { name:'HP提升',		value: skill.HPbuff  * 100 + '%'	},
		ATKbuff : { name:'攻击加成',	value: skill.ATKbuff * 100 + '%'	},
		DEFbuff : { name:'防御加成',	value: skill.DEFbuff * 100 + '%'	},
		SPDbuff : { name:'速度加成',	value: skill.SPDbuff * 100 + '%'	},

		ATKRoll : { name:'攻击骰',		value: skill.ATKRoll ?  skill.ATKRoll[0]+'D'+skill.ATKRoll[1] : ''},
		costSP	: { name:'技能消耗',	value: skill.costSP + 'SP'		},
		costSPper: { name:'技能消耗',	value: skill.costSPper * 100 + '% SP'}
	}

	let c = 0;
	for(let i in list){
		if(skill[i]){
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
