import { Context } from "koishi";
import { ComReply, getJrrp, getLuckBuff, getMorningCall, txtp, random } from "../unit";
import { getJrrpComment } from "../Plugin";


export function DailyRoutine(ctx:Context){

	ctx.command('signin', '-每日签到  签到前最好找小昀算一卦。',{ ignore:true, signed:true, usageName:'签到', maxUsage:1, hidden:true} )
		.alias('每日签到')
		.shortcut('签到')
		.shortcut('打卡')
		.shortcut(/^我(要|来)签到\S{0,3}$/,{})
		.userFields(['game','daily','userID','role'])
		.action( async ({ session })=>{
			const { game, daily, userID, role } = session.user;
			const name = (game.nick ? game.nick : game.name)
			
			let txt = '路昀：“'

			if(role.length){
				txt += getMorningCall(role, name)
			}

			if(daily.luck <= 0){
				daily.luck = getJrrp(userID);
				txt += txtp(ComReply['签到气运'].join('\n'),[name, daily.luck, getJrrpComment(daily.luck)]) + '\n“……然后，'
			}

			const luck = daily.luck
			const earn = Math.floor(random(20,50) * getLuckBuff(luck)+0.5)

			txt += txtp(ComReply['每日签到'].join('\n'),[earn])
			daily.sign = true;

			game.money += earn
			await session.user.$update()

			session.send(txt)

		})
	
	ctx.command('dailyquest [type]', '-每日任务  还没弄好，准备开放。', { signed:true, usageName: '每日任务', maxUsage: 5, hidden:true })
		.alias('每日任务')
		.userFields(['game','daily','userID'])
		.action(async ({ session }) => {
			
		})

}