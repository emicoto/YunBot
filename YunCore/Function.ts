//功能函数

import { Context, segment} from "koishi";
import { getJrrp } from "./getluck";
import * as s from "./Setting";

export function between(int: number, a: number, b: number) {
  return int >= a && int <= b;
}

export function random(min: number, max?: number) {
  if (!max) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function fixed(int, a?) {
  if (!a) a = 2;
  return parseFloat(int.toFixed(a));
}

export function either(arr: Array<any>) {
  let max = arr.length;
  let i = random(1, max) - 1;
  return arr[i];
}

export function At(uid: string) {
  return segment("at", { id: uid });
}

export function faceicon(str) {
  let path = `file:///H:/_Yunbot/data/images/Yun_${str}.png`;
  return segment("image", { url: path });
}

export function images(str) {
  let path = `file:///H:/_Yunbot/data/images/${str}`;
  return segment("image", { url: path });
}

export function include(str, arr) {
  for (let i in arr) {
    if (str.includes(arr[i])) {
      return true;
    }
  }
  return false;
}

export function gmatch(a, arr: Array<any>) {
  for (let i in arr) {
    if (a === arr[i]) return true;
  }
  return false;
}

export function maybe(arr: Array<any>) {
  let txt;
  arr.forEach((v, i) => {
    if (random(100) < v[1]) txt = v[0];
  });

  if (!txt) {
    return arr[0][0];
  }
  return txt;
}

export function compare(key) {
  return function (m, n) {
    let a = m[key];
    let b = n[key];
    return b - a;
  };
}

export function Roll(times, max) {
  let re = {
    roll: null,
    result: 0,
    bonus: 0,
  };
  
  re.roll = []

  for (let i = 0; i < times; i++) {
    let r = random(1, max);
    re.roll[i] = r;
    re.result += r;
    if (r == max) re.bonus++;
  }

  re.roll = re.roll.join()

  return re;
}

export function intoChar(str: string) {
  const N = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  let s = "";
  for (var i = 0; i < str.length; i++) {
    s += N[parseInt(str[i])];
  }
  return s;
}

export function getShichen() {
  const gan = [
    "子",
    "丑",
    "寅",
    "卯",
    "巳",
    "午",
    "未",
    "申",
    "酉",
    "戌",
    "亥",
  ];
  const ke = ["一", "二", "三", "四", "五", "六", "七", "八"];

  let now = cnTime();

  let h = Math.floor(now.getHours() / 2);
  let m = Math.floor(now.getMinutes() / 15);

  let s = gan[h] + "时";

  if (h % 2 === 0) {
    s += ke[m];
  } else {
    s += ke[m + 4];
  }

  return s + "刻";
}

export function cnTime() {
  var cn = new Date().toLocaleString("jpn", { timeZone: "Hongkong" });
  var cntime = new Date(cn);
  return cntime;
}

export function ComUsage(utoday: s.UserToday, str: string, limit: number) {
  if (!utoday.usage[str]) utoday.usage[str] = 0;
  if (utoday.usage[str] >= limit) return false;
  //console.log(utoday.usage)
  return true;
}

export function CountUsage(uid: string, str: string) {
  let today = s.getToday(uid);
  if (!today.usage[str]) today.usage[str] = 0;
  today.usage[str]++;
  console.log(today.usage);
  s.saveToday();
}

export function getLevelChar(lv) {
  let level = [
    "炼心",
    "破幻", //10+
    "灵动", //20+
    "开元", //30+
    "结丹", //40+
    "解灵", //50+
    "归一", //60+
    "通天", //70+
    "大乘", //80+
    "真仙", //90+
  ];
  let char = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  lv = Math.min(lv - 1, 100);

  let m = Math.min(Math.floor(lv / 10), 8);
  let i = lv % 10;

  let t = `${char[i]}阶`;

  if (lv == 90) {
    t = "大圆满";
  }

  let text = `${level[m]} ${t}`;
  return text;
}

export function expLevel(level){
    let x = 1/(1.4+(level/100))
    let a = Math.pow(level,x+1)
    let re = level*20 + Math.pow(level,3) + level * ( level > 10 ? a : 1.25)

    let y = 1+(level/100)
    if(level >= 40) re += Math.atan(0.05*(level-40))*5000000
    if(level > 10) re *= y
    
    return Math.floor(re/20)*20
}


export async function getBreakRate(ctx: Context, uid: string, mode?) {
  let a,b,goal
  let data, today, luck, level;

  if (!mode) {
    data = await s.getUser(ctx, uid);
    today = s.getToday(uid);
    luck = today.luck;
    level = data.level;
  } else {
    data = s.yunstate;
    luck = getJrrp(s.yunbot);
    level = s.yunstate.level;
  }

  a = (level/10);
  b = Math.pow((4/5),a);
  goal = Math.floor((b-0.1)*100+0.5);

  //计算灵根影响
  goal += Math.floor(goal*getSoulBreakBuff(data.soul)+( getSoulBreakBuff(data.soul) > 0 ? 0.5 : -0.5 ));

  goal += Math.floor(luck/20);

  //计算境界影响
  if(level%10==0) goal/= 2.1;

  if(data.flag?.breakbuff) goal += data.flag.breakbuff;
  
  return Math.max(Math.floor(goal+0.5),3)

}

export function getTimeZone(hour) {
  if (between(hour, 2, 4)) return "凌晨";
  if (between(hour, 5, 7)) return "黎明";
  if (between(hour, 8, 10)) return "上午";
  if (between(hour, 11, 13)) return "中午";
  if (between(hour, 14, 16)) return "下午";
  if (between(hour, 17, 19)) return "傍晚";
  if (between(hour, 20, 22)) return "晚上";
  return "深夜";
}

//获取灵根和主功法对修炼加值
export function getExpBuff(data, mode?) {
  let type, chara;
  type = data.soul.match(/天/);
  chara = data.soul.match(/金|木|水|火|土/g);

  let list = [1.5, 1.25, 1, 0.8, 0.6];

  let buff = list[chara.length - 1];
  if (type) buff += 0.5;
  if (!mode && data.core?.id) {
    let core = data.core.lvstats[data.core.level - 1];
    if (core?.Expbuff) buff += core.Expbuff;
  }

  return buff;
}

//获取灵根加值
export function getSoulBuff(str) {
  let type, chara, count, buff;
  type = str.includes("天");
  chara = str.match(/金|木|水|火|土/g);
  count = chara.length;

  switch (count) {
    case 1:
      buff = 1.05;
      break;
    case 2:
      buff = 0.5;
      break;
    case 3:
      buff = 0.3;
      break;
    case 4:
      buff = 0.2;
      break;
    case 5:
      buff = 0.1;
      break;
  }
  if (type) buff *= 1.5;

  let result = {
    HP:
      (chara.includes("木") ? buff : 0) +
      (chara.includes("水") ? buff * 0.3 : 0),
    SP:
      (chara.includes("水") ? buff : 0) +
      (chara.includes("金") ? buff * 0.3 : 0),

    ATK:
      (chara.includes("火") ? buff : 0) +
      (chara.includes("木") ? buff * 0.3 : 0),
    DEF:
      (chara.includes("土") ? buff : 0) +
      (chara.includes("火") ? buff * 0.3 : 0),
    SPD:
      (chara.includes("金") ? buff : 0) +
      (chara.includes("土") ? buff * 0.3 : 0),
  };
  return result;
}

function getSoulBreakBuff(str){
    let count,type
    count = str.match(/金|木|水|火|土/g).length
    type = str.includes("天")

    if(type) return 0.12
    else{
        switch(count){
            case 1:
                return 0.1
            case 2:
                return 0.06
            case 3:
                return 0
            case 4:
                return -0.06
            case 5:
                return -0.1
        }
    }
}

export function printSoul(str) {
  let type, chara, text;
  type = str.match(/天/);
  chara = str.match(/金|木|水|火|土/g);

  let list = ["单", "双", "三", "杂", "杂"];

  text = chara.join("");

  if (!type) text += ` · ${list[chara.length - 1]}灵根`;
  else text = `${type} · ${text}灵根`;

  return text;
}

export function LevelBuff(level){
return Math.pow(1.4,Math.floor(level/10)) 
}

export function expCount(getexp, data) {
  getexp *= LevelBuff(data.level) + Math.floor(data.level/10);
  getexp *= getExpBuff(data);

  return Math.floor(getexp+0.5);
}

export function getSoulInfo(str) {
  let type, chara, count;
  type = str.match(/天/);
  chara = str.match(/金|木|水|火|土/g);
  count = str.replace("天", "").length();

  let info = {
    t: false,
    chara: chara,
    count: count,
  };

  if (type) info.t = true;

  return info;
}
