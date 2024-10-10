import { Equip, Weapon } from "../Define";

Weapon.set('无','','',0)

//装备数值设定
//grade 3 及以上的才有乘数。乘数最大0.5，最小0.05
//grade1（凡品） 只能对一个主属性 有加值。最少 +3，最大+10
//grade2（八品）可以对一个主属性+1个生产属性有加值，最少+5，最大+20
//每级可增加数值（总值）上限 10*grade*grade，最大1000
//buff 0.05 = 1 grade价值，也就是说，0.5加值的，剩余可用点数只有 10
//hp与sp的加值打折扣。 hp/10，sp/5
//神器另算

//本命法器才能成长。每级提升 5%原始属性值（绝对值类），
//0.05原始属性值（百分比值类）。满级10。
//没有value（价值）就表示非卖品。
//价值换算，1 三围属性/5HP/2SP = 30灵石
// 1 生活属性加成 = 5灵石

Weapon.set('冷烟管剑','灵虚派掌门人时月的本命法器，可成长。 细剑藏匿于烟管之中，可攻可守。','刀剑',10)
	.setATK(800)
	.setDEFbuff(0.2)
	.setSkill('天毒虚雾')
	.setUnique()
	.setLevel({
		ATK:[800,1000],
		DEFbuff:[0.2,0.3],
	})	

Weapon.set('净玉扇','路昀的本命法器，可成长。扇收为剑，扇开为盾。可自由变换大小，十分万能。','扇',5)
	.setATK(40)
	.setATKbuff(0.2)
	.setDEFbuff(0.3)
	.setSkill('净化之风')
	.setUnique()
	.setLevel({
		ATK:[40,100],
		DEFbuff:[0.3,0.4],
		gradesp:[
			{require:10, rename:'净玉扇·极',add:{ SPDbuff:0.2 }},
			{require:8, add:{ ATKbuff: 0.5 }}
		]
	})

Weapon.set('乾坤锁','周天的本命法器，可成长。乾坤护体，无人能破。乾坤一锁，无物可逃。防御用法器，没多少攻击力。','鞭绳',3)
	.setATK(5)
	.setDEF(20)
	.setSPbuff(0.1)
	.setSkill('乾坤护体')
	.setUnique()
	.setLevel({
		ATK:[5,15],
		DEF:[20,50],
		gradesp:[
			{require:10, rename:'乾坤锁·极', add:{ DEFbuff:0.8 }},
			{require:8, add:{ DEFbuff: 0.5 }},
			{require:5, add:{ DEFbuff: 0.2 }},
		]
	})

Weapon.set('烛龙杖·残','公祈裕的本命法器，可成长。烛龙所留下的法杖。已经残破不剩多少法力。但依然带有一丝烛龙之息。','法杖',3)
	.setSoul(['火','水'])
	.setSP(20)
	.setATK(20)
	.setSPbuff(0.1)	
	.setSkill('烛龙邪火·残')
	.setUnique()
	.setLevel({
		SP:[20,120],		
		ATK:[20,50],
		gradesp:[
			{require:10, rename:'烛龙杖·真', add:{ ATKbuff:0.8, SPbuff: 0.5 }},
			{require:8, rename:'烛龙杖', add:{ ATKbuff: 0.5, SPbuff: 0.2, skill:'烛龙邪火'}},
			{require:5, rename:'烛龙杖·封', add:{ ATKbuff: 0.2 }},
		]
	})

Equip.set('无','','',0)

Equip.set('泠月云裳','清池水中月。带着清凉夜色的云织法衣，让穿戴者保持最佳的精神状态。','衣服',10)
	.setDEF(1000)
	.setSPbuff(0.2)	
	.setSPDbuff(0.1)
	.setResearch(100)
	.setMedicine(50)
	.setPlant(50)
	.setExpbuff(0.1)
	.setBreakbuff(5)

Equip.set('履云靴','脚踏彩云，御风而行。鎏金覆边的设计很是别致。','鞋子',8)
	.setSPD(1000)
	.setMine(20)

Equip.set('弟子袍','灵虚派的弟子袍。白底竹纹的设计很是别致。','衣服',1)
	.setDEF(3)
	.setValue(60)

Equip.set('布鞋','十分普通的古式布鞋。深绿的绸布上绣着云纹，很是别致。','鞋子',1)
	.setSPD(2)
	.setValue(40)

Equip.set('布腰带','十分普通的布腰带。黑色的绸布上绣着银灰色的暗纹，很是别致。','腰饰',1)
	.setSP(5)
	.setValue(50)

Equip.set('花簪','一个好看的镶着金边的粉色发簪。','头饰',2)
	.setSP(100)
	.setExpbuff(0.1)
	.setValue(500)

Equip.set('倾袭','倾袭，某个向往极致的炼器师意外炼制而出，在较低端领域有超高名气。剑形状的红色吊坠，内部带有黑色，攻击时会激发使用者的灵气增加攻击力，但是会削弱使用者的防御力。','首饰',2)
	.setATK(10)
	.setDEF(-5)
	.setMine(5)
	.setValue(250)

Equip.set('明光铠','明光铠，外表类似于唐代明光铠，由上古炼器师好名研究而出的第一个作品，在较低端领域受众较高，强大的防御和其他的额外加成让这件铠甲放到现在仍旧是不错的选择。','衣服',2)
	.setDEF(10)
	.setSPD(5)
	.setCraft(5)
	.setMedicine(5)
	.setValue(620)

Equip.set('愈光','愈光，种植园的某位天才炼器师为了更好的效率而炼制，外表为人参形状的吊坠，内部的木属性和土属性灵气会加强佩戴者的防御力并增加其的生命力，在种植时亦可增加生长速度等','首饰',2)
	.setHP(20)
	.setDEF(5)
	.setPlant(10)
	.setValue(400)

Equip.set('风语','风语，被广大低速群体所追求，在中端领域亦有一席之地，外表为(adds)，超高的速度加成，更快的挖矿速度，时尚的外形，再也不怕打不到人，挖不到宝。','鞋子',2)
	.setSPD(10)
	.setMine(5)
	.setResearch(5)
	.setValue(420)

Equip.set('修学','修学，在炼器炼丹圈内大受追捧，整体为绿色+白色的手镯，强大的炼丹炼器加成致使哪怕价格极贵也有人倾家荡产都要买，生命力和法力加成也让部分人情有独钟。','手饰',2)
	.setHP(20)
	.setSP(10)
	.setMedicine(10)
	.setCraft(15)
	.setValue(600)

Equip.set('天任','被低端剑修圈所青睐的红色手环，带来生命力和速度加成，让脆皮剑修们能够更好的输出。同时附带一定的挖矿加成。','手饰',2)
	.setHP(20)
	.setSPD(5)
	.setMine(10)
	.setValue(280)

Equip.set('束发','外表为古代的簪，纯金，镶有玉石等，通常用于固定头发。','头饰',2)
	.setSP(18)
	.setCraft(10)
	.setValue(380)

Equip.set('玲珑师蛮带','传说为古代无双神将吕布的腰饰。均衡的加成令玲珑狮蛮带较受战士群体追捧，当然价格太贵只有那些比较有钱的才买，不过还是会有人倾家荡产去买的。','腰饰',2)
	.setATK(7)
	.setDEF(7)
	.setSPD(7)
	.setMine(5)
	.setValue(680)
	


//console.log(Weapon.data)
//console.log(Equip.data)