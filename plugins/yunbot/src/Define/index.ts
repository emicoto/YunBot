// import { DatabaseService } from "koishi";
import { Today } from "./Today";
import { Yun} from "./Yun";
import DatabaseProvider from "koishi-plugin-dataview";
import {Database} from "koishi";

export * from "./Yun"
export * from "./Today"
export * from "./Game"
export * from "./Skill"
export * from "./Mind"
export * from "./Equip"
export * from './items'
export * from "./Init"

export const master: string = "1794362968"; //我
export const discord: string = "discord#832608774"
export const kook:string = 'kook#804622517'

export const yunbot: string = "QQ#185632406"; //小昀
export const senior: string = "QQ#1742029094"; // 周天
export const cleaner: string = "QQ#541084126"; //扫地僧
export const brother: string = "QQ#1632519382"; //好名
export const elder: string = "QQ#598139265"; //兰兰
export const pigeon: string = "QQ#1034826119"; //鸽子
export const onisan:string = "QQ#329939974" //摩多

export type category = 'weapon' | 'items' | 'equip' | 'skillbook' | 'mindsbook' | 'material'

export const Roles = {
    [master]:'master',
    [senior]:'senior',
    [cleaner]:'cleaner',
    [brother]:'brother',
    [elder]:'elder',
    [pigeon]:'pigeon',
    [discord]:'master',
    [kook]:'maseter',
    [onisan]:'onisan',
}


interface global{
    db?:Database<any,any,any>;
    pf?:string;//平台名

    temp:any; //暂存位

    a?:any; b?:any; c?:any;
    user?:any;

    //运行中的全局变量
    s?:Yun; v?:Today;
}
export var bot:global = { temp:null }

export const Authorized= {
    [master]:6,
    [discord]:6,
    [kook]:6,
    ['Alice']:5,
    [pigeon]:4,
    [onisan]:3,
    [senior]:3,
    [brother]:3,
    [elder]:3,
    [cleaner]:2,
}



if(!bot.s){
    Yun.load()
    Today.load()
    console.log('数据正在初始化……')
    setTimeout(() => {
        if(bot.s){
            console.log('数据初始化完毕。')
        }
    }, 2000);
}
