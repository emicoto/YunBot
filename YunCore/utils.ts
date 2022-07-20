import { random } from "./Function";


export enum LingGen {
  天灵根,
  单灵根,
  双灵根,
  三灵根,
  四灵根,
  杂灵根,
}
export enum Elements {
  火 = "火",
  土 = "土",
  木 = "木",
  水 = "水",
  金 = "金",
}

export class LingGenUtils {
  public static getLingGen(rate: number) {
    if (rate >= 90 {
      return random(100)=> 90?LingGen.天灵根:LingGen.单灵根;
    }
    else if (rate >= 80) {
      return LingGen.双灵根
    }
    else if (rate >= 60) {
      return LingGen.三灵根
    }
    else if (rate >= 40) {
      return LingGen.四灵根
    }
    else {
      return LingGen.杂灵根
    }
  }
  private _LingGen: LingGen;
  private _Elements: Elements[];
  private _result: number;
  constructor(linggen: LingGen, result: number) {
    this._LingGen = linggen;
    this._result = result;
    this.init();
  }
  private init() {

    switch (this._LingGen) {
      case LingGen.天灵根:
      case LingGen.单灵根:
        this._Elements = this.getElements()
        break;
      case LingGen.双灵根:
        this._Elements = this.getElements(2)
        break;
      case LingGen.三灵根:
        this._Elements = this.getElements(3)
        break;
      case LingGen.四灵根:
        this._Elements = this.getElements(4)
        break;
      case LingGen.杂灵根:
        this._Elements = this.getElements(5)
        break;
    }

  }
  private getElements(num: number = 1) {
    const el = [Elements.金, Elements.木, Elements.水, Elements.火, Elements.土]
    if (num == 1) {
      return [el[this._result]]
    }
    else if (num >= 5) {
      return el;
    }
    const arr = []
    arr.push(...el.splice(this._result, 1))
    const NUM = num - 1;
    for (let index = 0; index < NUM; index++) {
      arr.push(...el.splice(random(el.length - 1), 1))
    }
    return arr
  }
  public getElementsString() {
    return this._Elements.join("")
  }
  public getSoul() {
    const str = this.getElementsString()
    switch (this._LingGen) {
      case LingGen.天灵根:
        return "天" + str;
      case LingGen.单灵根:
      case LingGen.双灵根:
      case LingGen.三灵根:
      case LingGen.四灵根:
      case LingGen.杂灵根:
        return str;
    }
  }
}
