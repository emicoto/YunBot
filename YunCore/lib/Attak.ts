import * as f from "../Function"

//普通攻击
export function NormalAtk(player, target){

    let pl = player.level, lk = player.luck , dmg = player.ATK, spd = player.SPD
    let tl = target.level, shd = target.DEF, goal = target.SPD, tlk = target.luck

    let al = dmg.toString().length
    let bl = dmg.toString().length

    //先算命中。 双方的差异比。
    let result = {
        hit: false,  //命中结果
        txt: "",    //返回文字
        damage: 0,  //攻击伤害
        lastdmg:0,
        crit: false, //会心伤害
    }

    let a,b, ar, br,cr, ef, re, ad, adf, buff, af,bf,ldmg
    re = CheckHit(player,target)

    if(!re.hit){
        console.log('攻击失败',re.txt)
        result.txt = re.txt
        return result
    }

    //进入伤害计算环节。先从命中情况看实际伤害
    dmg = dmg * re.per
    
    //看等级差，以及数值差，伤害比
    //先看等级差。如果差异在10以内，则攻击/防御效果 * 1+(10-等级差)/20
    if(Math.abs(pl-tl) <= 10)buff = (1+(10-Math.abs(pl-tl))/20);
    //等级差大于10的话，则会造成境界压制。 攻击/防御效果 * 1+(等级差)/10
    if(Math.abs(pl-tl) > 10) buff = (1+(Math.abs(pl-tl))/10);

    //如果有等级buff，则追加到数值计算中。
    if(pl>tl) dmg = Math.floor(dmg*buff+0.5);
    if(tl>pl) shd = Math.floor(shd*buff+0.5);

    //接着获得攻防伤害比。 攻防伤害比 >= 1，则攻击方获得优势骰。 如果 < 1，则防守方获得优势骰。
    ef = dmg/shd
    cr = f.Roll(3,6).bonus //先扔个会心判定。

    //双方等级差不大时，或者计算了等级差后依然没达成压制时，看数值差比。
    ad = Math.floor(Math.abs(dmg-shd))
    adf = Math.abs(al-bl)+1

    console.log('数值差：',dmg,'-',shd,'=',ad,'数级比：', adf,':1')       

    //接着看数值之间差异，获取压制骰。
    af = Math.max(Math.floor(dmg/Math.pow(10,adf+1)+0.5),1)
    bf = Math.max(Math.floor(shd/Math.pow(10,adf+1)+0.5),1)

    console.log('双方可用骰子数：',af,bf)

    //攻击方压制的情况，骰点会心后直接结算。
    if( adf-1 > 2 && dmg > shd || af-bf >= 48 ){
        ldmg = dmg*f.fixed(buff)*( ar >=2 ? 2 : 1 )

        result = {
            hit: true,
            txt: re.txt + `\n……数值压制，攻击效果 ：${f.fixed(buff)*100}%，`,
            damage: dmg,
            lastdmg: ldmg,
            crit: (cr >= 2 ? true : false),
        }
        console.log(result.txt,'最终造成伤害：',ldmg,'/',shd)
        return result
    }

    //防守方压制的情况，骰点会心后直接结算最低输出值。
    if( adf-1 > 2 && dmg < shd || bf-af > 48 ){
        ldmg = Math.max(dmg*f.fixed(af/bf),1) * ( ar >= 2 ? 2 : 1)
        result = {
            hit: true,
            txt: re.txt + `\n……数值被压制，攻击效果：${f.fixed(af/bf)}%，`,
            damage: dmg,
            lastdmg: ldmg,
            crit: (cr >= 2 ? true : false),
        }
        console.log(result.txt,'最终造成伤害：',ldmg,'/',shd)
        return result
    }

    //双方数值上没达成压制的情况。攻守扔最终结果骰。
    ar = f.Roll(af + (ef >= 1? 1 : 0),6).result + Math.floor((lk/10)+0.5)
    br = f.Roll(bf + (ef < 1? 1 :0 ),6).result + ( tlk ? Math.floor((tlk/10)+0.5): 0 )
    console.log('双方骰点结果：',ar,br,'防守比：',ar/br)

    //计算最后伤害值。
    ldmg = Math.max(Math.floor(dmg * (ar/br)+0.5),1) * (cr >= 2 ? 2 : 1)

    result = {
        hit:true,
        txt: re.txt + `\n双方骰点3d6+幸运补正：${ar}/${br}，攻击效果：${f.fixed(ar/br)*100}%，`,
        damage : dmg,
        lastdmg : ldmg,
        crit: (cr >= 2 ? true : false)
    }
    console.log(result.txt,'最终造成伤害：',ldmg,'/',shd)
    return result 
}

export function CheckHit(player, target){

    let pl = player.level, lk = player.luck ,  spd = player.SPD
    let tl = target.level, goal = target.SPD, tlk = target.luck


    let a,b, ar, br, ef, adf, ad, af,bf

    let al = spd.toString().length
    let bl = goal.toString().length

    //先算命中。 双方的差异比。
    ef = spd/goal
    //console.log('双方速度：攻', spd, '守', goal)
    //console.log('攻守速度比：',ef)
    let re = {
        hit: false,
        txt : '',
        per: 0,
    }

    //接着看数值差。 如果在20内，则互相骰点对决。其余情况看压制程度。
    ad = Math.abs(spd-goal)
    adf = Math.abs(al-bl)+1

    console.log('双方速度差值：',spd,'-',goal,'=',ad, '数级比：',adf,':1')

    //接着看数值之间差异，获取压制值。
    af = spd/Math.pow(10,adf+1)
    bf = goal/Math.pow(10,adf+1)

    if ( ad <= 18  || (al > 3 && Math.abs(af-bf) <= 12) || (f.between(al,2,3) && Math.abs(af-bf) <= 18 ) ) { //两者数值差在18内，或位数一致且比值不大时，互相骰点3d6对决。
        a = Math.floor(f.Roll(3,6).result + lk/12 + ( ad <= 18 ? spd : af ) + 0.5)
        b = Math.floor(f.Roll(3,6).result + (tlk ? tlk/12 : 0) + ( ad <= 18 ? goal : bf )  + 0.5)

        if( a >= b) ef = (a-b+1)/b;
        else ef = (b-a+1)/a;

        if(ef < 0.67 && a < b ){
            re.hit = false;
            re.txt = `……双方骰点3d6，${a} < ${b}，攻击失败。`
        }
        else{
            re.hit = true;
            re.txt = `……双方骰点3d6，${ a > b ? `${a} > ${b}，攻击成功。` : `${a}，${b}，容差范围内勉强成功，但攻击遭到削弱。`}`
            re.per = f.fixed(( a > b ?  1+(a-b)/b : 1-(b-a)/b ))
        }
        console.log(re)
        return re
    }   

    if( adf-1 > 2 && spd > goal || (al > 3 && af-bf > 32) || (f.between(al,2,3) && af-bf > 48 )){ //对方十倍，或比值差处于压制时
        re.hit = true;
        re.txt = '……速度压制，强制命中。';
        re.per = 1;
    }
    else if( adf-1 > 2 && goal > spd || (bl > 3 && bf-af > 32) || (f.between(bl,2,3) && bf-af > 48 ) ){ //反过来，被压制、    
       re.hit = false;
       re.txt = '……速度被压制，强制失败。';
    }    
    else if (ef >= 1){
        ef = Math.floor((goal/spd)*100)
        //console.log('攻击方速度大于敌方，由对方骰点！对方的闪避概率：',ef+'%', (tl > pl ? `+等级差加成：${tl-pl*3}` : ''),  `幸运加成：${lk/10}`)
        br = Math.max(f.Roll(1,100).result - ( tl > pl ? (tl-pl)*3 : 0) - ( tlk ? tlk/10 : 0),1)
        //console.log('对方骰点：D100',br, ( br <= ef ? '攻击失败！' : '攻击成功！'))
        if(br<=ef){
            re.hit = false;
            re.txt = `……速度大于敌方，敌方骰点。\n骰点D100${ tlk ? '+幸运补正' : ''}${br}/${ef}，攻击失败。`;
        }else{
            re.hit = true;
            re.txt = `……速度大于敌方，敌方骰点。\n骰点D100${ tlk ? '+幸运补正' : ''}${br}/${ef}，攻击成功。`
            re.per = Math.max(ef/2/br,1)
        }
    }
    else {
        ef = Math.floor(ef*100)
        ar = Math.max(f.Roll(1,100).result - ( pl > tl ? (pl-tl)*3 : 0) - (lk/10),1)       
        //console.log('攻击方速度低于敌方！命中概率：', ef + '%', (pl > tl ? `+ 等级差加成:${(pl-tl)*3}` :  '') ,`+ 幸运加成：${lk/10}`)        
        //console.log('攻击方骰点D100：',ar,"/",ef, (ar <= ef ? '攻击成功！': '攻击失败！')) 
        if(ar > ef) {
            re.hit = false;
            re.txt = `……速度小于敌方，骰点D100+幸运补正：${ar}/${ef}，攻击失败！`;
        }else{
            re.hit = true;
            re.txt = `……速度小于敌方，骰点D100+幸运补正：${ar}/${ef}，攻击成功。`;
            re.per = f.fixed(1-(ar/ef/2))
        }
    }
    return re
}