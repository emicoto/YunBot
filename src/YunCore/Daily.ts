import { Context, segment } from "koishi";
import { getJrrp, getJrrpComment } from "./getluck";

import * as f from "./Function"
import * as s from "./Setting"

export default function Daily(ctx: Context){

    ctx.command("每日签到","每日签到。签到前最先找小昀算一卦。")
        .shortcut("签到")
        .shortcut("打卡")
        .action( async ({ session }) =>{
            let uid = session.userId
            let user = await s.getUser(ctx, uid)
            let name = await s.getUserName(ctx, session)

            if(s.usertoday[uid]?.sign === true){
                return "今天已经签到过了。"
            }

            if(!user.flag?.signed){
                return "签到之前麻烦先填份入门信息吧……"
            }

            if(!s.usertoday[uid]['luck']){}

        })

}