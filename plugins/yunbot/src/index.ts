import { Context, Schema } from "koishi";
import { Core } from "./Core";
import { resolve } from 'path'
import {} from '@koishijs/plugin-console'


export interface Config {

	tokenPrefix?:string;
	generateToken?:() => string;

	autoBreak?: boolean;
	autoRest?: boolean;
	autoWork?: boolean;
	autoSleep?: boolean;
	usingTime?: string;

}

export const name = 'yunbot'
export const using = ['database'] as const
export const Config: Schema<Config> = Schema.intersect([

Schema.object({
	autoBreak: Schema.boolean().default(false).description('是否允许不经过指令或事件，自主突破境界。'),
	autoRest:  Schema.boolean().default(true).description('是否允许不经过指令或事件，自主进入休息状态。'),
	autoWork:  Schema.boolean().default(false).description('是否允许不经过指令或事件，自主进入修炼状态。'),
	autoSleep: Schema.boolean().default(false).description('是否允许不经过指令或事件，自主进入睡眠状态。'),
	usingTime: Schema.string().default('US').description('设置每日刷新时的标准时区。')
}).description('基本设置'),


Schema.object({
	generateToken: Schema.function().hidden(),
}).description('插件设置'),

Schema.object({
	RepeatImg: Schema.number().default(0.2).description('表情包复读的概率'),
	Laugh: Schema.number().default(0.2).description('对群友哈哈哈气氛组进行反应的概率'),
	RandomImg: Schema.number().default(0.03).description('随机表情包的触发概率'),
	RandomPoke: Schema.number().default(0.03).description('随机戳一戳的概率'),
}).description('概率设置'),
	
])
export function apply(ctx:Context, config: Config={}){
  ctx.using(['console'], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, '../client/index.ts'),
      prod: resolve(__dirname, '../dist'),
    })
  })
	Core.init(ctx, config)
}