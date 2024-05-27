import { Soul,CountStats, LevelExp, getBreakRate, breakProces,Minds, getJrrp,bot,  Equipment, Equip,  getChara, Weapon, Game, random, setChara, Upgrade, Today, save, faceicon, txtp, YunCom, LevelKan } from "../unit"
import { Config, shopitems } from "../index";
import { createHash } from "crypto";
import fs from "fs"
import { Dict, Session } from "koishi";
import { resolve } from "path";
import { Core } from "../Core";
export interface Yun{
	name:string;	title:string;
	talent:string[];	soul:string;

	level:number;	exp:number;
	mood: number;	stats:YunStats;
	money:number;

	HP:number;	maxHP:number;
	SP:number;	maxSP:number;
	AP:number;	maxAP:number;
	san?:number;	maxsan?:number;
	BP:number;

	ATK:number;	DEF:number;	SPD:number;
	INT:number;	WIL:number;

	luck?:number;
	lastluck?:number;

	mine:number;
	plant:number;	medicine:number;
	craft:number;	research:number;

	core?:any;	equip?:Equipment;
	skill:any;	upgrade?:Dict<Upgrade>;
	items?:any;

	flag?:any;	memory?:Array<any>;
	cflag?:any
	shops?:Array<shopitems>;
	work:number;
}

export type botstats = 'onLoading' | 'failed' | 'botOn' | 'botOff' | 'Running' | 'LoadEnd' | ''
export type YunStats = 'free' | 'working' | 'sleeping' | 'awake' | 'gaming' | 'learning' | 'goodnight' | 'relax'

export const statslist = ['free','working','sleeping' ,'awake','gaming','learning','goodnight', 'relax']

export class Yun{
	public static baseDir: string = "";
	public static getDataPath() {
		return resolve(Yun.baseDir, 'data', "yunSaves");
	}
	public static get YunPath(): string { 

		return resolve(Yun.getDataPath(), 'YunData.json');
	}
	public static state:Yun;
	public static botstats:botstats = '';

	public static selfId:string = '185632406';
	public static masterId:string = '1794362968';
	public static master:string = '时月';
	public static callmaster:string = '师父';
	public static nick:string = '小昀';

	public static config: Config;
	public static stats:YunStats = 'sleeping';

	constructor(data?:Yun){
		if(data){
			for(let i in data){
				this[i] = data[i]
			}
		}
		else{
			//初始化用。
			this.name = '路昀';
			this.title = '掌门之子';
			this.talent = ['灵兽','灵泉','内向','淡漠','散漫'];
			this.soul = '天水';

			this.level = 21; this.exp = 0;

			this.mood = Yun.mood();	this.stats = 'sleeping';
			this.money = 500;
			this.luck = Yun.luck();

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

			this.core = Minds.get('天泉心法');
			this.core.level = 3;

			this.equip = {
				weapon : Weapon.get('净玉扇'),
				head: new Equip(0,'','','头饰',0),
				cloth:new Equip(0,'','','衣服',0),
				shoes:new Equip(0,'','','鞋子',0),
				neck: new Equip(0,'','','首饰',0),
				hands:new Equip(0,'','','手饰',0),
				waist:new Equip(0,'','','腰饰',0),
			};

			this.skill = ['灵泉之体', '天泉幻法'];

			this.upgrade = {};
			this.items = {};
			this.flag = {
				breakbuff: 5,
				expbuff:0,
			};

			this.memory = [];
			this.shops = [];
		}
	}

	public static load():Yun{
		let data:Yun = Yun.state
		if(!data){
			fs.readFile(Yun.YunPath,"utf-8", (err, file)=>{
				if(!file) return;
				if(err) throw new Error("error occured while reading file:YunData.json")
				data = JSON.parse(file.toString());

				if(data){
					Yun.state = new Yun(data);
					Yun.state.mood = Yun.mood();
					Yun.state.luck = Yun.luck();
					Yun.stats = Yun.state.stats
					console.log("从YunData.json中读取完毕");
				}
				else {
					console.log("从YunData.json中读取失败，等待2秒后再试");
					Yun.botstats = 'failed'
				}
			});
		}
		if(data){
			bot.s = Yun.state
			Yun.stats = Yun.state.stats
		}
		return Yun.state;
	}

	public static async save(){
		//把状态保存到存档里。
		Yun.state.stats = Yun.stats

		const data = JSON.stringify(Yun.state);
		if(!fs.existsSync(Yun.getDataPath())) fs.mkdirSync(Yun.getDataPath(),{recursive:true})
		await fs.writeFileSync(Yun.YunPath, data);
		console.log("已保存本地数据:YunData.json");
	}

	public static init(){
		Yun.state = new Yun()
		return Yun.state
	}

	public static mood(){
		const hash = createHash("sha256")
		hash.update("185632406");
		hash.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0));
		hash.update("6688");

		let val = Math.max(parseInt(hash.digest("hex"), 16) % 101, 1);
		return val
	}
	public static shopitem(arg){
		Yun.state.shops.push(arg)
	}
	public static solditem(arg:number){
		Yun.state.shops.splice(arg,1)
	}
	public static shopcount(){
		return Yun.state.shops.length
	}
	public static isBreak(){
		return (Yun.state.exp >= LevelExp(Yun.state.level))
	}
	public static isBusy(){
		return ['working','learning','sleeping','goodnight'].includes(Yun.stats)
	}
	public static isSleeping(){
		return (Yun.stats === 'sleeping')
	}
	public static breakrate(){
		return getBreakRate(Yun.state,'yun')
	}
	public static luck(){
		return getJrrp(Yun.selfId)
	}

	public static getstats(){
		switch(Yun.stats){
			case 'awake':
				return '刚睡醒'
			case 'free':
				return '空闲'
			case 'gaming':
				return '游戏中'
			case 'goodnight':
				return '准备睡了'
			case 'learning':
				return '学习中'
			case 'relax':
				return '放松中'
			case 'sleeping':
				return '睡觉中'
			case 'working':
				return '修炼中'
		}
	}

	public static async getFavo(uid:string){
		let data = await getChara(uid)
		return data.favo
	}
	public static async getTrust(uid:string){
		let data = await getChara(uid)
		return data.trust
	}

	public static setFavo(data:Game, min, max?){
		if(!max) max = min;
		const favo = random(min,max);
		data.favo += favo
		console.log(data.name,'好感变化：+',favo,'=>',data.favo)
	}

	public static setTrust(data:Game, min, max?){
		if(!max) max= min;
		const trust = random(min,max);
		data.trust += random(min,max);
		console.log(data.name,'信赖变化：+',trust,'=>',data.trust)
	}

	public static async addFavo(uid:string, val:number){
		let data = await getChara(uid)
		const favo = data.favo

		data.favo += val
		await setChara(uid, data)

		console.log(data.name,'好感变化：',favo,"+",val,'=>', await (await getChara(uid)).favo )
	}

	public static async addTrust(uid:string, val:number){
		let data = await getChara(uid)
		const trust = data.trust

		data.trust += val
		await setChara(uid, data)

		console.log(data.name,'信赖变化：',trust,"+",val,'=>', await (await getChara(uid)).trust )
	}

	public static async count(){
		return CountStats(this.selfId, 'yun')
	}
	public static soulinfo(){
		return new Soul(Yun.state.soul)
	}
	public static yunrate(){
		const mood = Yun.mood()
		const rate = random(103) + (mood > 60 ? mood/10 : -(mood/5))
		return rate
	}
	public static trainCheck(){
		return ( this.yunrate() > 80 && Today.data.yun.dotrain < 5 && Today.data.totaltrain >= 10 && Yun.isBusy()===false )
	}
	public static breakCheck(){
		return (this.yunrate() > 70 && this.isBreak() && Today.data.yun.break < 5 && Yun.isBusy()===false)
	}
	public static setYunTrain(session){
		const today = Today.data

		Yun.stats = 'working'
		today.yun.dotrain++
		today.yun.loads = 150

		save()
		yunTraining(session)
	}
	public static async setYunBreak(session:Session, name){
		const today = Today.data
		today.yun.break++
		save()
		await yunBreak(session, name)
	}
}

export async function yunTraining(session){

	const stop = function(work){
		clearInterval(work)
		console.log('自主修炼已停止')
	}

	const Doing = setInterval(()=>{
		Today.data.yun.loads--;
		Today.save()

		if(Today.data.yun.loads <= 0){
			const result = Game.getExp(Yun.state,3,45)
			Yun.stats = 'free'
			Today.data.yun.loads = 0
			save()

			const txt = txtp(YunCom['修炼完毕'].join('\n'),[result])

			session.send(txt)

			if(Yun.isBreak()){
				session.send(YunCom['准备突破'].join('\n'))
			}

			stop(Doing)
		}
	},1000 + random(100))

	console.log('自主修炼已设置')

}

export async function yunBreak(session:Session, name){
	const today = Today.data.yun

	const level = Yun.state.level
	const lv = [LevelKan(level), LevelKan(level+1)]


	const goal = getBreakRate(Yun.state, Yun.selfId)
	const rate = random(100)
	console.log('路昀突破概率:',rate,'/',goal)

	today.break++

	let txt = YunCom['开始突破'].join('\n')+'\n'
	let txt1 = ''

	if(rate <= goal){
		txt += txtp(YunCom['突破成功'].join('\n'),[`在${name}的见证下，`,lv[0],lv[1]])
		breakProces(Yun.state)
		await session.send(txt)

		txt1 = YunCom['突破成功：台词']

	}
	else{

		txt += YunCom['突破失败'] + Game.setExp(Yun.state,5,30)
		await session.send(txt)

		txt1 = YunCom['突破失败：台词']
	}

	save()
	session.sendQueued(txt1)

}

export const {
	setFavo, setTrust, addFavo, addTrust,
} = Yun
