import { segment } from "koishi"
import path from "path";
import { pathToFileURL } from "url";
import { bot } from "../Define";


declare global{
	interface Math{
		clamp(number1:number, min:number, max:number):number
	}
}

export function copy(data){
	return JSON.parse(JSON.stringify(data))
}

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

Math.clamp = (num, min, max)=>{
	return Math.min( Math.max(num, min), max)
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

export function getSegmentImage(url: string) {
	return segment("image", { url });
}

export function getImagePath(paths: string) {
	const url = path.normalize(paths).split(path.sep).join("/");
	return pathToFileURL(url).toString();
}

export function ImgUrl(url){
	return segment('image', { url: url})
}

export function faceicon(str:string) {
  let path ;

  if(bot.pf == 'discord'){
	path = `file://H:/_Yunbot/data/images/Yun_${str}.png`
  }else{
	path = `file:///H:/_Yunbot/data/images/Yun_${str}.png`
  }

  return segment("image", { url: path });
}

export function images(str:string) {
  let path;

  if(bot.pf == 'discord'){
	path = `file://H:/_Yunbot/data/images/${str}`
  }else{
	path = `file:///H:/_Yunbot/data/images/${str}`
  }

  return segment("image", { url: path });
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


export function slicer(arr:Array<any>, id){
	let get = arr.splice(id,1)
	return get
}

export function Roll(times:number, max:number) {
	let re
	
	re = {
		roll: [],
		result: 0,
		bonus: 0,
	};

	for (let i = 0; i < times; i++) {
		let r = random(1, max);
		re.roll[i] = r;
		re.result += r;
		if (r == max) re.bonus++;
	}

	re.roll = re.roll.join()

	return re;
}

export function printTime(t){
	let sec = Math.floor(t/1000)
	let min=0, hour=0

	while(sec>=60){
		sec -=60
		min +=1
		if(min>=60){
			hour +=1
			min -=60
		}
	}
	return `${ hour>0 ? hour+'时' : ""}${ min>0 ? min+'分' : "" }${sec}秒`
}