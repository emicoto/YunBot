import { between, copy, Game, getLuckBuff, random, Roll } from "../unit";
export type situation = 'A>>B' | 'B>>A' | 'A~=~B' | 'A>B' | 'B>A' | ''

export interface compare {
	rdv:number;
	abl:number;
	ar:number;
	br:number;
	dv:number;
	dp:number;
	re:situation;
}
export class Combat{
	player:Game; target:Game;

	plv:number; tlv:number; //等级
	plk:number; tlk:number; //幸运

	pn:string; tn:string; //人物名字
	pwn:string; twn:string; //武器名字

	constructor(player:Game, target:Game){
		this.player = player;
		this.target = target;

		this.pn = player.name;
		this.tn = target.name;

		this.plv = player.level;
		this.tlv = target.level;
		this.plk = player.luck;
		this.tlk = target.luck;

		this.pwn = player.equip.weapon.name

	}

	getleft(num:number,p:number, rdv:number, abl:number){
		return Math.floor(
				num/Math.pow(10,p) * ( rdv <= 1 && abl > 3 ? 10 : 1)
			+0.5)
	}

	compare(a:number, b:number){
		const al = a.toString().length
		const bl = b.toString().length
		const p = (al > bl ? bl : al)-1

		const abl = al+bl
		const rdv = Math.abs(al-bl)
		const ar = this.getleft(a,p,rdv,abl)
		const br = this.getleft(b,p,rdv,abl)
		const dv = Math.abs(a-b)
		const dp = a/b

		const re:compare = {
			rdv: rdv, //位数差
			abl:abl, //长度和
			ar: ar, //剩余值A
			br: br, //剩余值B
			dv: dv, //绝对差
			dp: dp, //比例差
			re:'',
		}

		 if (this.isBiger(rdv, a, b, abl, ar, br) ){
			re.re = 'A>>B'
		 }
		 else if (this.isBiger(rdv, b, a, abl, br, ar)){
			re.re = 'B>>A'
		 }
		 else if( abl <= 4 && dv <= 15 || between(abl,5,6) && Math.abs(ar-br) <= 10 || abl>6 && Math.abs(ar-br) <= 6){
			re.re = 'A~=~B'
		 }
		 else{
			if(a > b){
				re.re = 'A>B'
			}
			else{
				re.re = 'B>A'
			}
		 }

		return re
	}

	isRealmSP(x:number, y:number , a:number, b:number){
			return x - y >= 20 && a/b >= 1.2
	}

	isBiger(rdv, a, b, abl, ar, br){
		return ( rdv >= 2 && a > b ) || ( between(abl, 5,6) && ar-br > 50) || ( abl >= 7 && ar-br > 33)
	}

	checkCritical(luck){
		const chance = random(1,100) * getLuckBuff(luck)
		const check = random(1,100) - (luck/12)

		if( check <= Math.max(chance/5,1)) return 3
		else if( check <= Math.max(chance/3,1)) return 2
		else if ( check <= Math.max(chance/2,1)) return 1

		return 0
	}

	checkhit(a,b,alk,blk){
		const info = this.compare(a,b)
		const { dp ,re, dv, ar, br } = info
		let chance = Math.floor(dp*100) + alk/10
		let hit = false
		let fb = false
		console.log(re)

		if(re == 'A>>B'){
			hit = true
			return { hit, re}
		}

		if(re == 'B>>A'){
			hit = false;
			fb = (random(100) < 80 )
			return { hit, re, fb}
		}

		if(re=='A~=~B'){
			const ra = Roll(4,6).result + (dv <= 12 ? a/2 : ar/2)
			const rb = Roll(3,6).result + (dv <= 12 ? b/2 : br/2) - random(1,5)
			console.log('roll',ra,rb)

			hit = (ra + alk/10 >= rb + (blk ? blk/12 : 0))

			if(!hit) fb = (random(100) < 20)
			return { hit, re, fb };
		}

		if(re=='A>B'){
			chance = Math.floor((b/a)*100) - alk/10 - Roll(2,6).result
			const rate = random(1,100)
			hit = ( rate >= chance )
			console.log('rate/chance',rate,chance, hit)

			return { hit, re, fb }
		}
		else{
			const rate = random(1,100) - Roll(2,6).result
			console.log('rate/chance',rate,chance)
			hit = ( rate <= chance )
			if(!hit) fb = (random(100) < 30)

			return { hit ,re ,fb}
		}
	}

	getDamage(atk,def){
		const dmg = (a, b) =>{
			const info = this.compare(a,b)
			const {ar,br} = info

			if( a >= b || a+b > 150 && Math.abs(a-b) < 10 || a+b > 150 && Math.abs(ar-br) < 5 ){
				let buff = Math.min(1+ a/b/50, 2)
				console.log('buff',buff)
				let re = Math.abs((a*buff) - b*( a+b > 150 ? 0.92 : 1))
				return re
			}
			return (Math.pow(a,2))/(7.5*b)
		}

		const rng = (a)=>{
			const stable = Math.floor(a*0.9+0.5)
			const d = Math.max( Math.floor( (a*0.1)/3 + 0.5))
			const result = Roll(d,3).result + stable
			console.log('rng',d,result)
			return result
		}

		//稳定发挥的90%剩余随机
		const damage = Math.floor( rng(atk) +0.5 )
		const shield = Math.floor( rng(def) +0.5 )

		const max = Math.max(Math.floor(atk/100+0.5),2)
		const lstdmg = Math.floor(
				dmg(damage, shield)  + random(1,max)
			+ 0.5 )

		return { damage, lstdmg, shield }
	}

	getSituation(str:situation){
		switch(str){
			case 'A>>B':
				return '数值压制，'
			case 'B>>A':
				return '数值被压制，'
			case 'A~=~B':
				return ''
			case 'A>B':
				return ''
			case 'B>A':
				return ''
		}
	}

	NormalAtack(){
		const spd = this.player.SPD
		const goal = this.target.SPD
		let atk = this.player.ATK
		let shd = this.target.DEF

		let lvbuff //查看等级差。数值足够大时才会有明显的补正。
		if(Math.abs(this.plv-this.tlv) <= 10)
			lvbuff = 1+Math.abs(this.plv-this.tlv)/50;

		if(Math.abs(this.plv-this.tlv) >10)
			lvbuff = 0.75 + Math.abs(this.plv-this.tlv)/20;

		if(this.plv > this.tlv) atk = Math.floor(atk*lvbuff);
		if(this.tlv > this.plv) shd = Math.floor(shd*lvbuff)

		const dmg = this.getDamage(atk, shd)
		let hit = this.checkhit(spd, goal, this.plk, this.tlk)
		let crit = hit.fb ? this.checkCritical(this.tlk) : this.checkCritical(this.plk)

		let result = {
			hit: hit.hit,
			fb: hit.fb,
			crit:crit,
			dmg: dmg.damage,
			shd: dmg.shield,
			lstdmg: dmg.lstdmg * (crit==3 ? 5 : crit==2 ? 2.5 : crit==1 ? 1.5 : 1),
			txt: this.getSituation(hit.re)+(hit.hit ? '攻击成功' : '攻击失败'),
		}

		if(this.plv - this.tlv >= 20 && spd/goal >= 1.2){
			result.hit = true
			result.txt = '境界压制，攻击成功'
		}
		else if(this.tlv - this.plv >= 20 && goal/spd >=1.2){
			result.hit = false
			result.txt = '境界被压制，攻击失败'
		}

		return result
	}

}

export const CritType = [ '', '暴击', '会心一击', '致命一击']
