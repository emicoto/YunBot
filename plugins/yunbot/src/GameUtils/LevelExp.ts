import { random, Game, Yun, between, getJrrp, Soul  } from "../unit";

//获取经验
export function getTrainExp(level:number, luck:number, min:number, max:number){
    let next = LevelExp(level);
    let len = next.toString().length
    let pmax = 100 - level

    let r = random(1, pmax)
    let p = (len <= 3 ? 1000 : between(len,4,6) ? 10000 : 100000)

    let per = (r+luck/2)/p * (level > 40 ? 0.2 : 1)

    console.log('获取经验：百分比',per,next*per)

    return Math.max(next*per, random(min,max))
}


//等级需求经验
export function LevelExp(level:number){
	let x = 1/(1.4+(level/100))
	let a = Math.pow(level,x+1)
	let re = level*20 + Math.pow(level,3) + level * ( level > 10 ? a : 1.25)

	let y = 1+(level/100)
	if(level >= 40) re += Math.atan(0.05*(level-40))*5000000
	if(level > 10) re *= y
	
	return Math.floor(re/20)*20
}

//计算经验获取值
export function expCount(getexp:number, data:Game|Yun) {
	getexp *= expLevelBuff(data.level) + Math.floor(data.level/10);
	getexp *= data.flag.expbuff; //心法、装备、灵根等对经验的总加成
	getexp *= getINTbuff(data.INT);

	return Math.floor(getexp+0.5);
}

export function LevelBuff(level:number){
	return Math.pow(1.25,Math.floor(level/10)) 
}

export function expLevelBuff(level:number){
	return Math.pow(1.4,Math.floor(level/10))
}


export function TotalExp(level:number){
	let exp = 0
	for(let i=0; i< level; i++){
		exp += LevelExp(i)
	}
	return exp
}

export function getBreakRate(data:Game|Yun, uid:string) {
	const { level } = data
	const soulinfo = new Soul(data.soul)
	const luck = getJrrp(uid);

	let a = (level/10)
	let b = Math.pow((4/5),a)
	let goal = Math.floor((b-0.1)*100+0.5);

	//计算灵根影响
	goal += goal * soulinfo.breakbuff;

	//计算悟性影响
	goal += ( data.INT > 40 ? (data.INT-20)/20 :  -data.INT/20 )

	//计算幸运影响
	goal += Math.floor(luck/20);

	//计算境界影响
	if(level%10==0) goal/= 2.1;

	if(data.flag?.breakbuff) goal += data.flag.breakbuff;
	if(data.flag?.equipBreak) goal += data.flag.equipBreak;
	
	return Math.max(Math.floor(goal+0.5),3)

}

export function breakProces(data){
	data.exp -= LevelExp(data.level);
	data.exp = Math.max(Math.floor(data.exp/3+0.5),0);
	data.level += 1;
	if(data.flag?.breakbuff) data.flag.breakbuff = 0
}


export function getINTbuff(INT:number){
	if(INT <= 30) return 0.75;
	if(INT <= 40) return 0.8;
	if(INT <= 50) return 0.9;
	if(INT <= 60) return 1;
	if(INT <= 70) return 1.05;
	if(INT <= 80) return 1.1;
	if(INT <= 90) return 1.15;
	if(INT <= 100) return 1.2;
}

export function getWILbuff(WIL:number){
	if(WIL <= 30) return 0.6;
	if(WIL <= 40) return 0.75;
	if(WIL <= 50) return 0.9;
	if(WIL <= 60) return 1;
	if(WIL <= 70) return 1.05;
	if(WIL <= 80) return 1.1;
	if(WIL <= 90) return 1.15;
	if(WIL <= 100) return 1.2;
}

export function getLuckBuff(luck:number){
	if(luck <= 10) return 0.3;
	if(luck <= 20) return 0.5;
	if(luck <= 30) return 0.7;
	if(luck <= 40) return 0.8;
	if(luck <= 50) return 0.9;
	if(luck <= 60) return 1;
	if(luck <= 70) return 1.05;
	if(luck <= 80) return 1.1;
	if(luck <= 90) return 1.15;
	if(luck <= 100) return 1.25;
}