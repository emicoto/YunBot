import { Schema } from "koishi";
import { Today, Yun } from "./Base";

export * from "./Base"
export * from "./Lib"
export * from "./Utils"
export * from "./Core"
export * from "./Plugin"

export interface YunConfig {
	autoBreak: boolean;
	autoRest: boolean;
	autoWork: boolean;
	autoSleep: boolean;
	usingTime: string;
}

export const name = 'YunCore'
export const using = ['database'] as const
export const Config: Schema<YunConfig> = Schema.object({
	autoBreak: Schema.boolean().default(false).description('是否允许不经过指令或事件，自主突破境界。'),
	autoRest:  Schema.boolean().default(true).description('是否允许不经过指令或事件，自主进入休息状态。'),
	autoWork:  Schema.boolean().default(false).description('是否允许不经过指令或事件，自主进入修炼状态。'),
	autoSleep: Schema.boolean().default(false).description('是否允许不经过指令或事件，自主进入睡眠状态。'),
	usingTime: Schema.string().default('US').description('设置每日刷新时的标准时区。')
})

export var yundata:Yun = Yun.state
export var today:Today = Today.data

if(!yundata){
	yundata = Yun.load();
	today = Today.load();
	if(Yun.botstats === 'failed'){
		setTimeout(() => {
			yundata = Yun.load();
			today = Today.load();
		}, 2000);
	}
}