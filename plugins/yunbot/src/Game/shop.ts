import { Context, segment, Time } from "koishi";
import { Config, shopitems } from "..";
import { Equip, Items, save, Today, Weapon, Yun } from "../Define";
import { HelpText } from "../TextLib";
import { copy, faceicon, isInvalid } from "../Utils";

function initShop(){
	const { shopitems } = Yun.config;

	for(let i in shopitems){
		const chk = shopitems[i]
		if(chk.type=='weapon'){
			chk.value = Math.floor(Weapon.data[chk.name].value * chk.discount)
		}
		if(chk.type=='equip'){
			chk.value = Math.floor(Equip.data[chk.name].value * chk.discount)
		}
		if(chk.type=='items'){
			chk.value = Math.floor(Items.data[chk.name].value * chk.discount)
		}
		if(chk.type=='skillbook' || chk.type=='mindsbook'){
			//chk.value = Books.data[chk.name].value * chk.discount
		}
	}

	Yun.state.shops = copy(shopitems)
	Today.data.shopinit = Date.now()
	save()
}

export function ShopSystem(ctx:Context, config:Config={}){

	ctx.command('shop <id>','-路昀商店  每日刷新商品。',{ hidden:true, signed:true, usageName:'路昀商店' })
		.alias('路昀商店')
		.option('count','-c <value>')
		.userFields(['game'])
		.action( async ({ session, options }, id)=>{
			const { game } = session.user
			console.log('商店使用',options)
			if(!Today.data.shopinit) initShop();
			const shop:shopitems[] = Yun.state.shops
			const type = {
				'weapon':'法器', 'items':'道具', 'equip':'装备'
			}

			if(!id){
				if(!game.memory.includes('商店初见')){
					const txt = [
						'听说商店开放了，于是你快步走到宗门小商店门前。',
						'宗门小商店就开放在主峰小广场上，说是商店，不如说是个移动小摊。',
						'小摊前两名杂役弟子在整理东西，而路昀则不知为何在这里用小灵通玩游戏。',
						'一旁的杂役弟子看到你来了，看到你目光停留的位置，解释道：“啊，路师兄这是逃避修炼跑来这边躲懒了。”',
						'你拍了拍路昀的肩膀，路昀吓了一跳立刻坐好把手机收起来，摆出营业微笑。'
					]
					await session.send(txt.join('\n'))
					await setTimeout(() => { }, 1000);
					await session.send(`${faceicon('微笑')}\n“你好……要买点什么吗？”\n（不是，你怎么还客串起店员来了？）你不禁在心中吐槽。`)
					game.memory.push('商店初见')
					session.user.$update()
				}
				else{
					await session.send(`${faceicon('微笑')}\n“你好……要买点什么吗？”`)
				}

				let list = [
					'商品一览：',
				]
				for(let i=0; i< shop.length; i++){
					const item = shop[i]
					const txt = `id ${i+1}. ${item.name}　${type[item.type]}　价格：${item.value}灵石　库存：${item.stock}`
					if(item.stock) list.push(txt)
				}
				list.push('【购买时请直接输入商品id（数字），装备类一次只能买一件。】')
				list.push('【其他物品需要买多件，请退出流程后用.shop <id> -c=<数量>】')
				list.push('（将<id>替换成物品id，以及<数量>替换成需要买的数量）')
				list.push('（物品详细请用 -查询 类别 名字）')

				await session.send(list.join('\n'))
				id = await session.prompt(Time.minute*3)
			}

			if( !options?.count && isInvalid(id) || !parseInt(id) ) return '……？？\n【输入错误】'

			let sid = parseInt(id)-1

			if( (!options?.count && game.money < shop[sid].value) || game.money < shop[sid].value*options.count ) return '……钱不够啊？'
			if( !shop[sid].stock || options?.count > shop[sid].stock ) return '……啊，没货了。\n【商店库存不足】'

			const shopitem = shop[sid]
			let getitem

			game.money -= shop[sid].value;
			Yun.state.money += Math.floor(shop[sid].value/10)

			if(shopitem.type == 'weapon'){
				getitem = Weapon.get(shopitem.name)
				game.storage.push(getitem)
			}

			if(shopitem.type == 'equip'){
				getitem = Equip.get(shopitem.name)
				game.storage.push(getitem)
			}

			if(shopitem.type == 'items'){
				getitem = Items.get(game, shopitem.name, (options.count ? options.count : 1))
			}

			if(shopitem.type == 'skillbook' || shopitem.type == 'mindsbook' ){

			}

			if(options?.count){
				shop[sid].stock -= options.count
			}
			else{
				shop[sid].stock --
			}

			Yun.save()
			session.user.$update()
			return `你购买了${shopitem.name}并放进了储物戒中。`
		})

	ctx.command('trade <target>','-交易  玩家之间交易物品。',{ hidden:true, signed:true, usageName:'交易', system:true })
		.alias('交易')
		.option('count','-c <value>')
		.option('money','-m <value>')
		.option('item','-i <value>')
		.option('storage','-s')
		.option('equip','-e')
		.userFields(['game','daily'])
		.action( async ({ session, options}, target)=>{
			const parsedTarget = target ? segment.parse(target)[0] : null;
			//console.log(parsedTarget, options)

			if(!parsedTarget && !options?.item){
				return HelpText['交易'].join('\n')
			}

			//挂单的情况
			const { daily, game } = session.user


			if(!parsedTarget || parsedTarget && options.item){
				if(!options.storage && options.item){
					if(!game.items[options.item]) return '【你没有物品：'+options.item+'】'
					if(game.items[options.item].num < options.count) return '【持有的'+options.item+'数量不足以交易】'

					daily.temp['tradeinfo']={
						sid:'items',
						item: game.items[options.item],
						count:(options.count ? options.count : 1),
						money:(options.money ? options.money : 0),
					}

					//console.log(daily.temp['tradeinfo'])
				}

				if(!parseInt(options.money)) return '【输入有误，价格只能是数字。】'
				if(!parseInt(options.count)) return '【输入有误，数量只能是数字。】'

				if(options.storage && options.item){
					if(!parseInt(options.item)) return '【输入有误，储物戒id只能是数字。】'


					const sid = parseInt(options.item)-1
          const item = game.storage[sid] as Items
					if(!item?.name) return `【储物戒第${sid}格内没有任何有效物品】`
					if(item.num < options.count) return '【持有的'+options.item+'数量不足以交易】'

					daily.temp['tradeinfo']={
						sid: sid,
						item: game.storage[sid],
						count:(options.count ? options.count : 1),
						money:(options.money ? options.money : 0),
					}

				}

				if(parsedTarget){
					const tid = parsedTarget.data.id
					daily.temp['tradeinfo'].tid = tid
				}

				session.user.$update()

				const info = daily.temp['tradeinfo']

				return '交易单子以挂出。详情：\n'+
						  ( parsedTarget ? `指定的交易对象id：${info.tid}` : '') +
						  `物品名：${info.item.name}\n交易数量：${info.count}\n交易总价格：${info.money}`
			}

			const tid = parsedTarget.data.id
			const data = await ctx.database.getUser(session.platform, tid)

			if(tid == session.userId) return '【不能自己跟自己交易】'

			if(!data.daily.temp['tradeinfo']) return '【对方没有挂任何交易单】'

			const info = copy(data.daily.temp['tradeinfo'])

			if(game.money < info.money) return '【金钱不足以交易】'
			if(info.tid && session.userId != info.tid){
				return '【非指定的交易对象】'
			}

			console.log(info)
			delete data.daily.temp['tradeinfo']


			if(info.sid == 'items'){
				Items.get(game, info.item.name, info.count)
				game.money -= info.money
				session.user.$update()

				data.game.items[info.item.name].num -= info.count

				if(data.game.items[info.item.name].num <= 0){
					delete data.game.items[info.item.name]
				}

				data.game.money += info.money
				await ctx.database.setUser(session.platform, tid, { game: data.game, daily: data.daily })

				return '【交易已顺利完成】'
			}
			else{

				const item = info.item
				game.storage.push(item)
				game.money -= info.money;

				session.user.$update()

				data.game.money += info.money;

				if(item?.num){

				}
				else{

					if(data.game.storage[info.sid].name == item.name ){
						data.game.storage.splice(info.sid,1)
					}
					else{
						for(let i=0; i<data.game.storage.length; i++){
							const chk = data.game.storage[i]
							if(chk.name == item.name){
								data.game.storage.splice(i,1)
								break
							}
						}
					}

					if(!data.game.storage.length || data.game.storage[0] == null ){
						data.game.storage = []
					}

				}

				await ctx.database.setUser(session.platform, tid, { game: data.game, daily:data.daily })
				return '【交易已顺利完成】'

			}

		})

	ctx.command('hongbao <target> <money:natural>','-红包  直接给被艾特的人打钱。', { hidden:true, signed:true, system:true })
		.alias('红包')
		.userFields(['game'])
		.action( async ({ session}, target, money)=>{
			const parsedTarget = target ? segment.parse(target)[0] : null;
			const { game }= session.user
			//console.log(parsedTarget, money)

			if(!parsedTarget && !money){
				return HelpText['红包'].join('\n')
			}

			if(!money) return '【金额不能为空】'

			money = Math.floor(money)
			if( game.money < money) return '【所持灵石不足】'

			const tid = parsedTarget.data.id
			const data = await ctx.database.getUser(session.platform, tid)
			if(!data.game.signed) return '【对象不存在游戏世界中】'
			if(tid == session.userId) return '【不能给自己发红包】'

			console.log(tid)

			data.game.money += money
			await ctx.database.setUser(session.platform, tid, { game: data.game })

			game.money -= money
			session.user.$update()

			return `${game.name}给${data.game.name}发了个${money}灵石的红包。`

		})
}
