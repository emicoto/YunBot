import { segment } from "koishi"
import path from "path";
import fs from "fs";

export function writeFileSync(filename: string, data: string) {
	const _filename = path.resolve(__dirname, "../", filename);
	fs.writeFileSync(_filename, data);
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