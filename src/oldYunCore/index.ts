import{Context, segment, Bot, template} from "koishi"
import * as s from "./Settings"
import * as f from "./Function"

const { createHash } = require('crypto')
/*
 import Daily from './Daily'
 import jrrp from './jrrp'

 export function apply(ctx:Contex){
    ctx.plugin(Daily)
    ctx.plugin(jrrp)
 }
 */

export default function Yuncore(ctx: Context){
    s.__extend(ctx)
    if(!s.Usertoday) s.initData();
	

}
