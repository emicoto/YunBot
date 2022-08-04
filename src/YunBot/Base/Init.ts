import { Context, Session, User } from "koishi";
import { Game, today, yundata, writeFileSync } from "../index"
import { createHash } from "crypto";

declare module 'koishi'{
	interface Tables{
		YunSave:UserData; //备份存档用
	}

	interface User{
		nick:string;
		onebot:string;
		reset:number;
		game:Game;
	}

	namespace Command {
		interface Config{
			ignore?: boolean;
		}
	}
}

export interface UserData{
	id:any;
	uid:string;

	name:string;	nick:string;
	reset:number;
	charalist:Array<any>;

	game:Game;
}

export function _extend( ctx:Context ){
	ctx.model.extend("YunSave",{
		id:"unsigned",
		uid:"string",
		name:"string",
		nick:"string",
		reset:"integer",
		charalist:"list",
		game:"json",
	}, {
  		autoInc: true,
	})

	ctx.model.extend("user",{
		nick:"string",
		reset:"integer",
		game:"json",
			"game.name":"string","game.nick":"string",
			"game.title":"string","game.soul":"string",
			"game.favo":"integer","game.trust":"integer",

			"game.level":"integer", "game.exp":"integer",
			"game.luck":"integer", "game.lastluck":"integer",
			"game.stats":"string",

			"game.HP":"integer", "game.maxHP":"integer",
			"game.SP":"integer", "game.maxSP":"integer",
			"game.AP":"integer", "game.maxAP":"integer",
			"game.BP":"integer",

			"game.ATK":"integer", "game.DEF":"integer",
			"game.SPD":"integer", "game.INT":"integer",
			"game.WIL":"integer",

			"game.mine":"integer","game.plant":"integer",
			"game.medicine":"integer","game.craft":"integer",
			"game.research":"integer",

			"game.core":"json", "game.equip":"json",
			"game.skill":"json", "game.upgrade":"json",
			"game.items":"json", "game.storage":"list",
			"game.flag":"json", "game.cflag":"json",
			"game.memory":"list",
			"game.signed":"boolean",

			"game.soulchar":"text", "game.charaname":"text",
	})

}

export async function save() {
	let data1 = JSON.stringify(today)
	await writeFileSync("UserToday.json", data1);
	
	let data2 = JSON.stringify(yundata)
	await writeFileSync("YunData.json", data2);
	console.log('已保存全部本地数据。')
}

export function getMood(){
	const hash = createHash("sha256")
	hash.update("185632406");
	hash.update((new Date().getTime() / (1000 * 60 * 60 * 24)).toFixed(0));
	hash.update("6688");

	let val = Math.max(parseInt(hash.digest("hex"), 16) % 101, 1);
	return val
}

export async function getUser(ctx:Context, platform:string, uid:string):Promise<Game>{
	let data:User, user:Game;
	data = await ctx.database.getUser(platform, uid);

	if(!data.game.signed){
		user = new Game(data.name, data.nick);
		data.game = user;
	}

	if( data.game.name !== data.name || data.game.nick !== data.nick){
		data.game.name = data.name;
		data.game.nick = data.nick;
	}

	user = data.game;
	await setUser(ctx, platform, uid, user);

	return user
}

export async function setUser( ctx:Context, platform:string, uid:string, data:Game) {

	console.log('存档前：',data);

	await ctx.database.setUser(platform, uid,{game:data});

	let chk = await ctx.database.getUser(platform, uid ,['game']);
	console.log('存档后：',chk);
}

export async function getUsername( ctx:Context, session:Session) {
	let userdata, name;
	let uid = session.userId ?? ""

	userdata = await ctx.database.getUser(session.platform, uid)

	if(userdata.name) name = userdata.name;
	if(userdata.nick) name = userdata.nick;

	if(!name){
		name = session.author?.nickname;
		if(!name) name = session.author?.username;
		await ctx.database.setUser(session.platform, uid, { name: name })
	};

	return name;
}

export async function ctsetFavo(ctx:Context, uid:string, val:number) {
	let data = await ctx.database.getUser('onebot', uid, ['game']);
	data.game.favo += val
	await setUser(ctx, 'onebot', uid, data.game)
	console.log('好感变化：',val, await (await ctx.database.getUser('onebot',uid,['game'])).game.favo)
}

export async function ctsetTrust(ctx:Context, uid:string, val:number) {
	let data = await ctx.database.getUser('onebot', uid, ['game']);
	data.game.trust += val;
	await setUser(ctx, 'onebot', uid, data.game)
	console.log('信赖变化：',val, await (await ctx.database.getUser('onebot',uid,['game'])).game.favo)
}