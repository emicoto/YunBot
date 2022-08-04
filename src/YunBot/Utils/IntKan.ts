import { between } from "../index";

//将数字转换成汉字。 2002 = 二〇〇二
export function intChar(str: string) {
	const N = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
	let s = "";
	for (var i = 0; i < str.length; i++) {
	s += N[parseInt(str[i])];
	}
	return s;
}

//将数字转换成汉字。 34500 = 三万四千五百
export function intKan(i:number){
	const n = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
	const l = ["","","十","百","千","万","十万","百万","千万","亿",,"十亿","百亿","千亿","兆","十兆","百兆","千兆","京"]

	let str = "", num = Math.abs(i)
	let int = num.toString()
	
	if(i >= Math.pow(10,15)) return "过万兆";
	if(i <= -Math.pow(10,15)) return "负万兆";
	if(between(i,0,10)) return n[i]
	else{
		for(let c=0; c<int.length; c++){
			let num = parseInt(int[c])
			let val = int.length - c
			let last = parseInt(int[c-1])
			let left = parseInt(int.slice(c-1,int.length))

			if( num == 0 && last*Math.pow(10,val) == left ){
				break
			}
			else if( num==0 && last==0 ){
				continue
			}
			else if(num==0){
				str += n[num]
			}
			else{
				str += n[num]+l[val]
			}
		}
	}

	if(i<0) str = '负'+str;

	return str
}

//给数字加汉字单位来节省长度。 36000 = 3.6万。只精确到后面两位。
export function shortInt(int:number){
	const l = ["万","百万","亿","百亿","兆","百兆"]
	let str = int.toString()

	if(between(int,0,999) ) return str;
	if(between(int,1000,9999)){
		return `${Math.floor(int/1000)}.${str.slice(1,3)}千`
	}

	for(let i=0; i<l.length; i++){
		let min = Math.pow(10,4+i*2)
		let max = Math.pow(10,6+i*2)-1
		let left = (int%min).toString()
		let head = Math.floor(int/min)

		if(between(int,min,max)){
			if(int%min == 0) return `${head}${l[i]}`;
			return `${head}.${left.slice(0,2)}${l[i]}`
		}
	}

	return '过万兆'
}