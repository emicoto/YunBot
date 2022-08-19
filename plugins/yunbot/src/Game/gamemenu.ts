import { Context, Time } from "koishi"
import { Weapon, Equip, Skill, Minds, Items, WeaponDes, EquipDes, SkillDes, CoreDes, ItemDes } from "../Define"
import { gethelp } from "../TextLib"

const PhoneMenu = [
	'小灵通功能一览：',
	'》修改用户名',
	'》查看档案',
	'》查看数据',
	'》查看技能',
	'》查看装备',
	'》查看道具',
	'》查看记录',
	'》设置头像'
]

const mainMenu = [
	'路昀修仙模拟器 ver 1.0.0',
	'-----------------------',
	'-入门申请　　初始化数据，并创建人物。第一个人物用。',
	'-介绍新人　　新建一个人物',
	'-写日记　　　将现在的人物更新到存档库中',
	'-查看日记　　确认存档记录状况',
	'-阅读日记　　从存档库中读取角色',
	'-工作交接　　切换人物，有两个角色时才能用',
	'-离开宗门　　删除当前人物',
	'-回忆前尘　　从旧库中继承档案',
	'-小灵通　　　查看角色',
	'-储物戒　　　查看非消耗性物品一览。以及切换装备。',
	'-角色名　　　修改角色名',
	'-脱下装备　　脱下指定部位的装备。加-h可看快捷指令一览。',
	'-----------------------',
	'》小灵通菜单　小灵通功能一览',
	'》路昀菜单　　打开路昀互动菜单',
	'》宗门设施　　确认每日可做的事情',
	'》地图一览　　确认可以移动的地点',
	'》弟子交流　　确认玩家之间的互动指令一览',
	'》藏经阁　　　查看图书馆目录',
	'-----------------------',
	'-使用道具 [道具名]　从道具栏中使用道具',
	'-领取福利　　只有活动开放期间才能领取。',
	'------------------------',
	'任何非》开头的指令都可以加 -help 查看更加详细的说明。'
]

const YunMenu = [
	'路昀菜单',
	'-----------------------',
	'-陪同修炼　　邀请路昀一起修炼',
	'-共同突破　　邀请路昀一起突破',
	'-路昀商店　　可购买一些东西',
	'-查看路昀　　可查看路昀现在状态。加【选项】可查看更多选项',
	'-送礼路昀　　可将一些道具送给路昀换取些许好感度',
	'-互动指南　　查看好感／信赖互动指南',
	'-----------------------',
	'可用快捷指令一览：',
	'》查看路昀',
	'》对路昀用破心通',
	'》查看路昀数据',
	'》查看路昀装备',
	'-----------------------',
	'输入快捷指令时记得把 》 加上哦。'
]

const WorkMenu = [
	'宗门设施一览',
	'-----------------------',
	'· 洞天峰　　可进行修炼与突破。相关指令：-修炼，-突破',
	'· 藏经阁　　可进行学习、查阅等。相关指令：-查阅，-整理书架',
	'· 弟子观　　大家进行日常学习的地方。相关指令：-修习心法，-休养生息',
	'· 灵矿峰　　可以进行挖矿，冶炼。相关指令：-炼器，-挖矿',
	'· 灵植峰　　可进行采药、种地、炼丹等。相关指令：-炼丹，-采药，-种植',
	'· 后山秘境　可进行探险，打怪升级。相关指令：-探索',
]

const LibMenu = [
	'藏经阁目录',
	'-----------------------',
	'》心法一览',
	'》技能一览',
	'》法器一览',
	'》装备一览',
	'》物品一览',
]

const playerMenu = [
	'弟子间交流指令一览：',
	'------------------------',
	'-邀请切磋 @对方　可邀请被艾特的人进行切磋',
	'-回应切磋 @对方　当被邀请时，使用该指令艾特对方即可开始切磋。',
	'-交易　可挂单与其他玩家交易。详细请直接看指令内置的帮助。',
	'-红包　可以给其他玩家发红包。详细请看指令内置的帮助。',
	'-邀请修炼 @对方　可邀请被艾特的人共同修炼。',
	'-应邀修炼 @对方　被邀请者以本指令回应后，则开始一起修炼。两人一起修炼能获得些许额外经验加成。',
	'-组队邀请 @队友　可将被艾特的成员加入到探索队伍中。最多可同时艾特两人组成三人队伍。',
	'-应邀组队　被邀请者回应后，便会正式加入探索队伍中。'
]

export function GameMenu(ctx: Context){

	ctx.command('gamehelp','-获取所有详细帮助说明', { system:true})
		.action( async ({ session })=>{
			const chk = await ctx.database.getChannel(session.platform, session.channelId)
			const now = Date.now()
			if( !chk.helptimer || now > chk.helptimer ){
				await ctx.database.setChannel(session.platform, session.channelId, { announce : Date.now()+Time.minute*30 })
				return gethelp(session)
			}
			else{
				return '【最近三十分钟内已有人查阅过】'
			}
		})

	ctx.command('menu <type>','-主菜单　路昀修仙模拟器主菜单',{system:true})
		.alias('主菜单').alias('游戏目录')
		.shortcut('》小灵通菜单',{args:['phone']})
		.shortcut('》路昀菜单',{args:['yun']})
		.shortcut('》宗门设施', {args:['work']})
		.shortcut('》地图一览',{args:['map']})
		.shortcut('》弟子交流',{args:['player']})
		.shortcut('》藏经阁',{args:['library']})
		.action(({session},type)=>{
			if(!type) return mainMenu.join('\n');
			switch(type){
				case 'phone':
					return PhoneMenu.join('\n')
				case 'yun':
					return YunMenu.join('\n')
				case 'work':
					return WorkMenu.join('\n')
				case 'library':
					return LibMenu.join('\n')
				case 'player':
					return playerMenu.join('\n')
			}
		})


	ctx.command('lib <type> [name]','查阅功法、技能、心法、物品、装备等详细数据和效果。')
		.alias('查询').alias('查阅')
		.shortcut('》心法一览',{args:['心法']})
		.shortcut('》技能一览',{args:['技能']})
		.shortcut('》法器一览',{args:['法器']})
		.shortcut('》装备一览',{args:['装备']})
		.shortcut('》物品一览',{args:['物品']})
		.action( ({ session }, type, name)=>{
			let txt, list;

			if(!type && !name){
				txt = [
					'……是需要什么帮助吗？',
					'',
					'请输入 -查询 [类型] [名字]',
					'目前可查询的类型：法器，装备，技能，心法，物品',
					'不输入对应的名字的话，可以看到目前已收录的该类别资料一览。'
				]

				return txt.join('\n')
			}

			if(type == '法器'){
				list = Object.keys(Weapon.data)
			}
			if(type == '装备'){
				list = Object.keys(Equip.data)
			}
			if(type=='技能'){
				list = Object.keys(Skill.data)
			}
			if(type=='心法'){
				list = Object.keys(Minds.data)
			}
			if(type=='物品' || type =='道具'){
				list = Object.keys(Items.data)
			}			

			if(!name && ['法器','装备','技能','心法','物品','道具'].includes(type)){

				txt= `目前有的${type}一览：`;
				for(let i=0; i < list.length; i++){
					txt += list[i] + '、'
				}
				return txt
			}

			if(!name || !list || list.includes(name)===false) return '【没找到查询物品】'

			if(type=='法器') return WeaponDes(Weapon.data[name])
			if(type=='装备') return EquipDes(Equip.data[name])
			if(type=='技能') return SkillDes(Skill.data[name])
			if(type=='心法') return CoreDes(Minds.data[name])
			if(type=='物品'||type=='道具') return ItemDes(Items.data[name])

		})

}

