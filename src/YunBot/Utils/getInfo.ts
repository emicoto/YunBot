import { between } from "../index";

export function cnTime() {
  var cn = new Date().toLocaleString("jpn", { timeZone: "Hongkong" });
  var cntime = new Date(cn);
  return cntime;
}

export function getTimeZone(hour:number) {
	if (between(hour, 2, 4)) return "凌晨";
	if (between(hour, 5, 7)) return "黎明";
	if (between(hour, 8, 10)) return "上午";
	if (between(hour, 11, 13)) return "中午";
	if (between(hour, 14, 16)) return "下午";
	if (between(hour, 17, 19)) return "傍晚";
	if (between(hour, 20, 22)) return "晚上";
	return "深夜";
}

export function getShichen() {
  const gan = [ "子", "丑", "寅", "卯", "巳", "午", "未", "申", "酉", "戌", "亥", ];
  const ke = ["一", "二", "三", "四", "五", "六", "七", "八"];

  let now = cnTime();

  let h = Math.floor(now.getHours() / 2);
  let m = Math.floor(now.getMinutes() / 15);

  let s = gan[h] + "时";

  if (h % 2 === 0) {
    s += ke[m];
  } else {
    s += ke[m + 4];
  }

  return s + "刻";
}

export function getLevelChar(lv) {
  let level = [
    "炼心", //0-10
    "破幻", //11+
    "灵动", //21+
    "开元", //31+
    "结丹", //41+
    "解灵", //51+
    "归一", //61+
    "通天", //71+
    "大乘", //81+
    "真仙", //91+
  ];
  let char = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  lv = Math.min(lv - 1, 100);

  let m = Math.min(Math.floor(lv / 10), 8);
  let i = lv % 10;

  let t = `${char[i]}阶`;

  if (lv == 90) {
    t = "大圆满";
  }

  let text = `${level[m]} ${t}`;
  return text;
}
