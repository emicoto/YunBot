import { Context, Session } from "koishi";
import fs from "fs";
import { createHash } from "crypto";
import { compare, EarnedExp } from "./Function";
import path from "path";
export * from "@koishijs/plugin-rate-limit"

export class TodayData {
  constructor(day: Date) {
    this.month = day.getMonth() + 1;
    this.day = day.getDate();
    this.genTime = day.toLocaleString();

    this.yunwork = 0;
    this.userwork = 0;
    this.yunbreak = 0;
    this.rank = [];
    this.luckrank = [];

    this.user = {};
  }
}

declare module 'koishi'{
  interface User{
    nick: string;
    onebot: string;
    YunData: UserData;
  }
  interface Tables{
    YunSave: UserData
  }

  namespace Command{
    interface Config{
      ignore?: boolean;
    }
  }
}

export var yunstate: YunState;
export var usertoday: TodayData;
export const master: string = "1794362968"; //师父我
export const yunbot: string = "185632406"; //小昀
export const senior: string = "1742029094"; // 周天
export const cleaner: string = "541084126"; //扫地僧
export const brother: string = "1632519382"; //好名
export const elder: string = "598139265"; //兰兰
export const pigeon: string = "1034826119"; //鸽子

if (!yunstate) {
  yunstate = getYunData();
  usertoday = getUsertoday();

  console.log("数据同步中……");
  setTimeout(() => {
    yunstate.mood = getMood();
    yunsave();
  }, 2000);
}

export interface TodayData {
  month: number;
  day: number;
  genTime: string;

  yunwork: number;
  yunbreak: number;
  userwork: number;
  rank: Array<any>;
  luckrank: Array<any>;
  lvrank: Array<any>
  
  user: any;
}

export interface UserData {
  name: string;  nick:string;
  title: string;

  money: number;
  favo: number;   trust: number;

  luck: number;   lastluck: number;
  lastroll: string;


  level: number;   exp: number;
  soul: string;

  HP: number;   maxHP: number;
  SP: number;   maxSP: number; 
  AP: number;   maxAP: number;
  BP: number;

  ATK: number;   DEF: number;   SPD: number;

  mine: number;  medicine: number;
  plant:number;  search:number;
  smith:number;

  equip: any;   items: any;
  skill: any;  core: any;

  storage: Array<any>;
  titles: string[];
  farm: any;
  flag: any;
}

export class UserData {
  constructor() {
    this.name = "",    this.nick = "",
    this.title = "";

    this.money = 100;
    this.favo = 0;    this.trust = 0;
    this.luck = 0;    this.lastluck = 0;
    this.lastroll = "";

    this.level = 1;    this.exp = 0;
    this.soul = "金木水火土";

    this.HP = 30;    this.maxHP = 30;
    this.SP = 10;    this.maxSP = 10;    
    this.AP = 8;     this.maxAP = 8;
    this.BP = 5;

    this.ATK = 5;  this.DEF = 5;  this.SPD = 5;

    this.mine = 5;    this.medicine = 5;
    this.plant = 5;    this.search = 5;
    this.smith = 5;

    this.skill = [];    this.core = {};

    this.equip = { weapon: {}, head:{}, dress:{}, shoes:{}, neck:{}, hands:{}, waist:{} };

    this.items = {};    this.storage = [];
    this.titles = [];    this.farm = {};    this.flag = {};
  }
}

export interface UserToday {
  luck: number; //jrrp
  sign: boolean; //签到
  roll: number; //骰点次数
  daily: any; //每日任务
  kuji: any; //每日一签
  flag: any; //一些临时flag
  usage: any; //指令使用次数
}

export class UserToday {
  constructor() {
    this.sign = false;
    this.roll = 0;
    this.daily = {};
    this.flag = {};
    this.usage = {};
    this.kuji = {};
    this.luck = -1;
    this.usage = {};
  }
}

interface UserDaily {
  work: number; //打工次数
  gift: number; //送礼次数
  talk: number; //聊天事件触发次数
  clean: number; //打扫次数
  go: boolean; //每日历练
}

export interface YunState {
  level: number;  exp: number;

  soul: string;
  talent: string[];

  mood: number;
  title: string;
  money: number;

  HP: number;  maxHP: number;
  SP: number; maxSP: number;  
  AP: number; maxAP: number;
  san: number; maxsan: number;
  BP: number;

  ATK: number; DEF: number; SPD: number;
  core: any;
  equip: any;
  skill: Array<any>;
  items: any;

  stats: string;

  shops: Array<any>;
  work: number;
  flag: any;
}

export function __extend(ctx) {
  ctx.model.extend("user", {
    YunData: "json",
    nick: "string",
  });
  ctx.model.extend("YunSave",{
    id:"unsigned",
    qid:"string",
    nick:"string",
    name:"string",
    favo:"number",
    trust:"number",
    money:"number",
    chara:"json",
    items:"json",
    storage:"list",
    upgrade:"json",
    farm:"json",
    flag:"json",
    combat:"json",
    signed:"boolean"
  })

}

export function getYunData() {
  if (!yunstate) {
    fs.readFile("Yunstate.json", "utf-8", (err, data) => {
      if (!data) return;
      if (err)
        throw new Error("error occured while reading file:Yunstate.json");
      yunstate = JSON.parse(data.toString());
      //console.log("getYunState:", yunstate);
    });
  }
  if (yunstate) {
    yunstate.mood = getMood();
    return yunstate;
  }
}

export function getUsertoday() {
  let timetick = new Date();
  if (!usertoday) {
    fs.readFile("usertoday.json", "utf-8", (err, data) => {
      if (!data) return;
      if (err)
        throw new Error("error occured while reading file:usertoday.json");
        usertoday = JSON.parse(data.toString());

      if (
        usertoday.day != timetick.getDate() ||
        usertoday.month != timetick.getMonth() + 1
      ) {
        NewToday();
      }

      if (usertoday && !usertoday?.user[master]) {
        usertoday.user[master] = new UserToday();
      }
      //console.log("getUsertoday:", usertoday);
    });
  }
  if (usertoday) return usertoday;
}

export function NewToday() {
  let timetick = new Date();
  usertoday = new TodayData(timetick);
  yunstate.mood = getMood();
  yunstate.AP = yunstate.maxAP
}

export function getMood() {
  const hash = createHash("sha256");
  hash.update("185632406");
  hash.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0));
  hash.update("6688");

  let val = Math.max(parseInt(hash.digest("hex"), 16) % 101, 1);
  yunstate.mood = val;
  yunsave();
  return val;
}
function writeFileSync(filename: string, data: string) {
  const _filename = path.resolve(__dirname, "../", filename);
  //console.log("保存路径：" + _filename);

  fs.writeFileSync(_filename, data);
}

export async function yunsave() {
  const data1 = JSON.stringify(yunstate);

  writeFileSync("Yunstate.json", data1);

  const data = JSON.stringify(usertoday);
  writeFileSync("usertoday.json", data);

  //console.log("成功保存");
}


export function saveToday() {
  const data = JSON.stringify(usertoday);
  fs.writeFileSync("usertoday.json", data);
}

export async function getUserNamebyId(ctx: Context, uid:string) {
  let data = await ctx.database.getUser('onebot',uid)

  if(data?.name){
      return data.name
  }

}

export async function makeRank(ctx: Context) {
  const data = await ctx.database.get("user", null);
  let rank = [];
  let luck = [];
  let level = [];

  for (let i in data) {
    if (data[i]["YunData"]?.level) {
      let chara = data[i]["YunData"]
      rank[i] = { bp: chara.BP, atk:chara.ATK , def:chara.DEF , spd: chara.SPD, user: data[i]["name"] };
      level[i] = { level: chara.level, exp: EarnedExp(chara.level-1)+chara.exp ,user: data[i]['name']};
    }
  }

  let c = 0
  for(let i in usertoday.user){
    if(i && usertoday.user[i]?.luck){
      let name = await getUserNamebyId(ctx,i)
      luck[c] = { luck: usertoday.user[i].luck, user: name}
    }
    c++
  }

  rank.sort(compare("bp"));
  luck.sort(compare("luck"));
  level.sort(compare("exp"));
  level.sort(compare("level"))

  rank = rank.slice(0,11)
  level = level.slice(0,11)
  luck = luck.slice(0,11)

  usertoday["rank"] = rank;
  usertoday["luckrank"] = luck;
  usertoday['lvrank'] = level;
}

export async function getUser(ctx: Context, uid: string): Promise<UserData> {
  let data, user;

  data = await ctx.database.getUser("onebot", uid);

  if (!data.YunData?.flag?.signed) {
    user = new UserData();
    data.YunData = user;
  }

  //将名字信息更新到修仙档案中。
  if ( data.YunData.name !== data.name || data.YunData.nick !== data.nick ) {
    data.YunData.name = data.name;
    data.YunData.nick = data.nick;
  }

  user = data.YunData;
  await setUser(ctx, uid, user);

  return user;
}

export async function newUser(ctx: Context, uid: string): Promise<UserData> {
  let data;

  data = await ctx.database.getUser("onebot", uid);
  data.YunData = new UserData();

  await setUser(ctx, uid, data.YunData);
  return data.YunData;
}

export async function setUser(ctx: Context, uid: string, data) {
  await ctx.database.set("user", { onebot: uid }, { YunData: data });
}

export async function getUserName(ctx: Context, session: Session) {
  let user, name;

  user = await ctx.database.getUser(session.platform, session.userId);

  if (user.name && user.name.length >= 1) name = user.name;
  if (user.nick && user.nick.length >= 1) name = user.nick;

  if (!name) {
    name = session.author.nickname;
    if (!name) name = session.author.username;
    await ctx.database.setUser(session.platform, session.userId, {
      name: name,
    });
  }

  return name;
}

export function getName(data) {
  if (data.nick && data.nick.length >= 1) return data.nick;
  return data.name;
}

export async function setFavo(ctx: Context, uid: string, val: number) {
  let data = await getUser(ctx, uid);

  data["favo"] += val;
  console.log("好感变化", data["favo"]);

  await setUser(ctx, uid, data);
}

export async function setTrust(ctx: Context, uid: string, val: number) {
  let data = await getUser(ctx, uid);

  data["trust"] += val;
  console.log("信赖变化", data["trust"]);

  await setUser(ctx, uid, data);
}

export function getToday(uid: string): UserToday {
  if (!usertoday.user[uid]) {
    usertoday.user[uid] = new UserToday();
    saveToday();
  }
  return usertoday.user[uid];
}
