import { Context } from "koishi";
import { Equip, Items, Weapon } from "../Define";

export function GameCom(ctx:Context){
	
	ctx.command('bonus', '-领取福利  领取活动奖励，福利等。 有活动时才能用。', { maxUsage:1, signed:true, notQQ: true, system:true , hidden:true})
		.alias('领取福利')
		.userFields(['game','daily','userID','role'])
		.action( async( { session } )=>{
			const { game, role } = session.user
			let item

			if(game.flag.eventbonus?.newservice < 2){
				return '【已领取过】'
			}
			if(role=='master'){
				item = Items.make('长生果',1)
				Items.setUpgrade(session, item,1)
				item = Items.make('女娲花',1)
				Items.setUpgrade(session, item,1)
				item = Items.make('伏羲丹',1)
				Items.setUpgrade(session,item,1)
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
			else if(role=='pigeon'){
				item = Items.make('仙书笺',5)
				session.user.game.items['仙书笺'] = item
			}
			
			if(role !=='master'){
				game.equip.cloth = Equip.get('弟子袍')
				game.equip.shoes = Equip.get('布鞋')
				game.equip.waist = Equip.get('布腰带')
			}

			game.money += 50
			game.items['明心丹'] = Items.make('明心丹',1)
			game.items['灵息丹'] = Items.make('灵息丹',1)

			if(!game.flag.eventbonus['newservice']){
				game.flag.eventbonus['newservice'] = 1
			}
			else{
				game.flag.eventbonus['newservice'] ++
			}
			
			session.user.$update()

			return '【已领取福利，详细请看小灵通。】'
		})

}