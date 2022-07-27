function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function between(int, a, b) {
    return int >= a && int <= b;
}

function Roll(times, max) {
    let re = {
        roll: [],
        result: 0,
        bonus: 0,
    };
    for (let i = 0; i < times; i++) {
        let r = random(1, max);
        re.roll[i] = r;
        re.result += r;
        if (r == max) re.bonus++;
    }

    re.roll = re.roll.join()

    return re;
}

export function fixed(int) {
    return parseFloat(int.toFixed(2));
}

function Checkhit(player, target) {
    let pl = player.level, lk = player.luck, spd = player.SPD;
    let tl = target.level, tlk = target.luck, goal = target.SPD;

    if (!lk) lk = 1;
    if (!tlk) tlk = 0;

    let al = spd.toString().length
    let bl = goal.toString().length

    let rdv = Math.abs(al - bl) //数位差
    let p = (al > bl ? bl : al) - 1  //数字小的一方有多少个零
    let abl = al + bl

    //去掉多余的位数后所得的数字
    let ar = Math.floor(spd / Math.pow(10, p) * (rdv <= 1 & abl > 3 ? 10 : 1) + 0.5)
    let br = Math.floor(goal / Math.pow(10, p) * (rdv <= 1 & abl > 3 ? 10 : 1) + 0.5)

    console.log(player.name, '速度', spd, target.name, '速度', goal)
    console.log('双方位数差：', rdv)
    console.log('去多余位数:', ar, br)

    let result = {
        txt: '普通',
        hit: false,
        fightback: false,
        critical: 0, //1=普通暴击， 2=会心一击， 3=要害攻击
        roll: '', //骰点记录。
    }

    //先看看境界。境界差两个同时数值差比较大的话，就直接压制成功
    if (pl - tl >= 20 && spd / goal >= 1.2) {
        console.log(player.name, '境界压制同时数值大于', target.name, '强制成功。')
        let roll = Roll(6, 6)
        result = {
            txt: '境界压制',
            hit: true,
            fightback: false,
            critical: Math.floor(roll.bonus / 2),
            roll: `暴击检测6D6:${roll.roll}`,
        }

        return result
    }
    else if (tl - pl >= 20 && goal / spd >= 1.2) {
        console.log(player.name, '境界被压制同时数值小于', target.name, '强制失败。')
        let roll = Roll(6, 6)
        result = {
            txt: '境界被压制',
            hit: false,
            fightback: (random(1, 100) < 75),
            critical: Math.floor(roll.bonus / 2),
            roll: `暴击检测6D6:${roll.roll}`,
        }
        return result
    }

    //明显压制的情况
    if ((rdv >= 2 && a > b) || (between(abl, 5, 6) && ar - br > 50 || (abl >= 7 && ar - br > 33))) {
        console.log(player.name, '数值压制', target.name, '强制成功。')
        let roll = Roll(6, 6)
        result = {
            txt: '数值压制',
            hit: true,
            fightback: false,
            critical: Math.floor(roll.bonus / 2),
            roll: `暴击检测6D6:${roll.roll}`
        }
        return result
    }

    else if ((rdv >= 2 && b > a) || (between(abl, 5, 6) && br - ar > 50) || (abl >= 7 && br - ar > 33)) {
        console.log(player.name, '数值被压制', target.name, '强制失败。')
        let roll = Roll(6, 6)
        result = {
            txt: '数值被压制',
            hit: false,
            fightback: (random(1, 100) < 75),
            critical: Math.floor(roll.bonus / 2),
            roll: `暴击检测6D6:${roll.roll}`
        }
        return result
    }

    //接着看两数字互相差值，以及互相占比。
    let dv, dp, aroll, broll

    dv = Math.abs(spd - goal)
    dp = spd / goal

    //差异小的情况
    if (abl <= 4 && dv <= 15 || between(abl, 5, 6) && Math.abs(ar - br) <= 10 || abl > 6 && Math.abs(ar - br) <= 6) {

        console.log('双方差异较小，互相骰点。', player.name, '为主动方，具备先发优势。额外追加一个d6骰子。')
        aroll = Roll(4, 6)
        broll = Roll(3, 6)

        let ard = Math.floor(
            aroll.result + (dv <= 15 ? Math.max(spd / 2, 1) : Math.max(ar / 2, 1)) + lk / 12
            + 0.5)

        let brd = Math.floor(
            broll.result + (dv <= 15 ? Math.max(goal / 2, 1) : Math.max(br / 2, 1))
            + (tlk ? lk / 20 : 0)
            + 0.5)

        let cr = Roll(6, 6)

        console.log(player.name, '骰点：', aroll.roll, ard)
        console.log(target.name, '骰点：', broll.roll, brd)

        if (ard >= brd) {
            //A比B大的话，A就攻击成功。 根据骰点结果，判定命中效果。666为命中弱点，66则会心一击，6则暴击。
            console.log(ard, '>=', brd, '攻击成功。', (cr.bonus >= 4 && cr.result >= 30 ? '命中要害！' : cr.bonus >= 3 ? '会心一击！' : aroll.bonus >= 2 && aroll.result >= 15 ? "暴击！" : ""))

            result = {
                txt: '攻击成功',
                hit: true,
                fightback: false,
                critical:
                    (cr.bonus >= 4 && cr.result >= 30 ? 3
                        : cr.bonus >= 3 ? 2
                            : aroll.bonus >= 2 && aroll.result >= 15 ? 1
                                : 0),
                roll: `互相骰点3D6+数值/2+幸运补正，${ard}>=${brd}`
            }
        }
        else {
            //失败就是对方闪避。看闪避结果是否遭遇反击。对面扔出666或665就遭遇反击。
            console.log(ard, '<', brd, '攻击失败！', (broll.result >= 17 ? '遭遇反击！！' : "攻击被躲闪成功！"))
            result = {
                txt: '攻击失败',
                hit: false,
                fightback: (broll.result >= 17),
                critical: 0,
                roll: `互相骰点3D6+数值/2+幸运补正，${ard}<${brd}`
            }
        }
        return result
    }
    else {
        //差异有点大的情况，给点机会。守方只能逃无法反击。
        let chance

        if (dp >= 1) {
            //B骰点
            dp = goal / spd
            chance = Math.floor(dp * 100) - Roll(3, 6).result
            broll = Roll(1, 100)

            let re = broll.result + (tlk ? Math.floor(tlk / 20) : 0)

            console.log('双方差异较大。攻方>守方，由', target.name, '骰点：', re, '/', chance)

            if (re < chance) {
                console.log('守方闪避成功！', player.name, '的攻击失败！')
                result = {
                    txt: '攻击失败',
                    hit: false,
                    fightback: false,
                    critical: 0,
                    roll: `数值差较大，${target.name}骰点：D100=${re}/${chance}`
                }

            }
            else {
                console.log('守方闪避失败！', player.name, '的攻击成功！')
                let cr = Roll(6, 6)
                result = {
                    txt: '攻击成功',
                    hit: true,
                    fightback: false,
                    critical: Math.floor(cr.bonus / 2),
                    roll: `数值差较大，${target.name}骰点：D100=${re}/${chance}`
                }
            }

        }
        else {
            //A骰点
            chance = Math.floor(dp * 100) + Roll(2, 6).result
            aroll = Roll(1, 100)

            let re = aroll.result + Math.floor(lk / 12)

            console.log('AB差异较大。A<B。由A骰点：', aroll.result, '/', chance)

            if (aroll.result - lk / 12 <= chance) {
                console.log('攻击成功！', (aroll.result <= 2 ? "骰点大成功，打出会心一击！" : aroll.result <= chance / 3 ? "骰点困难成功！打出暴击伤害！" : ""))

                result = {
                    txt: '攻击成功',
                    hit: true,
                    fightback: false,
                    critical: (aroll.result <= 2 ? 2 : aroll.result <= chance / 3 ? 1 : 0),
                    roll: `数值差较大，${player.name}骰点：D100+幸运补正=${re}/${chance}`,
                }
            }
            else {
                console.log('攻击失败！', (aroll.result >= 90 ? "骰点大失败！遭遇反击！" : ""))
                let roll = Roll(3, 6)
                result = {
                    txt: '攻击失败',
                    hit: false,
                    fightback: (aroll.result >= 90),
                    critical: (roll.result >= 15 && roll.bonus >= 2 ? 1 : 0),
                    roll: `数值差较大，${player.name}骰点：D100+幸运补正=${re}/${chance}`,
                }
            }
        }

        return result
    }
}

function Attack(player, target) {
    let pl = player.level, lk = player.luck, dmg = player.ATK;
    let tl = target.level, tlk = target.luck, shd = target.DEF;

    let al = dmg.toString().length;
    let bl = shd.toString().length;

    let result
    /*= {
        hit: false, //命中结果
        txt: "", //返回文字
        fightback: false, //是否遭遇反击
        damage: 0, //计算会心等之前的基本伤害。
        lastdmg: 0, //计算会心等之后的最终伤害。
        critcal: 0, //暴击、会心、要害命中情况。
        shd: 0, //对方有效防御。
        roll: "", //骰点情况
    }*/

    let lvbuff

    //等级补正。 10以内,攻击效率 = 1.025~1.25, 境界压制，攻击效率 = 1.25~
    if (Math.abs(pl - tl) <= 10) lvbuff = 1 + Math.abs(pl - tl) / 40;
    if (Math.abs(pl - tl) > 10) lvbuff = 0.75 + Math.abs(pl - tl) / 20;

    if (pl > tl) dmg = Math.floor(dmg * lvbuff + 0.5);
    if (tl > pl) shd = Math.floor(shd * lvbuff + 0.5);


    const getDamage = function (player, target, critical) {
        let a, b, re
        let dmg = player.ATK, shd = target.DEF

        let ld = Math.floor(dmg / 3)
        let ls = Math.floor(shd / 3)

        //双方扔骰子后进行计算。
        a = Math.max(
            Math.floor(ld / 3 + 0.5)
            , 1);

        b = Math.max(
            Math.floor(ls / 3 + 0.5)
            , 1);

        a = Roll(a, 3).result + (dmg - ld)
        b = Roll(b, 3).result + (shd - ls)

        re = {
            dmg: a,
            shd: b,
            lsdm: 0,
        }

        const atk = (a, b) => {
            if (a >= b) {
                let buff = Math.min(1 + a / b / 50, 2)
                let re = (a - b) * buff
                return Math.floor(re + 0.5)
            }
            return Math.floor(Math.pow(a, 2) / (5 * b) + 0.5)
        }

        re.lsdm = atk(a, b)
        if (critical == 3) re.lsdm *= 4;
        if (critical == 2) re.lsdm *= 2.5;
        if (critical == 1) re.lsdm *= 1.5;

        Math.floor(re.lsdm + 0.5)

        return re
    }

    let re = Checkhit(player, target);
    if (!re.hit) {
        if (re.fightback) {
            let fbre = getDamage(target, player, re.critical)
            console.log('遭遇反击。', target.name, '攻击：', fbre.dmg, player.name, '防御：', fbre.shd)
            console.log('最终承受伤害：', fbre.lsdm)
        }

        return false
    }

    let atkre = getDamage(player, target, re.critical)
    console.log('攻击结果：')
    console.log(player.name, '最终攻击：', atkre.dmg, target.name, '最终防御：', atkre.shd)
    console.log('最终造成伤害：', atkre.lsdm)

}