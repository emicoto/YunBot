import { Items } from "../Define"

//可食用：丹药，灵果，食物，灵材，灵材
//可使用：至宝，道具
//不可用：素材，矿物

//使用方式：恢复HP/SP，暂时提升（获得condition)
//获得经验，提升突破概率，永久提升属性值。
//万能：实为多用途类别。HPSP类为恢复。三围属性是暂时提升。突破和经验则直接加。

//价值换算，1突破率=40灵石。
//1经验值=2灵石。
//1永久属性点=1000灵石（5HP=1/2SP=1)
//1临时属性点=100灵石
//0.05永久buff = 5000灵石，临时buff为50灵石。


// 修炼类丹药。可炼制。
Items.set('明心丹','清心明目，挥去心中阴霾，协助服药者早日看破假象。','丹药','突破')
	.setRequire(5,10)
	.setBreakbuff(3)
	.setDayUsage(2)
	.setValue(120)
	.setRecipie(['甘薄荷 3','冰月草 2','心露花 1'])

Items.set('灵息丹','稳定心息，提升感度，协助服药者捕捉灵动之息。','丹药','突破')
	.setRequire(15,20)
	.setBreakbuff(3)
	.setDayUsage(2)
	.setValue(360)
	.setRecipie(['心露花 3','狐角叶 2','蓝云果 1'])

Items.set('凝元丹','凝固心神，集元气，协助服药者聚元开元。','丹药','突破')
	.setRequire(21,30)
	.setBreakbuff(3)
	.setDayUsage(2)
	.setValue(1080)
	.setRecipie(['心露花 5','风芯草 3','七合莲 1'])

//道具
Items.set('仙书笺','凝聚了仙人修士的灵气与经验的书笺。','道具','经验')
	.setRequire(11,100)
	.setGetexp(100,300)
	.setDayUsage(2)
	.setValue(120)


//至宝
Items.set('长生果','据说吃了能长生的果子。','灵果','永久提升')
	.isUpGradeItem('仙果')
	.setRequire(35,100)
	.setLifeUsage(5)	
	.setHP(500)
	.setValue(250000)

Items.set('女娲花','散发着光芒十分美丽的仙花，传说为女娲亲自中下的花所变异来的。可直接食用。','灵材','永久提升')
	.isUpGradeItem('仙材')
	.setLifeUsage(5)
	.setSP(500)
	.setValue(250000)

Items.set('伏羲丹','蕴含着太古之力的神秘仙，服下能让实力暴涨，但不是谁都能服用。','丹药','永久提升')
	.isUpGradeItem('仙丹')
	.setRequire(35,100)
	.setLifeUsage(5)
	.setATK(100)
	.setDEF(100)
	.setSPD(100)

Items.set('太虚丹','用了上好天材地宝炼制的仙丹，能永久改善体质。','丹药','永久提升')
	.isUpGradeItem('神丹妙药')
	.setLifeUsage(3)
	.setATKbuff(0.2)
	.setDEFbuff(0.2)
	.setSPDbuff(0.2)
	.setValue(64000)

Items.set('火之源种','传说中人王给人类带来的第一把火所残留的种子。','至宝','永久提升')
	.isUpGradeItem('火之源种')
	.setLifeUsage(1)
	.setATKbuff(0.5)
	.setValue(150000)

Items.set('噬火丹','虽然看着像丹，实则是物品。一种能永久改善根骨的神秘物品。','至宝','永久提升')
	.isUpGradeItem('噬火丹')
	.setLifeUsage(1)
	.setATK(100)
	.setValue(150000)


//素材