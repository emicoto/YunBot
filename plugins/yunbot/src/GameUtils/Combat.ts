import { copy, Game } from "../unit";

export class Combat{
	private pl:Game;
	private tg:Game;
	private dmg:number;
	private shd:number;
	private spd:number;
	private dex:number;

	private plv:number;
	private tlv:number;
	private pluck:number;
	private tluck:number;

	private al:number;
	private bl:number;
	private abl:number;

	private rdv:number;
	private p:number;

	private init(){

	}
	
	start(){

	}

	getSpecific(int:number){

	}

	public static setEnemy(){
		
	}

	constructor(player:Game, target:Game){
		this.pl = copy(player);
		this.tg = copy(target);

		this.plv = player.level;
		this.tlv = target.level;

		this.pluck = player.luck;
		this.tluck = target.luck;

		this.dmg = player.ATK;
		this.shd = target.DEF;
		this.spd = player.SPD;
		this.dex = target.SPD;

		
		this.init()
	}
}