import { Context, Time } from "koishi";
import { Config } from "..";
import * as s from "../unit"

export function TestCom(ctx:Context, config: Config={}){
	ctx.command('test','',{hidden:true, authority:4})
	.userFields(['game','name','chara','daily'])
	.action(async( { session } )=>{
		const database = await ctx.database.get('user',null)

		return s.images('cat_cross.jpg')
	})

	ctx.command('resetINTWIL',{ hidden:true,signed:true })
		.alias('恢复数据').alias('数据恢复')
		.userFields(['game'])
		.action(async({ session })=>{
			const id = session.userId
			if(session.platform !== 'onebot') return '当前平台不存在旧版存档。'

			const chk = await ctx.database.get('oldsave', { uid: 'QQ#'+id })
			if(!chk.length) return '没找到存档。'

			const chara = chk[0].chara
			const olddata = chk[0].charalist[chara]

			const { game } = session.user

			await session.send(`${game.name}的当前悟性：${game.INT}　旧档悟性：${olddata.INT}\n当前韧性:${game.WIL}　旧档韧性：${olddata.WIL}\n是否要继承旧版属性？\n [是/否]`)
			const answer = await session.prompt(Time.minute*2)
			if(!answer.match('是')) return '【已取消流程。】'

			game.INT = olddata.INT
			game.WIL = olddata.WIL

			session.user.$update()

			return '已恢复为旧档属性。'
			

		})
	
	ctx.command('clearuser',{hidden:true})
		.action( async( { session}) =>{
			const database = await ctx.database.get('user',null)
			for(let i=0; i<database.length; i++){
				let user = database[i]
				if(!user.lastCall && !user.game?.name) await ctx.database.remove('user', { userID: user.userID })
			}

			return s.images('cat_cross.jpg')
		})

	ctx.command('testchara', { hidden:true, authority:5 })
		.userFields(['game','name','chara','daily'])
		.action(async( { session } )=>{
			const { game } = session.user

			game.INT = 100
			game.WIL = 86
			game.equip.weapon = s.copy(s.Weapon.data['冷烟管剑'])
			game.equip.cloth = s.copy(s.Equip.data['泠月云裳'])
			game.equip.shoes = s.copy(s.Equip.data['履云靴'])

			return s.images('cat_cross.jpg')

		})

	ctx.command('wake','',{hidden:true, authority:4})
	.action(()=>{
		if(s.Yun.isSleeping()){
			s.Yun.stats = 'awake'
			s.Yun.save()
		}
		return '已唤醒路昀。'
	})

	ctx.command('freeyun','',{hidden:true, authority:4})
	.action(()=>{
		if(s.Yun.stats == 'working'){
			s.Yun.stats = 'free';
			s.Yun.state.work = 0;
			s.Yun.save()
		}
		return '已停止修炼。'
	})

	ctx.command('setyun', { hidden:true, authority:4})
	.action(()=>{
		const yun = s.Yun.state

	})

	ctx.command('yunstats [text]','',{hidden:true, authority:4})
	.action(({ session }, text:s.YunStats)=>{
		if(s.statslist.includes(text)){
			s.Yun.stats = text
		}
		return '路昀的状态：'+ s.Yun.stats
	})

	ctx.command('soulrank','',{hidden:true, authority: 4 })
	.action(()=>{
		const list = [
			'天异金',
			'天异金火',
			'天金',
			'天金火',
			'异金',
			'异金火',
			'异金木火',
			'异金木水火',
			'异金木水火土',
			'金',
			'金木',
			'金木水',
			'金木水火',
			'金木水火土',
		]

		let soulrank = []

		for(let i in list){
			let info = new s.Soul(list[i])
			let buff = info.buff
			let stats = buff.ATK + buff.DEF + buff.SPD + buff.HP + buff.SP
			let skill = buff.craft + buff.medicine + buff.mine + buff.plant + buff.research

			soulrank.push({ info, stats, skill })

		}
		soulrank.sort(s.compare('stats'))
		for(let i in soulrank){
			const { info, stats } = soulrank[i]
			console.log((info.tian ? '天' : '')+(info.unique ? '异' : '')+s.intKan(info.count), '战斗总加成值', s.fixed(stats))
		}

		soulrank.sort(s.compare('sk'))
		for(let i in soulrank){
			const { info, skill } = soulrank[i]
			console.log((info.tian ? '天' : '')+(info.unique ? '异' : '')+s.intKan(info.count), '生活总加成值：',s.fixed(skill))
		}
	})

}