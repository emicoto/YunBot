import { Minds } from "../Define";

Minds.set('无','',0,0)

//SP和HP的价值/2, EXP的加值比重/4

Minds.set('虚月心法','灵虚派创始人 时月为了适配自身的灵根与灵脉，特意设计的独门心法。主修速度与精神。',10, 12)
	.setbuff('ATKbuff',0.4,1)
	.setbuff('DEFbuff',0.3,0.64)
	.setbuff('SPDbuff',0.6,1.8)
	.setbuff('HPbuff',0.25,0.8)
	.setbuff('SPbuff',1.25,2)
	.setbuff('Expbuff',3,5)  //4.84+1.25

Minds.set('天泉心法','灵虚派大长老 万虚为了适配小昀本身的灵根与灵脉，特意设计的独门心法。主修精神与防御。',9, 10)
	.setbuff('ATKbuff',0.2,0.4)
	.setbuff('DEFbuff',0.6,1.5)
	.setbuff('SPDbuff',0.15,0.6)
	.setbuff('HPbuff',0.35,1.2)
	.setbuff('SPbuff',1.1,2.0)
	.setbuff('Expbuff',2.5,4) //4.1+1

Minds.set('幻千心法','灵虚派掌门开发的一种高级心法。主修精神，同时对全属性进行小幅加成。',5,15)
	.setbuff('ATKbuff',0.15,0.8)
	.setbuff('DEFbuff',0.15,0.8)
	.setbuff('SPDbuff',0.15,0.8)
	.setbuff('HPbuff',0.15,0.8)
	.setbuff('SPbuff',0.5,1.2)
	.setbuff('Expbuff',0.6,2) //3.4+0.5

Minds.set('幻花心法','灵虚派掌门开发的一种高级心法。主修精神，同时对全属性进行小幅加成。',5,15)
	.setbuff('ATKbuff',0.15,0.8)
	.setbuff('DEFbuff',0.15,0.8)
	.setbuff('SPDbuff',0.15,0.8)
	.setbuff('HPbuff',0.15,0.8)
	.setbuff('SPbuff',0.5,1.2)
	.setbuff('Expbuff',0.6,2) //3.4+0.5

Minds.set('灵犀心法','灵虚派的基础心法之一，主修攻击。',1,5)
	.setbuff('ATKbuff',0.1,0.5)
	.setbuff('Expbuff',0.2,0.8) //0.5+0.2

Minds.set('灵空心法','灵虚派的基础心法之一，主修防御',1,5)
	.setbuff('DEFbuff',0.1,0.5)
	.setbuff('Expbuff',0.2,0.8) //0.5+0.2

Minds.set('灵虚心法','灵虚派的基础心法之一，主修速度。',1,5)
	.setbuff('SPDbuff',0.1,0.5)
	.setbuff('Expbuff',0.2,0.8) //0.5+0.2

Minds.set('幽火诀','一种基础心功，主修攻击。',2,8)
	.setbuff('ATKbuff',0.2,0.8)
	.setbuff('Expbuff',0.3,1) //0.8+0.25

Minds.set('遁土诀','一种基础心功，主修防御。',2,8)
	.setbuff('DEFbuff',0.2,0.8)
	.setbuff('Expbuff',0.3,1)  //0.8+0.25

Minds.set('清风诀','一种基础心功，主修速度。',2,8)
	.setbuff('SPDbuff',0.2,0.8)
	.setbuff('Expbuff',0.3,1)  //0.8+0.25

Minds.set('明犀心法','灵虚派的进阶心法，主修攻击，同时对速度小幅提升。',3,8)
	.setbuff('ATKbuff',0.2,0.8)
	.setbuff('SPDbuff',0.1,0.5)
	.setbuff('Expbuff',0.2,0.8) //1.3+0.2

Minds.set('明空心法','灵虚派的进阶心法，主修防御，同时对HP与SP小幅提升。',3,8)
	.setbuff('DEFbuff',0.2,0.8)
	.setbuff('HPbuff',0.1,0.5)
	.setbuff('SPbuff',0.1,0.5)
	.setbuff('Expbuff',0.2,0.8) //1.3+0.2

Minds.set('明虚心法','灵虚派的进阶心法，主修速度，同时对攻击小幅提升。',3,8)
	.setbuff('SPDbuff',0.2,0.8)
	.setbuff('ATKbuff',0.1,0.5)
	.setbuff('Expbuff',0.2,0.8) //1.3+0.2

//console.log(Minds.data)