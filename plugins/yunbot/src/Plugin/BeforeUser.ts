import { Argv, Command, Context, Session, Time } from "koishi";
import { Config } from "..";
import { Authorized, bot, Common, DailyData, Game, initUser, initUserFirst,  Roles,  Today, whileSleeping, whileWorking, Yun} from "../unit";
import { checkUsageEvent } from "./rate-limit";

export function BeforeUser(ctx:Context, config: Config={}){

	//-------防止初始化失效------------->>
	ctx.before("attach", ()=>{
		if(!Yun.state || !Today.data){
			Yun.load();
			Today.load();
			console.log('再次初始化完毕。')
		}
		bot.db = ctx.database //防止莫名其妙的失效
	})

	//------加到各群的用户列表中------------>>
	ctx.on('attach-user', async ( session ) =>{
		if(!session.channelId || !session.userId ) return

		const channel = await ctx.database.getChannel(session.platform, session.channelId)
		if(!channel) return;

		let { userList, name } = channel
		if(userList && userList.includes(session.userId) === false ){
			userList.push(session.userId)
		}
		if(!name || !name.length){
			name = session.channelName
		}
		await ctx.database.setChannel(session.platform, session.channelId, { userList : userList, name: name })
	})

	//---------Yun Process------------->>
	//小昀的数据处理。只有小昀的数据有变动时才会进行
	ctx.before("command/attach-user", async ( command:Command )=>{
		if(!command || !command.config?.yunAction ) return;

		if(Yun.state.AP <= 3){
			//监听中时，不足3时概率触发休息事件。
		}
	})

	//-------init User，顺序按最后registry的开始(￣▽￣")-------------------->>
	ctx.before("command/attach-user", async (argv: Argv<'userID'>, fields)=>{
		const { session , command } = argv
		if(!session || !command) return;

		if(!fields.has('name')) fields.add('name');
		if(!fields.has('game')) fields.add('game');
		if(!fields.has('authority')) fields.add('authority')
		if(!fields.has('daily')) fields.add('daily')
		fields.add('userID').add('flags')

	})

	ctx.on('attach-user', async( session )=>{
		const user = await ctx.database.getUser(session.platform, session.userId)
		if(!user?.userID.length || !user.userID){
			await InitUser(session)
		}
	})

	ctx.before("command/execute",async (argv: Argv<'name'|'game'|'daily'|'userID'|'chara'|'authority'|'flags'>)=>{
		const { session, options, command } = argv
		if(!session || !session?.user ) return;
    if (!Yun.state){
      Yun.init();
    }
		bot.user = session.user //暂存一下方便调用
		bot.pf = session.platform

		let next

		await Initdaily(session)
		await UpdateUser(session)
		await Yun.count()

		await notice(session)

		next = await beforeEvent(session, command)
		if(next) return next;

		next = await checkUsageEvent(session, options, command)
		if(next) return next;

	})

async function notice(session:Session<'flags'>) {
	const { flags } = session.user
	const newsname = Yun.config.notice
	const newscontext = Yun.config.anounce
	const channel = await bot.db.getChannel(session.platform, session.channelId)
	const now = Date.now()


	if( !flags?.newscheck ){
		flags.newscheck = {}
	};

	if(!newsname || !newscontext ) return

	//console.log(( now > channel.announce))
	if( !channel?.announce || now > channel.announce){

		if(!flags?.newscheck[newsname] && session.platform == 'onebot' ){
			flags.newscheck[newsname] = true
			await session.send(newscontext)

			const due = now + Time.hour
			await bot.db.setChannel(session.platform, session.channelId, { announce : due })
		}
	}

}

//------------Init user------------->>
//对用户档案进行格式化与初始化。

async function InitUser( session:Session ){
	const { platform , userId } = session

	//初始化用户ID和档案格式
	const init = await initUserFirst(session)
	let userID = init[1]
	let name = init[0]
	let role = ''
	//await initUser(session, userID, name)

	let authority = 1
	//自动设置权限分配
	if(Object.keys(Authorized).includes(userID)){
		authority = Authorized[userID]
		role = Roles[userID]
	}

	//游戏档案初始化。只初始化基础数据。
	let game = new Game('')
	await ctx.database.setUser(platform, userId, { authority, userID, role, name, game })

}

async function Initdaily(session:Session<'daily'|'game'>) {
	const now = new Date()
	const { daily } = session.user
  console.log(daily)
	//每日刷新
	if( !daily?.lastDay || new Date(daily.lastDay).getDate() !== now.getDate() ){
		session.user.daily = new DailyData()
		session.user.game.AP = session.user.game.maxAP;
		session.user.$update()
	}
}

//---------Update User------------>>
//游戏进行中的各种数据处理。
async function UpdateUser(session:Session<'userID' | 'game' | 'chara'>) {
	const { userID } = session.user;

	if(!session.user.game?.signed) return;

	session.user.game = await Game.Count(userID)
	session.user.$update()
}


//---------BeforeEvent------------>>
//指令触发前的对话事件。
async function beforeEvent(session:Session<'userID' | 'game' | 'authority'>, command:Command) {
	const { user } = session;
	const {ignore:shouldIgnore,signed:shouldSigned} = command.config;

	if(user.authority < 1) return '……（已被拉黑）';

	if(session.platform == 'onebot' && session.channelId.match('private') && user.authority < 3 ) return '路昀什么反应都没有。\n（私聊窗口已关闭）';

	if(Yun.stats == 'sleeping' && shouldIgnore ){
		return whileSleeping('command')
	}

	if(Yun.stats == 'working' && shouldIgnore ){
		let text = whileWorking('command')
		if(text) return text
	}

	if(!user.game?.signed && shouldSigned){
		if( command.config.system ){
			return Common['not-signed-phone']
		}
		return Common['not-signed']
	}
}
}

