import { Dict, Session } from "koishi";
import {
  random,
  bot,
  Skill,
  Yun,
  Equip,
  PlayerCore,
  Weapon,
  Minds,
  Items,
  Upgrade,
  between,
  copy,
  DailyData,
  getUser,
  initUser,
  userExist,
  UserData,
  makeID,Soul,CountStats, LevelExp, expCount, breakProces,getTrainExp
} from "../unit"
export interface Game{
	name:string;	nick?:string;
	savename?:string;

	title?:string;	soul:string;
	money?:number;

	favo?:number;	trust?:number;

	level:number;	exp:number;
	luck?:number;	lastluck?:number;
	stats:string;

	HP:number;	maxHP:number;
	SP:number;	maxSP:number;
	AP?:number;	maxAP?:number;
	BP:number;

	ATK:number;	DEF:number;	SPD:number;
	INT:number;	WIL:number;

	mine?:number;
	plant?:number;	medicine?:number;
	craft?:number;	research?:number;

	core?:PlayerCore;	equip?:Equipment;
	skill:string[];		upgrade?:Dict<Upgrade>;
	items?:Dict<Items>;	storage?:Array<Equip|Weapon|Items>;

	flag?:Flags;	cflag?:Cflags;

	memory?:Array<any>;
	signed?:boolean;
}

//角色flag
export interface Flags{
	breakbuff?: number;

	equipBreak?:number;
	expbuff:number;

	farm?:any; //种植详情。初始 1格，根据种植效率最大10格。
	stove?:any; //炼丹详情。初始 1格，根据炼丹效率最大10格。
	craftable?:any;//炼器详情。初始 1格，根据炼器效率最大10格。
	researchTree?:any; //研究详情。 初始 1格，根据研究效率最大10格。


	event?:Dict<any>; //活动相关记录
	eventbonus?:Dict<any>; //活动福利领取详情
	totalexp:number;//累计EXP，用来判定存档一致性

	daily?:DailyData; //切换角色时把每日档案暂存到此处。
	url?:string, //头像显示链接
	pkwin?:number;
  evil?:boolean;
}

//战斗处理
export interface Cflags{
	cooldown: Dict<number>;
	condition: Dict<Condition>;
	canAct:boolean;
}

export interface Condition{
	name:playerStats;
	type:condType;
	time:number;

	HP?:number; reHP?:number; dwHP?:number; redHP?:number;
	SP?:number; reSP?:number; dwSP?:number; redSP?:number;

	ATKbuff?:number; ATKdebuff?:number;
	DEFbuff?:number; DEFdebuff?:number;
	SPDbuff?:number; SPDdebuff?:number;
}

export interface Equipment{
	weapon	?: Weapon; 	head	?: Equip;
	cloth	?: Equip; 	shoes	?: Equip;
	neck	?: Equip; 	hands	?: Equip;
	waist	?: Equip;
}

export type playerStats = '迷幻' | '天毒' | '中毒' | '轻毒' | '剧毒' | '凝固' | '石化' | '麻痹' | '虚弱' | '失血' | '狂暴' | '鼓舞' | '恢复' | '净化' | '迷茫' | '护盾' | '药物提升'

export type condType = 'debuff' | 'buff'

export const debuff = ['迷幻','天毒','中毒','轻毒','剧毒','凝固','石化','麻痹', '虚弱','失血']
export const buff = ['鼓舞','恢复','狂暴','护盾','药物提升']

export class Game{
	constructor( name:string){
		this.name = name;  this.nick = '';
		this.savename = '';
		this.money = 5;

		this.soul = "金木水火土";

		this.level = 1;	this.exp = 0;
		this.stats = "";

		this.HP = 30;	this.maxHP = 30;
		this.SP = 10;	this.maxSP = 10;
		this.BP = 5;

		this.ATK = 5;	this.DEF = 5;	this.SPD = 5;
		this.INT = 5;	this.WIL = 5;

		this.skill = [];
	}

	public static Count(uid:string){
		return CountStats(uid,'player')
	}

	public static async getChara(uid:string):Promise<Game>{
		const chk = await bot.db.get("user", {"userID": uid})
		let data:Game = chk[0].game
		return data
	}

	public static async setChara(uid:string, data:Game){
		//console.log('存档前：',data);
		await bot.db.set("user", {"userID": uid}, { game: data});
		//console.log('存档后：', await getChara(uid));
	}

	public static getExp(data:Game|Yun, min:number, max?:number){
		if(!max) max=min;
		let { luck, level } = data
		let exp = getTrainExp(level, luck, min, max)
		exp = expCount(exp, data);

		data.exp = Math.floor(data.exp + exp)

		return `${data.name}的悟道经验 + ${Math.floor(exp)}=>${data.exp}/${LevelExp(data.level)}`
	}

	public static setExp(data:Game|Yun, min:number, max?:number, luck?, buff?){
		if(!max) max=min;
		let exp = random(min,max) + (luck ? Math.floor(data.luck/10) : 0)
		exp *= (buff? data.flag.expbuff : 1)
		exp = Math.floor(exp)
		data.exp = Math.floor(data.exp + exp)

		return `${data.name}的悟道经验 + ${exp}=>${data.exp}/${LevelExp(data.level)}`
	}

	public static setMoney(data:Game, min,max?){
		if(!max) max=min;
		let num = random(min,max);
		data.money += num
	}

	public static Corebuff(data:Game|Yun){
		if(data.core?.id){
			return Minds.data[data.core.name].lvstats[data.core.level-1]
		}
	}

	public static async save(session:Session<'userID'|'name'|'chara'|'game'>, data?:Game, savename?:string){
		//保存到YunSave里。同时更新一下用户信息。
		const { game, name, chara, userID } = session.user
		let chk = await bot.db.get("YunSave", {uid: userID})
		if(!chk[0]?.charalist){
			initUser(session,session.user.userID,session.user.name)
			chk = await bot.db.get("YunSave", { uid: userID })
		}
		let charalist = chk[0].charalist

		const save = (savename ? savename : chara)
		charalist[save] = (data ? data : game)

		await bot.db.set("YunSave", {uid: userID}, {
			charalist : charalist,
			name : name,
			[session.platform]:[session.userId],
		})
	}

	public static async delet( uid:string, savename:string){
		//从存档中删除
		let chk = await bot.db.get("YunSave", {uid:uid})
		let charalist = chk[0].charalist

		delete charalist[savename]
		await bot.db.set("YunSave", {uid:uid}, {charalist: charalist})

	}

	public static async load(session:Session<'userID'|'name'|'chara'|'game'>, uid:string, savename:string){
		//从存档中读取。如果totalexp不一致会提示存档不一致。但不在这里。
		let chk = await bot.db.get("YunSave",null)
		const charalist:Dict<Game> = chk[0].charalist
		console.log(charalist[savename])
		return charalist[savename]
	}


	public static async new( session:Session<'name'|'userID'>, soul:string ,chara:string, nick?:string){

		const { userID, name } = session.user
		const chk = await bot.db.get("YunSave", { uid: userID })

		if(!chk.length || !chk[0]?.charalist){
			await initUser(session, userID, name)
		}

		const chk1 = await bot.db.get("YunSave",{uid:userID})
		let charalist = chk1[0].charalist

		charalist[chara] = this.initChara(chara, nick)
		charalist[chara].soul = soul

		//console.log(charalist)

		await bot.db.set("YunSave", {uid: userID}, { charalist } )
		return charalist[chara]

	}

	public static initOldSave(save){
		const old = copy(save)
		let data = this.initChara(save.name, save.nick)

		data.level = old.level
		data.soul = old.soul;
		data.money = old.money;
		data.exp = old.exp;
		data.favo = old.favo;
		data.trust = old.trust;
		data.INT = old.INT;
		data.WIL = old.WIL;

		data.signed = true;

		data.level -= Math.floor(old.level/10)

		if(old.core?.id) data.core = old.core;
		if(old.skill) data.skill = old.skill;

		if(old.equip?.weapon?.id){
			const weapon = old.equip.weapon.name
			data.equip.weapon = Weapon.get(weapon)
		}

		const up = Object.keys(old.upgrade)

		if(up.length){
			for(let i in old.upgrade){
				const oi:any = old.upgrade[i]
				const item = Items.make(i, oi.num)
				const name = item.upgrade

				data.upgrade[name] = {
					type: item.type,
					count: item.num,
				}

				const list = ['HP','SP','ATK','DEF','SPD','INT','WIL','HPbuff','SPbuff','ATKbuff','DEFbuff','SPDbuff']

				for(let v=0; v<list.length; v++){
					let k = list[v]
					if(item[k]){
						data.upgrade[name][k] = item[k]
					}
				}
			}
		}

		if(old.flag.spbonus) data.flag.eventbonus['reborn'] = old.flag.spbonus;
		return data
	}

	public static initChara(chara:string, nick?:string){
		let newChara = new Game(chara)
		if(nick) newChara.nick = nick;


		const obj = {
			title:'', money:50, favo:0, trust:0,
			luck:0, lastluck:0,
			AP:8, maxAP:8,
			mine:100,	plant:100,
			medicine:100,	craft:100,	research:100,
		}

		for(let i in obj){
			newChara[i] = obj[i]
		}

		newChara.core = {};
		newChara.equip = {
			weapon:new Weapon(null,'无','','',0),
			head:new Equip(null,'无','','',0),
			cloth:new Equip(null,'无','','',0),
			shoes:new Equip(null,'无','','',0),
			neck:new Equip(null,'无','','',0),
			hands:new Equip(null,'无','','',0),
			waist:new Equip(null,'无','','',0),
		};

		newChara.upgrade = {};
		newChara.items = {};
		newChara.storage = [];
		newChara.flag = {
			breakbuff:0, equipBreak:0, expbuff:0,
			farm:[], 	stove:[], 	craftable:[],
			researchTree:[],

			event:{}, eventbonus:{},
			totalexp:0,
		}

		newChara.cflag = {
			cooldown:{},
			condition:{},
			canAct:true,
		}

		newChara.memory = [];
		newChara.savename = chara;
		return newChara
	}

	public static async change( session:Session<'chara'|'userID'> ){
		//角色切换，先做一些准备。备份一下。
		const uid = session.user.userID
		const chara = session.user.chara
		const user = await getUser(uid)
		const now:Game = copy(user.game)
		now.flag.daily = user.daily


		const chk = await bot.db.get("YunSave", { uid: uid })
		let charalist = chk[0].charalist
			delete charalist[chara] //把旧的删除

		const targetname = Object.keys(charalist)[0] //获取另一个角色的名字。
		charalist[chara] = now //又放回去。

		const data = charalist[targetname]
		session.user.chara = targetname

		if(data.flag?.daily?.lastDay){ //切换每日档案。
			user.daily = data.flag.daily
			delete data.flag.daily
		}
		else{
			user.daily = new DailyData()
		}

		//最后保存更新到现有档案。
		await bot.db.set("user", {userID:uid}, {game:data, daily: user.daily, chara: targetname})
		await bot.db.set("YunSave", {uid:uid}, {charalist:charalist})
	}

	public static setCondbySkill(data:Game, skill:Skill){
		const { condType, bufftime } = skill

		let condition = data.cflag.condition
			condition[condType] = {
			name:condType, type:( debuff.includes(condType) ? 'debuff' : 'buff'),
			time: bufftime
			}

		const list = [
			'upHP','reHP','dwHP','redHP',
			'dwSP','redSP',
			'ATKbuff','ATKdebuff',
			'DEFbuff','DEFdebuff',
			'SPDbuff','SPDdebuff',
		]

		for(let i=0; i<list.length; i++){
			if(skill[i]) condition[condType][i] = skill[i]
		}

		return data
	}

	public static setCondbyItem(data:Game, item){

	}
}


export const {
	getChara, setChara, getExp, setMoney,
	setCondbySkill, setCondbyItem, Corebuff
} = Game
