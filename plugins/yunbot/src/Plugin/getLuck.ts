import { Context, Time, User } from "koishi"
import { At, Yun, getJrrp, getLuckRes, hdxlq, huandaxian, images, txtp, random, setUsage, Today, YunOpinion, zglq, zhougong, getName } from "../unit"

const levels = [0,20,40,60,80]
const jackpot = [1,39,42,66,77,100]
const zgpot = [1]
const hdxpot = [98,99,100]

export function getJrrpComment(luck,pot?){
	let comment

	if(pot =='黄大仙' && hdxpot.indexOf(luck)){
		comment = YunOpinion[`hdx-${luck}`]
	}
	if(pot == '周公' && zgpot.indexOf(luck)){
		comment = YunOpinion[`zg-${luck}`]
	}

	const jackpotIndex = jackpot.indexOf(luck)
	if(!comment && jackpotIndex != -1){
		let indexkey = `jackpot-${luck}`
		comment = YunOpinion[indexkey]
	}

	if(!comment){
		let key
		const keyIndex = levels.findIndex(level => luck <= level)

		if(keyIndex == -1){
			key = levels[levels.length - 1]
		}
		else{
			key = levels[keyIndex - 1]
		}

		let indexkey = `level-${key}`

		comment = YunOpinion[indexkey]
	}

	return comment
}

export function getOmikuji({ daily }:Pick<User,'daily'>){
	let kuji
	let txt
	let pot = ''

	if(daily.kuji?.no){

		pot = daily.kuji.pot

		if(daily.kuji.pot=="黄大仙"){
			kuji = hdxlq[daily.kuji.no]
		}
		else{
			kuji = zglq[daily.kuji.no]
		}

	}else{
		if(Yun.state.mood < 66){
			kuji = huandaxian(daily.luck)
			pot = '黄大仙'
			daily.kuji.pot = pot
			daily.kuji.no = kuji.id-1
		}
		else{
			kuji = zhougong(daily.luck)
			pot = '周公'
			daily.kuji.pot = pot
			daily.kuji.no = kuji.id-1
		}
	}

	txt = `第${kuji.no}签呢。我看看……（拿起签文读了起来。）\n${kuji.luck}签 ${kuji.title}\n${kuji.text}\n`

	txt += `小昀的一言：${getJrrpComment(daily.luck,pot)}`

	return txt
}

export function getLuck(ctx:Context){
	ctx.command("jrrp","-每日一卦  小昀帮你算今天一卦。",{ ignore:true, usageName:"每日一卦", authority:1})
		.alias("每日一卦")
		.shortcut(/(帮忙|帮我|给我|我的|我)(.+){0,}(今天|今日){0,1}(.+){0,}(算卦|算个卦|算一卦|运气|人品|运势|气运|幸运)/,{prefix:true})
		.userFields(['game','daily','userID'])
		.action(async ( { session } )=>{
			const uid = session.user.userID;
			let { game, daily } = session.user;
			const name = await getName(uid)
			let repeat

			if(daily.kuji.no) repeat = true;
			if( game.money < 2){
				console.log(session.user);
				return getLuckRes['没有钱']
			}

			const luck = getJrrp(uid)
			daily.luck = luck
			
			if(game.lastluck !== luck && game.luck !== luck){
				game.lastluck = game.luck;
				game.luck = luck;
			}

			const omikuji = getOmikuji(session.user)
			

			let text1 = repeat ? 
				txtp(getLuckRes['重复算卦：上'].join('\n'),[name,luck]) 
				: txtp(getLuckRes['每日一卦：上'].join('\n'),[name,luck])

			let text2 = repeat ? 
				txtp(getLuckRes['重复算卦：下'].join('\n'),[name,luck,omikuji]) 
				: txtp(getLuckRes['每日一卦：下'].join('\n'),[name,luck,omikuji])

			game.money -=2

			await session.send(text1)
			return text2
		})
	
	ctx.command("pick <type>","-抽签  从签筒中抽签。需要带签筒的名字。", { ignore:true, usageName:"抽签", maxUsage:3, authority:1, hidden:true})
		.alias('抽签')
		.shortcut(/(帮忙|帮我|给我)(\S+){0,}抽(\S+)签/, {args:['$3'], prefix:true})
		.shortcut(/(帮忙|帮我|给我)(\S+){0,}(随机|随便)抽(\S+)签/, {args:['随机'], prefix:true})
		.shortcut("抽黄大仙灵签", {args:['黄大仙'], prefix:true})
		.shortcut("抽周公灵签", {args:['周公'], prefix:true})
		.shortcut("随机抽签",{args:['随机'], prefix:true})
		.userFields(['name','game','daily','userID'])
		.action(async({ session }, type)=>{

			const uid = session.user.userID
			let { game } = session.user

			if(game.money < 2) return getLuckRes['没有钱'];

			const kujitype = ['黄大仙','周公']
			let pot:string
			let txt:string


			if(!type){
				const list = ['黄大仙','周公','随机']
				await session.send('请问要抽什么签呢？（签筒上写着：抽一次2灵石）\n1.黄大仙 2.周公 3.随机 4.取消')
				let answer = await session.prompt(Time.minute*2)
				if(!answer) return session.text('internal.times-out')

				if(answer.match(/黄大仙|周公|随机/)){
					type = answer.match(/黄大仙|周公|随机/g)[0]
				}
				else if(answer.match(/1|2|3/)){
					let n = answer.match(/1|2|3/g)[0]
					let id = parseInt(n)
					type = list[id-1]
				}
				else if(answer.match(/4|取消/)){
					return '……不抽了吗？'
				}
				else {
					return session.text('internal.invalid-input')
				}

				txt = `……嗯。${type}签吗？好的吧。`
			}
			else{
				txt = '……要抽签吗？好的吧。'
			}

			pot = (type == '随机') ? kujitype[random(1)] : type

			let no = random(99)
			let kuji = pot == '周公' ? zglq[no] : hdxlq[no]

			let url = `https://www.zgjm.org/chouqian/${ pot=='周公' ? 'zhougong' : 'huangdaxian' }/${kuji.no}.html`
			let file = `${ pot=='周公' ? 'zglq' : 'hdxlq'}/${kuji.no}.png`

			txt += `(收下2灵石。)\n第${kuji.no}签  ${kuji.luck}签  ${kuji.title}\n${kuji.text}\n解签链接：${url}\n${images(file)}`

			game.money -= 2;
			session.sendQueued(At(uid)+txt);
			return
		})
}