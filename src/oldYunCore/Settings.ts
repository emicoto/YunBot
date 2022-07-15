import{ Context, segment, Bot } from "koishi"
import fs from 'fs'

export interface UserData {
    id: number    ;
    name: string;
    nick: string;
    money: number;
    favo: number;

    luck: number;
    lastluck: number;
    lastroll: string;

    HP: number; //生命值;
    BP: number; //战斗力;
    exp: number;
    level: number;

    items: Array<userItems>;
    skill: Array<userSkill>;
}

export interface userItems {
    id: number;
    name: string;
    count: number;
}

export interface userSkill {
    id:number;
    name:string;
    level:number;
    exp:number;
}

export interface IYunState {
    level: number;
    exp: number;
    money:number;

    mood:number;
    sanity:number;

    working: boolean;
    gaming: boolean;
    sleeping: boolean;

    acount: number;

    sales: Array<SalesItem>;
}

export interface SalesItem {
    id: number;
    name: string;
    count: number;
    cost: number;
    seller: string;
}

export interface Today{
    roll: number;
    lastcall: string; //date = Date.parse('04 Dec 1995 00:12:00 GMT');
    luck: number;
}

export interface Keywords{
    id: number;
    name: string;
    group: Array<string>;
}

export interface Items{
    id: number;
    name: string;
    type: string;
    cost: number;
    desc: string;

    author: string;
    tips?: string;
}

export interface Skillbook{
    id: number;
    name: string;
    type: string;

    req_level: number;   
    cost_exp: number;
    cost: number;
    level: number;
    maxlevel: number;
    req_exp: Array<number>;
    addBP: Array<number>;

    desc: string;
    author: string;
    tips?: string;
}


export default class YunBot {
    static instance:YunBot;
    static Yunstate:IYunState;
    static Usertoday:Today;

}

export var Yunstate, Usertoday
export var timetick = new Date()

export function initData(){
    fs.readFile('usertoday.json','utf-8',(err,data)=>{
        if(err){
            throw err;
        }
        Usertoday = JSON.parse(data.toString());
        if(Usertoday.Date.day != timetick.getDate() && Usertoday.Date.month != timetick.getMonth()){
            NewToday();
            SaveToday();
        }
        if(!Usertoday["1794362968"]){
            
        }
        console.log("Usertoday:",Usertoday)
    })
}

export function NewToday(){
    Usertoday = {
        Date:{
            month: timetick.getMonth(),
            day: timetick.getDate()
        }
    }
}

export function SaveToday(){
    const data = JSON.stringify(Usertoday)
    fs.writeFileSync('usertoday.json',data)
}


export function __extend(ctx){
    ctx.model.extend("keywords",{
        id:"unsigned",
        name:"string",
        group:"list"
    })

}