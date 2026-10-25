/* ===== 解读资料库：可直接替换成师傅的文字 ===== */
const DOMAIN = {命宫:'',兄弟:'母亲或兄弟',夫妻:'配偶',子女:'孩子',财帛:'财运',疾厄:'健康',迁移:'出外运势',仆役:'合作',官禄:'事业',田宅:'房产运',福德:'晚年',父母:'父亲'};
const CAT = {命宫:'self',兄弟:'kin',夫妻:'love',子女:'kin',财帛:'money',疾厄:'health',迁移:'travel',仆役:'social',官禄:'career',田宅:'house',福德:'late',父母:'kin'};

// 每颗星：trait 性格(命宫中间) / gen 通用 / 各类宫位专用 / xian 落陷 / month 流月
const STAR = {
  紫微:{trait:['格局大','爱面子','有领导力'],gen:['贵气','有主见'],career:['管理阶层','自己做老板'],money:['有钱有伴','财源稳定'],health:['脾胃'],love:['配偶能干','有主见'],kin:['长辈有地位'],late:['有钱有伴','晚年安稳'],month:['事业顺利','贵人相助']},
  天机:{trait:['聪明理智','想很多'],gen:['头脑灵活','善于计划'],career:['策划顾问','科技资讯'],money:['靠脑力赚钱'],health:['肝胆','神经'],kin:['疼爱帮助'],love:['配偶聪明'],month:['想很多','注意自己的思想']},
  太阳:{trait:['热心善良','积极拼命'],gen:['热心','付出多'],career:['政府企业','公众服务'],money:['先付出后收获'],health:['心脏','眼睛血压'],kin:['威严管教','帮助我'],xian:['付出多回报少'],month:['工作能力强','开销大']},
  武曲:{trait:['坚韧毅力','重视财富'],gen:['刚直','重实际'],career:['金融财务','数字财会'],money:['收入高','善于理财'],health:['肺部呼吸'],love:['无缘','聚少离多'],kin:['较有距离'],month:['赚到钱','要求高']},
  天同:{trait:['有同理心','享受生活'],gen:['感情好','孝顺'],career:['服务业','餐饮娱乐'],money:['小富即安'],health:['肾','膀胱'],love:['感情好'],kin:['感情好','孝顺'],month:['吉人天相','贪玩好动']},
  廉贞:{trait:['欲望大','讲义气'],gen:['权贵相助','外地人或外国人是贵人'],career:['公关业务','军警运动'],money:['财来财去'],health:['心脏血液'],love:['感情起伏'],travel:['权贵相助','外地人或外国人是贵人'],month:['工作能力强','人际关系差']},
  天府:{trait:['沉稳务实','善于理财'],gen:['领导统御','发号施令'],career:['管理行政','银行财库'],money:['守得住钱'],health:['脾胃'],kin:['照顾家人'],month:['事业顺利','赚到钱']},
  太阴:{trait:['细心温柔','文笔好'],gen:['温和','顾家'],career:['房地产','设计文艺'],money:['慢慢累积'],health:['肾','妇科'],kin:['聚少离多'],house:['房产运好'],xian:['容易悲观'],month:['想很多','容易悲观']},
  贪狼:{trait:['多才多艺','交际好'],gen:['人缘好','兴趣多'],career:['娱乐销售','代购销售'],money:['偏财运'],health:['肝','肾'],love:['桃花多'],late:['兴趣广'],month:['贪玩好动','开销大']},
  巨门:{trait:['口才好','冲动直接'],gen:['口才好','是非多'],career:['律师老师','靠口才'],money:['靠嘴巴赚钱'],health:['肠胃','口腔'],house:['官司是非','不建议投资'],xian:['官司是非','不建议投资'],month:['注意口角是非','注意合约合同']},
  天相:{trait:['热心助人','操心负责'],gen:['中间人','服务热心'],career:['中间人','代购销售','服务业'],money:['收入稳定'],health:['皮肤','泌尿'],month:['赚到钱','逢凶化吉']},
  天梁:{trait:['有慈悲心','逢凶化吉'],gen:['照顾人','老成'],career:['医疗教育','慈善宗教'],money:['有贵人帮'],health:['胃'],social:['可合作慈善医院学校'],month:['贵人相助','逢凶化吉']},
  七杀:{trait:['企图心强','冲动直接'],gen:['冲劲大','独立'],career:['军警运动','创业开拓'],money:['大进大出'],health:['血光意外','呼吸道'],travel:['血光意外','出外多辛苦'],month:['工作能力强','要求高']},
  破军:{trait:['敢冲敢变','火爆急躁'],gen:['变动大','破旧立新'],career:['开创新事业'],money:['财进财出'],health:['肾','生殖系统'],love:['聚少离多'],month:['开销大','脾气不好']},
  // 辅星
  左辅:{trait:['爱帮助人'],gen:['多帮手'],month:['贵人相助']},
  右弼:{trait:['人缘好'],gen:['多才多艺','爱帮助人'],month:['贵人相助']},
  文昌:{trait:['文笔好'],gen:['帮助我','有文才'],month:['考试文书顺']},
  文曲:{trait:['口才好'],gen:['才艺好'],month:['想很多']},
  天魁:{trait:['有贵人'],gen:['贵人相助'],month:['贵人相助']},
  天钺:{trait:['有贵人'],gen:['贵人相助'],health:['肝胆'],month:['贵人相助']},
  禄存:{trait:['善于理财'],gen:['有财库'],money:['守财'],month:['赚到钱']},
  天马:{trait:['爱跑动'],gen:['奔波走动'],career:['政府企业','奔波外勤'],month:['出外有利']},
  擎羊:{trait:['火爆急躁'],gen:['冲突竞争'],health:['开刀外伤'],month:['注意口角是非','注意小人']},
  陀罗:{trait:['固执'],gen:['拖延纠结'],health:['慢性病'],month:['不要太纠结']},
  火星:{trait:['火爆急躁'],gen:['性急'],health:['发炎'],month:['注意自己的脾气']},
  铃星:{trait:['内心急'],gen:['暗中压力'],health:['心脏血液'],month:['容易悲观']},
  地空:{trait:['想法特别'],gen:['理想化'],money:['不宜冒险'],month:['不要投资']},
  地劫:{trait:['大起大落'],gen:['财进财出'],money:['收入高','两份收入','财进财出'],month:['不能投资','开销大']},
};
const MUTAGEN = {
  禄:{gen:'有收获',money:'赚到钱',month:'赚到钱'},
  权:{gen:'有权力',social:'合作商业',month:'工作能力强'},
  科:{gen:'有名声',month:'贵人相助'},
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

function palaceText(p){
  const cat = CAT[p.name], out = [];
  for(const st of starsOf(p)){
    const d = STAR[st.name];
    if(st.brightness === '陷' && d.xian) out.push(...d.xian);
    else out.push(...(d[cat] || d.gen || []));
    if(st.mutagen){ const m = MUTAGEN[st.mutagen]; out.push(m[cat] || m.gen); }
  }
  return uniq(out).slice(0, 5);
}

function monthText(p, good, flow){
  const cat = CAT[p.name], out = [];
  const names = [...p.majorStars, ...p.minorStars].map(x => x.name);
  if(flow){ if(names.includes(flow[3])) out.push('想很多'); if(flow.slice(0,3).some(n => names.includes(n))) out.push('贵人相助'); }
  out.push(...((!good && MONTH_CAT_BAD[cat]) || MONTH_CAT[cat] || []));
  let list = starsOf(p);
  if(!good) list = [...list].sort((a, b) => (UNLUCKY.includes(b.name) || b.brightness === '陷') - (UNLUCKY.includes(a.name) || a.brightness === '陷'));
  for(const st of list){
    out.push(...(STAR[st.name].month || []));
    if(st.mutagen) out.push(MUTAGEN[st.mutagen].month);
  }
  if(good && out.length < 3) out.push('逢凶化吉');
  if(!good) out.push('凡事多计划');
  return uniq(out).slice(0, 4);
}

function selfTraits(astrolabe){
  const ming = astrolabe.palaces.find(p => p.name === '命宫');
  const body = astrolabe.palaces.find(p => p.isBodyPalace);
  let t = [];
  for(const st of starsOf(ming)) t.push(...STAR[st.name].trait);
  // 空宫借对宫主星
  if(!ming.majorStars.length){
    const opp = astrolabe.palaces[(astrolabe.palaces.indexOf(ming) + 6) % 12];
    for(const st of opp.majorStars) t.push(...(STAR[st.name]?.trait || []));
  }
  for(const st of starsOf(body)) t.push(...STAR[st.name].trait);
  const fill = ['热心善良','聪明理智','重视家庭','讲义气','有责任心','逢凶化吉','有慈悲心','做事认真','积极拼命','沉稳务实'];
  t = uniq(t); for(const f of fill){ if(t.length >= 12) break; if(!t.includes(f)) t.push(f); }
  return t.slice(0, 12);
}

function advice(astrolabe){
  const all = astrolabe.palaces.flatMap(p => [...p.majorStars, ...p.minorStars]);
  const has = n => all.some(s => s.name === n);
  const a = ['多做慈善'];
  if(has('擎羊') || has('七杀')) a.push('捐血捐款');
  if(has('地空') || has('地劫')) a.push('不要冒险投资');
  a.push('宗教信仰');
  if(has('火星') || has('铃星')) a.push('控制脾气');
  return uniq(a).slice(0, 4);
}

function yearReading(astrolabe, year, timeIndex, Lunar){
  const months = [];
  for(let m = 1; m <= 12; m++){
    const sol = Lunar.fromYmd(year, m, 15).getSolar();
    const h = astrolabe.horoscope(new Date(sol.getYear(), sol.getMonth() - 1, sol.getDay(), 12), timeIndex);
    const p = astrolabe.palaces[h.monthly.index];
    const flow = h.monthly.mutagen;
    const score = palaceScore(p, flow), good = score >= 0;
    months.push({m, good, score, branch: p.earthlyBranch, palace: p.name, lines: monthText(p, good, flow)});
  }
  const bad = months.filter(x => !x.good).length;
  const mid = Lunar.fromYmd(year, 6, 15).getSolar();
  const h = astrolabe.horoscope(new Date(mid.getYear(), mid.getMonth() - 1, mid.getDay(), 12), timeIndex);
  const jiStar = h.yearly.mutagen[3];
  const jiPalace = astrolabe.palaces.find(p => [...p.majorStars, ...p.minorStars].some(s => s.name === jiStar));
  const jiCat = jiPalace ? CAT[jiPalace.name] : 'self';
  const CAUTION = {self:'注意自己的情绪和健康',kin:'注意自己与家人的沟通和相处',love:'注意感情与婚姻的经营',money:'注意钱财进出，不要乱投资',health:'注意身体健康，按时检查',travel:'出外注意安全，凡事小心',social:'注意自己与人的沟通和相处',career:'工作上注意小人与是非',house:'注意房产和合约文件',late:'注意心情，不要想太多'};
  const overall = bad <= 3 ? '整体是不错的一年' : bad <= 5 ? '吉凶参半，稳中求进的一年' : '挑战较多的一年，宜守不宜攻';
  return {months, bad, overall, caution: CAUTION[jiCat], yearGanZhi: h.yearly.heavenlyStem + h.yearly.earthlyBranch, jiStar};
}

if(typeof module !== 'undefined') module.exports = {palaceScore, palaceText, monthText, selfTraits, advice, yearReading, DOMAIN};
