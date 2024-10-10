import { Context, RuntimeError } from 'koishi'
import { either, isInvalid } from '../unit'

export function UserCommon(ctx:Context){

	ctx.command('callme','-设置角色昵称', { hidden:true })
		.shortcut('叫我')
		.userFields(['game','userID','name'])
		.action( async ({ session }, nick)=>{
			const { game } = session.user;
			if(!nick){
				let callname = game.nick ? game.nick : game.name
				if(callname){
					return either([
						`……怎么了，${callname}？`,
						`……有什么事吗？${callname}。`,
						`……好的，${callname}。`
					])
				}
				else{
					return '…………我们认识吗？（还没有创建角色）'
				}
			}

			if( isInvalid(nick)) return session.text("internal.invalid-input")

			//查重
			let chk = await ctx.database.get('user', { 'game.nick' : nick })
			if(chk.length && chk[0].userID != session.user.userID ){
				return '……好像已经有人叫这个了，……换一个？'
			}

			session.user.game.nick = nick
			session.user.$update()

			return `${nick}……吗？\n了解了，那么……以后就这么称呼${game.name}了。\n还请多多指教……`

		})

	ctx.command('username <txt:text>','修改小灵通的用户名', { system:true })
		.alias('用户名')
		.shortcut('》修改用户名')
		.userFields(['name'])
		.action( async ({ session }, txt)=>{
			const { name } = session.user
			if(!txt){
				return `【你现在的用户名为：${name}】`
			}

			if( isInvalid(txt) ) return session.text("internal.invalid-input")

			try {
				session.user.name = txt;
				await session.user.$update()
				return `【小灵通用户名已更新为：${txt}】`
			}
			catch(error){
				if(RuntimeError.check(error, "duplicate-entry")){
					return '【已存在相同用户名】'
				}
				else{
					ctx.logger('common').warn(error);
					return '【出现不明错误，详细请看后台日志】'
				}
			}

		})

	ctx.command('charaname <name:text>','修改角色名称',{ system:true, hidden:true })
		.alias('角色名')
		.userFields(['userID','game'])
		.action( async ({ session } ,name)=>{
			const { game } = session.user;

			await session.send('你来到了宗门的弟子档案处，提出了修改名字的申请。')
			if(!name){
				await session.send('【请输入角色名】')
				name = await session.prompt()
				if(!name) return session.text('internal.invalid-input')
			}

			if( isInvalid(name) )
				return session.text('internal.invalid-input')
			
			game.name = name
			session.user.$update()

			await session.send(`路昀得知你已经修改名字后，了然道：“嗯……${name}是吗？了解了，以后要改称呼了呢……”`)
			
		})

}