/* ===== 解读资料库：可直接替换成师傅的文字 ===== */
const DOMAIN = {命宫:'',兄弟:'母亲或兄弟',夫妻:'配偶',子女:'孩子',财帛:'财运',疾厄:'健康',迁移:'出外运势',仆役:'合作',官禄:'事业',田宅:'房产运',福德:'晚年',父母:'父亲'};
const CAT = {命宫:'self',兄弟:'kin',夫妻:'love',子女:'kin',财帛:'money',疾厄:'health',迁移:'travel',仆役:'social',官禄:'career',田宅:'house',福德:'late',父母:'kin'};

// 每颗星：trait 性格(命宫中间) / gen 通用 / 各类宫位专用 / xian 落陷 / month 流月
const STAR = {
  紫微:{trait:['格局大','爱面子','有领导力'],gen:['贵气','有主见'],career:['管理阶层','自己做老板'],money:['有钱有伴','财源稳定'],health:['脾胃'],love:['配偶能干','有主见'],kin:['长辈有地位'],late:['有钱有伴'],month:['事业顺利','贵人相助'],house:['房产运好'],travel:['出外有贵人'],social:['朋友有地位'],self:['领导统御','有主见']},
  天机:{trait:['聪明理智','想很多'],gen:['头脑灵活','善于计划'],career:['策划顾问','科技资讯'],money:['靠脑力赚钱'],health:['肝胆'],kin:['疼爱帮助'],love:['配偶聪明'],month:['想很多','注意自己的思想'],house:['常搬家'],travel:['出外有机会'],social:['朋友多变'],late:['想很多'],self:['聪明理智','善于计划']},
  太阳:{trait:['热心善良','积极拼命'],gen:['热心','付出多'],career:['政府企业','公众服务'],money:['先付出后收获'],health:['心脏','眼睛血压'],kin:['威严管教'],xian:['付出多回报少'],month:['工作能力强','开销大'],house:['房产运好'],travel:['出外有名声'],social:['付出多回报少'],late:['操心多'],self:['热心善良','积极拼命']},
  武曲:{trait:['坚韧毅力','重视财富'],gen:['刚直','重实际'],career:['金融财务','数字财会'],money:['收入高','善于理财'],health:['肺部呼吸'],love:['无缘','聚少离多'],kin:['较有距离'],month:['赚到钱','要求高'],house:['靠自己置产'],travel:['出外求财'],social:['合作要分清楚'],late:['有钱有伴'],self:['刚直果断','重视财富']},
  天同:{trait:['有同理心','享受生活'],gen:['感情好','孝顺'],career:['服务业','餐饮娱乐'],money:['小富即安'],health:['肾','膀胱'],love:['感情好'],kin:['感情好','孝顺'],month:['吉人天相','贪玩好动'],house:['家庭和乐'],travel:['出外顺利'],social:['人缘好'],late:['享受生活'],self:['有同理心','享受生活']},
  廉贞:{trait:['欲望大','讲义气'],gen:['讲义气','感情起伏'],career:['公关业务','军警运动'],money:['财来财去'],health:['心脏血液'],love:['感情起伏'],travel:['权贵相助','外地人或外国人是贵人'],month:['工作能力强','人际关系差'],house:['房产有变动'],social:['朋友讲义气'],late:['欲望大'],self:['讲义气','爱面子']},
  天府:{trait:['沉稳务实','善于理财'],gen:['领导统御','发号施令'],career:['管理行政','银行财库'],money:['守得住钱'],health:['脾胃'],kin:['照顾家人'],month:['事业顺利','赚到钱'],house:['房产运好','守得住'],travel:['出外有贵人'],social:['合作稳定'],late:['有钱有伴']},
  太阴:{trait:['细心温柔','文笔好'],gen:['温和','顾家'],career:['房地产','设计文艺'],money:['慢慢累积'],health:['肾','妇科'],kin:['聚少离多'],house:['房产运好'],xian:['容易悲观'],month:['想很多','容易悲观'],travel:['出外顺利'],social:['朋友温和'],late:['想很多'],self:['细心温柔','重视家庭']},
  贪狼:{trait:['多才多艺','交际好'],gen:['人缘好','兴趣多'],career:['娱乐销售','代购销售'],money:['偏财运'],health:['肝','肾'],love:['桃花多'],late:[],month:['贪玩好动','开销大'],house:['家里热闹'],travel:['出外有桃花'],self:['多才多艺','交际好']},
  巨门:{trait:['口才好','冲动直接'],gen:['口才好','是非多'],career:['律师老师','靠口才'],money:['靠嘴巴赚钱'],health:['肠胃','口腔'],house:['官司是非','不建议投资'],xian:['官司是非','不建议投资'],month:['注意口角是非','注意合约合同'],travel:['出外口舌多'],social:['注意口角是非'],late:['想很多'],self:['口才好','冲动直接']},
  天相:{trait:['热心助人','操心负责'],gen:['中间人','服务热心'],career:['中间人','代购销售','服务业'],money:['收入稳定'],health:['皮肤','泌尿'],month:['赚到钱','逢凶化吉'],house:['房产运好'],travel:['出外有贵人'],social:['朋友帮忙'],late:['操心多'],self:['热心助人','操心负责']},
  天梁:{trait:['有慈悲心','逢凶化吉'],gen:['照顾人','老成'],career:['医疗教育','慈善宗教'],money:['有贵人帮'],health:['胃'],social:['破财','可合作慈善医院学校'],month:['贵人相助','逢凶化吉'],house:['祖业庇荫'],travel:['出外有贵人'],late:['逢凶化吉'],self:['有慈悲心','逢凶化吉']},
  七杀:{trait:['企图心强','冲动直接'],gen:['冲劲大','独立'],career:['军警运动','创业开拓'],money:['大进大出'],health:['血光意外','呼吸道'],travel:['血光意外'],month:['工作能力强','要求高'],house:['房产有变动'],social:['朋友讲义气'],late:['劳碌'],self:['积极拼命','企图心强']},
  破军:{trait:['敢冲敢变','火爆急躁'],gen:['变动大','破旧立新'],career:['开创新事业'],money:['财进财出'],health:['肾','生殖系统'],love:['聚少离多'],month:['开销大','脾气不好'],house:['房产有变动'],travel:['出外辛苦'],social:['朋友多变'],late:['劳碌'],self:['敢冲敢变','火爆急躁']},
  // 辅星
  左辅:{trait:['爱帮助人'],gen:['多帮手'],month:['贵人相助'],self:[],health:[]},
  右弼:{trait:['人缘好'],gen:['多才多艺','爱帮助人'],month:['贵人相助'],health:[]},
  文昌:{trait:['文笔好'],gen:['帮助我','有文才'],month:['考试文书顺'],kin:['帮助我'],health:[]},
  文曲:{trait:['口才好'],gen:['才艺好'],month:['想很多'],kin:[],health:[]},
  天魁:{trait:['有贵人'],gen:['贵人相助'],month:['贵人相助'],kin:[],health:[]},
  天钺:{trait:['有贵人'],gen:['贵人相助'],health:[],month:['贵人相助']},
  禄存:{trait:['善于理财'],gen:['有财库'],money:['守财'],month:['赚到钱'],late:[],health:[]},
  天马:{trait:['爱跑动'],gen:['奔波走动'],career:['政府企业','奔波外勤'],month:['出外有利'],love:[],health:[]},
  擎羊:{trait:['火爆急躁'],gen:['冲突竞争'],health:['开刀外伤'],month:['注意口角是非','注意小人'],house:[]},
  陀罗:{trait:['固执'],gen:['拖延纠结'],health:['脾胃'],month:['不要太纠结'],kin:[]},
  火星:{trait:['火爆急躁'],gen:['性急'],health:['发炎'],month:['注意自己的脾气'],self:[]},
  铃星:{trait:['内心急'],gen:['暗中压力'],health:['心脏血液'],month:['容易悲观']},
  地空:{trait:['想法特别'],gen:['理想化'],money:['不宜冒险'],month:['不要投资'],self:[],health:[]},
  地劫:{trait:['大起大落'],gen:['财进财出'],money:['收入高','两份收入','财进财出'],month:['不能投资','开销大']},
};
const MUTAGEN = {
  禄:{gen:'有收获',health:'',money:'赚到钱',kin:'',late:'',month:'赚到钱'},
  权:{gen:'有权力',health:'',social:'合作商业',month:'工作能力强'},
  科:{gen:'有名声',health:'',late:'',month:'贵人相助'},
  忌:{gen:'聚少离多',social:'破财',money:'破财',month:'想很多'},
};
// 宫位类别 → 流月主题
const MONTH_CAT = {self:['注意自己的脾气'],kin:['想很多'],love:['事业顺利'],money:['赚到钱'],health:['注意健康'],travel:['人际关系差'],social:['贵人相助'],career:['事业顺利'],house:['注意合约合同'],late:['贪玩好动']};
const MONTH_CAT_BAD = {self:['脾气不好'],money:['开销大','不要投资'],kin:['脾气不好'],house:['注意口角是非'],health:['容易悲观']};

/* ===== 吉凶计分规则（可调整） ===== */
const LUCKY = ['左辅','右弼','天魁','天钺','文昌','文曲','禄存'];
const UNLUCKY = ['擎羊','陀罗','火星','铃星','地空','地劫'];
const GOODMAIN = ['紫微','天府','天相','天同','天梁'];
function palaceScore(p, flow){
  let s = 0;
  const names = [...p.majorStars, ...p.minorStars].map(x => x.name);
  if(flow){ flow.forEach((n, i) => { if(names.includes(n)) s += (i === 3 ? -2 : 2); }); }
  if(!p.majorStars.length) s -= 1;
  for(const st of p.majorStars){
    if(GOODMAIN.includes(st.name)) s += 1;
    if(st.brightness === '陷') s -= 3;
  }
  for(const st of [...p.majorStars, ...p.minorStars]){
    if(st.mutagen === '禄' || st.mutagen === '权' || st.mutagen === '科') s += 2;
    if(st.mutagen === '忌') s -= 2;
    if(st.name === '左辅' || st.name === '右弼') s += 0.5;
    else if(LUCKY.includes(st.name)) s += 1;
    if(st.name === '地空' || st.name === '地劫') s -= 2;
    else if(UNLUCKY.includes(st.name)) s -= 1;
  }
  return s;
}

const uniq = a => [...new Set(a.filter(Boolean))];
function starsOf(p){ return [...p.majorStars, ...p.minorStars].filter(s => STAR[s.name]); }

function palaceText(p, palaces){
  const cat = CAT[p.name], out = [];
  let list = starsOf(p);
  // 疾厄宫无主星：借对宫的星看健康
  if(cat === 'health' && !p.majorStars.length && palaces){
    const opp = palaces[(palaces.indexOf(p) + 6) % 12];
    list = [...list, ...starsOf(opp).filter(st => STAR[st.name].health).map(st => ({name: st.name}))];
  }
  for(const st of list){
    const d = STAR[st.name];
    if(d[cat] !== undefined) out.push(...d[cat]);
    else if(st.brightness === '陷' && d.xian) out.push(...d.xian);
    else out.push(...(d.gen || []));
    if(st.mutagen){ const m = MUTAGEN[st.mutagen]; const v = m[cat] !== undefined ? m[cat] : m.gen; if(v) out.push(v); }
  }
  return uniq(out).slice(0, cat === 'health' ? 6 : 5);
}

// ===== 流月用语（按原图样本反推：每颗星对应的词，只用原图出现过的词语）=====
const MONTH_PH = {
  紫微:['事业顺利','贵人相助'], 天机:['工作顺利','想很多'], 太阳:['注意自己的脾气'], 武曲:['赚到钱','工作能力强'],
  天同:['吉人天相','贵人相助'], 廉贞:['人际关系差','赚到钱'], 天府:['开销大','赚到钱'], 太阴:['想很多','容易悲观'],
  贪狼:['贪玩好动','开销大'], 巨门:['注意口角是非','注意合约合同'], 天相:['赚到钱','逢凶化吉','注意小人','开销大'],
  天梁:['贵人相助','注意健康'], 七杀:['工作能力强','要求高'], 破军:['事业顺利','注意健康'],
  左辅:['贵人相助'], 右弼:['贵人相助'], 天魁:['贵人相助'], 天钺:['贵人相助'], 文昌:['注意口角是非'], 文曲:[],
  禄存:['赚到钱'], 天马:['工作能力强'], 擎羊:['开销大'], 陀罗:['不要太纠结'], 火星:['脾气不好'],
  铃星:['想很多','容易悲观'], 地空:['不要投资'], 地劫:['不能投资','注意口舌是非','注意流言蜚语'],
};
const MONTH_MUT = {禄:'赚到钱', 权:'事业顺利', 科:'贵人相助', 忌:'注意自己的思想'};
const MONTH_FALLBACK = {self:['注意自己的脾气'],kin:['想很多'],love:['事业顺利'],money:['赚到钱'],health:['注意健康'],travel:['人际关系差'],social:['贵人相助'],career:['工作顺利'],house:['注意合约合同'],late:['贪玩好动']};

function monthText(p, good){
  const cols = [...p.majorStars, ...p.minorStars].filter(st => MONTH_PH[st.name]).map(st => {
    const ph = MONTH_PH[st.name].slice();
    if(st.mutagen === '忌') return [MONTH_MUT['忌']];   // 化忌盖过原本的意思
    if(st.mutagen && MONTH_MUT[st.mutagen]) ph.push(MONTH_MUT[st.mutagen]);
    return ph;
  });
  const out = [];
  for(let round = 0; round < 4; round++) for(const c of cols) if(c[round] && !out.includes(c[round])) out.push(c[round]);
  if(p.isBodyPalace) out.push('逢凶化吉');
  for(const f of MONTH_FALLBACK[CAT[p.name]] || []) if(out.length < 2 && !out.includes(f)) out.push(f);
  if(out.length < 2) out.push(good ? '逢凶化吉' : '注意小人');
  return uniq(out).slice(0, 4);
}

// ===== 性格（按原图样本：取命宫及三方四正的星）=====
const TRAIT = {
  紫微:['格局大','爱面子','有领导力','重视地位'], 天机:['聪明理智','想很多','反应快','善于计划'],
  太阳:['热心善良','积极拼命','光明磊落','爱面子'], 武曲:['坚韧毅力','重视财富','刚直果断','善于理财'],
  天同:['有同理心','享受生活','性格温和','知足常乐'], 廉贞:['讲义气','欲望大','爱面子','要求高'],
  天府:['沉稳务实','善于理财','重视财富','格局大'], 太阴:['细心温柔','文笔好','重视家庭','善于理财'],
  贪狼:['多才多艺','交际好','欲望大','好奇心强'], 巨门:['口才好','冲动直接','观察力强','爱钻研'],
  天相:['有同理心','热心善良','操心负责','有慈悲心'], 天梁:['有慈悲心','逢凶化吉','爱照顾人','老成稳重'],
  七杀:['积极拼命','企图心强','冲动直接','坚韧毅力'], 破军:['敢冲敢变','火爆急躁','冲动直接','不服输'],
  左辅:['聪明理智','逢凶化吉'], 右弼:['文笔好','爱帮助人'], 文昌:['文笔好'], 文曲:['口才好'],
  天魁:['逢凶化吉'], 天钺:['逢凶化吉'], 禄存:['善于理财'], 擎羊:['冲动直接'], 陀罗:['固执'],
  火星:['火爆急躁'], 铃星:['内心急'], 地空:[], 地劫:['大起大落'],
};
function selfTraits(astrolabe){
  const P = astrolabe.palaces, ming = P.find(p => p.name === '命宫'), i = P.indexOf(ming);
  // 命宫空宫借对宫
  const core = ming.majorStars.length ? ming : P[(i + 6) % 12];
  const group = [core, P[(i + 4) % 12], P[(i + 8) % 12], P[(i + 6) % 12]];
  const t = [];
  for(const st of [...ming.minorStars]) t.push(...(TRAIT[st.name] || []).slice(0, 1));
  for(const p of uniq(group)) for(const st of p.majorStars) t.push(...(TRAIT[st.name] || []));
  for(const st of ming.minorStars) t.push(...(TRAIT[st.name] || []).slice(1));
  return uniq(t).slice(0, 20);
}

function advice(astrolabe){
  const all = astrolabe.palaces.flatMap(p => [...p.majorStars, ...p.minorStars]);
  const has = n => all.some(s => s.name === n);
  const a = ['多做慈善'];
  if(has('七杀') || has('擎羊') || has('破军')) a.push('捐血捐款');
  a.push('宗教信仰');
  return a;
}

function yearReading(astrolabe, year, timeIndex, Lunar){
  const months = [];
  for(let m = 1; m <= 12; m++){
    const sol = Lunar.fromYmd(year, m, 15).getSolar();
    const h = astrolabe.horoscope(new Date(sol.getYear(), sol.getMonth() - 1, sol.getDay(), 12), timeIndex);
    const p = astrolabe.palaces[h.monthly.index];
    const flow = h.monthly.mutagen;
    const score = palaceScore(p, flow), good = score >= 0;
    months.push({m, good, score, branch: p.earthlyBranch, palace: p.name, lines: monthText(p, good)});
  }
  const bad = months.filter(x => !x.good).length;
  const mid = Lunar.fromYmd(year, 6, 15).getSolar();
  const h = astrolabe.horoscope(new Date(mid.getYear(), mid.getMonth() - 1, mid.getDay(), 12), timeIndex);
  const jiStar = h.yearly.mutagen[3];
  const jiPalace = astrolabe.palaces.find(p => [...p.majorStars, ...p.minorStars].some(s => s.name === jiStar));
  const jiCat = jiPalace ? CAT[jiPalace.name] : 'self';
  const CAUTION = {self:'注意自己的情绪和健康',kin:'注意自己与人的沟通和相处',love:'注意感情与婚姻的经营',money:'注意钱财进出，不要乱投资',health:'注意身体健康，按时检查',travel:'出外注意安全，凡事小心',social:'注意自己与人的沟通和相处',career:'工作上注意小人与是非',house:'注意房产和合约文件',late:'注意心情，不要想太多'};
  const overall = bad <= 4 ? '整体是不错的一年' : bad <= 6 ? '吉凶参半，稳中求进的一年' : '挑战较多的一年，宜守不宜攻';
  // 流年四化落宫 → 个人化建议
  const CN = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
  const findPalace = name => astrolabe.palaces.find(p => [...p.majorStars, ...p.minorStars].some(s => s.name === name));
  const label = p => p ? (p.name === '命宫' ? '自己' : (DOMAIN[p.name] || p.name)) : '';
  const LU = {self:'个人运势旺，努力就有收获',kin:'家人会带来好运和帮助',love:'感情顺利，配偶带财',money:'财运旺，有机会赚到钱',health:'身体比去年好',travel:'出外有财，适合多走动',social:'朋友合作有利，可以谈生意',career:'事业有收获，适合争取升职加薪',house:'家宅房产运好',late:'心情愉快，懂得享受生活'};
  const [luS, quanS, keS] = h.yearly.mutagen;
  const luP = findPalace(luS), quanP = findPalace(quanS), keP = findPalace(keS);
  const yearMing = astrolabe.palaces[h.yearly.index];
  const rough = [...yearMing.majorStars, ...yearMing.minorStars].some(s => UNLUCKY.includes(s.name) || s.brightness === '陷' || s.mutagen === '忌');
  const badList = months.filter(x => !x.good).map(x => CN[x.m - 1]).join('、');
  const goodList = months.filter(x => x.good && x.score >= 2).map(x => CN[x.m - 1]).join('、');
  const advice = [];
  advice.push(bad ? `凶月是${badList}月，这几个月做事情多计划` : '十二个月都平稳，按部就班就好');
  if(goodList) advice.push(`${goodList}月运势最好，重要的事安排在这几个月`);
  if(luP) advice.push(`${luS}化禄入${luP.name === '命宫' ? '命宫' : luP.name + '宫'}：${LU[CAT[luP.name]]}`);
  if(quanP) advice.push(`${quanS}化权入${quanP.name === '命宫' ? '命宫' : quanP.name + '宫'}：${label(quanP)}方面可以主动争取`);
  if(keP) advice.push(`${keS}化科入${keP.name === '命宫' ? '命宫' : keP.name + '宫'}：${label(keP)}方面有贵人和好名声`);
  advice.push(rough ? '流年命宫有煞，不要冲动，思考全面后才去做' : '流年命宫平稳，适合规划长远目标');
  advice.push(bad >= 6 ? '不要意气用事，不要随便投资' : '保持乐观，多一些正能量');
  return {months, bad, overall, caution: CAUTION[jiCat], yearGanZhi: h.yearly.heavenlyStem + h.yearly.earthlyBranch, jiStar, advice, yearMingPalace: yearMing.name};
}

if(typeof module !== 'undefined') module.exports = {palaceScore, palaceText, monthText, selfTraits, advice, yearReading, DOMAIN};
