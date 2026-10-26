/* =====================================================================
   紫微命盘 · 流年运势 —— 解读规则
   规则来源：传统紫微斗数（星曜庙陷、四化、三方四正、对宫、斗君起流月），
   用语与取舍按原始样本（秀玲 1985-11-23 戌时 / 2021）反推校准。
   要换成师傅的用语，只需改下面的词库。
   ===================================================================== */

/* ---------- 流派设定 ---------- */
const SETTINGS = {
  maByMonth: true,     // 天马按出生月份安星（样本用法）；false = 按出生年
  triWeight: 0.2,      // 流月吉凶：三方四正占的比重（本宫为主）
};

/* ---------- 宫位 ---------- */
const PKEY = {命宫:'命',兄弟:'兄',夫妻:'夫',子女:'子',财帛:'财',疾厄:'疾',迁移:'迁',仆役:'仆',官禄:'官',田宅:'田',福德:'福',父母:'父'};
const DOMAIN = {命宫:'',兄弟:'母亲或兄弟',夫妻:'配偶',子女:'孩子',财帛:'财运',疾厄:'健康',迁移:'出外运势',仆役:'合作',官禄:'事业',田宅:'房产运',福德:'晚年',父母:'父亲'};
const CAT = {命宫:'self',兄弟:'kin',夫妻:'love',子女:'kin',财帛:'money',疾厄:'health',迁移:'travel',仆役:'social',官禄:'career',田宅:'house',福德:'late',父母:'kin'};

/* ---------- 14 主星 × 12 宫 ----------
   每格：[一般用语]；'陷' 为落陷（陷/不）时改用的用语 */
const MAJOR = {
  紫微:{命:['领导统御','格局大'],兄:['兄弟有地位','互相帮助'],夫:['配偶能干','夫妻同心'],子:['子女有出息','管教严格'],财:['财源稳定','善于理财'],疾:['脾胃'],迁:['出外有贵人','受人尊重'],仆:['朋友有地位','贵人相助'],官:['管理阶层','自己做老板'],田:['房产运好','有祖业'],福:['有钱有伴'],父:['父亲有地位','家教严']},
  天机:{命:['聪明理智','善于计划'],兄:['兄弟聪明','各有想法'],夫:['配偶聪明','年龄有差距'],子:['子女聪明','好动'],财:['靠脑力赚钱','收入有变动'],疾:['肝胆'],迁:['出外有机会','常变动'],仆:['朋友多变','点子多'],官:['策划顾问','科技资讯'],田:['常搬家'],福:['想很多','劳心'],父:['疼爱帮助'],
        陷:{命:['想太多','心神不定'],财:['收入不稳'],夫:['感情多变']}},
  太阳:{命:['热心善良','积极拼命'],兄:['兄弟照顾我'],夫:['配偶事业心强'],子:['子女有出息'],财:['先付出后收获'],疾:['心脏','眼睛血压'],迁:['出外有名声'],仆:['朋友多'],官:['政府企业','公众服务'],田:['房产运好'],福:['操心多'],父:['父亲照顾'],
        陷:{命:['付出多回报少'],兄:['威严管教'],夫:['配偶忙碌'],子:['管教辛苦'],财:['付出多回报少'],迁:['出外辛苦'],仆:['付出多回报少'],官:['工作辛苦'],田:['房产难守'],父:['威严管教']}},
  武曲:{命:['刚直果断','重视财富'],兄:['兄弟较有距离'],夫:['无缘','聚少离多'],子:['子女独立'],财:['收入高','善于理财'],疾:['肺部呼吸','骨骼'],迁:['出外求财'],仆:['合作要分清楚'],官:['数字财会','金融财务'],田:['靠自己置产'],福:['劳碌赚钱'],父:['父亲严格']},
  天同:{命:['有同理心','享受生活'],兄:['兄弟和睦'],夫:['感情好','配偶温和'],子:['感情好','孝顺'],财:['小富即安','白手起家'],疾:['肾','膀胱'],迁:['出外顺利','人缘好'],仆:['人缘好','朋友多'],官:['服务业','餐饮娱乐'],田:['家庭和乐'],福:['享受生活','有福气'],父:['父母疼爱'],
        陷:{命:['懒散','缺乏冲劲'],财:['钱财难聚']}},
  廉贞:{命:['讲义气','爱面子'],兄:['兄弟意见多'],夫:['感情起伏'],子:['子女个性强'],财:['财来财去'],疾:['心脏血液'],迁:['权贵相助','外地人或外国人是贵人'],仆:['朋友讲义气'],官:['公关业务','军警运动'],田:['房产有变动'],福:['欲望大'],父:['父亲个性强'],
        陷:{命:['容易冲动'],迁:['出外是非多'],夫:['感情纠纷']}},
  天府:{命:['领导统御','发号施令'],兄:['兄弟照顾'],夫:['配偶顾家','婚姻稳定'],子:['子女孝顺'],财:['守得住钱','财库丰厚'],疾:['脾胃'],迁:['出外有贵人'],仆:['合作稳定'],官:['管理行政','银行财库'],田:['房产运好','守得住'],福:['有钱有伴'],父:['父母照顾']},
  太阴:{命:['细心温柔','重视家庭'],兄:['姐妹多'],夫:['配偶温柔'],子:['女儿缘好'],财:['慢慢累积'],疾:['肾','妇科'],迁:['出外顺利'],仆:['朋友温和'],官:['房地产','设计文艺'],田:['房产运好'],福:['想很多'],父:['母亲照顾'],
        陷:{命:['容易悲观'],兄:['聚少离多'],夫:['感情多波折'],财:['存钱不易'],福:['容易悲观']}},
  贪狼:{命:['多才多艺','交际好'],兄:['兄弟爱玩'],夫:['桃花多','感情复杂'],子:['子女活泼'],财:['偏财运','财来财去'],疾:['肝','肾'],迁:['出外有桃花','交际多'],仆:['朋友多','酒肉朋友'],官:['娱乐销售','代购销售'],田:['家里热闹'],福:[],父:['父亲爱交际']},
  巨门:{命:['口才好','冲动直接'],兄:['兄弟意见多'],夫:['夫妻口角'],子:['子女难管'],财:['靠嘴巴赚钱'],疾:['肠胃','口腔'],迁:['出外口舌多'],仆:['注意口角是非'],官:['律师老师','靠口才'],田:['房产要谨慎'],福:['想很多'],父:['和父母意见多'],
        陷:{命:['是非多'],田:['官司是非','不建议投资'],官:['工作是非'],夫:['夫妻口角多'],财:['钱财纠纷']}},
  天相:{命:['热心助人','操心负责'],兄:['兄弟互助'],夫:['配偶体贴'],子:['子女乖巧'],财:['收入稳定'],疾:['皮肤','泌尿'],迁:['出外有贵人'],仆:['朋友帮忙'],官:['中间人','代购销售','服务业'],田:['房产运好'],福:['操心多'],父:['父母照顾']},
  天梁:{命:['有慈悲心','逢凶化吉'],兄:['兄长照顾'],夫:['配偶年长','懂得照顾'],子:['子女懂事'],财:['有贵人帮'],疾:['胃'],迁:['出外有贵人'],仆:['破财','可合作慈善医院学校'],官:['医疗教育','慈善宗教'],田:['祖业庇荫'],福:['逢凶化吉'],父:['父母长寿']},
  七杀:{命:['积极拼命','企图心强'],兄:['兄弟个性强'],夫:['感情多波折'],子:['子女独立'],财:['大进大出'],疾:['血光意外','呼吸道'],迁:['血光意外'],仆:['朋友讲义气'],官:['军警运动','创业开拓'],田:['房产有变动'],福:['劳碌'],父:['父亲严格']},
  破军:{命:['敢冲敢变','火爆急躁'],兄:['兄弟聚少离多'],夫:['聚少离多'],子:['子女叛逆'],财:['财进财出'],疾:['肾','生殖系统'],迁:['出外辛苦'],仆:['朋友多变'],官:['军警运动','开创新事业'],田:['房产有变动'],福:['劳碌'],父:['和父母聚少离多']},
};

/* ---------- 辅星、煞星：只在有意义的宫位才写 ---------- */
const MINOR = {
  左辅:{仆:['朋友帮忙'],官:['多帮手'],夫:['婚姻有助力'],迁:['出外有帮手']},
  右弼:{命:['多才多艺','爱帮助人'],仆:['朋友帮忙'],官:['多帮手'],夫:['婚姻有助力'],迁:['出外有帮手']},
  文昌:{兄:['帮助我'],官:['文书考试顺'],命:['文笔好'],子:['子女会读书'],父:['父母有学问']},
  文曲:{官:['口才好'],命:['才艺好'],子:['子女有才艺'],财:['靠才艺赚钱']},
  天魁:{命:['贵人相助'],迁:['出外遇贵人'],仆:['贵人相助'],官:['上司提拔']},
  天钺:{命:['贵人相助'],迁:['出外遇贵人'],仆:['贵人相助'],官:['上司提拔']},
  禄存:{财:['有财库'],命:['善于理财'],官:['工作稳定'],田:['守得住产业']},
  天马:{官:['政府企业'],迁:['出外有利'],财:['奔波求财'],命:['爱跑动']},
  擎羊:{疾:['开刀外伤'],财:['竞争求财'],命:['冲动直接'],夫:['夫妻口角'],迁:['出外注意安全']},
  陀罗:{疾:['脾胃'],命:['固执'],财:['钱财拖延'],夫:['感情纠结'],官:['工作拖延']},
  火星:{疾:['发炎'],夫:['夫妻吵架'],财:['突然破财']},
  铃星:{疾:['心脏血液'],夫:['感情冷淡'],财:['暗中破财']},
  地空:{财:['不宜冒险'],官:['想法特别'],田:['房产难守']},
  地劫:{财:['收入高','两份收入','财进财出'],官:['工作变动'],田:['房产难守'],疾:['注意意外']},
};

/* ---------- 四化：禄权科只在相关宫位加一句；化忌盖过该星原本的意思 ---------- */
const MUT_ADD = {
  禄:{财:'赚到钱',官:'升职加薪',命:'有福气',仆:'朋友带财',田:'置产有利'},
  权:{仆:'合作商业',官:'掌握实权',财:'善于理财',命:'有主见'},
  科:{命:'有名声',官:'名声好',财:'有贵人帮'},
};
const MUT_JI = {父:'聚少离多',兄:'聚少离多',子:'聚少离多',夫:'聚少离多',财:'破财',官:'工作是非',命:'想很多',疾:'注意身体',迁:'出外不顺',仆:'被朋友拖累',田:'房产纠纷',福:'想很多'};

const uniq = a => [...new Set(a.filter(Boolean))];
const isXian = st => st.brightness === '陷' || st.brightness === '不';
const allStars = p => [...p.majorStars, ...p.minorStars];
const opposite = (P, p) => P[(P.indexOf(p) + 6) % 12];

/* ---------- 天马按生月（寅午戌马在申，申子辰在寅，巳酉丑在亥，亥卯未在巳） ---------- */
const BR = '子丑寅卯辰巳午未申酉戌亥';
function applySchool(astrolabe){
  if(!SETTINGS.maByMonth || astrolabe._school) return astrolabe;
  astrolabe._school = true;
  const lm = parseLunarMonth(astrolabe.lunarDate);
  if(!lm) return astrolabe;
  const monthBranch = BR[(lm + 1) % 12];                 // 正月建寅
  const MA = {寅:'申',午:'申',戌:'申',申:'寅',子:'寅',辰:'寅',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'};
  const target = MA[monthBranch];
  let ma = null;
  for(const p of astrolabe.palaces){
    const i = p.minorStars.findIndex(s => s.name === '天马');
    if(i >= 0){ ma = p.minorStars.splice(i, 1)[0]; }
  }
  const tp = astrolabe.palaces.find(p => p.earthlyBranch === target);
  if(ma && tp) tp.minorStars.push(ma);
  return astrolabe;
}
function parseLunarMonth(s){
  const M = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
  const m = String(s).match(/年(闰)?(十一|十二|[正一二三四五六七八九十冬腊])月/);
  if(!m) return 0;
  const t = m[2];
  if(t === '十一') return 11;
  if(t === '十二') return 12;
  if(t === '一') return 1;
  return M.indexOf(t) + 1;
}

/* ---------- 本命十二宫解读 ---------- */
function starWords(st, k){
  if(st.mutagen === '忌') return [MUT_JI[k]];
  let w;
  if(MAJOR[st.name]){
    const d = MAJOR[st.name];
    w = (isXian(st) && d.陷 && d.陷[k]) ? d.陷[k] : (d[k] || []);
  } else {
    w = (MINOR[st.name] && MINOR[st.name][k]) || [];
  }
  w = w.slice();
  if(st.mutagen && MUT_ADD[st.mutagen] && MUT_ADD[st.mutagen][k]) w.push(MUT_ADD[st.mutagen][k]);
  return w;
}
function palaceText(p, palaces){
  const k = PKEY[p.name], out = [];
  for(const st of allStars(p)) out.push(...starWords(st, k));
  if(palaces){
    const opp = opposite(palaces, p);
    // 官禄看对宫（夫官一线）：对宫主星各取第一句
    if(k === '官') for(const st of opp.majorStars){ const w = starWords(st, k); if(w[0]) out.push(w[0]); }
    // 疾厄空宫：借对宫的星看身体
    if(k === '疾' && !p.majorStars.length) for(const st of allStars(opp)) out.push(...starWords({name: st.name, brightness: st.brightness}, k));
    // 其他空宫（无主星且本宫没话说）：借对宫主星
    else if(!p.majorStars.length && uniq(out).length < 2) for(const st of opp.majorStars) out.push(...starWords({name: st.name, brightness: st.brightness}, k));
  }
  return uniq(out).slice(0, 6);
}

/* ---------- 流月吉凶 ---------- */
const LUCKY = ['左辅','右弼','天魁','天钺','文昌','文曲','禄存'];
const UNLUCKY = ['擎羊','陀罗','火星','铃星','地空','地劫'];
const GOODMAIN = ['紫微','天府','天相','天同','天梁'];
function palaceScore(p, flow){
  let s = 0;
  const names = allStars(p).map(x => x.name);
  if(flow) flow.forEach((n, i) => { if(names.includes(n)) s += (i === 3 ? -2 : 2); });
  if(!p.majorStars.length) s -= 1;
  for(const st of p.majorStars){
    if(GOODMAIN.includes(st.name)) s += 1;
    if(st.brightness === '陷') s -= 3;
  }
  for(const st of allStars(p)){
    if(st.mutagen === '禄' || st.mutagen === '权' || st.mutagen === '科') s += 2;
    if(st.mutagen === '忌') s -= 2;
    if(st.name === '左辅' || st.name === '右弼') s += 0.5;
    else if(LUCKY.includes(st.name)) s += 1;
    if(st.name === '地空' || st.name === '地劫') s -= 2;
    else if(UNLUCKY.includes(st.name)) s -= 1;
  }
  return s;
}
// 本宫 + 三方四正 + 流年四化
function monthScore(P, i, monthFlow, yearFlow){
  const p = P[i];
  let s = palaceScore(p, monthFlow);
  s += SETTINGS.triWeight * [4, 8, 6].map(k => palaceScore(P[(i + k) % 12])).reduce((a, b) => a + b, 0);
  const names = allStars(p).map(x => x.name);
  if(yearFlow){
    yearFlow.slice(0, 3).forEach(n => { if(names.includes(n)) s += 1; });
    if(names.includes(yearFlow[3])) s -= 1;
  }
  return s;
}

/* ---------- 流月用语（按样本反推，只用原图出现过的词） ---------- */
const MONTH_PH = {
  紫微:['事业顺利','贵人相助'], 天机:['工作顺利','想很多'], 太阳:['注意自己的脾气'], 武曲:['赚到钱','工作能力强'],
  天同:['吉人天相','贵人相助'], 廉贞:['人际关系差','赚到钱'], 天府:['开销大','赚到钱'], 太阴:['想很多','容易悲观'],
  贪狼:['贪玩好动','开销大'], 巨门:['注意口角是非','注意合约合同'], 天相:['赚到钱','逢凶化吉','注意小人','开销大'],
  天梁:['贵人相助','注意健康'], 七杀:['工作能力强','要求高'], 破军:['事业顺利','注意健康'],
  左辅:['贵人相助'], 右弼:['贵人相助'], 天魁:['贵人相助'], 天钺:['贵人相助'], 文昌:['注意口角是非'], 文曲:[],
  禄存:['赚到钱'], 天马:[], 擎羊:['开销大'], 陀罗:['不要太纠结'], 火星:['脾气不好'],
  铃星:['想很多','容易悲观'], 地空:['不要投资'], 地劫:['不能投资','注意口舌是非','注意流言蜚语'],
};
const MONTH_MUT = {禄:'赚到钱', 权:'事业顺利', 科:'贵人相助', 忌:'注意自己的思想'};
const MONTH_FALLBACK = {self:['注意自己的脾气'],kin:['想很多'],love:['事业顺利'],money:['赚到钱'],health:['注意健康'],travel:['人际关系差'],social:['贵人相助'],career:['工作顺利'],house:['注意合约合同'],late:['贪玩好动']};

function monthText(p, good){
  const cols = allStars(p).filter(st => MONTH_PH[st.name]).map(st => {
    if(st.mutagen === '忌') return [MONTH_MUT['忌']];
    const ph = MONTH_PH[st.name].slice();
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

/* ---------- 性格：命宫 + 三方四正 ---------- */
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
  火星:['火爆急躁'], 铃星:['内心急'], 地空:[], 地劫:['大起大落'], 天马:[],
};
function selfTraits(astrolabe){
  const P = astrolabe.palaces, ming = P.find(p => p.name === '命宫'), i = P.indexOf(ming);
  const core = ming.majorStars.length ? ming : P[(i + 6) % 12];
  const group = [core, P[(i + 4) % 12], P[(i + 8) % 12], P[(i + 6) % 12]];
  const t = [];
  for(const st of ming.minorStars) t.push(...(TRAIT[st.name] || []).slice(0, 1));
  for(const p of uniq(group)) for(const st of p.majorStars) t.push(...(TRAIT[st.name] || []));
  for(const st of ming.minorStars) t.push(...(TRAIT[st.name] || []).slice(1));
  const fill = ['热心善良','聪明理智','重视家庭','有责任心','逢凶化吉','做事认真'];
  for(const f of fill) if(uniq(t).length < 12) t.push(f);
  return uniq(t).slice(0, 20);
}

function advice(astrolabe){
  const all = astrolabe.palaces.flatMap(allStars);
  const has = n => all.some(s => s.name === n);
  const a = ['多做慈善'];
  if(has('七杀') || has('擎羊') || has('破军')) a.push('捐血捐款');
  a.push('宗教信仰');
  return a;
}

/* ---------- 流年 ----------
   流月起点用「斗君」：以流年太岁宫为正月，逆数到生月，再从该宫起子时顺数到生时。
   流月四化用该月天干（五虎遁）。和 iztro 逐月核对过结果相同，但快很多。 */
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const SIHUA = {甲:['廉贞','破军','武曲','太阳'],乙:['天机','天梁','紫微','太阴'],丙:['天同','天机','文昌','廉贞'],丁:['太阴','天同','天机','巨门'],
  戊:['贪狼','太阴','右弼','天机'],己:['武曲','贪狼','天梁','文曲'],庚:['太阳','武曲','太阴','天同'],辛:['巨门','太阳','文曲','文昌'],
  壬:['天梁','紫微','左辅','武曲'],癸:['破军','巨门','太阴','贪狼']};
function horoscopeAt(astrolabe, Lunar, year, m, timeIndex){
  const s = Lunar.fromYmd(year, m, 15).getSolar();
  return astrolabe.horoscope(new Date(s.getYear(), s.getMonth() - 1, s.getDay(), 12), timeIndex);
}
function monthIndexes(astrolabe, Lunar, year, timeIndex){
  const P = astrolabe.palaces;
  const ly = Lunar.fromYmd(year, 1, 1);
  const tai = BR.indexOf(ly.getYearZhi());
  const bm = parseLunarMonth(astrolabe.lunarDate) || 1;
  const hi = timeIndex === 12 ? 0 : timeIndex;
  const dj = ((tai - (bm - 1) + hi) % 12 + 12) % 12;            // 斗君地支
  const ys = STEMS.indexOf(ly.getYearGan());
  return Array.from({length: 12}, (_, k) => {
    const br = BR[(dj + k) % 12];
    const stem = STEMS[((ys % 5) * 2 + 2 + k) % 10];              // 五虎遁：正月天干
    return {index: P.findIndex(p => p.earthlyBranch === br), mutagen: SIHUA[stem]};
  });
}
function yearReading(astrolabe, year, timeIndex, Lunar){
  applySchool(astrolabe);
  const P = astrolabe.palaces;
  const yh = horoscopeAt(astrolabe, Lunar, year, 6, timeIndex);
  const yearFlow = yh.yearly.mutagen;
  const months = [];
  const mi = monthIndexes(astrolabe, Lunar, year, timeIndex);
  for(let m = 1; m <= 12; m++){
    const i = mi[m - 1].index, p = P[i];
    const score = monthScore(P, i, mi[m - 1].mutagen, yearFlow), good = score >= 0;
    months.push({m, good, score, branch: p.earthlyBranch, palace: p.name, lines: monthText(p, good)});
  }
  const bad = months.filter(x => !x.good).length;
  const findPalace = name => P.find(p => allStars(p).some(s => s.name === name));
  const jiPalace = findPalace(yearFlow[3]);
  const jiCat = jiPalace ? CAT[jiPalace.name] : 'self';
  const CAUTION = {self:'注意自己的情绪和健康',kin:'注意自己与人的沟通和相处',love:'注意感情与婚姻的经营',money:'注意钱财进出，不要乱投资',health:'注意身体健康，按时检查',travel:'出外注意安全，凡事小心',social:'注意自己与人的沟通和相处',career:'工作上注意小人与是非',house:'注意房产和合约文件',late:'注意心情，不要想太多'};
  const overall = bad <= 4 ? '整体是不错的一年' : bad <= 6 ? '吉凶参半，稳中求进的一年' : '挑战较多的一年，宜守不宜攻';

  // 流年重点
  const CN = ['一','二','三','四','五','六','七','八','九','十','十一','十二'];
  const pn = p => p.name === '命宫' ? '命宫' : p.name + '宫';
  const label = p => p.name === '命宫' ? '自己' : (DOMAIN[p.name] || p.name);
  const LU = {self:'个人运势旺，努力就有收获',kin:'家人会带来好运和帮助',love:'感情顺利，配偶带财',money:'财运旺，有机会赚到钱',health:'身体比去年好',travel:'出外有财，适合多走动',social:'朋友合作有利，可以谈生意',career:'事业有收获，适合争取升职加薪',house:'家宅房产运好',late:'心情愉快，懂得享受生活'};
  const QUAN = {self:'主见强，适合主动出击',kin:'家里事由你做主',love:'感情上你较有主导权',money:'理财能力强，可主动争取收入',health:'体力好，适合规律运动',travel:'出外办事有魄力',social:'合作中掌握主导，可以谈条件',career:'工作上有表现，适合争取升职',house:'适合处理房产大事',late:'做事有定见'};
  const KE = {self:'名声好，容易得到认同',kin:'家人有贵人相助',love:'感情和谐，有贵人牵线',money:'有贵人帮忙理财',health:'遇到好医生，小病能化解',travel:'出外遇贵人',social:'朋友中有贵人',career:'工作上有名声，适合考试进修',house:'房产文件顺利',late:'心情平和'};
  const JI = {self:'情绪起伏，凡事多想一步',kin:'和家人容易有误会，多沟通',love:'感情容易有摩擦，多体谅',money:'钱财容易流失，不要投资',health:'身体要多注意，按时检查',travel:'出外要小心，避免冲动',social:'朋友合作容易有纠纷，不要担保',career:'工作上容易有是非，做事多检查',house:'房产文件要小心',late:'容易想太多，多出去走走'};
  const notes = [];
  const badList = months.filter(x => !x.good).map(x => CN[x.m - 1]).join('、');
  const best = months.filter(x => x.good).sort((a, b) => b.score - a.score).slice(0, 3).sort((a, b) => a.m - b.m).map(x => CN[x.m - 1]).join('、');
  notes.push(bad ? `凶月是${badList}月，这几个月做事情多计划` : '十二个月都平稳，按部就班就好');
  if(best) notes.push(`${best}月运势最好，重要的事安排在这几个月`);
  const [luS, quanS, keS, jiS] = yearFlow;
  const luP = findPalace(luS), quanP = findPalace(quanS), keP = findPalace(keS);
  if(luP) notes.push(`${luS}化禄入${pn(luP)}：${LU[CAT[luP.name]]}`);
  if(quanP) notes.push(`${quanS}化权入${pn(quanP)}：${QUAN[CAT[quanP.name]]}`);
  if(keP) notes.push(`${keS}化科入${pn(keP)}：${KE[CAT[keP.name]]}`);
  if(jiPalace) notes.push(`${jiS}化忌入${pn(jiPalace)}：${JI[jiCat]}`);
  const yearMing = P[yh.yearly.index];
  const rough = allStars(yearMing).some(s => UNLUCKY.includes(s.name) || s.brightness === '陷' || s.mutagen === '忌');
  notes.push(`流年命宫在${pn(yearMing)}，${rough ? '有煞星，不要冲动，思考全面后才去做' : '星曜平稳，适合规划长远目标'}`);
  // 大限（十年运）
  const birthYear = +String(astrolabe.solarDate).slice(0, 4);
  const age = year - birthYear + 1;
  const dec = P.find(p => p.decadal && p.decadal.range && age >= p.decadal.range[0] && age <= p.decadal.range[1]);
  if(dec){
    const w = palaceText(dec, P).slice(0, 2);
    notes.push(`目前大限（${dec.decadal.range[0]}–${dec.decadal.range[1]}岁）走${pn(dec)}：这十年重点在${label(dec)}${w.length ? '，' + w.join('、') : ''}`);
  }
  return {months, bad, overall, caution: CAUTION[jiCat], yearGanZhi: yh.yearly.heavenlyStem + yh.yearly.earthlyBranch, jiStar: jiS, advice: notes};
}

if(typeof module !== 'undefined') module.exports = {monthIndexes, horoscopeAt, SETTINGS, applySchool, palaceScore, monthScore, palaceText, monthText, selfTraits, advice, yearReading, DOMAIN};
