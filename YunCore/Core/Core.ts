import { Context } from "koishi";
import { getImage } from "./Utils";

type BotStatus = "" | "boton" | "botonloading" | "botrunning";

export class YunCore {
	private static _instance: YunCore;
	public static init(ctx: Context) {
		if (YunCore._instance == null) {
			YunCore._instance = new YunCore(ctx);
			YunCore._instance.Start();
		}
		return YunCore._instance;
	}
	private _ctx: Context;
	private _botstatus: BotStatus = "";
	constructor(ctx: Context) {
		this._ctx = ctx;
	}
	private get BotStatus() {
		return this._botstatus;
	}
	private set BotStatus(value: BotStatus) {
		this._botstatus = value;
	}
	private Start() {
		this.initPlugins();
		this.BindEvent();
	}
	private initPlugins() {
		//this.registerPlugin()
	}
	private registerPlugin(plugin: any) {
		this._ctx.plugin(plugin);
	}
	private BindEvent() {
		this.onBotConnect();
		this.onBotStatusUpdated();
	}

	private onBotStatusUpdated() {
		this.initYunState();
		this.initBotState();
	}
	private onBotConnect() {
		const that = this;
		this._ctx.on("bot-connect", () => {
			if (that.BotStatus === "") {
				that.BotStatus = "boton";
				console.log("路昀bot已链接。准备中……");
			}
		});
	}
	private async initYunState() {
		const that = this;
		this._ctx.on("bot-status-updated", async (session) => {});
	}
	private async initBotState() {
		const that = this;
		this._ctx.on("bot-status-updated", async (session) => {
			if (that.BotStatus === "botonloading") {
				let text = `${getImage("yunneoki.png")}\n路昀从睡眠中苏醒，懒洋洋地打了个哈欠：`;
				const now = new Date()
			}
		});
	}
}
