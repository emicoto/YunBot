import { Context, Schema } from "koishi";
import { Core } from "./Core";
import { } from '@koishijs/plugin-console'
import { Today, Yun } from "./Define";


export interface Config {

  tokenPrefix?: string;
  generateToken?: () => string;

  autoBreak?: boolean;
  autoRest?: boolean;
  autoWork?: boolean;
  autoSleep?: boolean;
  usingTime?: string;

  RepeatImg?: number;
  Laugh?: number;
  RandomImg?: number;
  RandomPoke?: number;
  event?: string;
  notice?: string;
  anounce?: string;
  eventday?: number;
  bonuslist?: string;
  shopitems?: shopitems[];
}
export interface shopitems {
  name: string;
  type: string;
  stock: number;
  discount: number;
  value?: number;
}

export const name = 'yunbot'

export const ShopItem: Schema<shopitems> = Schema.object(
  {
    name: Schema.string().required().description('商品名称'),
    type: Schema.string().required().description('种类'),
    stock: Schema.number().required().description('每日库存'),
    discount: Schema.number().default(1.10).description('设置折扣')
  }
)

export const Config: Schema<Config> = Schema.intersect([

  Schema.object({
    autoBreak: Schema.boolean().default(false).description('是否允许不经过指令或事件，自主突破境界。'),
    autoRest: Schema.boolean().default(true).description('是否允许不经过指令或事件，自主进入休息状态。'),
    autoWork: Schema.boolean().default(false).description('是否允许不经过指令或事件，自主进入修炼状态。'),
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

  Schema.object({
    event: Schema.string().default('').description('设置活动名称'),
    notice: Schema.string().default('').description('设置公告名称'),
    anounce: Schema.string().default('').description('设置公告内容'),
    eventday: Schema.number().default(0).description('设置活动持续天数'),
    bonuslist: Schema.string().default('').description('设置奖励物品列表')
  }).description('活动设置'),

  Schema.object({
    shopitems: Schema.array(ShopItem).description('设置每日商店的商品。'),
  }).description('商店设置')

])
export const inject = {
  required: ['database'],
}
export function apply(ctx: Context, config: Config = {}) {
  //   ctx.inject(['console',"database"], (ctx) => {
  //     // ctx.console.addEntry({
  //     //   dev: resolve(__dirname, '../client/index.ts'),
  //     //   prod: resolve(__dirname, '../dist'),
  //     // })
  //     console.log(ctx)
  //})
  Today.baseDir = ctx.baseDir;
  Yun.baseDir = ctx.baseDir;
  Core.init(ctx, config)
}
