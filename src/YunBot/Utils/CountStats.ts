import {Game, getSoulInfo, LevelBuff, YunData} from "../index"

export function CountStats( data:Game|YunData, mode?){
	let levelStats = (lv)=>{
		return 5 + Math.floor((lv-1)/10)*1.2 + Math.floor(lv/2)
	}
	let soul = getSoulInfo(data.soul)

	const { level, core, skill, equip, upgrade } = data

	let base = {
		BP: (6 - soul.count) * Math.max(Math.floor(level / 10), 1),

		HP: (10 + level * 5) * LevelBuff(level),
		SP: (5 + level * 2) * LevelBuff(level),

		ATK: levelStats(level) * LevelBuff(level),
		DEF: levelStats(level) * LevelBuff(level),
		SPD: levelStats(level) * LevelBuff(level),
	};

	let add = {
		HP: 0,	SP: 0,	BP: 0,
		ATK: 0,	DEF: 0,	SPD: 0,

		HPbuff: 0,	SPbuff: 0,	ATKbuff: 0,
		DEFbuff: 0,	SPDbuff: 0,	BPbuff: 0,
	}
}