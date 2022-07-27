import { Context } from "koishi";
import * as s from "../Setting";
import * as f from "../Function";
import { SkillLib } from "./Library";

export async function CountStats(ctx: Context, uid: string, mode?) {
  let data, level;

  if (!mode) {
    data = await s.getUser(ctx, uid);
    level = data.level;
  } else {
    data = s.yunstate;
    level = s.yunstate.level;
  }

  let levelStats = (lv)=> {
    return 5 + Math.floor(lv/10) + Math.floor(lv/2)
  }

  //先从等级获得各数值的基础值，战斗力最后算
  let base = {
    BP: (7 - data.soul.length) * Math.max(Math.floor(level / 10), 1),

    HP: (10 + level * 5) * f.LevelBuff(level),
    SP: (5 + level * 2) * f.LevelBuff(level),

    ATK: levelStats(level) * f.LevelBuff(level),
    DEF: levelStats(level) * f.LevelBuff(level),
    SPD: levelStats(level) * f.LevelBuff(level),
  };
  //console.log('base',base)

  let add = {
    HP: 0,
    SP: 0,
    BP: 0,
    ATK: 0,
    DEF: 0,
    SPD: 0,

    HPbuff: 0,
    SPbuff: 0,
    ATKbuff: 0,
    DEFbuff: 0,
    SPDbuff: 0,
    BPbuff: 0,
  };

  let core;
  if (data.core?.id) {
    core = data.core.lvstats[data.core.level - 1];
    //计算主心法加成
    for (let i in add) {
      if (core[i] > 0) add[i] += core[i];
    }
  }
  //console.log('addcore',add)

  //计算被动技能加成。被动技能追加的属性值，将算入基础值中。
  const countSkill = function (skill, add) {
    if (skill && skill.type.includes("被动")) {
      for (let k in add) {
        if (k.includes("buff") && skill[k]) add[k] += skill[k];
        else if (skill[k]) base[k] += skill[k];
      }
    } else {
      //主动只计算战力加值
      if (skill?.BP) add.BP += skill.BP;
      if (skill?.BPbuff) add.BPbuff += skill.BPbuff;
    }
  };

  if (Object.keys(data.skill).length >= 1) {
    for (let i in data.skill) {
      let skill = data.skill[i];
      countSkill(skill, add);
    }
  }

  //console.log('addskill',add)

  //计算装备加成，一般只对ATK,DEF,SPD有加值和加成。装备追加的属性值，不算入基础值中。
  let list = ["head", "coat", "middle", "skin", "weapon"];
  for (let i = 0; i < list.length; i++) {
    let equip = data.equip[list[i]];
    for (let k in add) {
      if (equip[k]) add[k] += equip[k];
    }
    if (equip?.skill) {
      let skill = SkillLib[equip.skill];
      //console.log(skill, equip.skill);
      countSkill(skill, add);
    }
  }
  //console.log('addequip',add)

  //计算装饰加成，装饰一般只对SP有加值，稀有装备或许可以有一些额外加成。
  list = ["face", "ear", "hand", "leg"];
  for (let i = 0; i < list.length; i++) {
    let acces = data.accesory[list[i]];
    for (let k in add) {
      if (acces[k]) add[k] += acces[k];
    }
    if (acces?.skill) {
      let skill = SkillLib[acces.skill];
      countSkill(skill, add);
    }
  }
  //console.log('addacess',add)

  //最后计算升级物品所带来的加值
  if (data.flag?.upgrade && Object.keys(data.flag?.upgrade).length > 0) {
    for (let i in data.flag.upgrade) {
      let items = data.flag.upgrade[i];
      for (let k in add) {
        if (items[k] && items.num) add[k] += items[k] * items.num;
      }
    }
  }
  //console.log('additems',add)

  //console.log(base)
  //console.log(add)

  //计算灵根加成
  let soulbuff = f.getSoulBuff(data.soul);
  for (let i in soulbuff) {
    if (soulbuff[i]) base[i] *= 1 + soulbuff[i];
  }

  //对HP,SP,ATK,DEF,SPD进行最后的计算
  for (let i in add) {
    if (i !== "BP") {
      if (add[`${i}buff`]) base[i] *= 1 + add[`${i}buff`];
      if (add[i]) base[i] += add[i];
    }
  }
  //最后做战力计算
  base.BP += base.HP / 20 + base.SP / 40 + base.ATK / 2 + base.DEF / 5 + base.SPD / 2 + add.BP;
  base.BP *= 1 + add.BPbuff;

  //将计算反馈到档案中
  let lefthp = data.HP / data.maxHP;
  let leftsp = data.SP / data.maxSP;

  data.maxHP = Math.max(Math.floor(base.HP / 25+0.5) * 25, 25);
  data.maxSP = Math.max(Math.floor(base.SP / 10+0.5) * 10, 10);
  data.HP = Math.floor(data.maxHP * lefthp);
  data.SP = Math.floor(data.maxSP * leftsp);

  if(data.maxAP < 8){
    data.AP = 8;
    data.maxAP = 8;
  }

  data.ATK = Math.max(Math.floor(base.ATK + 0.5), 5);
  data.DEF = Math.max(Math.floor(base.DEF + 0.5), 5);
  data.SPD = Math.max(Math.floor(base.SPD + 0.5), 5);
  data.BP = Math.max(Math.floor(base.BP + 0.5), 5);

  if (!mode) {
    await s.setUser(ctx, uid, data);
  } else {
    console.log(s.yunstate);
    s.yunsave();
  }

  return data;
}
