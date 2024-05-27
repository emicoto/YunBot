import { Game, Skill} from "../Define";

Skill.set('无','','','')

Skill.set('灵霄身法','灵虚派的顶级身法。凌霄一跃，便是千里。','被动','身法')
	.setATKbuff(0.2)
	.setDEFbuff(0.3)
	.setSPDbuff(1)

Skill.set('虚梦之境','庄周梦蝶，蝶梦周公。亦真亦幻，谁知真假？','特殊','操控')
	.setEffectDes('使对象陷入迷幻状态，持续5回合。')
	.setCondType('迷幻')
	.setCoverage('全体')
	.setrate(85)
	.setBufftime(5)
	.setBP(500)
	.setcostSP(250)

Skill.set('太虚剑法','灵虚派创世人所涉及的顶级剑法。太虚一剑，破法万千。剑之所指，皆是虚空。','主动','剑法')
	.setATKbuff(0.8)
	.setATKRoll(50,100)
	.setBP(1000)
	.setcostSP(25)

Skill.set('天雷诀','消耗灵力1000，召唤天雷一道。','主动','术法')
	.setCoverage('全体')
	.setATK(5000)
	.setBP(1000)
	.setcostSP(1000)

Skill.set('灵泉之体','灵泉之躯，以自身润泽万物。','被动','体质')
	.setDEFbuff(0.2)
	.setSPDbuff(0.5)
	.setHPbuff(1)
	.setSPbuff(25)

Skill.set('天毒虚雾','天之毒，可吞噬万物根源。','特殊','效果')
	.setEffectDes('使对象陷入天毒状态，每回合失去10%的HP与SP，持续10回合。')
	.setCondType('天毒')
	.setBufftime(10)
	.setredHP(0.1)
	.setredSP(0.1)
	.setBP(1000)
	.setcostSP(300)

Skill.set('净化之风', '净玉扇的专属技能。玉扇一舞，净化一切污秽与邪念。', '特殊','效果')
	.setEffectDes('对敌人全体进行攻击，并对带有邪恶特征的敌人赋予【迷茫】效果，持续3回合。')
	.setCondType('迷茫')
	.setATK(100)
	.setBP(50)
	.setcostSP(100)
	.setAct((target:Game)=>{

		if(target.flag?.evil){
			target.cflag.condition['迷茫'] = {
				name:'迷茫', type:'debuff', time:3,
				ATKdebuff:0.6, DEFdebuff:0.6
			}
		}
		return target
	})

Skill.set('天泉幻法', '路昀自己独创的水系攻击法术。', '主动', '术法')
	.setRange('全范围')
	.setCoverage('单体')
	.setATKbuff(0.25)
	.setATKRoll(5,100)
	.setBP(200)
	.setcostSP(50)

Skill.set('乾坤护体', '乾坤锁的专属技能。乾坤护体，无人能破。','主动','护盾')
	.setEffectDes('技能使用后对防御力大幅提升，持续10回合。')
	.setDEFbuff(1.5)
	.setBufftime(10)
	.setCondType('护盾')
	.setBPbuff(0.3)
	.setcostSPper(0.5)

Skill.set('烛龙邪火·残','即使是残级的烛龙邪火，也足够将大部分杂碎燃烧殆尽。','主动','术法')
	.setRange('全范围')
	.setCoverage('单排')
	.setATKbuff(0.25)
	.setATKRoll(5,25)
	.setBP(25)
	.setcostSPper(0.1)

Skill.set('烛龙邪火','烛龙的邪火，能将大部分的存在燃烧殆尽。','主动','术法')
	.setRange('全范围')
	.setCoverage('全体')
	.setATKbuff(0.5)
	.setATKRoll(5,100)
	.setBP(250)
	.setcostSPper(0.2)

//console.log(Skill.data)
