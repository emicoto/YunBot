declare module 'koishi'{
	interface Tables{
		YunSave: UserData
	}

	interface User{
		nick: string;
		onebot: string;
	}
}

export interface TodayData{
	month: number; day: number; genTime: string;

	cnDay: number; cnMonth: number; cnGenTIme:string;
		
	yunwork:number;
	yunbreak:number;
	userwork:number;

	rank: Array<any>; luckrank: Array<any>;
	lvrank: Array<any>;

	user:any;
}

export interface UserData{
	id: any;  qid:string;
	name:string;  nick:string;
	title:string;

	money:number;
	trust:number; favo:number;

	chara:CharaStatus;

	items:any; storage:Array<any>;
	upgrade:any;
	farm:any;
	cflag:any;
	flag:any;
}

export interface CharaStatus{
	level:number;  exp:number;
	soul:string;
		
	HP:number; maxHp:number;
	SP:number; maxSP:number;
	AP:number; maxAP:number;

	ATK:number; DEF:number; SPD:number;
	core:any;
	skill:string[];
	equip:any;
}

export interface YunData {
	name: string; nick:string;
	title:string;

	money:number;
	chara:CharaStatus;
	items: any;
	upgrade:any;
	combat:any;
	flag:any;
	shops:any;

	stats:string;
}