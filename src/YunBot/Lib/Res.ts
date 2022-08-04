import * as y from "../index"

export const Restype = {
  晚安语:
	/^((?!还没|没有|没想|不困|说到这个).)*((困了|睡了|睡去|睡觉|晚安|去睡|睡啦|眠去|眠了|安安啦|歇了)\.{0,8}$|^安{1,5}$)/,
  召唤语:
	/(小昀|路昀)~{0,2}\S{0,5}(出来|在吗|过来|招呼|接客|见客|客人来啦)\S{0,5}$|(小昀|路昀)\S{0,5}$/,
  叫醒语:
	/(小昀|路昀).+(醒醒|醒来|不给睡|起床|起来)|(醒醒|醒来|不给睡|起床|起来).+(小昀|路昀)/,
  早安语:
	/(醒来|醒了|睡醒|起床|吓醒|惊醒|困醒|帅醒)\S{0,3}$|早啊|早安|早上好|大家早|^早\S{0,2}$|[床]\S{0,5}[起来]\S{0,3}$|[床]\S{0,5}[出来]\S{0,3}$/,
};

export const Res = [
  {
	//id.0
	m: "天王盖地虎",
	re: "宝塔镇河妖",
  },
]

export function Respond(str, uid, ctx) {
  for (let i in Res) {
	if (str.match(Res[i].m)) {
	  if (typeof Res[i].re == "function") return Res[i].re(str, uid, ctx);
	  return Res[i].re;
	}
  }
  return "next";
}


export function getResCount() {
  return Res.length;
}