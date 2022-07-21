export {
    Sample, CoreLib
}

const Sample = {
        id:0,
        name:"无",
        type:"被动/攻击/防御/恢复",
        ATK:0,
        DEF:0,
        BP:0,
        ATKRoll:0,
        SPDRoll:0,
        recover:0,
        sp:0,
        ATKbuff:0,
        DEFbuff:0,
        BPbuff:0
}

const CoreLib = {
    ['虚月心法'] :{
        id: 1,  name: '虚月心法',
        des: "灵虚派创始人 时月为了适配自身的灵根与灵脉，特意设计的独门心法。主修速度与精神。",
        grade:10, level:1, exp: 0, maxlevel:10,
        lvstats:[
            {ATKbuff:0.15, DEFbuff:0.12, SPDbuff:0.70, HPbuff:0.15, SPbuff:1.00, Expbuff: 3.4},
            {ATKbuff:0.20, DEFbuff:0.14, SPDbuff:0.75, HPbuff:0.20, SPbuff:1.10, Expbuff: 3.6},
            {ATKbuff:0.25, DEFbuff:0.16, SPDbuff:0.80, HPbuff:0.25, SPbuff:1.15, Expbuff: 3.7},
            {ATKbuff:0.30, DEFbuff:0.18, SPDbuff:0.85, HPbuff:0.30, SPbuff:1.20, Expbuff: 3.8},
            {ATKbuff:0.35, DEFbuff:0.20, SPDbuff:0.90, HPbuff:0.35, SPbuff:1.25, Expbuff: 4.0},
            {ATKbuff:0.40, DEFbuff:0.22, SPDbuff:0.95, HPbuff:0.40, SPbuff:1.30, Expbuff: 4.2},
            {ATKbuff:0.45, DEFbuff:0.24, SPDbuff:1.00, HPbuff:0.45, SPbuff:1.35, Expbuff: 4.4},
            {ATKbuff:0.50, DEFbuff:0.26, SPDbuff:1.10, HPbuff:0.50, SPbuff:1.40, Expbuff: 4.6},
            {ATKbuff:0.55, DEFbuff:0.28, SPDbuff:1.15, HPbuff:0.55, SPbuff:1.45, Expbuff: 4.8},
            {ATKbuff:0.60, DEFbuff:0.30, SPDbuff:1.20, HPbuff:0.60, SPbuff:1.50, Expbuff: 5.0},
        ],
    },
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
        ],
    },
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
        ]
    },
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
        ]
    }
}