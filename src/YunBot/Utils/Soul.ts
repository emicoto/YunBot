import { getExpBuff } from "../index"

export function getSoulBreakBuff(str){
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

	return 0
}

export function getSoulInfo(str) {
	let type, chara, count;
	type = str.match(/天/);
	chara = str.match(/金|木|水|火|土/g);
	count = chara.length;

	let info = {
	t: false,
	chara: chara,
	count: count,
	expbuff:getExpBuff(str,1),
	breakbuff:getSoulBreakBuff(str),
	buff:{
		
	}
	};

	if (type) info.t = true;

	return info;
}

export function printSoul(str:string):string{
	let type = str.includes('天');
	let chara = str.match(/金|木|水|火|土/g) ?? [""];

	let list = ["单", "双", "三", "杂", "杂"];

	let text = chara.join("") ?? "";

	if (!type) text += ` · ${list[chara.length - 1]}灵根`;
	else text = `${type} · ${text}灵根`;

	return text;
}