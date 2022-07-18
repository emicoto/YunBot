import { Context, segment } from "koishi"
import * as f from "./Function"
import * as s from "./Setting"
import { whileSleeping } from "./lib/reply"

import getluck from "./getluck"
import YunAI from "./AI"

const notignore = ['channel','help','schedule','test','timer','usage','user','小灵通']

export default function YunCore(ctx: Context){

    //先完成数据设定的初始化    
    s.__extend(ctx)
    s.initData()
    s.saveAll()

    ctx.before('command/execute', ({session, command})=>{
        if(!session.user) return;
        if(s.yunstate.stats == 'sleep' && !notignore.includes(command.name)) return whileSleeping('command');
    })

    //加载各个模块
    ctx.plugin(YunAI)
    ctx.plugin(getluck)
    /*
    ctx.plugin(Users)

    ctx.plugin(Daily)
    ctx.plugin(Com)
    ctx.plugin(Dice)
    ctx.plguin(ADRoles)
     */

}