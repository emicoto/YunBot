import { Computed, Context, Dict, Session, User } from "koishi";
import { bot, DailyData, Game, Today, Yun } from ".";
import fs from "fs"
import { random } from "../Utils";
import { Core } from "../Core";

declare module 'koishi' {
  interface Tables {
    YunSave: UserData; //备份用
    oldsave: UserData; //旧存档
  }

  interface User {
    userID: string;
    chara: string;
    role: string;
    reset: number;
    game: Game;
    daily: DailyData;
    flags: any;
  }

  interface Channel {
    userList: string[];
    name: string;
    announce: Computed<number>;
    helptimer: Computed<number>;
  }

  namespace Command {
    interface Config {
      ignore?: boolean;
      yunAction?: boolean;
      notQQ?: boolean;
      signed?: boolean;
    }
  }
}

export interface UserData {
  id: any;
  uid: string;

  name: string;
  chara: string;
  reset: number;
  charalist: Dict<Game>;
  onebot?: string;
  discord?: string;
  kook?: string;
  sandbox?: string;
}

export function _extend(ctx: Context) {
  ctx.model.extend("YunSave", {
    id: "string",
    uid: "string",

    name: "string",
    chara: "string",
    reset: "integer",
    charalist: "json",
    onebot: "string",
    discord: "string",
    kook: "string",
    sandbox: "string",
  }, {
    foreign: {
      uid: ['user', 'userID'],
      chara: ['user', 'chara'],
    }
  })

  ctx.model.extend("oldsave", {
    id: "unsigned",
    uid: "string",

    name: "string",
    chara: "string",
    reset: "integer",
    charalist: "json",
  }, {
    autoInc: true,
  })

  ctx.model.extend("user", {
    userID: "string",
    chara: "string",
    role: "string",
    reset: "integer",
    game: "json",
    daily: "json",
    flags: "json",
  }, {
    autoInc: true,
  })

  ctx.model.extend("channel", {
    userList: "list",
    name: "string",
    announce: 'unsigned',
    helptimer: 'unsigned',
  }, {
    autoInc: true
  })
}

export async function save() {
  await Today.save()
  Yun.state.stats = Yun.stats
  await Yun.save()
}

export async function initUserFirst(session: Session) {
  let name;
  let uid = session.userId

  name = session.author?.nickname;
  if (!name) name = session.author?.username;

  name = UserNameGenerator(session.platform, uid, name)
  uid = UserIdGenerator(session.platform, uid)

  return [name, uid];
}

export function UserNameGenerator(pf: string, uid: string, name: string) {
  if (!name) name = uid;
  if (pf == 'onebot') return name;
  else {
    const code = `#${random(9)}${random(9)}${random(9)}${random(9)}`
    return name + code
  }
}

export function UserIdGenerator(pf: string, uid: string) {
  if (pf == 'onebot') return 'QQ#' + uid;
  else {
    const code = pf + `#${uid.slice(uid.length - 9, uid.length)}`
    return code
  }
}

export async function initUser(session: Session, userId: string, name: string) {
  const exist = await userExist(userId)
  if (exist) {
    return
  };
  session.app.logger.info("平台", session.platform.split(":")[0])
  const platform = session.platform.split(":")[0]
  const newId = await makeID()
  let data: UserData = {
    id: newId,
    uid: userId,
    name: name,
    reset: 0,
    chara: "",
    charalist: {}
  }
  data[platform] = session.userId
  session.app.logger.info("初始化用户", data)
  await bot.db.create("YunSave", data)
}

export async function getUser(uid: string): Promise<User> {
  const chk = await bot.db.get('user', { userID: uid })
  return chk[0]
}

export async function setDaily(uid: string, data: DailyData) {
  await bot.db.set('user', { userID: uid }, { daily: data })
}

export async function getName(uid: string) {
  const user = await bot.db.get('user', { userID: uid })
  //console.log(user.length, user[0].name)
  //console.log(user)

  if (user[0]?.game?.nick?.length)
    return user[0].game.nick;
  else if (user[0]?.game?.name?.length)
    return user[0].game.name
  else
    return user[0].name
}

export async function getSaves(uid: string): Promise<Dict<Game>> {
  const chk = await bot.db.get('YunSave', { uid: uid })
  return chk[0]?.charalist ?? []
}

export async function userExist(uid: string) {
  const chk = await bot.db.get("YunSave", { uid: uid })
  return (chk.length > 0)
}

export async function makeID() {
  let chk = await bot.db.get("YunSave", { id: { $gt: 0 } });

  let lastId = chk && chk.length > 0 ? parseInt(chk[chk.length - 1]?.id ?? 0) : 0
  const newid = lastId + 1 + random(3)
  const id = (chk.length > 10000000 ? chk.length.toString() : '0'.repeat(8 - (newid.toString().length)) + newid)

  return id
}

export async function checkData(session: Session<'userID' | 'name' | 'chara' | 'game'>, uid: string) {


  session.app.logger.info("检查数据")
  const _uid = UserIdGenerator(session.platform, session.userId)
  let chk = await session.app.database.get("YunSave", { uid: _uid });
  if (!chk[0]?.charalist) {
    await initUser(session, uid, session.user.name)
    await setTimeout(() => { }, 500);
  }
}
