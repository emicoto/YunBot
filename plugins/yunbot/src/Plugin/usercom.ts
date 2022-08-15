import { Context } from 'koishi'
import {} from '../unit'

export function UserCommon(ctx:Context){

	ctx.command('setimgurl <url>','-设置人物头像。只能放网址',{system:true , signed:true, hidden:true})
		.alias('设置头像')
		.shortcut('》设置头像')
		.userFields(['userID','game'])
		.action( async ({ session },url)=>{
			const { userID, game } = session.user
			if(!url){
				await session.send('【请输入头像url链接】\n【结尾得是png或jpg。以及不能用gif。】')
				url = await session.prompt()
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

}