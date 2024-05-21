import { random, slicer } from "../unit"

export type isoul = '木'|'火'|'金'|'水'|'土'
export const soultype:isoul[] = ['木','火','金','水','土']
export const soulcount = ['单','双','三','杂','杂']

export enum genSoul {
	天灵根,
	单灵根,
	双灵根,
	三灵根,
	四灵根,
	杂灵根,
}

export enum Elements {
	火 = "火",
	土 = "土",
	木 = "木",
	水 = "水",
	金 = "金",
}

interface answer{
	result:number;
	qa:number;
	qb:number;
}

interface buffinfo{
	HP:number; SP:number;

	ATK:number; DEF:number; SPD:number;

	mine:number;	medicine:number;
	plant:number;	research:number;
	craft:number;
}


export interface Soul{
	unique:boolean,
	tian:boolean,
	chara:string[],
	count:number,
	buff:buffinfo,
}

export class Soul{

	get breakbuff(){
		if(this.tian) return 0.12;
		switch(this.count){
			case 1: return 0.1;
			case 2: return 0.06;
			case 3: return 0;
			case 4: return -0.06;
			case 5: return -0.1;
		}
	}

	get print(){
		let txt = this.chara.join("")
		if(this.tian){
			txt = `天 · ${txt}${this.unique ? '异' : ''}灵根`;
		}
		else if(this.unique && this.count >= 3){
			txt = `${txt} · 多彩灵根`
		}
		else{
			txt = `${txt} · ${soulcount[this.count-1]}${this.unique ? '异' : ''}灵根`
		}
		return txt
	}

	get Expbuff(){
		const li = [1.5,1.25,1,0.8,0.6];
		let buff = li[this.chara.length-1];

		if(this.tian) buff+= 0.5;
		return buff
	}
	constructor(str:string){
		this.unique = str.includes('异');
		this.tian = str.includes('天');
		this.chara = str.match(/[金木水火土]/g);
		console.log(this.chara)
		this.count = this.chara.length;
		this.buff = this.getBuffInfo();
	}

	public getBuff():number[]{
		let buff=0, subuff=0;

		switch(this.count){
			case 1:
				buff = 1.2; subuff = 1;
				break;
			case 2:
				buff = 0.55; subuff = 0.8;
				break;
			case 3:
				buff = 0.3; subuff = 0.6;
				break;
			case 4:
				buff = 0.2; subuff = 0.4;
				break;
			case 5:
				buff = 0.1; subuff = 0.2;
				break;
		}

		if(this.unique && this.count >= 3) {
			buff += 0.05 * ( 7 - this.count )
			subuff *= 2;
		}
		else if(this.unique){
			buff += 0.1 * ( 6 - this.count ) * (this.count == 1 ? 2 : 1);
			subuff += 0.2;
		}
		if(this.tian) buff *= 2;

		return [buff, subuff]
	}

	public getBuffInfo(){
		let buff = this.getBuff()[0]
		const subuff = this.getBuff()[1]

		let info:buffinfo = {
			HP: 0, SP:0, ATK: 0, DEF: 0, SPD: 0,
			mine: 0, medicine: 0, plant: 0, research: 0, craft: 0
		}

		const buffset = {
			HP:['土','木','土'], SP:['木','水','火'], ATK:['火','火','金'],
			DEF:['金','土','水'], SPD:['水','金','木'],
		}
		const subuffset = {
			mine:['土','金'], medicine:['火','木'], plant:['木','水'],
			research:['水','火'], craft:['金','土']
		}

		for(let i in buffset){
			let arr = buffset[i]
			info[i] = (this.chara.includes(arr[0]) ? buff : 0)
					  + (this.chara.includes(arr[1]) ? buff*0.4 : 0)
					  + (this.chara.includes(arr[2]) ? buff*0.15 : 0)
		}

		for(let i in subuffset){
			let arr = subuffset[i]
			info[i] = (this.chara.includes(arr[0]) ? subuff : 0)
					  + (this.chara.includes(arr[1]) ? subuff*0.6 : 0)
		}
		return info
	}

	public static genNew(rate:number, {result, qa, qb}:answer){
		let soul = new SoulUtils(rate, {result, qa, qb})
		return soul.getSoul()
	}

	public static Random(rate, str?:isoul){
		let li:isoul[] = ['木','火','金','水','土']
		if(str){
			const id = li.indexOf(str)
			li.splice(id,1)
		}
		//单
		if( rate>= 80 ) return Soul._randsoul(li, 1, str)
		//双
		else if( rate >= 60) return Soul._randsoul(li, 2, str);
		//三
		else if( rate >= 40) return Soul._randsoul(li,3,str);
		//四
		else return Soul._randsoul(li,4,str)
	}

	public static _randsoul(arr:isoul[], times:number, str?){
		let re:isoul[] = []
		if(str) re[0] = str;
		else re[0] = Soul.rand(arr)

		for(let i=1; i <times; i++){
			re[i] = Soul.rand(arr)
		}
		return re
	}

	public static rand(arr:isoul[]):isoul{
		let ran = random(arr.length-1)
		return slicer(arr,ran)[0]
	}
}

export class SoulUtils{
	private _result: number;
	private _qa: number;
	private _qb:number;
	private _elements: Elements[];
	private _genSoul:genSoul;
	private _isUnique:boolean;

	constructor(rate:number, {result, qa, qb}:answer){
		this._genSoul = this._genNew(rate);
		this._result = result;
		this._qa = qa;
		this._qb = qb;
		this.init();
	}

	private _genNew(rate:number){
		const r = random(1000)
		console.log('变异度检测：', r)

		if(rate >= 80 && r < 100 ){
			this._isUnique = true
		}
		else if(rate >= 60 && r < 50 ){
			this._isUnique = true
		}
		else if(rate < 60 && r < 30 ){
			this._isUnique = true
		}

		if(rate >= 90){
			return random(100) >= 90 ? genSoul.天灵根 : genSoul.单灵根;
		}
		if(rate>=80) return genSoul.双灵根;
		if(rate>=60) return genSoul.三灵根;
		if(rate>=40) return genSoul.四灵根;

		return genSoul.杂灵根
	}

	public getSoul(){
		const str = (this._isUnique ? '异' : '') + this._elements.join("");

		switch(this._genSoul){
			case genSoul.天灵根:
				return '天'+str;
			default:
				return str;
		}
	}

	private equalQA=()=>this._result === this._qa;
	private equalQB=()=>this._result === this._qb;
	private equalQAB=()=>this._qa === this._qb;

	private init(){
		switch(this._genSoul){
			case genSoul.天灵根:
			case genSoul.单灵根:
				this._elements = this.getElements();
				break;
			case genSoul.双灵根:
				this._elements = this.getElements(2);
				break
			case genSoul.三灵根:
				this._elements = this.getElements(3);
				break
			case genSoul.四灵根:
				this._elements = this.getElements(4);
				break
			case genSoul.杂灵根:
				this._elements = this.getElements(5)
				break
		}
	}

	private getElements(num:number = 1){
		let el = [Elements.木, Elements.火, Elements.金, Elements.水, Elements.土]
		let arr = [];
		const equalQA = this.equalQA();
		const equalQB = this.equalQB();
		const equalQAB = this.equalQAB();

		const re = this._result;
		const a = this._qa;
		const b = this._qb;

		switch(num){
			case 1:
				return [el[re]];

			case 2:
				arr.push(...el.splice(re,1))

				if(equalQA && !equalQB) arr.push(...el.splice(b,1));
				else if(equalQB && !equalQA) arr.push(...el.splice(a,1));
				else{
					arr.push(el[random(3)]);
				}
				return arr;

			case 3:
				if(!equalQA && !equalQB && !equalQAB){
					arr.push(el[re],el[a],el[b])
				}
				else{
					arr.push(...el.splice(re,1))

					if(equalQA && !equalQB) arr.push(...el.splice(b,1));
					else if(equalQB && !equalQA) arr.push(...el.splice(a,1));

					if(arr.length>1) arr.push(el[random(2)])
					else{
						for(let i=0; i<2; i++){
							arr.push(...el.splice(random(el.length-1), 1))
						}
					}
				}
				return arr;

			case 4:
			case 5:
				arr.push(...el.splice(re,1));
				for(let i=0; i<(num-1); i++){
					arr.push(...el.splice(random(el.length-1),1))
				}
				return arr;
		}
	}
}

export function SoulMatcher(player:string[],equip:string[]){
	let match = []

	if(equip.length > player.length) return 0;

	for(let i=0; i < player.length; i++){
		if(equip.includes(player[i])){
			match.push(player[i])
		}
	}

	if(match.length < equip.length) return 0;
	if(player.length == equip.length) return 1;
	if(player.length > equip.length) return equip.length/player.length;
}
