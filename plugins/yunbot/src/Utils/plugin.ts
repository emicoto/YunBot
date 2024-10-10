import { createHash } from "crypto";
import { Session, User } from "koishi";
import { bot } from "../Define";

export function setUsage(str, { daily }:Pick<User,'daily'>) {

	if (!daily.usage[str]) daily.usage[str] = 0;
	daily.usage[str]++;
	
	console.log(daily.usage);
}

export function getJrrp(uid:string){
	const lk = createHash('sha256')
	lk.update(uid)
	lk.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0))
	lk.update('908')

	let luck = Math.max(parseInt(lk.digest('hex'),16) % 101,1)

	return luck
}

export function txtp(str:string, arr:Array<any>){
	for(let i=0; i<arr.length; i++){
		let mask = '{'+i+'}'
		str = str.replace(mask,arr[i]).replace(mask,arr[i]).replace(mask,arr[i])
	}
	return str
}

export function waitTime(time:number){
	//console.log(bot.pf)
	if(bot.pf == 'onebot'){
		return time
	}
	else{
		time /= 5
		return Math.floor(time)
	}
}

export async function resetUsage(session:Session<'daily'>,usage:string, longterm?){
	const { daily } = session.user
	if(!daily.usage[usage]) return

	daily.usage[usage]--

	if(longterm){
		daily.stats.com = 'free'
		daily.stats.due = -1
	}
	
	await session.user.$update()
}