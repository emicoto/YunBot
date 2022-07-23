import { between, fixed, random, Roll } from "../Function"

export const GradeName = [
    '无', //0 
    '凡',//1
    '八',//2
    '七',//3
    '六',//4
    '五',//5
    '四',//6
    '三',//7
    '二',//8
    '一',//9
    '天',//10
]

export const CoreLib = {
    ['虚月心法'] :{
        id: 1,  name: '虚月心法',
        des: "灵虚派创始人 时月为了适配自身的灵根与灵脉，特意设计的独门心法。主修速度与精神。",
        grade:10, level:1, exp: 0, maxlevel:12,
        lvstats:[
            {ATKbuff:0.25, DEFbuff:0.12, SPDbuff:0.70, HPbuff:0.20, SPbuff:1.25, Expbuff: 3.0},
            {ATKbuff:0.30, DEFbuff:0.16, SPDbuff:0.78, HPbuff:0.24, SPbuff:1.30, Expbuff: 3.2},
            {ATKbuff:0.35, DEFbuff:0.20, SPDbuff:0.86, HPbuff:0.28, SPbuff:1.35, Expbuff: 3.4},
            {ATKbuff:0.40, DEFbuff:0.24, SPDbuff:0.94, HPbuff:0.32, SPbuff:1.40, Expbuff: 3.6},
            {ATKbuff:0.45, DEFbuff:0.28, SPDbuff:1.02, HPbuff:0.36, SPbuff:1.45, Expbuff: 3.8},
            {ATKbuff:0.50, DEFbuff:0.32, SPDbuff:1.10, HPbuff:0.40, SPbuff:1.50, Expbuff: 4.0},
            {ATKbuff:0.55, DEFbuff:0.36, SPDbuff:1.18, HPbuff:0.44, SPbuff:1.55, Expbuff: 4.2},
            {ATKbuff:0.60, DEFbuff:0.38, SPDbuff:1.26, HPbuff:0.48, SPbuff:1.60, Expbuff: 4.4},
            {ATKbuff:0.65, DEFbuff:0.42, SPDbuff:1.34, HPbuff:0.52, SPbuff:1.65, Expbuff: 4.4},
            {ATKbuff:0.70, DEFbuff:0.46, SPDbuff:1.42, HPbuff:0.56, SPbuff:1.70, Expbuff: 4.6},
            {ATKbuff:0.75, DEFbuff:0.50, SPDbuff:1.50, HPbuff:0.60, SPbuff:1.75, Expbuff: 4.8},
            {ATKbuff:0.80, DEFbuff:0.54, SPDbuff:1.54, HPbuff:0.64, SPbuff:1.80, Expbuff: 5.0},
    ],},

    ['灵犀心法']:{
        id:2, name:"灵犀心法",
        des:"灵虚派的基础心法之一，主修攻击。",
        grade:1, level:1, exp:0, maxlevel:5,
        lvstats:[
            {ATKbuff: 0.1, Expbuff: 0.20,},
            {ATKbuff: 0.2, Expbuff: 0.35,},
            {ATKbuff: 0.3, Expbuff: 0.50,},
            {ATKbuff: 0.4, Expbuff: 0.65,},
            {ATKbuff: 0.5, Expbuff: 0.80,},
    ],},

    ['灵空心法']:{
        id:3, name:"灵空心法",
        des:"灵虚派的基础心法之一，主修防御。",
        grade:1, level:1, exp:0, maxlevel:5,
        lvstats:[
            {DEFbuff: 0.1, Expbuff: 0.20,},
            {DEFbuff: 0.2, Expbuff: 0.35,},
            {DEFbuff: 0.3, Expbuff: 0.50,},
            {DEFbuff: 0.4, Expbuff: 0.65,},
            {DEFbuff: 0.5, Expbuff: 0.80,},
    ]},

    ['灵虚心法']:{
        id:4, name:"灵虚心法",
        des:"灵虚派的基础心法之一，主修敏捷。",
        grade:1, level:1, exp:0, maxlevel:5,
        lvstats:[
            {SPDbuff: 0.1, Expbuff: 0.20,},
            {SPDbuff: 0.2, Expbuff: 0.35,},
            {SPDbuff: 0.3, Expbuff: 0.50,},
            {SPDbuff: 0.4, Expbuff: 0.65,},
            {SPDbuff: 0.5, Expbuff: 0.80,},
    ]},

    ['天泉心法']:{
        id:5,
        name:"天泉心法",
        des:"灵虚派大长老 万虚为了适配小昀本身的灵根与灵脉，特意设计的独门心法。主修精神与防御。",
        grade:10, level:1, exp:0, maxlevel:10,

    "lvstats":[
        {ATKbuff:0.20, DEFbuff:0.6, SPDbuff:0.15, HPbuff:0.35, SPbuff:1.1, Expbuff:3.0},
        {ATKbuff:0.24, DEFbuff:0.7, SPDbuff:0.20, HPbuff:0.40, SPbuff:1.2, Expbuff:3.4},
        {ATKbuff:0.26, DEFbuff:0.8, SPDbuff:0.25, HPbuff:0.45, SPbuff:1.3, Expbuff:3.6},
        {ATKbuff:0.28, DEFbuff:0.9, SPDbuff:0.30, HPbuff:0.50, SPbuff:1.4, Expbuff:3.8},
        {ATKbuff:0.30, DEFbuff:1.0, SPDbuff:0.35, HPbuff:0.55, SPbuff:1.5, Expbuff:4.0},
        {ATKbuff:0.32, DEFbuff:1.1, SPDbuff:0.40, HPbuff:0.60, SPbuff:1.6, Expbuff:4.2},
        {ATKbuff:0.34, DEFbuff:1.2, SPDbuff:0.45, HPbuff:0.65, SPbuff:1.7, Expbuff:4.4},
        {ATKbuff:0.36, DEFbuff:1.3, SPDbuff:0.50, HPbuff:0.70, SPbuff:1.8, Expbuff:4.6},
        {ATKbuff:0.38, DEFbuff:1.4, SPDbuff:0.55, HPbuff:0.75, SPbuff:1.9, Expbuff:4.8},
        {ATKbuff:0.40, DEFbuff:1.5, SPDbuff:0.60, HPbuff:0.80, SPbuff:2.0, Expbuff:5.0},
    ]},

    ['幻千心法']:{
        id:5,
        name:"幻千心法", 
        des:"灵虚派掌门开发的一种高级心法。主修精神，同时对全属性进行小幅加成。满级12。",
        grade:5, level:1, exp:0, maxlevel:12,

        "lvstats":[
            {ATKbuff:0.10, DEFbuff:0.10, SPDbuff:0.10, HPbuff:0.20, SPbuff:0.30, Expbuff:0.5},
            {ATKbuff:0.15, DEFbuff:0.15, SPDbuff:0.15, HPbuff:0.25, SPbuff:0.40, Expbuff:0.6},
            {ATKbuff:0.20, DEFbuff:0.20, SPDbuff:0.20, HPbuff:0.30, SPbuff:0.50, Expbuff:0.7},
            {ATKbuff:0.25, DEFbuff:0.25, SPDbuff:0.25, HPbuff:0.35, SPbuff:0.60, Expbuff:0.8},
            {ATKbuff:0.30, DEFbuff:0.30, SPDbuff:0.30, HPbuff:0.40, SPbuff:0.70, Expbuff:0.9},
            {ATKbuff:0.35, DEFbuff:0.35, SPDbuff:0.35, HPbuff:0.45, SPbuff:0.80, Expbuff:1.0},
            {ATKbuff:0.40, DEFbuff:0.40, SPDbuff:0.40, HPbuff:0.50, SPbuff:0.90, Expbuff:1.1},
            {ATKbuff:0.45, DEFbuff:0.45, SPDbuff:0.45, HPbuff:0.55, SPbuff:1.00, Expbuff:1.2},
            {ATKbuff:0.50, DEFbuff:0.50, SPDbuff:0.50, HPbuff:0.60, SPbuff:1.10, Expbuff:1.3},
            {ATKbuff:0.55, DEFbuff:0.55, SPDbuff:0.55, HPbuff:0.75, SPbuff:1.20, Expbuff:1.4},
            {ATKbuff:0.60, DEFbuff:0.60, SPDbuff:0.60, HPbuff:0.80, SPbuff:1.30, Expbuff:1.5},
            {ATKbuff:0.70, DEFbuff:0.70, SPDbuff:0.70, HPbuff:0.85, SPbuff:1.50, Expbuff:1.75}
        ],
    },

    ['幻花心法']:{
        id:5,
        name:"幻花心法",
        des:"灵虚派掌门开发的一种高级心法。主修精神，同时对全属性进行小幅加成。满级12。",
        grade:5, level:1, exp:0, maxlevel:12,

        "lvstats":[
            {ATKbuff:0.10, DEFbuff:0.10, SPDbuff:0.10, HPbuff:0.20, SPbuff:0.30, Expbuff:0.5},
            {ATKbuff:0.15, DEFbuff:0.15, SPDbuff:0.15, HPbuff:0.25, SPbuff:0.40, Expbuff:0.6},
            {ATKbuff:0.20, DEFbuff:0.20, SPDbuff:0.20, HPbuff:0.30, SPbuff:0.50, Expbuff:0.7},
            {ATKbuff:0.25, DEFbuff:0.25, SPDbuff:0.25, HPbuff:0.35, SPbuff:0.60, Expbuff:0.8},
            {ATKbuff:0.30, DEFbuff:0.30, SPDbuff:0.30, HPbuff:0.40, SPbuff:0.70, Expbuff:0.9},
            {ATKbuff:0.35, DEFbuff:0.35, SPDbuff:0.35, HPbuff:0.45, SPbuff:0.80, Expbuff:1.0},
            {ATKbuff:0.40, DEFbuff:0.40, SPDbuff:0.40, HPbuff:0.50, SPbuff:0.90, Expbuff:1.1},
            {ATKbuff:0.45, DEFbuff:0.45, SPDbuff:0.45, HPbuff:0.55, SPbuff:1.00, Expbuff:1.2},
            {ATKbuff:0.50, DEFbuff:0.50, SPDbuff:0.50, HPbuff:0.60, SPbuff:1.10, Expbuff:1.3},
            {ATKbuff:0.55, DEFbuff:0.55, SPDbuff:0.55, HPbuff:0.75, SPbuff:1.20, Expbuff:1.4},
            {ATKbuff:0.60, DEFbuff:0.60, SPDbuff:0.60, HPbuff:0.80, SPbuff:1.30, Expbuff:1.5},
            {ATKbuff:0.70, DEFbuff:0.70, SPDbuff:0.70, HPbuff:0.85, SPbuff:1.50, Expbuff:1.75}
        ],
    }
}

//主动技，action是 SkillFun[n]里代入的function名。
//被动会计入平时的属性中。 主动不会计入平时属性，只有使用技能时才计入。所有主动技能都会消耗SP。 主动技能中，分 攻击、防御、特殊、治疗 四种技能。

export function SkillDes(skill){
    
    let txt = [
        `【${skill.name}】  品级：${GradeName[skill.grade]}品\n`,
        `技能种类：${ skill.type }\n`,
        `说明：${ skill.des }\n`,
        `${ skill?.action ? `技能效果：${ SkillAct[skill.action](skill) }\n` : '' }`,  

        `${ skill?.rate ? `成功概率：${skill.rate}　` : '' }`,
        `${ skill?.reHP ? `HP回复：${skill.HP}% 　` : ''}`,
        `${ skill?.reSP ? `SP回复：${skill.SP}%　` : ''}`,
        `${ skill?.HP ? `生命增强：${skill.HP} 　` : ''}`,
        `${ skill?.SP ? `法力增强：${skill.SP}　` : ''}`,
        `${ skill?.HPbuff ? `生命增强：${skill.HP*100}% 　` : ''}`,
        `${ skill?.SPbuu ? `法力增强：${skill.SP*100}%　` : ''}`,
        `${ skill?.ATK ? `攻击：${skill.ATK}　` : ''}`,
        `${ skill?.DEF ? `防御：${skill.DEF}　` : ''}`,
        `${ skill?.SPD ? `速度：${skill.SPD}　` : ''}`,
        `${ skill?.ATKRoll ? `追加攻击骰：${skill.ATKRoll[0]}D${skill.ATKRoll[1]}　` : ''}`,
        `${ skill?.ATKbuff ? `攻击加成：${skill.ATKbuff*100}%　` : ''}`,
        `${ skill?.DEFbuff ? `防御加成：${skill.DEFbuff*100}%　` : ''}`,
        `${ skill?.SPDbuff ? `速度加成：${skill.SPDbuff*100}%　` : ''}`,

        `${ skill?.cost ? `技能消耗：${skill.cost*100}% SP　` : ''}`,
        `${ skill?.costSP ? `技能消耗：${skill.costSP} SP　` : '' }`,
        `${ skill?.HPcost ? `技能消耗：${skill.HPcost}% HP　` : ''}`,
        `${ skill?.costHP ? `技能消耗：${skill.costHP} HP　` : '' }`,
        `${ skill?.costAP ? `技能消耗：${skill.costAP} AP　` : ''} `,
    ]

    return txt.join('')
}

export function CoreDes(core){
    let txt = [
        `【${ core.name }】  品级：${GradeName[core.grade]}品\n`,
        `初始等级：${core.level}  最大等级：${core.maxlevel}\n`,
        `说明：${ core.des }\n`,
        `${ core.lvstats[core.maxlevel-1]?.HPbuff ?  `生命加成：${core.lvstats[core.maxlevel-1].HPbuff*100}%　` : ''}`,
        `${ core.lvstats[core.maxlevel-1]?.SPbuff ?  `法力加成：${core.lvstats[core.maxlevel-1].SPbuff*100}%　` : ''}`,
        `${ core.lvstats[core.maxlevel-1]?.ATKbuff ? `攻击加成：${core.lvstats[core.maxlevel-1].ATKbuff*100}%　` : ''}`,
        `${ core.lvstats[core.maxlevel-1]?.DEFbuff ? `防御加成：${core.lvstats[core.maxlevel-1].DEFbuff*100}%　` : ''}`,
        `${ core.lvstats[core.maxlevel-1]?.SPDbuff ? `速度加成：${core.lvstats[core.maxlevel-1].SPDbuff*100}%　` : ''}`,
        `${ core.lvstats[core.maxlevel-1]?.Expbuff ? `经验加成：${core.lvstats[core.maxlevel-1].Expbuff*100}%　` : ''}`,
    ]
    return txt.join('')
}

export function WeaponDes(weapon){
    let txt = [
        `【${ weapon.name }】\n`,
        `类型：${ weapon.type } 　品阶：${GradeName[weapon.grade]}品\n`,
        `${ weapon.des }\n`,
        `${ weapon?.HP ? `生命：　${weapon.HP}` : ''}`,
        `${ weapon?.SP ? `法力：　${weapon.SP}` : ''}`,
        `${ weapon?.ATK ? `攻击：${weapon.ATK}　` : ''}`,
        `${ weapon?.DEF ? `防御：${weapon.DEF}　` : ''}`,
        `${ weapon?.SPD ? `速度：${weapon.SPD}　` : ''}`,
        `${ weapon?.HP ? `生命加成：${weapon.HPbuff}　` : ''}`,
        `${ weapon?.SP ? `法力加成：${weapon.SPbuff}　` : ''}`,
        `${ weapon?.ATKbuff ? `攻击加成：${weapon.ATKbuff*100}%　` : ''}`,
        `${ weapon?.DEFbuff ? `防御加成：${weapon.DEFbuff*100}%　` : ''}`,
        `${ weapon?.SPDbuff ? `速度加成：${weapon.SPDbuff*100}%　` : ''}`,
        `${ weapon?.skill ? `装备技能：${weapon.skill}　` : ''}`
    ]

    return txt.join('\n')
}

export const SkillAct = {
    dream : (skill, target?)=>{
        if(!target){
            return `使对象陷入迷幻状态，持续${skill.debuff}回合。`
        }

        if(target.flag.stats.includes('迷幻') == false){
            target.flag.stats += '【迷幻】'
            target.flag.debuff['迷幻'] = {
                turn: skill.debuff
            }
        }
        else{
            target.flag.debuff['迷幻'].turn += skill.debuff
        }
        return `${target.name}已陷入迷幻状态！将持续${skill.debuff}回合。`

    },
    tiandu : (skill, target?)=>{
        if(!target){
            return `使对象陷入天毒状态，每回合失去10%的HP与SP，持续${skill.debuff}回合。`
        }
        if(target.flag.stats.includes('天毒') == false){
            target.flag.stats += '【天毒】'
            target.flag.debuff['天毒'] = {
                turn: skill.debuff,
                dwHP: target.maxHP/10,
                dwSP: target.maxSP/10,
            }
        }
        else{
            target.flag.debuff['天毒'].turn += skill.debuff
        }
    }
}

export function useSkill(player, skill, target?){
    let txt
    if(skill.type.includes('被动')) return; //被动技能作为常态常驻。不会执行。

    if(skill.type.includes('特殊')) return;
    if(skill.type.includes('攻击')) return;
    if(skill.tyle.includes('防御')) return;
    if(skill.type.includes('回复')) return;
}


//cost = maxSP*cost, cost是 n%
//costSP 具体值
export const SkillLib = {
    ['灵霄身法'] : {
        id: 1,
        name:"灵霄身法",
        des:"灵虚派的顶级身法。凌霄一跃，便是千里。",
        type: '被动：身法',  grade:10,
        ATKbuff: 0.2, DEFbuff: 0.3, SPDbuff: 1,
    },
    ['虚梦之境']:{
        id: 2,
        name:"虚梦之境",
        des:"庄周梦蝶，蝶梦周公。亦真亦幻，谁知真假？",
        type:"特殊：全体操控",  grade:9,
        action:"dream",
        rate:95,
        debuff:10,
        BP:300,
        costSP:100,
    },
    ['太虚剑法']:{
        id:3,
        name:"太虚剑法",
        des:"灵虚派创世人所涉及的顶级剑法。太虚一剑，破法万千。剑之所指，皆是虚空。",
        type:"攻击-全距离",  grade:10,
        ATKbuff:0.8,
        ATKRoll:[50,100],        
        BP:800,
        costSP:25,
    },
    ['天雷诀']:{
        id:4,
        name:"天雷诀",
        des:"消耗灵力1000，召唤天雷一道。",
        type:"全体攻击",  grade:9,
        ATK:5000,
        BP:1000,        
        costSP:1000,
    },
    ['灵泉之体']:{
        id:5,
        name:"灵泉之体",
        des:"灵泉之躯，以自身润泽万物。",
        type:"被动：体质",  grade:10,
        DEFbuff:0.2,
        SPDbuff:0.5,
        HPbuff:1,
        SPbuff:20,
    },
    ['天毒虚雾']:{
        id:6,
        name:"天毒虚雾",
        des:"天之毒，可吞噬万物根源。",
        type:"特殊：全体攻击",  grade:9,
        action:"tiandu",
        debuff:10,
        BP:500,
        costSP:100,
    },
    ['净化之风']:{
        id:7,
        name:"净化之风",
        des:"净玉扇的专属技能。玉扇一舞，净化一切污秽与邪念。",
        type:"特殊：范围攻击，范围-前排",  grade:5,
        action:"clear",
        ATK:100,
        BP:25,
        costSP:100,
    },
    ['天泉幻法']:{
        id:8,
        name:"天泉幻法",
        des:"路昀自己独创的水系攻击法术。",
        type:"单体攻击，全范围",  grade:5,
        ATKbuff:0.5,
        ATKRoll:[5,100],
        BP:200,
        costSP:50,
    },
    ['乾坤护体']:{
        id:9,
        name:"乾坤护体",
        des:"乾坤锁的专属技能。乾坤护体，无人能破。技能使用后对防御力大幅提升，持续到战斗结束。",
        type:"防御：护盾", grade:2,
        DEFbuff:1.2,
        BPbuff:0.2,
        cost:0.8,
    },
    ['烛龙邪火·残']:{
        id:10,
        name:"烛龙邪火·残",
        des:"即使是残级的烛龙邪火，也足够将大部分杂碎燃烧殆尽。",
        type:"范围攻击，范围-前排", grade:2,
        ATKRoll:[3,20],
        BP:15,
        cost:0.1,
    }
}

export const WeaponLib = {
    ['冷烟管剑']:{
        id:1,
        name:"冷烟管剑",
        des:"灵虚派掌门人时棂月的专属法器。 细剑藏匿于烟管之中，可攻可守。",
        type:"剑", grade:10,
        ATK:500,
        DEFbuff:0.3,
        skill:"天毒虚雾",
    },
    ['净玉扇']:{
        id:2,
        name:"净玉扇",
        des:"路昀的专属法器。扇收为剑，扇开为盾。可自由变换大小，十分万能。",
        type:"扇", grade:3,
        ATK:64,
        ATKbuff:0.5,
        DEFbuff:0.5,
        skill:"净化之风",
    },
    ['乾坤锁']:{
        id:3,
        name:"乾坤锁",
        des:"乾坤护体，无人能破。乾坤一锁，无物可逃。防御用法器，没多少攻击力。",
        type:"绳/锁", grade:2,
        ATK:1,
        DEF:5,
        DEFbuff:0.6,
        skill:"乾坤护体"
    },
    ['烛龙杖·残']:{
        id:4,
        name:"烛龙杖·残",
        des:"烛龙所留下的法杖。已经残破不剩多少法力。但依然带有一丝烛龙之息。",
        type:"杖", grade:2,
        SP: 20,
        ATKbuff:0.6,
        skill:"烛龙邪火·残",
    }

}