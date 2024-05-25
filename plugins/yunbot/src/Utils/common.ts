import { segment ,h} from "koishi"
import {sep,normalize,resolve} from "path";
import { readFileSync,existsSync } from "fs";
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
	return h("at", { id: uid });
}

export function getSegmentImage(url: string) {
	return h("image", { url });
}

export function getImagePath(paths: string) {
	const url = normalize(paths).split(sep).join("/");
	return pathToFileURL(url).toString();
}

export function ImgUrl(url){
	return h('image', { url: url})
}

export function faceicon(str:string) {
  return images(`Yun_${str}.png`);
}
export function getImage(filepath:string){
  const image = resolve(__dirname, `../data/images/${filepath}`);
  if (!existsSync(image)) {
    return null;
  }
  return `data:image/png;base64,${readFileSync(image,"base64")}`;
}
export function images(str:string) {
  return h("image", { url: getImage(str) });
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

export function isInvalid(str){
	return str.includes('[CQ:') || str.match(/((?=[\x21-\x7e]+)[^A-Za-z0-9])/) || str.match(/。|【|】|“|”|@|·|…/)
}
