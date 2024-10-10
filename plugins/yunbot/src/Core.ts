import { Context } from "koishi";
import { between, bot, cnTime, getResCount, getTimeZone, images, master, Today, Yun, _extend } from "./unit"
import { BeforeUser, getLuck, RateLimit, TestCom, Bind, UserCommon, ToolsCommand } from "./Plugin";
import { DailyTraining, UserRegistry, DailyRoutine, CheckStatus, GameCom, GameMenu, ShopSystem } from "./Game";
import { Config } from "./index";
import { YunAI } from "./AI";
import { PlayerCombat } from "./Game/pk";

export class Core {
  private static _instance: Core;
  public static get instance() {
    return Core._instance;

  }
  private loading: number = 0;

  public static init(app: Context, config: Config = {}) {
    console.log('Core已初始化')
    if (!Core._instance) {
      Core._instance = new Core(app, config);
      Core._instance.Start();
    }

    return Core._instance;
  }

  public ctx: Context;
  public conf: Config;

  constructor(app: Context, config: Config = {}) {
    this.ctx = app;
    this.conf = config;
    bot.db = app.database;

  }

  private Start() {
    _extend(this.ctx);
    this.initPlugins();
    this.BindEvent();
  }

  private initPlugins() {

    this.ctx.plugin(YunAI)
    this.ctx.plugin(UserCommon)
    this.ctx.plugin(ShopSystem)
    this.ctx.plugin(PlayerCombat)
    this.ctx.plugin(GameCom)
    this.ctx.plugin(GameMenu)
    this.ctx.plugin(DailyTraining)
    this.ctx.plugin(DailyRoutine)
    this.ctx.plugin(CheckStatus)
    this.ctx.plugin(UserRegistry)
    this.ctx.plugin(ToolsCommand)
    this.ctx.plugin(getLuck)
    this.ctx.plugin(RateLimit)
    this.ctx.plugin(BeforeUser)
    this.ctx.plugin(Bind)
    this.ctx.plugin(TestCom)

  }

  private BindEvent() {
    this.onBotConnect();
    this.onBotStatusUpdated();
  }

  private onBotStatusUpdated() {
    this.initYun();
    this.initBot();
  }

  private onBotConnect() {
    this.ctx.on("bot-connect", () => {
      if (!Yun.botstats) {
        Yun.botstats = "botOn";
        console.log("路昀bot已链接。准备中……")
      }
    })

    this.ctx.on("ready", () => {
      const that = this;
      setTimeout(() => {
        if (Yun.state) {
          console.log('数据加载完毕？')
          if (!bot?.s) {
            Yun.load();
            Today.load();
          }
          setTimeout(() => {
            if (bot.s) {
              console.log('数据加载完毕。')
            }
          }, 1000);
        }
        Yun.config = that.conf
        console.log('设置已读取：', Yun.config)
      }, 2000);
    })
  }

  private async initYun() {
    const that = this;
    this.ctx.on("bot-status-updated", async (session) => {
      if (Yun.state) {
        console.log("本地数据已读取完毕！开始唤醒路昀bot。")
        console.log(`userid:${session.userId}`)
        const time = new Date()
        const res = [
          `${time.toLocaleString()}`,
          `路昀bot已正常启动……`,
          `已读取可用指令${this.comlist.length}条，自动回复${getResCount()}条。`,
          `本地控制台：http://localhost:5140/`
        ]

        let txt = res.join('\n'), txt1 = ""
        let now = time.getHours()
        let zone = getTimeZone(now)

        if (Yun.stats == 'sleeping') {
          Yun.stats = 'awake';
          Yun.save()
          console.log('路昀苏醒了。')
        }

        if (['晚上', '深夜'].includes(zone)) txt1 = '师父，晚上好。';
        if (between(now, 4, 6)) txt1 = '……师父，早上好？这时间肯定是通宵了吧，可不要熬太久，请注意休息……';
        if (between(now, 7, 8)) txt1 = '师父，早上好……呼啊……起得也太早了吧……（揉眼睛'
        if (between(now, 9, 13)) txt1 = '……师父，早上好。'
        if (['下午', '傍晚'].includes(zone)) txt1 = '午安，师父。'

        txt1 += '请问今天有什么吩咐吗？'

        setTimeout(() => {
          if (session.platform == 'onebot') {

            session.sendPrivateMessage(master, txt)
          }

        }, 1000)

        setTimeout(() => {
          if (session.platform == 'onebot') {
            session.sendPrivateMessage(master, txt1)
          }

        }, 2000);

        Yun.botstats = 'LoadEnd'
        console.log('数据初始化完毕。')
      }
    })
  }

  get comlist() {
    const $ = this.ctx.$commander
    const commands = $._commandList.filter(cmd => cmd.parent === null)

    return commands
  }

  private async initBot() {
    const that = this;
    this.ctx.on("bot-status-updated", (session) => {
      setTimeout(async () => {
        if (Yun.botstats == 'LoadEnd') {
          let text = `${images('yunneoki.png')}\n路昀从睡眠中苏醒，懒洋洋地打了个哈欠：`

          const now = cnTime().getHours()
          const zone = getTimeZone(now)

          if (['晚上', '深夜', '凌晨'].includes(zone)) text += '“师父……还有同门的各位晚上好……”\n“……啊，这午觉好像睡过头了……”';
          if (zone == '黎明') text += '“师父……还有各位早上好……”\n“呜……我好像起得太早了……”';
          if (zone == '上午') text += '“师父……还有各位……早啊……”';
          if (zone == '中午') text += '“师父……还有各位……中午好……”';
          if (['下午', '傍晚'].includes(zone)) text += '“师父……还有各位……下午好……”\n“……？我是不是起太晚了……？”';

          // if(Yun.stats == 'awake'){
          // 	await that.ctx.broadcast(['4709267978629327','246789096'],text)
          // }
          console.log('路昀bot已启动完毕。')
          Yun.botstats = 'Running'

        }
      }, 2000)

      if (Yun.botstats !== 'LoadEnd' && Yun.botstats !== 'Running') {
        that.loading++
        console.log('本地数据读取中……\n', '状态：', Yun.botstats, '进度：', that.loading)
        Yun.botstats = 'onLoading'
      }
    })
  }

}
