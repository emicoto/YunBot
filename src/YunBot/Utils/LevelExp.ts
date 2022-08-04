import { Context } from "koishi"
import { CoreLib, Game, getSoulBreakBuff, Today, Yun } from "../index"

//获取灵根和主功法对修炼加值
export function getExpBuff(data, mode?) {
  let type, chara;
  type = data.soul.match(/天/);
  chara = data.soul.match(/金|木|水|火|土/g);

  let list = [1.5, 1.25, 1, 0.8, 0.6];

  let buff = list[chara.length - 1];
  if (type) buff += 0.5;
  if (!mode && data.core?.id) {
    let coredata = CoreLib[data.core.name]
    let core = coredata.lvstats[data.core.level - 1];
    if (core?.Expbuff) buff += core.Expbuff;
  }

  return buff;
}

export function LevelExp(level){
    let x = 1/(1.4+(level/100))
    let a = Math.pow(level,x+1)
    let re = level*20 + Math.pow(level,3) + level * ( level > 10 ? a : 1.25)

    let y = 1+(level/100)
    if(level >= 40) re += Math.atan(0.05*(level-40))*5000000
    if(level > 10) re *= y
    
    return Math.floor(re/20)*20
}

export function expCount(getexp, data) {
  getexp *= LevelBuff(data.level) + Math.floor(data.level/10);
  getexp *= getExpBuff(data);

  return Math.floor(getexp+0.5);
}

export function LevelBuff(level){
return Math.pow(1.4,Math.floor(level/10)) 
}


export function EarnedExp(level){
  let exp = 0
  for(let i=0; i< level; i++){
    exp += LevelExp(i)
  }
  return exp
}

export function getBreakRate(data:Game|Yun, mode?, uid?) {
  let a,b,goal
  let luck;

  const { level } = data

  if (mode=='player') {
    let t = Today.get(uid);
    luck = t.luck;
  } else {
    //luck = s.getJrrp(s.yunbot);
  }

  a = (level/10);
  b = Math.pow((4/5),a);
  goal = Math.floor((b-0.1)*100+0.5);

  //计算灵根影响
  goal += Math.floor(goal * getSoulBreakBuff(data.soul) + (getSoulBreakBuff(data.soul) > 0 ? 0.5 : -0.5 ));

  goal += Math.floor(luck/20);

  //计算境界影响
  if(level%10==0) goal/= 2.1;

  if(data.flag?.breakbuff) goal += data.flag.breakbuff;
  
  return Math.max(Math.floor(goal+0.5),3)

}

export function breakProces(data){
  data.exp -= LevelExp(data.level);
  data.exp = Math.max(Math.floor(data.exp/3+0.5),0);
  data.level += 1;
  if(data.flag?.breakbuff) data.flag.breakbuff = 0
}