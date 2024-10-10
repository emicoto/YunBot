import { Game, Yun, Skill, bot, random, Soul, TotalExp, LevelBuff, SoulMatcher, breakProces } from "../unit";
export async function CountStats(uid: string, mode?) {
  let data: Game | Yun

  if (mode == 'player') {
    data = await Game.getChara(uid)
  }
  else {
    data = Yun.state
  }

  const levelStats = (lv) => {
    return 5 + Math.floor((lv - 1) / 10) * 1.2 + Math.floor(lv / 2)
  }
  console.log(data)
  console.log(Yun.state)
  const soul = new Soul(data.soul)

  const { level, core, skill, equip, upgrade } = data

  if (data.INT <= 5 || data.WIL <= 5) {
    data.INT = random(20, 100);
    data.WIL = random(20, 100);
  }

  let base = {
    BP: (6 - soul.count) * Math.max(Math.floor(level / 10), 1),

    HP: (10 + level * 5) * LevelBuff(level),
    SP: (5 + level * 2) * LevelBuff(level),

    ATK: levelStats(level) * LevelBuff(level),
    DEF: levelStats(level) * LevelBuff(level),
    SPD: levelStats(level) * LevelBuff(level),

    INT: data.INT, WIL: data.WIL,

    mine: 100, plant: 100, medicine: 100,
    craft: 100, research: 100,
  };

  let add = {
    HP: 0, SP: 0, BP: 0,
    ATK: 0, DEF: 0, SPD: 0,

    HPbuff: 0, SPbuff: 0, ATKbuff: 0,
    DEFbuff: 0, SPDbuff: 0, BPbuff: 0,

    mine: 0, plant: 0, medicine: 0,
    craft: 0, research: 0,

    INT: 0, WIL: 0,
    breakbuff: 0,
    Expbuff: 0,
  }

  //console.log('基础值',base)


  //计算被动技能加成。
  const countSkill = function (skill: Skill, add) {
    if (skill && skill.category === '被动') {
      for (let k in add) {
        if (k.includes('buff') && skill[k]) add[k] += skill[k];
        else if (skill[k]) base[k] += skill[k];
      }
    }
    else {
      if (skill?.BP) add.BP += skill.BP;
      if (skill?.BPbuff) add.BPbuff += skill.BPbuff;
    }
  }

  if (skill.length >= 1) {
    for (let i = 0; i < skill.length; i++) {
      let s = Skill.data[skill[i]]
      countSkill(s, add)
    }
  }

  //console.log('技能加成',add)
  //console.log('技能加值',base)

  //计算装备加成。
  for (let i in equip) {
    const eq = equip[i];
    let m = 1;

    if (!eq?.id) continue;
    if (eq?.soul) {
      m = SoulMatcher(soul.chara, eq.soul)
    }

    for (let k in add) {
      if (eq[k]) add[k] += eq[k] * m;
    }

    if (eq?.skill) {
      let sk = Skill.data[eq.skill];
      countSkill(sk, add);
    }

    if (equip[i]?.id && !equip[i]?.category) {
      if (i == 'weapon') equip[i].category = 'weapon';
      else equip[i].category = 'equip'
    }
  }

  //console.log('装备加成',add)

  //先获取心法
  let buffs = {
    ATKbuff: 0, DEFbuff: 0, SPDbuff: 0,
    HPbuff: 0, SPbuff: 0, Expbuff: 0
  }

  if (core?.id) {
    const minds = Game.Corebuff(data)
    for (let i in minds) {
      add[i] += minds[i]
    }
  }

  //计算升级物品所带来的加值
  if (Object.keys(upgrade).length > 0) {
    for (let i in upgrade) {
      let items = upgrade[i]
      for (let k in add) {

        if (items[k] && items.count > 0) {
          if (['至宝'].includes(items.type) && k.includes('buff')) {
            buffs[k] += items[k] * items.count
          }
          else if (['至宝'].includes(items.type) && !k.includes('buff')) {
            base[k] += items[k] * items.count
          }
          else {
            add[k] += items[k] * items.count
          }
        }
      }
    }
  }

  //最后计算当天临时增加的数值
  const today = bot.user.daily
  if (today?.upgrade) {
    for (let k in upgrade) {
      add[k] += upgrade[k]
    }
  }

  //console.log('升级物品加成',add)


  //计算灵根加成
  //console.log('灵根',soul.buff)
  for (let i in soul.buff) {
    base[i] *= 1 + soul.buff[i]
  }


  //对至宝的buff进行计算
  //console.log('至宝',buffs)
  for (let i in base) {
    let n = i + 'buff'
    if (buffs[n]) base[i] *= 1 + buffs[n]
  }

  //console.log('最终加算',add)
  //对HP,SP,ATK,DEF,SPD进行最后的计算
  for (let i in base) {
    if (i !== "BP") {
      if (add[`${i}buff`]) base[i] *= 1 + add[`${i}buff`];
      if (add[i]) base[i] += add[i];
    }
  }

  //console.log('最终基础值',base)

  //最后做战力计算
  base.BP += base.HP / 20 + base.SP / 40 + base.ATK / 2 + base.DEF / 5 + base.SPD / 2 + add.BP + Math.floor((level - 1) / 10) * 10;
  base.BP *= 1 + add.BPbuff;

  //将计算反馈到档案中
  let lefthp = data.HP / data.maxHP;
  let leftsp = data.SP / data.maxSP;

  data.maxHP = Math.max(Math.floor(base.HP / 25 + 0.5) * 25, 25);
  data.maxSP = Math.max(Math.floor(base.SP / 10 + 0.5) * 10, 10);
  data.HP = Math.floor(data.maxHP * lefthp);
  data.SP = Math.floor(data.maxSP * leftsp);

  data.ATK = Math.max(Math.floor(base.ATK + 0.5), 5);
  data.DEF = Math.max(Math.floor(base.DEF + 0.5), 5);
  data.SPD = Math.max(Math.floor(base.SPD + 0.5), 5);
  data.BP = Math.max(Math.floor(base.BP + 0.5), 5);

  data.mine = Math.floor(base.mine);
  data.plant = Math.floor(base.plant);
  data.medicine = Math.floor(base.medicine);
  data.craft = Math.floor(base.craft);
  data.research = Math.floor(base.research);

  data.INT = Math.min(Math.floor(base.INT), 100);
  data.WIL = Math.min(Math.floor(base.WIL), 100);

  data.flag['equipBreak'] = add.breakbuff ?? 0;
  data.flag['expbuff'] = add.Expbuff + (soul.Expbuff ?? 0)

  data.flag.totalexp = data.exp + TotalExp(data.level)
  data.money = Math.clamp(Math.floor(data.money), 0, 10000000000)

  if (!data.flag.pkwin) data.flag.pkwin = 0

  if (mode == 'player') {
    await Game.setChara(uid, data)
  }
  else {
    Yun.save()
    //console.log(Yun.state)
  }

  return data
}
