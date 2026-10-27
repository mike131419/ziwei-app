/* =====================================================================
   其他命理：八字、生肖太岁、黄历择日、西洋星座、生命灵数，以及综合判断
   八字与黄历用 lunar-javascript；星座用 astronomy-engine 计算太阳和月亮位置。
   仅供参考。
   ===================================================================== */
const MORE = (function(){
  const L = (typeof Solar !== 'undefined') ? {Solar, Lunar} : require('lunar-javascript');
  const AST = (typeof Astronomy !== 'undefined') ? Astronomy : (typeof require === 'function' ? require('astronomy-engine') : null);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const GRADE = s => s >= 80 ? '大吉' : s >= 68 ? '吉' : s >= 52 ? '平' : s >= 40 ? '注意' : '小心';

  /* ---------- 五行基础 ---------- */
  const WX = ['木','火','土','金','水'];
  const GAN_WX = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  const ZHI_WX = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  const gen = e => WX[(WX.indexOf(e) + 1) % 5];      // 我生
  const ctl = e => WX[(WX.indexOf(e) + 2) % 5];      // 我克
  const genMe = e => WX[(WX.indexOf(e) + 4) % 5];    // 生我
  const ctlMe = e => WX[(WX.indexOf(e) + 3) % 5];    // 克我
  const LUCKY = {木:{color:'绿色、青色',dir:'东方',num:'3、8'},火:{color:'红色、紫色',dir:'南方',num:'2、7'},土:{color:'黄色、咖啡色',dir:'中央、本地',num:'5、0'},金:{color:'白色、金色',dir:'西方',num:'4、9'},水:{color:'黑色、蓝色',dir:'北方',num:'1、6'}};
  const WX_LIFE = {木:'教育、文化、设计、园艺、医药',火:'餐饮、科技电子、传媒、美容',土:'房地产、建筑、农业、管理、顾问',金:'金融、机械、汽车、法律、五金',水:'贸易、物流、旅游、水产、咨询'};
  const DAY_MASTER = {
    甲:'像参天大树：正直、有担当、想往上发展，但不太会转弯',
    乙:'像花草藤蔓：柔和、适应力强、懂得借力，有时缺乏主见',
    丙:'像太阳：热情大方、乐于分享、有感染力，脾气来得快去得快',
    丁:'像烛火：细心温暖、思想深、重感情，内心容易紧张',
    戊:'像高山：稳重可靠、守信用、包容力强，但比较固执',
    己:'像田园：务实细心、照顾人、善于经营，容易想太多',
    庚:'像刀剑钢铁：果断讲义气、执行力强，说话直接',
    辛:'像珠宝：精致敏感、重面子、有品味，受不了委屈',
    壬:'像江河大海：聪明灵活、点子多、爱自由，定性不够',
    癸:'像雨露：温和细腻、直觉强、善于观察，容易多愁善感'};
  const SHISHEN = {比肩:'自主、朋友兄弟',劫财:'竞争、合伙',食神:'才华、享受、口福',伤官:'表达、创意、反叛',偏财:'偏财、生意、父亲',正财:'稳定收入、妻子（男命）',七杀:'压力、魄力、小人',正官:'规矩、地位、丈夫（女命）',偏印:'偏门学问、灵感',正印:'学业、贵人、母亲'};

  /* ---------- 八字 ---------- */
  function bazi(y, m, d, hour, isMale){
    const s = L.Solar.fromYmdHms(y, m, d, hour, 0, 0), lu = s.getLunar(), e = lu.getEightChar();
    const P = [
      {label:'年柱', gz:e.getYear(), gan:e.getYearGan(), zhi:e.getYearZhi(), sg:e.getYearShiShenGan(), sz:e.getYearShiShenZhi(), hide:e.getYearHideGan(), ny:e.getYearNaYin()},
      {label:'月柱', gz:e.getMonth(), gan:e.getMonthGan(), zhi:e.getMonthZhi(), sg:e.getMonthShiShenGan(), sz:e.getMonthShiShenZhi(), hide:e.getMonthHideGan(), ny:e.getMonthNaYin()},
      {label:'日柱', gz:e.getDay(), gan:e.getDayGan(), zhi:e.getDayZhi(), sg:'日主', sz:e.getDayShiShenZhi(), hide:e.getDayHideGan(), ny:e.getDayNaYin()},
      {label:'时柱', gz:e.getTime(), gan:e.getTimeGan(), zhi:e.getTimeZhi(), sg:e.getTimeShiShenGan(), sz:e.getTimeShiShenZhi(), hide:e.getTimeHideGan(), ny:e.getTimeNaYin()},
    ];
    // 五行力量：天干 1；地支藏干 本气 1、中气 0.5、余气 0.3；月令（月支）加 50%
    const w = {木:0,火:0,土:0,金:0,水:0};
    P.forEach((p, i) => {
      w[GAN_WX[p.gan]] += 1;
      p.hide.forEach((g, k) => { w[GAN_WX[g]] += [1, 0.5, 0.3][k] * (i === 1 ? 1.5 : 1); });
    });
    const total = WX.reduce((a, k) => a + w[k], 0);
    const pct = {}; WX.forEach(k => pct[k] = Math.round(100 * w[k] / total));
    const dm = P[2].gan, me = GAN_WX[dm];
    const support = w[me] + w[genMe(me)];
    const ratio = support / total;
    const strength = ratio >= 0.55 ? '身强' : ratio >= 0.45 ? '中和' : '身弱';
    let like, avoid;
    if(strength === '身强'){ like = [ctlMe(me), gen(me), ctl(me)]; avoid = [genMe(me), me]; }
    else if(strength === '身弱'){ like = [genMe(me), me]; avoid = [ctlMe(me), gen(me), ctl(me)]; }
    else { const weak = [...WX].sort((a, b) => w[a] - w[b]); like = [weak[0], genMe(weak[0])]; avoid = [weak[4]]; }
    like = [...like].sort((a, b) => w[a] - w[b]);            // 越缺越需要
    const use = like[0];
    const lucky = {use, also: like.slice(1), avoid, ...LUCKY[use], career: WX_LIFE[use]};
    const strengthText = strength === '身强' ? '日主力量强，个性有主见、能扛事；运势上喜欢消耗多余力量的五行（发挥才华、赚钱、承担责任）'
      : strength === '身弱' ? '日主力量较弱，需要贵人、学习和团队支持；运势上喜欢生扶自己的五行'
      : '五行较平衡，顺势而为；最需要补的是最弱的五行';

    // 大运
    const yun = e.getYun(isMale ? 1 : 0);
    // 五行对日主的分级作用（扶抑法）：身弱喜印比、最忌官杀；身强喜食伤财官、最忌印比
    const role = {};
    if(strength === '身弱'){ role[genMe(me)] = 1; role[me] = 0.7; role[gen(me)] = -0.45; role[ctl(me)] = -0.65; role[ctlMe(me)] = -0.9; }
    else if(strength === '身强'){ role[ctlMe(me)] = 0.8; role[gen(me)] = 0.9; role[ctl(me)] = 0.7; role[genMe(me)] = -0.8; role[me] = -0.9; }
    else { const sorted = [...WX].sort((a, b) => w[a] - w[b]); WX.forEach(k => role[k] = 0); role[sorted[0]] = 0.8; role[genMe(sorted[0])] = 0.5; role[sorted[4]] = -0.7; role[sorted[3]] = -0.3; }
    const score = gz => {
      const v = 0.45 * role[GAN_WX[gz[0]]] + 0.55 * role[ZHI_WX[gz[1]]];
      return Math.round(clamp(60 + 30 * v, 20, 95));
    };
    const dayun = yun.getDaYun().slice(1, 10).map(dy => {
      const gz = dy.getGanZhi(), sc = score(gz);
      return {age: dy.getStartAge(), end: dy.getEndAge(), year: dy.getStartYear(), gz, score: sc, grade: GRADE(sc),
        text: `${gz}运（${GAN_WX[gz[0]]}${ZHI_WX[gz[1]]}）：${sc >= 68 ? '五行对你有利，适合发展' : sc >= 52 ? '有好有坏，稳步前进' : '五行对你不利，宜守不宜攻'}`};
    });
    const startText = `${yun.getStartYear()}年${yun.getStartMonth()}个月后起运`;
    return {role, pillars: P, wx: pct, dm, dmText: DAY_MASTER[dm], me, strength, ratio: Math.round(ratio * 100), strengthText, lucky, dayun, startText,
      lunarText: lu.toString(), score};
  }
  const CHONG = {子:'午',丑:'未',寅:'申',卯:'酉',辰:'戌',巳:'亥',午:'子',未:'丑',申:'寅',酉:'卯',戌:'辰',亥:'巳'};
  const LIUHE = {子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
  function baziYear(bz, year){
    const ly = L.Lunar.fromYmd(year, 6, 1), gz = ly.getYearInGanZhiExact ? ly.getYearInGanZhi() : ly.getYearInGanZhi();
    const cur = bz.dayun.find(d => year >= d.year && year < d.year + 10);
    const raw = bz.score(gz);
    const sc = Math.round(cur ? 0.6 * raw + 0.4 * cur.score : raw), notes = [];
    const dayZhi = bz.pillars[2].zhi;
    if(CHONG[dayZhi] === gz[1]) notes.push('流年冲日支：感情、家庭或住所容易有变动');
    if(LIUHE[dayZhi] === gz[1]) notes.push('流年合日支：感情和人缘有喜事');
    const g = GAN_WX[gz[0]], z = ZHI_WX[gz[1]];
    const rv = 0.45 * bz.role[g] + 0.55 * bz.role[z];
    notes.unshift(`${year}年${gz}（${g}${z}）${rv >= 0.3 ? '带来你需要的五行，有助力' : rv <= -0.3 ? '带来你忌讳的五行，阻力较多' : '五行影响有好有坏'}`);
    if(cur) notes.push(`目前走${cur.gz}大运（${cur.age}–${cur.end}岁，${cur.grade}）${cur.score >= 68 ? '，大运有力，可以减轻流年的不利' : cur.score < 52 ? '，大运较弱，流年好坏都会被放大' : ''}`);
    return {gz, score: sc, grade: GRADE(sc), notes, dayun: cur};
  }

  /* ---------- 生肖太岁 ---------- */
  const SX = {子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龙',巳:'蛇',午:'马',未:'羊',申:'猴',酉:'鸡',戌:'狗',亥:'猪'};
  const HAI = {子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
  const PO = {子:'酉',酉:'子',午:'卯',卯:'午',申:'巳',巳:'申',寅:'亥',亥:'寅',辰:'丑',丑:'辰',戌:'未',未:'戌'};
  const SANHE = [['申','子','辰'],['亥','卯','未'],['寅','午','戌'],['巳','酉','丑']];
  function isXing(a, b){
    if(a === b && '辰午酉亥'.includes(a)) return '自刑';
    const g1 = '寅巳申', g2 = '丑戌未';
    if(a !== b && g1.includes(a) && g1.includes(b)) return '刑';
    if(a !== b && g2.includes(a) && g2.includes(b)) return '刑';
    if((a === '子' && b === '卯') || (a === '卯' && b === '子')) return '刑';
    return '';
  }
  function taisui(birthZhi, year){
    const ly = L.Lunar.fromYmd(year, 6, 1), yz = ly.getYearZhi(), out = [];
    if(birthZhi === yz) out.push({k:'值太岁', bad:true, text:'本命年：变动多、压力大，适合稳中求变，不宜冲动做大决定'});
    if(CHONG[birthZhi] === yz) out.push({k:'冲太岁', bad:true, text:'变动最大的一年：工作、住所容易变，出外注意安全，投资要保守'});
    const x = isXing(birthZhi, yz); if(x && birthZhi !== yz || x === '自刑') out.push({k:'刑太岁', bad:true, text:'容易有是非口舌、官非文书问题，签约要小心'});
    if(HAI[birthZhi] === yz) out.push({k:'害太岁', bad:true, text:'容易遇小人、被误会，人际关系多留心'});
    if(PO[birthZhi] === yz) out.push({k:'破太岁', bad:true, text:'容易破财或计划被打乱，钱财要守'});
    if(LIUHE[birthZhi] === yz) out.push({k:'六合', bad:false, text:'和太岁相合：人缘好，有贵人相助'});
    if(SANHE.some(g => g.includes(birthZhi) && g.includes(yz) && birthZhi !== yz)) out.push({k:'三合', bad:false, text:'和太岁三合：做事有助力，适合推进计划'});
    const badN = out.filter(o => o.bad).length;
    const score = out.length === 0 ? 70 : Math.round(clamp(70 - 12 * badN + (out.some(o => !o.bad) ? 12 : 0), 30, 90));
    const advice = badN ? '传统习俗会在年初到庙里拜太岁、安太岁，平时多做善事，心态放平稳。' : '今年和太岁没有冲犯，按平常心发展即可。';
    return {shengxiao: SX[birthZhi], yearShengxiao: SX[yz], yearGZ: ly.getYearInGanZhi(), list: out, score, grade: GRADE(score), advice};
  }

  /* ---------- 黄历择日 ---------- */
  const ACTS = [['开业','开市'],['签约','立券','交易'],['搬家','入宅','移徙'],['嫁娶','嫁娶'],['出行','出行'],['装修动土','动土','修造']];
  function zeri(year, lunarMonth, birthShengxiao){
    const days = [];
    const lm = L.Lunar.fromYmd(year, lunarMonth, 1);
    const first = lm.getSolar();
    for(let k = 0; k < 31; k++){
      const s = first.next(k), lu = s.getLunar();
      if(lu.getMonth() !== lunarMonth) break;
      days.push({solar: s, lunar: lu, yi: lu.getDayYi(), ji: lu.getDayJi(), chong: lu.getDayChongShengXiao(), luck: lu.getDayTianShenLuck()});
    }
    return ACTS.map(([label, ...keys]) => {
      const good = days.filter(d => keys.some(k => d.yi.includes(k)) && !keys.some(k => d.ji.includes(k)) && d.chong !== birthShengxiao && d.luck === '吉');
      return {label, days: good.slice(0, 8).map(d => ({date: `${d.solar.getMonth()}/${d.solar.getDay()}`, week: '日一二三四五六'[d.solar.getWeek()], lunar: d.lunar.getDayInChinese()}))};
    });
  }

  /* ---------- 西洋星座 ---------- */
  const SIGNS = [
    ['白羊座','火','开创','冲劲十足、直率、喜欢领先','情绪来得快，需要即时的回应'],
    ['金牛座','土','固定','稳重务实、重视安全感和享受','需要稳定、实在的陪伴'],
    ['双子座','风','变动','好奇心强、反应快、爱沟通','需要聊天和新鲜感'],
    ['巨蟹座','水','开创','顾家、重感情、保护欲强','需要家的温暖和被照顾'],
    ['狮子座','火','固定','自信大方、有领导魅力、爱面子','需要被欣赏和肯定'],
    ['处女座','土','变动','细心、追求完美、善于分析','需要秩序，容易为小事操心'],
    ['天秤座','风','开创','优雅、重视公平与和谐、人缘好','需要和谐的关系，怕冲突'],
    ['天蝎座','水','固定','专注、洞察力强、爱恨分明','感情深沉，需要信任'],
    ['射手座','火','变动','乐观、热爱自由、喜欢学习和旅行','需要自由空间'],
    ['摩羯座','土','开创','有责任感、目标明确、能吃苦','需要成就感，不轻易表露'],
    ['水瓶座','风','固定','独立、有创意、重视朋友','需要理解，讨厌被约束'],
    ['双鱼座','水','变动','浪漫、富同情心、直觉强','需要心灵上的共鸣'],
  ];
  function zodiac(y, m, d, hour){
    if(!AST) return null;
    const t = new Date(Date.UTC(y, m - 1, d, hour - 8, 0));        // 按 UTC+8（马来西亚）
    const sunLon = AST.SunPosition(t).elon, moonLon = AST.EclipticGeoMoon(t).lon;
    const si = Math.floor(sunLon / 30) % 12, mi = Math.floor(moonLon / 30) % 12;
    const near = Math.min(moonLon % 30, 30 - moonLon % 30) < 1.2;
    const S = SIGNS[si], M = SIGNS[mi];
    return {sun: {name: S[0], el: S[1], mode: S[2], text: S[3]}, moon: {name: M[0], el: M[1], text: M[4]}, moonNear: near};
  }

  /* ---------- 生命灵数 ---------- */
  const LP = {1:'领导者：独立、有主见、开创',2:'协调者：体贴、合作、敏感',3:'表达者：乐观、有创意、爱分享',4:'建设者：踏实、守规矩、有耐力',5:'自由者：爱冒险、多才多艺、喜欢变化',6:'照顾者：有责任感、重家庭、爱付出',7:'思考者：爱研究、直觉强、需要独处',8:'掌权者：重视成就和财富、有魄力',9:'理想者：博爱、有同情心、追求理想',11:'灵性导师（大师数）：直觉极强、能启发别人',22:'大建筑师（大师数）：能把理想变成现实',33:'大爱导师（大师数）：无私奉献、疗愈他人'};
  const MISS = {1:'自信和主见',2:'耐心和合作',3:'表达和沟通',4:'纪律和条理',5:'弹性和冒险',6:'责任和承诺',7:'独处和思考',8:'理财和规划',9:'包容和放下'};
  function lifePath(y, m, d){
    const digits = `${y}${m}${d}`.split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    let n = sum;
    while(n > 9 && ![11, 22, 33].includes(n)) n = String(n).split('').reduce((a, b) => a + +b, 0);
    const present = new Set(digits.filter(x => x > 0).concat(String(sum).split('').map(Number)).concat([n > 9 ? 0 : n]));
    const missing = [1,2,3,4,5,6,7,8,9].filter(k => !present.has(k));
    return {sum, number: n, code: `${sum}/${n}`, text: LP[n], missing: missing.map(k => ({k, text: MISS[k]}))};
  }

  /* ---------- 综合判断 ---------- */
  function combine(ziweiAvg, baziYearScore, taisuiScore){
    const idx = Math.round(0.5 * ziweiAvg + 0.35 * baziYearScore + 0.15 * taisuiScore);
    const zG = ziweiAvg >= 60, bG = baziYearScore >= 60;
    const text = zG && bG ? '紫微斗数和八字都看好今年，可以积极行动'
      : !zG && !bG ? '紫微斗数和八字都提示今年要保守，以守为主'
      : zG ? '紫微斗数看好、八字较保守：机会有，但要量力而为'
      : '八字看好、紫微斗数较保守：大方向不错，细节要小心';
    return {index: idx, grade: GRADE(idx), text};
  }

  return {bazi, baziYear, taisui, zeri, zodiac, lifePath, combine, SX};
})();
if(typeof module !== 'undefined') module.exports = MORE;
