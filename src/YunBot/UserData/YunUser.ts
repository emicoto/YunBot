export * from "@koishijs/plugin-rate-limit";
import * as y from "../index"

import { Context, Session } from "koishi";
import { createHash } from "crypto";
import fs from "fs";

export var yun:y.YunData;
export var today:y.TodayData;

export function _extend( ctx:Context ){
	ctx.model.extend("YunSave",{
		id:"unsigned", qid:"string",
		name:"string", nick:"string",
		title:"string",

		money:"integer",
		trust:"integer", favo:"integer",

		chara:"json", items:"json",
		storage:"list",

		upgrade:"json", farm:"json",
		cflag:"json", flag:"json"
	})
}