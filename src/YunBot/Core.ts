import { Context } from "koishi";
import RateLimit from "./Plugin/rate-limit";
import {Yun, Today, Game} from "./index"
import * as s from "./index"

export class YunCore {
	private static _instance:YunCore;

	public static init(app:Context){
		if(!YunCore._instance){
			YunCore._instance = new YunCore(app);
			YunCore._instance.Start();
		}
		return YunCore._instance;
	}

	private ctx: Context;

	constructor(app:Context){
		this.ctx = app;
	}

	private Start(){
		this.initPlugins();
		this.BindEvent();
	}

	private initPlugins(){
		this.Plugin(RateLimit)
		//this.Plugin(UserCom)
		//this.Plugin(Com)
		//this.Plugin(Daily)
		//this.Plugin(PK)
		//this.Plugin(Combat)
		//this.Plugin(Quest)
		//this.Plugin(getluck)
		//this.Plugin(Shop)
		//this.Plugin(Craft)
		//this.Plugin(Farm)
		//this.Plugin(YunAI)
	}

	private Plugin(Plugin: any){
		this.ctx.plugin(Plugin);
	}

	private BindEvent(){
		this.onBotConnect();
		this.onBotStatusUpdated();
	}

	private onBotStatusUpdated(){
		this.initYun();
		this.initBot();
	}

	private onBotConnect(){
		this.ctx.on("bot-connect", ()=>{
			if(!Yun.botstats){
				 Yun.botstats = "botOn";
				console.log("路昀bot已链接。准备中……")
			}
		})
	}

	private async initYun(){
		const that = this;
		this.ctx.on("bot-status-updated", (session)=>{
			if(!s.yundata){
				s.yundata = Yun.load()
			}
			if(s.yundata){
				console.log("本地数据已读取完毕！开始唤醒路昀bot。")

				let time = new Date()
				let res = [
					`${time.toLocaleString()}`,
					`路昀bot已正常启动……`,
					`已读取自动回复${s.getResCount()}条。`,
					`本地控制台：http://localhost:5140/`
				]

				let txt = res.join('\n'), txt1 = ""
				let now = time.getHours()
				
				if(s.yundata.stats == 'sleep'){
					s.yundata.stats = 'wake';
					console.log('路昀苏醒了。')
				}
			}
		})
	}

	private async initBot(){
		const that = this;
		this.ctx.on("bot-status-updated", (session)=>{
			
		})
	}

}