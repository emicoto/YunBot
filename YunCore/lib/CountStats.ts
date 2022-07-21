import { Context} from "koishi"
import { getUser, setUser } from "../Setting"
import { getSoulBuff } from "../Function"

function LevelBuff(level){
	if( level/10 > 1){
		return Math.pow(Math.floor(level/10),1.25)
	}
	return 1
}

export async function CountStats(ctx: Context, uid: string) {
    let data = await getUser(ctx, uid)
	let level = data.level
	//console.log(data)

	//先从等级获得各数值的基础值，战斗力最后算
	let BP = (6 - data.soul.length) * Math.max(Math.floor(level/10),1)

	let HP = (10 + level * 4.75) * LevelBuff(level)
	let SP = (5 + level * 1.5) * LevelBuff(level)

	let ATK = (5 + Math.floor(level/2)) * LevelBuff(level)
	let DEF = (5 + Math.floor(level/2)) * LevelBuff(level)
	let SPD = (5 + Math.floor(level/2)) * LevelBuff(level)

	//计算灵根加成
	let soulbuff = getSoulBuff(data.soul)

	HP *= 1+soulbuff.HP;		SP *= 1+soulbuff.SP;
	ATK *= 1+soulbuff.ATK;		DEF *= 1+soulbuff.DEF;
	SPD *= 1+soulbuff.SPD;

	let hpbuff=0, spbuff=0, atkbuff=0, defbuff=0, spdbuff=0, addbp=0
	let core

	if(data.core?.id > 0){
		core = data.core.lvstats[data.core.level-1]
	}

	//计算主心法加成
	if(core?.HPbuff > 0) hpbuff += core.HPbuff;
	if(core?.SPbuff > 0) spbuff += core.SPbuff;
	if(core?.ATKbuff > 0) atkbuff += core.ATKbuff;
	if(core?.DEFbuff > 0) defbuff += core.DEFbuff;
	if(core?.SPDbuff > 0) spdbuff += core.SPDbuff;

	//计算装备加成，大部分装备只对ATK,DEF,BP有直接加值。稀有装备或许可以有对ATK,DEF，BP的加成。
	let list = ['head','coat','middle','skin','weapon']
	for(let i=0; i<list.length; i++){
		let equip = data.equip[list[i]]

		if(equip?.ATK > 0) ATK += equip.ATK;
		if(equip?.DEF > 0) DEF += equip.DEF;
		if(equip?.SPD > 0) SPD += equip.SPD;

		if(equip?.ATKbuff > 0) atkbuff += equip.ATKbuff;
		if(equip?.DEFbuff > 0) defbuff += equip.DEFbuff;
		if(equip?.SPDbuff > 0) spdbuff += equip.SPDbuff;

	}

	//计算装饰加成，装饰一般只对SP有加值，稀有装备或许可以有一些额外加成。
	list = ['face','ear','hand','leg']
	for(let i=0; i<list.length; i++){
		let acces = data.accesory[list[i]]

		if(acces?.SP > 0) SP += acces.SP;

		if(acces?.ATKbuff > 0) atkbuff += acces.ATKbuff;
		if(acces?.DEFbuff > 0) defbuff += acces.DEFbuff;
		if(acces?.SPDbuff > 0) spdbuff += acces.SPDbuff;

		if(acces?.HPbuff > 0) hpbuff += acces.HPbuff;
		if(acces?.SPbuff > 0) spbuff += acces.SPbuff;
	}

	//计算被动技能加成，技能作为列表存在于技能表中。
	for(let i=0; i< data.skill.length; i++){
		let skill = data.skill[i]
		if(skill.type == '被动'){
			if(skill?.ATK > 0) ATK += skill.ATK;
			if(skill?.DEF > 0) DEF += skill.DEF;
			if(skill?.SPD > 0) SPD += skill.SPD;
				
			if(skill?.ATKbuff > 0) atkbuff += skill.ATKbuff;
			if(skill?.DEFbuff > 0) defbuff += skill.DEFbuff;
			if(skill?.SPDbuff > 0) spdbuff += skill.SPDbuff;
			
			if(skill?.HPbuff > 0) hpbuff += skill.HPbuff;
			if(skill?.SPbuff > 0) spbuff += skill.SPbuff;
			
		}
		else{ //主动只计算战力加值
			if(skill?.BP > 0) addbp += skill.BP;
		}
	}

	//对HP,SP,ATK,DEF,SPD进行最后的计算
	HP *= 1+hpbuff; SP *= 1+spbuff;
	ATK *= 1+atkbuff; DEF *= 1+defbuff; SPD *= 1+spdbuff;


	//最后计算消耗物所带来的加值
	list = ['长生果','女娲花','伏羲丹']
	if(data.flag?.upgrade){
		let items = data.flag.upgrade
		if(items['长生果'] > 0) HP += 500*items['长生果'];
		if(items['女娲花'] > 0) SP += 500*items['女娲花'];
		if(items['伏羲丹'] > 0) {
			ATK += 50*items['伏羲丹'];
			DEF += 50*items['伏羲丹'];
			SPD += 50*items['伏羲丹'];
		}
	}

	//最后做战力计算
	BP += HP/10 + SP/20 + ATK/2 + DEF/5 + SPD/2+ addbp
	
	//console.log('stats: HP',HP,'SP',SP,'ATK',ATK,'DEF',DEF,'SPD',SPD,'BP',BP)
	//console.log('Buff: hp',hpbuff,'sp',spbuff,'atk',atkbuff,'def',defbuff,'spd',spdbuff)

	//将计算反馈到档案中
	let lefthp = data.HP/data.maxHP
	let leftsp = data.SP/data.maxSP

	data.maxHP = Math.max(Math.floor(HP/5+0.5)*5,25)
	data.maxSP = Math.max(Math.floor(SP/5+0.5)*5,10)
	data.HP = Math.floor(data.maxHP*lefthp)
	data.SP = Math.floor(data.maxSP*leftsp)

	data.ATK = Math.max(Math.floor(ATK+0.5),5)
	data.DEF = Math.max(Math.floor(DEF+0.5),5)
	data.SPD = Math.max(Math.floor(SPD+0.5),5)
	data.BP = Math.max(Math.floor(BP+0.5),5)

	await setUser(ctx,uid,data)
	return data
}