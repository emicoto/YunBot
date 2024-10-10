import { Context, segment, Session } from "koishi";
import {Lunar, Tao} from 'lunar-javascript';
import { HelpText } from "../TextLib";
import { getUsageName } from "./rate-limit";
import * as s from "../Utils"

export function ToolsCommand(ctx:Context){
	ctx.command("Lunar", "查看黄历时间以及宜忌信息等。", { system:true })
	.alias('黄历')
	.action(({ session }) => {
		let ly = Lunar.fromDate(s.cnTime());
		let year = `${ly.getYearInChinese()}年，`;
			year += `天运${ly.getGan() + ly.getZhi()}，`;
			year += `生肖 ${ly.getYearShengXiao()}\n`;
			year += `${ly.getMonthInGanZhi()}月，`;
			year += `${ly.getDayInGanZhi()}日，`;
			year += `${ly.getHou()}，月相 ${ly.getYueXiang()}\n`;
			year += `${ly.getMonthInChinese()}月 ${ly.getDayInChinese()}日 ${s.getShichen()}\n`;

		let jiyi = `宜：${ly.getDayYi().join("、")}\n忌：${ly
			.getDayJi()
			.join("、")}`;

		let tao = Tao.fromLunar(ly);
		let text = year + jiyi;

		if (tao.getFestivals().length >= 1) {
			let fes = tao.getFestivals();
			text += "\n道历节日：";
			for (let i = 0; i < fes.length; i++) {
			text += `${fes[i].getName()}　${fes[i].getRemark()}`;
			}
		}
		return text
	})

	ctx.command("servertime", "查看服务器时间", { system:true })
	.alias("时间")
	.action(({ session }) => {
		let time = new Date();
		let str = time.toLocaleString("cn-ZH");
		session.sendQueued(`本机服务器时间为：` + str);
		return;
	});

	ctx.command("poke <target>", "戳一戳")
	.alias('戳戳').alias('戳一戳')
	.shortcut("戳我")
	.action(({ session }, target) => {
		const parsedTarget = target ? segment.parse(target)[0] : null;
		
		session.send("o(-。- o)===3 ) σ- . -)σ");
		if (!parsedTarget) {
		return segment("poke", { qq: session.userId });
		} else {
		return segment("poke", { qq: parsedTarget.data.id });
		}

	});

	ctx.command("poket", "teach事件专用版戳一戳。", { hidden:true })
	.action(({ session }) => {
		session.send("o(-。- o)===3 ) σ- . -)σ");
		return segment("poke", { qq: session.userId });
	});

	ctx.command("at [target]", "让路昀bot艾特任意人。")
	.shortcut("艾特我")
	.action(({ session }, target) => {
		const parsedTarget = target ? segment.parse(target)[0] : null;

		if (!parsedTarget) {
		return s.At(session.userId);
		} else {
		return s.At(parsedTarget.data.id);
		}
	});

	ctx.on('help/command', (output, command, session:Session )=>{

		const name = getUsageName(command)
		if(!HelpText[name]) return

		output.push( HelpText[name].join('\n') )

	})

//------------------------------------------------------------------------------------->>
}