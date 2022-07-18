import { Bot, Context, segment, Session} from "koishi";
import { Lunar } from "lunar-javascript"
import * as f from "./function";
import { getResCount } from "./YunCore/lib/reply"

var YunWorking

function stopWorking(){
    clearInterval(YunWorking)
    console.log("自动修炼已停止")
}

export default async function ping(ctx: Context) {
    // 如果收到“天王盖地虎”，就回应“宝塔镇河妖”

    if ( !f.userdata ||!f.userdata['1794362968']) f.initData();
    var botstatus
    var botupdated = 0

    ctx.on('bot-added',async(session)=>{
		botstatus = 'boton'
		console.log('路昀bot已正常启动。数据库准备中……')

		let time = new Date()
		let res = [
			`${time.toLocaleString()}`,
			`路昀bot已正常启动……`,
			`已读取自动回复${getResCount()}条。`,
			`本地控制台：http://localhost:5140/`
		]

		let text1 = res.join('\n')
		let text2 = ``

		let now = time.getHours()
		let zone = f.getTimeZone(now)

		if(['晚上','深夜'].includes(zone)) text2 = '师父，晚上好。';
		if(f.between(now,4,6)) text2 = '……师父，早上好？这时间肯定是通宵了吧，可不要熬太久，请注意休息……';
		if(f.between(now,7,8)) text2 = '师父，早上好……呼啊……起得也太早了吧……（揉眼睛'
		if(f.between(now,9,13)) text2 ='……师父，早上好。'
		if(['下午','傍晚'].includes(zone)) text2 = '午安，师父。'

		text2 += '请问今天有什么吩咐吗？'

		session.sendPrivateMessage('1794362968', text1)

		setTimeout(() => {
			session.sendPrivateMessage('1794362968', text2)
		}, 1000);
    })

    ctx.on('bot-status-updated',async(session)=>{
        setTimeout(()=>{
            if (botstatus == 'boton'){
            ctx.broadcast(f.images('yunneoki.png')+'\n路昀从睡眠中苏醒，懒洋洋地打了个哈欠：“师父、各位师兄弟们，早啊……”')
            console.log('机器人已正常启动。')
            botstatus = 'botrunning'
        }},2000)
        botupdated ++
        console.log('……机器人动态更新了，次数：', botupdated, "状态：",botstatus)
    })

    ctx.middleware(async (session, next) => {
        let timetick = new Date()
        if ( !f.usertoday?.day || f.usertoday.day != timetick.getDate() ){
            f.NewToday()
        }
        let nick = "";

        if (session.content.match(/\[CQ:image,file=(.+)\]$/) && f.random(100) < 30){
            return session.content
        }

        if (session.author.nickname && session.author.nickname.length > 0) {
            nick = session.author.nickname;
        } else {
            nick = session.author.username;
        }

        if (session.content === "天王盖地虎") {
            return "宝塔镇河妖";
        }
        
        else if (f.textinclude(session.content, ["新年", "除夕", "新春"])) {
            return f.images("yun_newyear.png");
        }
        
        else if (
            f.textinclude(session.content, [
                "醒来",
                "醒了",
                "睡醒",
                "早啊",
                "早安",
                "早上好",
                "大家早",
                "困醒",
            ]) ||
            session.content === "早"
            
        ) {
            let text = "";

            if (session.userId == "1794362968") {
                text = f.either([`早啊，师父。`, `师父早安。`, "师父，早。"]);

                if (f.yunstate.sleep) {
                    text = "呼啊……" + text + "\n我也才起床……";
                    f.yunstate.sleep = false;
                    f.yunsave();
                }
            } else {
                text = f.either([
                    `……早安，${f.At(session.userId)}`,
                    `……早，${f.At(session.userId)}`,
                    `……${f.At(session.userId)}，早上好`,
                ]);
            }
            return text;
        }

        else if(session.content.match('一时爽')){
            let str = session.content.split('一时爽')
            
            if (session.content.match('火葬场')){
                return `一直${str[0]}一直爽。`
            }

            if(session.content.match('挖坑')){
                str[0] = '填坑'
            }
            if(session.content.match('草稿')){
                str[0] = '线稿'
            }
            if(f.random(1,10) >= 5){
                return `一直${str[0]}一直爽。`
            }
            return `${str[0]}火葬场`;
        }

        else if(session.content.match('awsl')){
            return "……阿伟乱葬岗？"
        }

        else if (
            f.textinclude(session.content, ["小昀", "路昀"]) &&
            f.textinclude(
                session.content,
                ["起来", "起床", "醒醒", "醒过来", "醒来"]
            )
        ) {
            let text;

            if (f.random(1, 100) > 60) {
                text = f.either([
                    "……呜……醒了。",
                    "……呼啊，早啊。" +
                        (session.userId == "1794362968"
                            ? "师父"
                            : f.At(session.userId)),
                    f.images("hardwake.jpg"),
                ]);
            } else {
                text = f.either([
                    "……呜。再五分钟。（翻身过去继续睡）",
                    f.faceicon("睡眠") + "\n……呼……呼……（依然在睡）",
                ]);
            }

            return text;
        }
        
        else if (f.yunstate.sleep) {
            if (f.YunCall(session.content) == true) {
                return `${f.faceicon("睡眠")}\n……呼……呼……（睡得挺香的样子）`;
            }

            if (f.random(1, 1000) < 20 && session.content.length > 4)
                return `${f.faceicon("睡眠")}\n……呼……呼……（睡觉中）`;

            return next();
        }
        
        else if (f.yunstate.work > 0) {
            let text = f.either([
                "…………静心。（打坐中）",
                "…………勿扰。（打坐中）",
                "……摒除杂念。（打坐中）",
            ]);
            let text2 = f.either([
                "……在、在好好修行了。",
                "…………在修行了，不要打扰。",
                "……静心。",
                "……应该还好。",
            ]);

            if (f.yunstate.work === 0) {
                f.yunstate.exp++;
                f.yunsave();
                return (
                    f.faceicon("普通") +
                    `\n好了，今天就修行到这里吧。（路昀修行经验 +1，总计:${f.yunstate.exp}）`
                );
            }

            if (f.YunCall(session.content) == true) {
                return f.faceicon("闭眼") + text;
            }

            if (
                f.textinclude(session.content, [
                    "修行进度",
                    "修行得怎样",
                    "修行得如何",
                    "修行",
                    "修炼",
                ])
            ) {
                return (
                    f.faceicon("普通") +
                    `\n${text2}（剩余进度${f.yunstate.work})`
                );
            }

            if (f.random(1, 1000) < 100 && session.content.length > 2) {
                return f.faceicon("闭眼") + text;
            }

            return next();
        }
        
        else if (f.textinclude(session.content, ["修炼", "修行"])) {
            let rate = f.random(1, 100);
            let text = "";
            if (rate < 30) {
                f.yunstate.work = 5;
                text = f.either([
                    "……静心，打坐……",
                    "……摒除杂念……入定……",
                    "……呼纳……吸气……",
                ]);
                f.yunsave();
            } else {
                text = f.either([
                    "……呜……不想修炼……",
                    (session.userId == "1794362968"
                        ? "师父"
                        : session.userId == "1742029094"
                        ? "师叔"
                        : session.userId == "1632519382"
                        ? "师哥"
                        : "师弟") + "……今天休息可以吗……？",
                    "……好困（揉揉眼睛",
                ]);
            }
            return text;
        }
        
        else if (
            f.textinclude(session.content, [
                "困了",
                "睡了",
                "睡去",
                "睡觉",
                "晚安",
                "去睡",
                "睡啦",
            ]) ||
            session.content === "安"
        ) {
            let text = "";
            if (f.yunstate.sleep && f.random(1, 100) > 50) {
                text = `${f.faceicon("睡眠")}\n……呼……呼……（也在睡了）`;
            } else {
                if (f.random(1, 100) < 60 && session.userId == "1794362968") {
                    text = "……呜啊，我也困了……\n我也睡啦，师父晚安。";
                    f.yunstate.sleep = true;
                    f.yunsave();
                } else if (f.random(1, 100) < 45) {
                    text = `……晚安，${
                        session.userId == "1794362968" ? "师父" : f.At(session.userId)
                    }`;
                }
            }
            return text;
        }
        
        else if (
            f.textinclude(session.content, [
                "涩涩",
                "色色",
                "透透",
                "很色",
                "很涩",
                "色爆",
                "涩爆",
                "射爆",
                "蛇爆",
                "色图",
                "涩图",
            ]) &&
            f.random(1, 100) < 40
        ) {
            return f.images("nosese.jpg");
        }
        
        else if (
            Date().includes("Feb 14") &&
            (session.content.includes("情人节快乐") ||
                f.textinclude(session.content, ["情人节", "恋人", "伴侣"]))
        ) {
            let text = f.either([
                `${f.faceicon(
                    "微笑"
                )}\n……情人节快乐。会庆祝这一天的话，那么你是有恋人了吗？\n……那挺好的。`,
                "情人节快乐？",
                `${f.faceicon("微笑")}\n嗯，单身情人节快乐。`,
                `……今天好像是和恋人一起渡过的日子。……可是我没有恋人。\n${f.faceicon(
                    "不安"
                )}\n嗯？你问我阿宵？我们、只是普通的青梅竹马啦……`,
                `情人节啊……那么${f.At(session.userId)}有恋人吗？`,
                `${f.faceicon(
                    "害羞笑"
                )}\n……听说今天是给人送巧克力的节日……嗯，所以……我会有吗？`,
            ]);
            return text;
        }
        
        else if (
            f.textinclude(session.content, ["路昀", "小昀"]) &&
            f.WordLinkList(
                session.content,
                ["来玩", "来打", "一起", "联机"],
                ["游戏", "丧尸", "僵尸"]
            ) <= 3
        ) {
            if (session.userId == "1794362968") {
                return `${f.faceicon("开心")}\n好的师父，一起玩吧。`;
            } else if (f.random(1, 100) > 60) {
                return `${f.faceicon("微笑")}\n……可以的。一起玩。`;
            } else {
                return `………？先等我打完这局……`;
            }
        }
        
        else if (
            f.WordLinkList(
                session.content,
                ["玩", "打", "联机"],
                [
                    "pz",
                    "僵毁",
                    "丧毁",
                    "丧尸毁灭计划",
                    "僵尸毁灭计划",
                    "丧尸",
                    "僵尸",
                ]
            ) <= 3 &&
            f.random(1, 100) < 30
        ) {
            let text = f.either([
                `${f.At(
                    session.userId
                )} 要一起打丧尸吗？听说挺好玩的……最近我也一直沉迷在其中呢。`,
                `Project Zomboid，这个游戏挺硬核的，同时也很有趣呢。\n${f.faceicon(
                    "微笑"
                )}\n在末日的黄昏下，人在圈中悠闲地种菜，外面确尸山遍野什么的……不觉得这样的挺有种矛盾感、一种特别的末日浪漫吗？`,
                `${f.images("yungaming.png")}\n……不要打扰我，丧尸快接近了。`,
            ]);
            return text;
        }
        
        else if (
            f.WordLinkList(
                session.content,
                ["笨蛋", "傻逼", "蠢蛋", "傻瓜", "死", "臭", "蠢", "傻"],
                ["路昀", "小昀"]
            ) <= 1
        ) {
            let text = f.either([
                "……呜，你这是在骂我吗？",
                "……呜，骂人是不对的……",
                "……哎，说脏话是不好的……",
                "………好好地称呼人就不行吗？你真讨厌……",
            ]);

            if (f.textinclude(session.content, ["宝", "亲亲", "摸摸"])) {
                return f.faceicon("生气") + "…………。好好地称呼人就不行吗？";
            }
            return f.faceicon("愤怒") + text;

        }
        
        else if (session.content === ".r") {
            let result = f.random(1, 100);
            let message = session.author.nickname + "掷骰：D100=" + result;
            if (!f.userdata[session.userId]){ f.userdata[session.userId] = { lastdice:0, money:0, }}
            f.userdata[session.userId]["lastdice"] = result;
            f.saveUserdata();

            return message;
        }
        
        else if (session.content === "艾特我") {
            return f.At(session.userId);
        }
        
        else if (session.content === "上一个掷骰结果") {
            console.log(f.userdata);
            if (f.userdata[session.userId]) {
                return f.userdata[session.userId].lastdice;
            } else {
                return "结果为空";
            }
        }
        
        else if (session.content.length > 1 && f.random(1, 1000) < 20) {
            return f.either([
                f.images("doge.jpg"),
                f.images("seekinside.png"),
                f.images("moyu.png"),
            ]);
        }
        
        else if (session.content.length > 1 && f.random(1, 1000) < 20) {
            session.send("o(-。- o)===3 ) σ- . -)σ");
            return segment("poke", { qq: session.userId });
            
        }
        
        else if (f.YunCall(session.content) === true) {
            let message = f.faceicon("普通") + "\n……在叫我吗？";
            if (session.userId == "1794362968") {
                message += "师父？";
            } else {
                message += session.author.nickname;
            }
            return message;
        }
        
        else if (session.content === "测试") {
            f.yunstate.work = 60
            YunWorking = setInterval(()=>{
                f.yunstate.work --;
                f.yunsave()
                if(f.yunstate.work==0){
                    session.send((f.faceicon("普通") +`\n好了，今天就修行到这里吧。（路昀修行经验 +1，总计:${f.yunstate.exp}）`))
                    stopWorking()
                }
                }, 1000)
                
            return "测试开始。";
        }
        
        else {
            return next();
        }
    });
}
