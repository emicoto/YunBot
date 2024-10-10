import { Context, Time } from "koishi";
import { Equip, Items, Weapon, Yun } from "../Define";

export function GameCom(ctx:Context){
	
	ctx.command('bonus', '-领取福利  领取活动奖励，福利等。 有活动时才能用。', { maxUsage:1, signed:true, system:true , hidden:true})
		.alias('领取福利')
		.userFields(['game','daily','userID','role'])
		.action( async( { session } )=>{
			const { game, role } = session.user
			const event = Yun.config.event

			if(game.flag.eventbonus[event] >= 4){
				return '【所有福利已领取完毕】'
			}
			if(role=='master'){
				Items.get(game, '长生果', 1)
				Items.get(game, '女娲花', 1) 
				Items.get(game, '伏羲丹', 1)
				Items.get(game, '太虚丹', 1)
				Items.get(game, '仙书笺', 1)
			}
			if(role=='senior'){
				game.equip.weapon = Weapon.get('乾坤锁')
			}
			else if(role=='brother'){
				game.equip.weapon = Weapon.get('烛龙杖·残')
			}
			else if(role=='elder'){
				game.equip.head = Weapon.get('花簪')
			}
			else if(role){
				Items.get(game, '仙书笺', 5)
			}
			
			if(role !=='master'){
				game.equip.cloth = Equip.get('弟子袍')
				game.equip.shoes = Equip.get('布鞋')
				game.equip.waist = Equip.get('布腰带')
			}
		
			game.money += 50
			if(!game.flag.eventbonus['0819补偿']){
				Items.get(game,'太虚丹',1)
				Items.get(game,'仙书笺',1)
				game.flag.eventbonus['0819补偿'] = 1
			}
			if(!game.flag.eventbonus[event]){
				Items.get(game,'明心丹',1)
				Items.get(game,'灵息丹',1)			
			}
			if(game.flag.eventbonus[event] == 1){
				Items.get(game,'灵息丹',1)
			}
			if(game.flag.eventbonus[event] == 2){
				Items.get(game,'凝元丹',1)
			}
			if(game.flag.eventbonus[event] == 3){
				Items.get(game,'仙书笺',1)
			}

			if(!game.flag.eventbonus[event]){
				game.flag.eventbonus[event] = 1
			}
			else{
				game.flag.eventbonus[event] ++
			}
			
			session.user.$update()

			return '【已领取福利，详细请看小灵通。】'
		})
	
	ctx.command('useitem [item]','-使用道具 [道具名]  可使用对应道具。', { hidden:true , minInterval: Time.minute*2 , usageName:'使用道具'})
		.alias('使用道具').alias('服用丹药')
		.shortcut('》阅读仙书笺',{args:['仙书笺']})
		.shortcut('》服用明心丹',{args:['明心丹']})
		.shortcut('》服用灵息丹',{args:['灵息丹']})
		.shortcut('》服用凝元丹',{args:['凝元丹']})
		.userFields(['daily','game','userID'],)
		.action(async ({ session }, item)=>{
			const { game, userID } = session.user
			const { items } = game
			const list = Object.keys(items)
			let use	

			if(!item){
				let txt:string[] = [
					'你打开储物戒，看了看里面……。\n',
					`>>${game.name}的持有物品一览：\n`,
				]

				if(list.length){
					let c = 1
					let v = 0
					for(let i in items){
						if(!txt[c]) txt[c] = ''
						txt[c] += `${items[i].name} x ${items[i].num}`
						if(v%2==0) c++
						v++
					}					
				}
				else{
					txt.push('·\n·\n·\n什么都没有呢。')
					return txt.join('\n')
				}

				txt.push('【直接输入道具名即可使用】')
				await session.send(txt.join('\n'))
				item = await session.prompt()				
			}

			if(list.includes(item) === false ) return session.text('internal.invalid-input')

			if(items[item].method == '合成'){
				return '并不是可以直接使用的物品。'
			}

			if(Items.checkRequire(game.level, items[item]) === false ){
				if(game.level > items[item].require[1])
					return '你的等级已经超出物品作用范围。'
				else
					return '使用物品的需求等级不足。'
			}

			if(Items.checkUsage(session, items[item]) === false ){
				console.log(items[item])
				if(items[item].lifeUsage)
					return `已达到使用上限`;
				if(items[item].dayUsage)
					return `已达到每日上限`

			}

			const txt = await Items.use(session, session.user.game.items[item] )
			const retxt =  `${game.name}${(items[item].type == '道具' ? `使用了道具` : '服用了' )}${item}，效果：\n${txt}`

			if(session.user.game.items[item].num <= 0){
				delete session.user.game.items[item]
			}

			await setTimeout(() => {}, 500);
			await session.user.$update()
			
			return retxt

		})

}