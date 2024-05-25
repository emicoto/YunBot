import { Context } from "koishi";
import { cnTime, copy, Equip, EquipDes, Game, getBreakRate, getTimeZone, images, ImgUrl, intKan, ItemDes, Items, LevelExp, LevelKan, random, Soul, Weapon, WeaponDes, Yun } from "../unit";

export function CheckStatus(ctx:Context){

	function hasImg(game:Game){
		return ( game.flag?.url && game.flag.url.length )
	}

	ctx.command('setimgurl <url>','-设置人物头像。只能放网址',{system:true , signed:true, hidden:true, usageName:'设置头像'})
		.alias('设置头像')
		.alias('》设置头像')
		.userFields(['userID','game'])
		.action( async ({ session },url)=>{
			const { game } = session.user
			if(!url){
				await session.send('【请输入头像url链接】\n【结尾得是png或jpg。以及不能用gif。】')
				url = await session.prompt()
			}
			if(session.platform == 'kook'){
				let get = url.match(/\[(.+)\]/)
				url = get[1]
			}
			const reg = new RegExp('^(http|https)://(.+)(png|jpg)$')
			if(url.match(reg)){
				game.flag.url = url
				session.user.$update()
				return '【已设置完毕】'
			}
			else{
				return '【输入有误】'
			}
		})

	ctx.command('takeoff <type>','-脱下装备  可脱下指定的装备。',{ system:true, usageName:'脱下装备' })
		.alias('脱下装备')
		.alias('》摘下头饰',{args:['头饰']})
		.alias('》摘下首饰',{args:['首饰']})
		.alias('》摘下手饰',{args:['手饰']})
		.alias('》摘下腰饰',{args:['腰饰']})
		.alias('》脱下鞋子',{args:['鞋子']})
		.alias('》脱下衣服',{args:['衣服']})
		.alias('》换下法器',{args:['法器']})
		.userFields(['game'])
		.action( ({ session },type)=>{
			const { game } = session.user
			const typelist = {
				'头饰':'head', '首饰':'neck', '手饰':'hands', '腰饰':'waist',
				'鞋子':'shoes', '衣服':'cloth', '法器':'weapon'
			}

			if(!game?.signed) return '好像也没啥可以脱的。'

			const part = typelist[type]

			if(!part) return '【输入错误】'

			if(!game.equip[part]?.id ) return '没有可以脱的'+type

			let old = copy(game.equip[part])
			if(old.category=='weapon'){
				game.equip[part] = new Weapon(null,'无','','',0)
			}
			else{
				game.equip[part] = new Equip(null,'无','','',0)
			}

			game.storage.push(old)
			session.user.$update()

			return `${game.name}把${old.name}脱下来放进储物戒了。`

		})

	ctx.command('storage <id:number>','-储物戒　存放了各种各样东西的地方。主要放非消耗性物品。',{signed:true, system:true, hidden:true, usageName:"储物戒"})
		.alias('储物戒')
		.option('equip','-e')
		.userFields(['game'])
		.action(({ session, options }, id)=>{
			const game:Game = session.user.game
			const typelist = {
				'头饰':'head', '首饰':'neck', '手饰':'hands', '腰饰':'waist',
				'鞋子':'shoes', '衣服':'cloth', '法器':'weapon'
			}

			if(!id){
				const { storage } = game
				let txt = [
					'储物戒内容物一览：'
				]
				for(let i=0; i<storage.length; i++){
					const item = storage[i] as Items
					const t = `id:${i+1}. ${item.name}`+(item.category=='material' ? `x${item.num}` : '')
					txt.push(t)
				}
				return txt.join('\n')
			}

			if(id && !options.equip){
				const sid = id-1
				const item = game.storage[sid]

				if(item.category == 'weapon') return WeaponDes(Weapon.data[item.name])
				if(item.category == 'equip') return EquipDes(Equip.data[item.name])
				if(item.category == 'items') return ItemDes(Items.data[item.name])

			}

			if(id && options.equip){
				const sid = id-1
				const chk = game.storage[sid]
				if(chk.category == 'weapon'){
					const item:Weapon = game.storage.splice(sid,1)[0] as Weapon
					let old = copy(game.equip.weapon)
					if(!game.storage.length || game.storage[0] == null){
						game.storage = []
					}

					game.equip.weapon = item
					if(old.id){
						game.storage.push(old)
					}

					session.user.$update()
					return `${game.name}装备上了${game.equip.weapon.name}${ old.id? `，把${old.name}放进储物戒了。` : '。'}`
				}
				else if(chk.category == 'equip'){
					const item:Equip = game.storage.splice(sid,1)[0] as Equip
					let old:Equip
					if(!game.storage.length || game.storage[0] == null){
						game.storage = []
					}

					const part = typelist[item.type]
					old = copy(game.equip[part])
					game.equip[part] = item

					if(old.id){
						game.storage.push(old)
					}

					session.user.$update()
					return `${game.name}装备上了${item.name}${ old.id? `，把${old.name}放进储物戒了。` : '。'}`
				}
				else{
					return '【不是可装备的物品】'
				}
			}
		})

	ctx.command('xphone <type>', '-小灵通  可以确认自己的详细资料。', { signed:true, system:true, hidden:true, usageName:'小灵通' })
		.alias('小灵通')
		.shortcut(/^(看看|查看)(我的)(小灵通|手机)$/,{args:['主要']})
		.shortcut(/^(拿出|取出|拿起)(我的){0,1}(小灵通|手机)看\S{0,5}$/,{args:['主要']})
		.shortcut('》查看档案',{args:['主要']})
		.shortcut('》查看数据', {args:['数据']})
		.shortcut('》查看技能', {args:['技能']})
		.shortcut('》查看装备', {args:['装备']})
		.shortcut('》查看道具', {args:['道具']})
		.shortcut('》查看记录', {args:['记录']})
		.userFields(['userID','name','chara','game','daily','role'])
		.action( ( { session }, type )=>{
			const { userID, game, daily, name } = session.user
			const rate = getBreakRate(game, userID)
			const level = LevelKan(game.level)
			const soul = new Soul(game.soul)
			const luck = daily.luck

			if(!type){
				return Page1(game,name,level,soul,luck,rate)
			}
			if(type){
				switch (type){
					case '主要':
						return Page1(game,name,level,soul,luck,rate)
					case '数据':
						return Page2(game.name,level,soul,game)
					case '技能':
						return Page3(game)
					case '装备':
						return Page4(game)
					case '道具':
						return Page6(game)
					case '记录':
						return Page5(game)
					case '帮助':
					case 'help':
					case '目录':
						return PageMenu()
				}
			}

		})

	ctx.command('yunstatus <type>', '-查看路昀  可以确认路昀的现状。',{ hidden:true, usageName:"查看路昀"})
		.alias('查看路昀')
		.shortcut('看看路昀',{args:['主要']})
		.shortcut('》查看路昀数据',{args:['数据']})
		.shortcut('》查看路昀技能',{args:['技能']})
		.shortcut('》查看路昀装备',{args:['装备']})
		.shortcut('》对路昀用破心通',{args:['看法']})
		.userFields(['game','userID'])
		.action( ({ session }, type) =>{
			const level = LevelKan(Yun.state.level)
			const soul = Yun.soulinfo()
			const uid = session.user.userID

			if(!type) return YunPage( uid,Yun.state, level, soul)
			if(type){
				switch(type){
					case '主要':
						return YunPage(uid, Yun.state, level, soul)
					case '数据':
						return Page2('路昀',level, soul, Yun.state)
					case '技能':
						return Page3(Yun.state)
					case '装备':
						return Page4(Yun.state)
					case '看法':
						return PageSP(session.user.game)
					case '帮助':
					case 'help':
					case '快捷指令':
					case '选项':
					case '菜单':
						return YunMenu()
				}
			}
		})

	function PageMenu(){
		const txt = [
			'可用快捷指令一览：',
			'》查看档案',
			'》查看数据',
			'》查看技能',
			'》查看装备',
			'》查看道具',
			'》查看记录',
			'-----------------------',
			'输入快捷指令时记得把 》加上哦。'
		]
		return txt.join('\n')
	}

	function YunMenu(){
		const txt = [
			'可用快捷指令一览：',
			'》查看路昀',
			'》对路昀用破心通',
			'》查看路昀数据',
			'》查看路昀装备',
			'-----------------------',
			'输入快捷指令时记得把 》 加上哦。'
		]
		return txt.join('\n')
	}

	function PrintHeart(){
		const t = Math.max(Math.floor(Yun.mood()/20+0.5),1)
		return '❤'.repeat(t)
	}

	function YunPage(uid:string, data:Yun, level:string, soul:Soul){
		const time = cnTime().getHours()
		const zone = getTimeZone(time)

		let dress = 'normal'
		let mood = '普通'

		if(data.mood >= 70) mood = '愉快';
		if(data.mood <= 50) mood = '不爽';

		if (['凌晨','黎明','晚上','深夜'].includes(zone)) dress = 'sleep';
		if(['凌晨','黎明'].includes(zone) && random(100) > 90 && Yun.getFavo(uid)) dress = 'sp';
		const txt = [
			`路昀的状态 ${Yun.getstats()} <·| Yunbot ver 1.0.0`,
			`${images(`Yunstand_${dress}_${mood}.png`)}`,
			`· 心情 ${ PrintHeart() }`,
			`· 特征：${data.talent.join('、')}`,
			`· 灵根：${soul.print}`,
			`· 境界：${level}`,
			`· 战斗力：${data.BP}`,
			`· 悟道值：${data.exp}/${LevelExp(data.level)}`,
			`· 幸运值：${Yun.luck()}`,
			`· 突破概率： ${Yun.breakrate()}`,
		]
		return txt.join('\n')
	}

	function Page1(game:Game, name:string, level:string, soul:Soul, luck:number, rate:number){
		const txt = [
			`id. ${name}  | ·>  灵石 ${game.money} <·| `,
			`------------------------------------>>`,
			`${ hasImg(game) ? ImgUrl(game.flag.url) : '· |·>　　[　一张照片　]　　<·|' }`,
			`· |　${game.name}　${ game.title ? `【${game.title}】` : '' }`,
			`· |　${soul.print}`,
			`· |　${level}`,
			`· |　悟道值　${game.exp}/${LevelExp(game.level)}`,
			`· |　战斗力　${game.BP}`,
			`· |　幸运　${ luck > 0 ? luck : '未检测'} / ${game.lastluck}`,
			`· |　突破概率　${rate}%`,
			`------------------------------------>>`,
			'　[ 数据 ]  [ 技能 ]  [ 装备 ] [ 道具 ] [ 记录 ]'
		]
		return txt.join('\n')
	}


	function Page2(name:string,level:string, soul:Soul, data:Game|Yun){
		const txt = [
			`>> ${name}  ${level}  ${soul.print}`,
			`>> 悟性：${data.INT}　韧性：${data.WIL}`,
			`------------------------------------>>`,
			`· 命力  ${data.HP}/${data.maxHP}`,
			`· 法力  ${data.SP}/${data.maxSP}`,
			`· 行动  ${data.AP}/${data.maxAP}`,
			`· 攻击  ${data.ATK}`,
			`· 防御  ${data.DEF}`,
			`· 速度  ${data.SPD}`,
			`------------------------------------>>`,
			`挖矿 ${data.mine}%  种植 ${data.plant}%`,
			`炼丹 ${data.medicine}%  炼器 ${data.craft}%  研究 ${data.research}%`,
			`------------------------------------>>`,
			'　[ 主要 ]  [ 技能 ]  [ 装备 ] [ 道具 ] [ 记录 ]'
		]
		return txt.join('\n')
	}

	function Page3(data:Game|Yun){
		let txt = [
			`>> ${data.name}所掌握的技能一览：`,
			`>> 主修心法：${data.core.id ? `${data.core.name} 层数 ${intKan(data.core.level)}` : '暂无'}`,
			`------------------------------------>>`,
		]
		let c = 3

		for(let i=0; i < data.skill.length ; i++){
			if(!txt[c]) txt[c] = '';

			txt[c] += `【${data.skill[i]}】　`

			if((i-2)%3==0) c++
		}

		txt.push(`------------------------------------`)
		txt.push('　[ 主要 ]  [ 数据 ]  [ 装备 ] [ 道具 ] [ 记录 ]')
		return txt.join('\n')
	}

	function Page4(data:Game|Yun){
		const  { equip } = data
		let txt = [
			`>> ${data.name}的装备：`,
			`------------------------------------>>`,
			`头部：${equip.head.name}`,
			`衣服：${equip.cloth.name}`,
			`鞋子：${equip.shoes.name}`,
			`首饰：${equip.neck.name}`,
			`手饰：${equip.hands.name}`,
			`腰饰：${equip.waist.name}`,
			`法器：${equip.weapon.name}`,
			`------------------------------------>>`,
			'　[ 主要 ]  [ 数据 ]  [ 技能 ] [ 道具 ] [ 记录 ]'
		]
		return txt.join('\n')
	}

	function Page6(data:Game){
		const { items } = data
		let txt = [
			`>> ${data.name}的持有物品一览：`,
			`------------------------------------>>`,
		]
		let c = 2
		let v = 0

		for(let i in items){
			if(!txt[c]) txt[c] = '';

			txt[c] += `${items[i].name}x${items[i].num}　`

			if(v%2==0) c++
			v++
		}
		txt.push(`------------------------------------`)
		txt.push('　[ 主要 ]  [ 数据 ]  [ 装备 ] [ 技能 ] [ 记录 ]')
		return txt.join('\n')
	}

	function Page5(data:Game){
		let txt:string[]
		let memory = data.memory.join('，')
		txt = [
			`>> ${data.name}的记录：`,
			`------------------------------------>>`,
			`· |  获得经验总数：${data.flag.totalexp}`,
			'· | ',
			'· |  成就：暂无',
			`· |  解锁记忆：${ data.memory.length ? memory : '暂无'}'`,
			'· |  ',
			`------------------------------------>>`,
			'　[ 主要 ]  [ 数据 ]  [ 技能 ]  [ 装备 ]'
		]
		return txt.join('\n')
	}

	function PageSP(data:Game){
		const txt = [
			`路昀对${data.name}的看法……`,
			`· 好感：${data.favo/10} `,
			`· 信赖: ${data.trust/10}`
		]
		return txt.join('\n')
	}


}
