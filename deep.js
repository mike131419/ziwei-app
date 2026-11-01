/* =====================================================================
   深度解读：三合派格局 + 四化飞星 + 运限叠宫
   整理自公开的紫微斗数资料（格局成格条件、化出/化入/自化/忌冲、
   大限流年叠宫与化忌层次），规则写成可检查的程序，同一张盘每次结果一致。
   仅供参考。
   ===================================================================== */
const DEEP = (function(){
  const core = (typeof palaceScore === 'function') ? {palaceScore, palaceText} : require('./core.js');
  const BR = '子丑寅卯辰巳午未申酉戌亥';
  const SI = {甲:['廉贞','破军','武曲','太阳'],乙:['天机','天梁','紫微','太阴'],丙:['天同','天机','文昌','廉贞'],丁:['太阴','天同','天机','巨门'],
    戊:['贪狼','太阴','右弼','天机'],己:['武曲','贪狼','天梁','文曲'],庚:['太阳','武曲','太阴','天同'],辛:['巨门','太阳','文曲','文昌'],
    壬:['天梁','紫微','左辅','武曲'],癸:['破军','巨门','太阴','贪狼']};
  const MT = ['禄','权','科','忌'];
  const NORTH = ['贪狼','巨门','禄存','文曲','廉贞','武曲','破军','左辅','右弼','擎羊','陀罗'];
  const SOUTH = ['天府','天梁','天机','天同','天相','七杀','文昌','天魁','天钺','火星','铃星'];
  const FOCUS = {命宫:'自己',兄弟:'兄弟姐妹',夫妻:'感情婚姻',子女:'子女晚辈',财帛:'钱财',疾厄:'身体健康',迁移:'出外发展',仆役:'朋友伙伴',官禄:'事业工作',田宅:'家庭房产',福德:'心情精神',父母:'父母长辈'};
  const CHONG = {命宫:'自己容易受累',兄弟:'和兄弟姐妹容易有距离',夫妻:'感情容易受影响',子女:'子女方面要多关心',财帛:'钱财容易流失',疾厄:'身体要多注意',迁移:'出外机会容易受阻',仆役:'人际容易有摩擦',官禄:'工作容易变动',田宅:'家里容易不安',福德:'心情容易起伏',父母:'和长辈或文书容易有问题'};

  const all = p => [...p.majorStars, ...p.minorStars];
  const has = (p, n) => all(p).some(s => s.name === n);
  const hasMut = (p, t) => all(p).some(s => s.mutagen === t);
  const pn = p => p.name === '命宫' ? '命宫' : p.name + '宫';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function ctx(a){
    const P = a.palaces, mi = P.findIndex(p => p.name === '命宫');
    const at = k => P[((mi + k) % 12 + 12) % 12];
    const tri = [at(0), at(4), at(8), at(6)];
    const triHas = n => tri.some(p => has(p, n));
    const triMut = t => tri.some(p => hasMut(p, t));
    const flank = [at(-1), at(1)];
    const flankBoth = (x, y) => (has(flank[0], x) && has(flank[1], y)) || (has(flank[0], y) && has(flank[1], x));
    const ming = at(0), mb = ming.earthlyBranch;
    const branchOf = n => { const p = P.find(q => has(q, n)); return p ? p.earthlyBranch : ''; };
    const find = n => P.find(q => has(q, n));
    return {P, mi, at, tri, triHas, triMut, flank, flankBoth, ming, mb, branchOf, find};
  }

  /* ---------- 格局（三层判断：成格条件 / 加分 / 破格） ----------
     成格条件与破格条件参考 ziwei-doushu 开源项目 patterns.ts（MIT）与《紫微斗数全书》《骨髓赋》（公版），
     说明文字为白话改写。等级：上吉 > 吉 > 平 > 注意。 */
  const SHA4 = ['擎羊','陀罗','火星','铃星'], KONG = ['地空','地劫'];
  const starOf = (p, n) => all(p).find(s => s.name === n);
  const bright = (p, n) => { const s = starOf(p, n); return !!s && ['庙','旺'].includes(s.brightness); };
  const dim = (p, n) => { const s = starOf(p, n); return !!s && ['陷','不'].includes(s.brightness); };
  const mutOf = (p, n) => { const s = starOf(p, n); return s ? s.mutagen : ''; };
  const shaIn = (p, list) => all(p).filter(s => list.includes(s.name)).length;

  function patternList(a){
    const c = ctx(a), {P, ming, mb, tri} = c, out = [];
    const tset = new Set(tri.flatMap(p => all(p).map(s => s.name)));
    const tmut = new Set(tri.flatMap(p => all(p).map(s => s.mutagen).filter(Boolean)));
    const triSha = list => tri.reduce((n, p) => n + shaIn(p, list), 0);
    const inTri = p => tri.includes(p);
    const opp = p => P[(P.indexOf(p) + 6) % 12];
    const body = P.find(p => p.isBodyPalace);
    const add = (name, kind, level, meaning, need, bonus, breaking, source) => {
      bonus = bonus || []; breaking = breaking || [];
      if(breaking.length && level === '上吉') level = '吉';
      else if(breaking.length && level === '吉' && kind === '吉') level = '平';
      out.push({name, kind, level, meaning, need, bonus, breaking, source: source || '《紫微斗数全书》', broken: breaking.length > 0});
    };
    const push = (cond, arr, text) => { if(cond) arr.push(text); };

    // ===== 上格 =====
    if(has(ming,'紫微') && tset.has('左辅') && tset.has('右弼')){
      const b = [], x = [];
      push(tset.has('文昌') || tset.has('文曲'), b, '再会文昌或文曲'); push(tset.has('天魁') || tset.has('天钺'), b, '魁钺贵人加照');
      push(mutOf(ming,'紫微') === '权', b, '紫微化权'); push(triSha(KONG) >= 2, x, '空劫会照（紫微最忌）');
      add('君臣庆会','吉','上吉','紫微坐命得左辅右弼，好比君王得贤臣：有领导力，一生贵人多，适合担任要职。',['紫微坐命','左辅右弼同会三方四正'],b,x,'《紫微斗数全书·君臣庆会格》');
    }
    { const z = c.find('紫微'), f = c.find('天府');
      if(z && f && z === f){
        const inM = z === ming, b = [], x = [];
        push(tset.has('左辅') && tset.has('右弼'), b, '左辅右弼同会'); push(tset.has('文昌') || tset.has('文曲'), b, '再会昌曲');
        push(shaIn(z, KONG) > 0, x, '紫府宫坐空劫'); push(shaIn(z, SHA4) >= 2, x, '紫府宫见两颗以上煞星');
        add('紫府同宫','吉', inM ? '上吉' : '吉', inM ? '紫微天府同坐命宫，尊贵稳重、衣食无忧，有领导才能；再得辅弼更完整。' : '紫微天府同宫但不在命宫，一生有贵气依托，富贵程度要看会照的吉煞。',
          [inM ? '紫微天府同坐命宫（寅或申）' : '紫微天府同宫，不在命宫'], b, x, '《紫微斗数全书·紫府同宫格》');
      } }
    { const f = c.find('天府'), x2 = c.find('天相');
      if(f && x2 && f !== x2 && inTri(f) && inTri(x2)){
        const b = [], x = [];
        push(has(ming,'禄存') || hasMut(ming,'禄'), b, '命宫见禄'); push(tset.has('左辅') || tset.has('右弼'), b, '辅弼会照');
        push(shaIn(ming, SHA4) > 0, x, '命宫坐煞星'); push(triSha(SHA4) >= 3, x, '三方四正煞星过多');
        add('府相朝垣','吉','上吉','天府天相分守命宫三方，古书说「府相朝垣，千钟食禄」：财务稳当、地位稳固，适合管理。',['天府在命宫三方四正','天相在命宫三方四正','两星不同宫'],b,x,'《紫微斗数全书·府相朝垣格》');
      } }
    if(['太阳','天梁','文昌','禄存'].every(n => tset.has(n))){
      const s = c.find('太阳'), l = c.find('天梁'), b = [], x = [];
      push(bright(s,'太阳'), b, '太阳庙旺'); push(bright(l,'天梁'), b, '天梁庙旺'); push(tmut.has('科'), b, '再会化科');
      push(dim(s,'太阳'), x, '太阳落陷'); push(triSha(SHA4) >= 2, x, '三方煞星重');
      add('阳梁昌禄','吉','上吉','太阳、天梁、文昌、禄存齐会命宫三方，考运极佳，利读书、证照、专业认证，功名容易成就。',['太阳、天梁、文昌、禄存都在命宫三方四正'],b,x,'《紫微斗数全书·阳梁昌禄格》');
    }
    { const t = c.find('贪狼');
      if(t && inTri(t)) for(const sha of ['火星','铃星']){
        const sp = c.find(sha); if(!sp) continue;
        const d = (P.indexOf(sp) - P.indexOf(t) + 12) % 12;
        if(![0,4,6,8].includes(d)) continue;
        const b = [], x = [];
        push(bright(t,'贪狼'), b, '贪狼庙旺'); push(['禄','权'].includes(mutOf(t,'贪狼')), b, '贪狼化禄或化权');
        push(shaIn(t, ['擎羊','陀罗']) > 0, x, '贪狼宫又见羊陀'); push(shaIn(t, KONG) > 0, x, '贪狼遇空劫，财来财去');
        add(sha === '火星' ? '火贪格' : '铃贪格','吉','上吉',`贪狼遇${sha}${d === 0 ? '同宫' : '会照'}，古书说「贪狼遇火铃，必发横财」：容易有突然的机会和横财，来得快也去得快，宜见好就收。`,[`贪狼${d === 0 ? '同宫' : '会照'}${sha}`,'贪狼在命宫三方四正'],b,x,'《骨髓赋》');
      } }
    { const w = c.find('武曲'), t = c.find('贪狼');
      if(w && t && (w === t || opp(w) === t) && (inTri(w) || inTri(t))){
        const b = [], x = [];
        push(tset.has('火星') || tset.has('铃星'), b, '再遇火星或铃星'); push(mutOf(w,'武曲') === '禄', b, '武曲化禄');
        push(shaIn(w, ['擎羊','陀罗']) > 0, x, '武贪宫见羊陀'); push(shaIn(w, KONG) > 0, x, '武贪宫遇空劫');
        add('武贪格','吉','上吉','武曲贪狼会命，古书说「武贪不发少年人」：三十岁后才厚积薄发，财富多来自人脉和经营，适合金融、销售、娱乐。',[w === t ? '武曲贪狼同宫（丑或未）' : '武曲贪狼对宫','会照命宫三方'],b,x,'《骨髓赋》');
      } }
    if(['七杀','破军','贪狼'].every(n => tset.has(n))){
      const b = [], x = [];
      push(tmut.has('禄') || tmut.has('权'), b, '三方有化禄或化权，动得有力'); push(tset.has('左辅') && tset.has('右弼'), b, '辅弼同会，变动中得贵人');
      push(triSha(SHA4) >= 3, x, '煞星过重，动而无成'); push(shaIn(ming, KONG) > 0, x, '命坐空劫，动得辛苦');
      add('杀破狼','变', x.length ? '注意' : '吉','七杀、破军、贪狼三星会命：一生变动多、不甘平凡，适合创业、军警、业务；年轻时易冲动，中年后才稳定。',['七杀、破军、贪狼都在命宫三方四正'],b,x,'《紫微斗数全书》');
    }
    { const four = ['天机','太阴','天同','天梁'], hv = four.filter(n => tset.has(n));
      if(hv.length === 4){
        const b = [], x = [];
        push(tset.has('文昌') || tset.has('文曲'), b, '再会昌曲'); push(tmut.has('科'), b, '再会化科');
        push(triSha(SHA4) >= 3, x, '煞星过多'); push(shaIn(ming, SHA4) > 0, x, '命宫坐煞');
        add('机月同梁','吉','上吉','天机、太阴、天同、天梁齐入命宫三方：聪明善谋，最适合公职、教育、医疗、专业技术等稳定累积的行业，不宜大冒险。',['四星都在命宫三方四正'],b,x,'《紫微斗数全书·机月同梁格》');
      } else if(hv.length === 3){
        add('机月同梁（缺一星）','吉','平',`只会齐${hv.join('、')}，缺${four.find(n => !tset.has(n))}，力量少一档：仍偏向稳定、靠积累的行业。`,[`三方四正会${hv.join('、')}`],[],[],'《紫微斗数全书·机月同梁格》');
      } }

    // ===== 中格 =====
    { const l = c.find('廉贞'), x2 = c.find('天相');
      if(l && x2 && l === x2){
        const b = [], x = [];
        push(has(l,'禄存') || mutOf(l,'廉贞') === '禄', b, '见禄存或廉贞化禄'); push(tset.has('左辅'), b, '左辅会照');
        push(has(l,'擎羊'), x, '同宫有擎羊'); push(mutOf(l,'廉贞') === '忌', x, '廉贞化忌');
        add('廉贞天相','吉', l === ming ? '吉' : '平','廉贞天相同宫：处事公正，适合公职、行政、法务、企划；怕擎羊和化忌，会转成官非。',['廉贞天相同宫'],b,x);
      } }
    { const w = c.find('武曲'), q = c.find('七杀');
      if(w && q && w === q){
        const b = [], x = [];
        push(mutOf(w,'武曲') === '权', b, '武曲化权'); push(mutOf(w,'武曲') === '禄', b, '武曲化禄');
        push(mutOf(w,'武曲') === '忌', x, '武曲化忌'); push(shaIn(w, SHA4) > 0, x, '同宫见煞星');
        add('武曲七杀','变', x.length ? '注意' : (w === ming ? '上吉' : '吉'),'武曲七杀同宫，将星配财星：果断刚毅、理财能力强，适合金融、军警、创业；一生奋斗、积财也操心。',['武曲七杀同宫'],b,x);
      } }
    { const t = c.find('天同'), l = c.find('天梁');
      if(t && l && t === l){
        const b = [], x = [];
        push(tset.has('文昌'), b, '文昌会照'); push(mutOf(t,'天同') === '禄', b, '天同化禄'); push(shaIn(t, SHA4) > 0, x, '同宫见煞星');
        add('天同天梁','吉','吉','福星与荫星同宫：宽厚和善、乐于助人，适合医疗、教育、宗教、公益；偏保守，不走大起大落的路。',['天同天梁同宫'],b,x);
      } }
    { const s = c.find('太阳'), m = c.find('太阴');
      if(s && m && s === m && '丑未'.includes(s.earthlyBranch)){
        const b = [], x = [];
        push(s.earthlyBranch === '未', b, '未宫日月同辉'); push(tset.has('文昌') && tset.has('文曲'), b, '昌曲会照'); push(shaIn(s, SHA4) > 0, x, '同宫见煞星');
        add('日月同宫','吉', s === ming ? '上吉' : '吉','太阳太阴同宫，阴阳平衡：异性缘好、事业顺，有升迁机会。',[`太阳太阴同在${s.earthlyBranch}宫`],b,x);
      } }
    { const sp = c.find('太阳'), mp = c.find('太阴');
      if(sp && mp && ((sp.earthlyBranch === '巳' && mp.earthlyBranch === '酉') || (sp.earthlyBranch === '辰' && mp.earthlyBranch === '戌')) && inTri(sp) && inTri(mp))
        add('日月并明','吉','上吉','太阳太阴都在明亮的位置会照命宫：早年有成，名声好。',['太阳太阴都庙旺，会照命宫三方'],[],[],'《紫微斗数全集》');
      if(sp && mp && sp.earthlyBranch === '戌' && mp.earthlyBranch === '辰' && (has(ming,'太阳') || has(ming,'太阴')))
        add('日月反背','凶','注意','太阳在戌、太阴在辰，都失去光辉：劳碌命，付出多，要靠后天努力。',['太阳在戌、太阴在辰，其中一颗坐命'],[],[],'《紫微斗数全集》');
    }
    if(c.flankBoth('太阳','太阴')){
      const sp = c.find('太阳'), mp = c.find('太阴'), b = [], x = [];
      push(bright(sp,'太阳'), b, '太阳庙旺'); push(bright(mp,'太阴'), b, '太阴庙旺'); push(dim(sp,'太阳') || dim(mp,'太阴'), x, '日月有落陷，夹命无光');
      add('日月夹命','吉','上吉','太阳太阴分在命宫两边：光明磊落，一生贵人相助，事业有助力。',['太阳太阴分居命宫前后两宫'],b,x,'《紫微斗数全书·日月夹命》');
    }
    { const j = c.find('巨门'), s = c.find('太阳');
      if(j && s && j === s && '寅申'.includes(j.earthlyBranch)){
        const b = [], x = [];
        push(j.earthlyBranch === '寅', b, '寅宫太阳庙旺，化解巨门是非'); push(['禄','权'].includes(mutOf(j,'巨门')), b, '巨门化禄或化权，口才生财');
        push(mutOf(j,'巨门') === '忌', x, '巨门化忌，口舌官非'); push(j.earthlyBranch === '申', x, '申宫太阳偏西，力量较弱');
        add('巨日同宫','吉', j === ming && j.earthlyBranch === '寅' ? '上吉' : '吉','巨门太阳同宫：靠口才、传媒、外语、专业立业，名声重于财。',[`巨门太阳同在${j.earthlyBranch}宫`],b,x,'《紫微斗数全书》');
      } }
    if(has(ming,'巨门') && '子午'.includes(mb)){
      const b = [], x = [];
      push(['禄','权'].includes(mutOf(ming,'巨门')), b, '巨门化禄或化权'); push(tset.has('文昌'), b, '文昌会照');
      push(mutOf(ming,'巨门') === '忌', x, '巨门化忌'); push(shaIn(ming, SHA4) > 0, x, '命宫坐煞');
      add('石中隐玉','吉','上吉','巨门坐命子午：外表平凡、内有才学，早年默默无闻，中年才显出来，适合专业、研究、口才行业。',[`巨门坐命${mb}宫`],b,x,'《骨髓赋》');
    }
    if(mb === '未' && !ming.majorStars.length && c.branchOf('太阳') === '卯' && c.branchOf('太阴') === '亥')
      add('明珠出海','吉','上吉','命宫在未没有主星，太阳在卯、太阴在亥拱照：靠后天努力出头，考试、仕途有利，适合到外地发展。',['命宫在未为空宫','太阳在卯、太阴在亥'],[],[],'《紫微斗数全集·明珠出海》');
    if(has(ming,'紫微') && !has(ming,'天府')){
      const b = [], x = [];
      push(tset.has('左辅') && tset.has('右弼'), b, '左辅右弼同会'); push(tset.has('文昌') && tset.has('文曲'), b, '文昌文曲同会');
      push(!tset.has('左辅') && !tset.has('右弼'), x, '没有辅弼，孤君无臣'); push(shaIn(ming, KONG) > 0, x, '紫微遇空劫');
      add('紫微入命','吉', x.length ? '平' : (b.length ? '上吉' : '吉'),'紫微坐命，自尊心强、有领导魅力；最怕没有左辅右弼帮忙，会变得孤高、容易招人议论。',['紫微坐命（无天府同宫）'],b,x);
    }
    if(has(ming,'紫微') && mb === '午') add('极向离明','吉','上吉','紫微坐午，帝星得位，贵格。',['紫微坐命午宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'太阳') && mb === '午') add('日丽中天','吉','上吉','太阳在午正当中天：光明、有名望，适合公众事业。',['太阳坐命午宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'太阳') && mb === '卯') add('日出扶桑','吉','吉','太阳在卯，旭日东升：越来越好，适合往外发展。',['太阳坐命卯宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'太阴') && mb === '亥') add('月朗天门','吉','上吉','太阴在亥最明亮：富而且贵，适合财务、房产、文艺。',['太阴坐命亥宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'太阴') && has(ming,'天同') && mb === '子') add('月生沧海','吉','上吉','太阴天同在子：气质好、有学问，名利双收。',['太阴天同坐命子宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'武曲') && '辰戌'.includes(mb)) add('将星得地','吉','吉','武曲在辰戌得地：大器晚成，适合财经、军警、技术。',['武曲坐命辰或戌宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'廉贞') && '寅申'.includes(mb)) add('雄宿朝垣','吉','吉','廉贞在寅申：能力强，适合担当要职。',['廉贞坐命寅或申宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'天梁') && mb === '午') add('寿星入庙','吉','吉','天梁在午：长寿有福，求名比求利容易。',['天梁坐命午宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'七杀') && '子午寅申'.includes(mb)) add('七杀朝斗','吉','吉','七杀在子午寅申：有魄力，能富能贵，适合开创和管理。',['七杀坐命子、午、寅或申宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'破军') && '子午'.includes(mb)) add('英星入庙','吉','吉','破军在子午：有领导力，敢开创新局。',['破军坐命子或午宫'],[],[],'《紫微斗数全集》');
    if(has(ming,'天机') && has(ming,'天梁') && '辰戌'.includes(mb)) add('善荫朝纲','吉','吉','天机天梁在辰戌：聪明有谋略，口才好，适合顾问、教育、医疗。',['天机天梁坐命辰或戌宫'],[],[],'《紫微斗数全集》');

    // ===== 助力格 =====
    if(c.flankBoth('左辅','右弼')) add('辅弼夹命','吉','上吉','左辅右弼夹命，古书说「终身福厚」：身边多人帮忙，适合组织管理。',['左辅右弼分居命宫前后两宫'],tset.has('天魁') || tset.has('天钺') ? ['再会魁钺'] : [],[],'《紫微斗数全书》');
    if(has(ming,'左辅') && has(ming,'右弼')) add('左右同宫','吉','吉','左辅右弼同在命宫：一生多人扶持，人缘好。',['左辅右弼同坐命宫'],[],[]);
    if(c.flankBoth('文昌','文曲')) add('昌曲夹命','吉','上吉','文昌文曲夹命：聪明俊秀、文采好，最利考试。',['文昌文曲分居命宫前后两宫'],[],[]);
    if(c.flankBoth('天魁','天钺')) add('魁钺夹命','吉','吉','天魁天钺夹命：一生贵人提携，考试、求职常有意外帮助。',['天魁天钺分居命宫前后两宫'],[],[]);
    if(c.flankBoth('紫微','天府')) add('紫府夹命','吉','吉','紫微天府夹命：左右有贵气，社会地位好。',['紫微天府分居命宫前后两宫'],[],[]);
    if((has(ming,'天魁') && has(c.at(6),'天钺')) || (has(ming,'天钺') && has(c.at(6),'天魁'))) add('坐贵向贵','吉','上吉','天魁天钺一坐命一在对宫：一生多贵人提携。',['魁钺分在命宫和迁移宫'],[],[]);
    else if(tset.has('天魁') && tset.has('天钺')) add('魁钺同会','吉','吉','天魁天钺都会照命宫：关键时刻有贵人相助。',['天魁天钺同会命宫三方四正'],[],[]);
    if(tset.has('文昌') && tset.has('文曲') && !c.flankBoth('文昌','文曲')) add(has(ming,'文昌') && has(ming,'文曲') ? '昌曲坐命' : '昌曲同会','吉','吉','文昌文曲都会照命宫：才华好、口才文笔佳，适合需要表达的行业；最怕昌曲化忌，文书契约要小心。',['文昌文曲同会命宫三方四正'],tmut.has('科') ? ['再会化科'] : [],tmut.has('忌') && (tri.some(p => ['文昌','文曲'].includes((all(p).find(s => s.mutagen === '忌') || {}).name))) ? ['昌曲化忌'] : []);
    if(tset.has('左辅') && tset.has('右弼') && !c.flankBoth('左辅','右弼') && !(has(ming,'左辅') && has(ming,'右弼')) && !has(ming,'紫微')) add('辅弼同会','吉','吉','左辅右弼都会照命宫：贵人不绝、人缘佳，适合团队合作和领导岗位。',['左辅右弼同会命宫三方四正'],[],[]);
    if(tset.has('禄存') && tmut.has('禄')) add('双禄朝垣','吉','上吉','化禄和禄存都会照命宫，古书说「双禄朝垣，富比陶朱」：财源多，正财偏财都有。',['化禄会照三方四正','禄存会照三方四正'],[],shaIn(ming, KONG) ? ['命坐空劫，财来财去'] : [],'《紫微斗数全书》');
    if(tmut.has('禄') && tmut.has('权') && tmut.has('科')) add('三奇加会','吉','上吉','化禄、化权、化科都会照命宫：功名、财富、贵人三全，是最好的格局之一。',['禄权科齐会命宫三方四正'],[],tmut.has('忌') && tri.some(p => hasMut(p,'忌')) ? ['三方也见化忌，力量打折'] : []);
    else if(tmut.has('科') && tmut.has('权')) add('科权双会','吉','吉','化科化权都会照命宫：既有名声又有掌控力，适合走专业权威路线。',['化科、化权同会命宫三方四正'],[],[]);
    else if(tmut.has('禄') && tmut.has('权')) add('权禄巡逢','吉','吉','化禄化权都会照命宫：事业稳定上升。',['化禄、化权同会命宫三方四正'],[],[]);
    { const f = c.flank.flatMap(p => all(p).map(s => s.mutagen)).filter(m => m && m !== '忌');
      if(new Set(f).size >= 2) add('科权禄夹','吉','吉','命宫两边有两种吉化夹着：常有意外好运和贵人。',['命宫前后两宫有两种吉化'],[],[]); }
    { const p = c.find('天马'), lu = tri.some(q => has(q,'禄存') || hasMut(q,'禄'));
      if(p && inTri(p) && lu){
        const x = []; push(shaIn(p, KONG) > 0 || shaIn(opp(p), KONG) > 0, x, '天马遇空劫，忙碌但收获少');
        add('禄马交驰','吉','吉','天马和禄同会命宫：越奔波越有钱，适合外出求财、跨地区发展。',['天马在命宫三方四正','禄存或化禄会照'],[],x,'《紫微斗数全书》');
      } }
    { const ms = ming.majorStars.find(s => s.mutagen === '禄');
      if(ms) add(`${ms.name}化禄入命`,'吉','吉',`${ms.name}化禄坐命：机会多、人缘好、生财顺。${ms.name === '武曲' ? '武曲化禄是正财，适合实业、金融。' : ms.name === '太阴' ? '太阴化禄偏向房产和慢慢累积的财。' : ms.name === '贪狼' ? '贪狼化禄是人脉财。' : ''}`,[`${ms.name}化禄坐命宫`],[],[]); }
    { const cai = P.find(p => p.name === '财帛'), s = cai && cai.majorStars.find(x => x.mutagen === '禄');
      if(s) add('化禄入财','吉','吉',`${s.name}化禄在财帛宫：财源畅通、收入稳定。`,[`${s.name}化禄入财帛宫`],[],[]); }
    { const g = P.find(p => p.name === '官禄'), s = g && g.majorStars.find(x => x.mutagen === '权');
      if(s) add('化权入官','吉','吉',`${s.name}化权在官禄宫：事业上有掌控力，能独当一面。`,[`${s.name}化权入官禄宫`],[],[]); }
    for(const p of [ming, body].filter((v, i, arr) => v && arr.indexOf(v) === i)){
      const s = p.majorStars.find(x => x.mutagen === '科');
      if(s){ add(p === ming ? '化科入命' : '化科入身','吉','吉',`${s.name}化科在${p === ming ? '命' : '身'}宫：名声、文书、学业运好，适合教育、研究、咨询。`,[`${s.name}化科入${p === ming ? '命' : '身'}宫`],[],[]); break; }
    }
    { const lc = c.find('禄存');
      if(lc && (lc === ming || lc === body)) add(lc === ming ? '禄存守命' : '禄存守身','吉','吉', lc === ming ? '禄存坐命：衣食无忧、善于积累，个性较保守。' : '禄存在身宫：中年后财源稳定。',[lc === ming ? '禄存入命宫' : '禄存入身宫'],[],[],'《紫微斗数全书》'); }
    if(has(ming,'擎羊') && '丑辰未戌'.includes(mb)) add('擎羊入庙','吉','吉','擎羊在四墓宫得地：有威权和竞争力，适合军警、竞技、执法。',['擎羊坐命丑辰未戌'],[],[]);

    // ===== 凶格 / 需要注意 =====
    for(const p of [ming, c.at(6)]){
      const s = p.majorStars.find(x => x.mutagen === '忌');
      if(s) add(`${s.name}化忌入${p === ming ? '命' : '迁'}`,'凶','注意', p === ming ? `${s.name}化忌坐命：容易固执、想太多，凡事退一步想；化忌代表这方面要特别用心，不一定是坏事。` : `${s.name}化忌在迁移宫：出外、远行、人际容易有波折，宜守不宜动。`,[`${s.name}化忌坐${p === ming ? '命' : '迁移'}宫`],[],[]);
    }
    if(hasMut(ming,'忌') && c.flankBoth('擎羊','陀罗')) add('羊陀夹忌','凶','注意','化忌坐命又被擎羊陀罗夹住，古书视为败局：压力放大、容易劳碌，要稳扎稳打、修身养性。',['化忌坐命','擎羊陀罗分居命宫前后两宫'],[],[],'《骨髓赋》');
    else if(c.flankBoth('擎羊','陀罗')) add('羊陀夹命','凶','注意','擎羊陀罗夹命：做事拘谨、守财，容易受人牵制。',['擎羊陀罗分居命宫前后两宫'],[],[]);
    if(c.flankBoth('火星','铃星') && !has(ming,'贪狼')) add('火铃夹命','凶','注意','火星铃星夹命：性子急、容易冲动，要练耐性。',['火星铃星分居命宫前后两宫'],[],[]);
    if(c.flankBoth('地空','地劫')) add('空劫夹命','凶','注意','地空地劫夹命，古书说「财不聚」：想法脱俗，钱财来去，适合技艺、研究、宗教等不重物质的路。',['地空地劫分居命宫前后两宫'],[],[]);
    if(has(ming,'地空') || has(ming,'地劫')) add('命里逢空','凶','注意','地空或地劫坐命：想法特别，钱财容易来去，要稳健理财。',['地空或地劫坐命'],[],[]);
    if(!ming.majorStars.length) add('命无正曜','变','平','命宫没有主星，借对宫的星来看：个性随环境变化，方向要靠自己定。',['命宫没有十四主星'],[],[]);
    if(['廉贞','七杀','擎羊'].every(n => tset.has(n))) add('廉杀羊','凶','注意','廉贞、七杀、擎羊会照：大限流年走到时要特别注意驾驶安全、避免冲突，医疗决定要理性。',['三星都在命宫三方四正'],[],[]);
    if(['巨门','火星','擎羊'].every(n => tset.has(n))) add('巨火羊','凶','注意','巨门、火星、擎羊会照：直话直说容易起冲突，要练习温和表达、管理情绪。',['三星都在命宫三方四正'],[],[],'《骨髓赋》');
    if(['铃星','文昌','陀罗','武曲'].every(n => tset.has(n))) add('铃昌陀武','凶','注意','铃星、文昌、陀罗、武曲会照：运限走到时，重大决定要理性，留意情绪起伏。',['四星都在命宫三方四正'],[],[],'《骨髓赋》');
    if(has(ming,'擎羊') && mb === '午') add('马头带箭','变', tset.has('七杀') || tset.has('破军') ? '吉' : '注意','擎羊坐命午宫，古书说「威镇边疆」：行动力强、敢竞争，适合需要果断的工作；配吉星才发挥得好。',['擎羊坐命午宫'],tset.has('七杀') || tset.has('破军') ? ['再会七杀或破军'] : [],[],'《骨髓赋》');
    if(has(ming,'紫微') && has(ming,'贪狼') && '卯酉'.includes(mb)) add('极居卯酉','凶','注意','紫微贪狼在卯酉：感情婚姻要多经营，容易受诱惑。',['紫微贪狼坐命卯或酉宫'],[],[]);
    if(has(ming,'廉贞') && has(ming,'七杀') && '丑未'.includes(mb)) add('贞杀同宫','凶','注意','廉贞七杀在丑未：做事要守规矩，注意官非和意外。',['廉贞七杀坐命丑或未宫'],[],[]);
    if(has(ming,'廉贞') && has(ming,'天相') && '子午'.includes(mb) && has(ming,'擎羊')) add('刑囚夹印','凶','注意','廉贞天相同擎羊：要特别注意官司纠纷、合约。',['廉贞天相擎羊同坐命宫'],[],[]);
    if(has(ming,'巨门') && SHA4.filter(n => tset.has(n)).length >= 2) add('巨逢四煞','凶','注意','巨门会两颗以上煞星：注意意外和是非，说话要小心。',['巨门坐命','四煞中两颗以上会照'],[],[]);
    if((has(ming,'禄存') || hasMut(ming,'禄')) && (tset.has('地空') || tset.has('地劫'))) add('禄逢冲破','凶','注意','命宫有禄但三方见空劫：有财也暗藏破耗，投资要谨慎。',['命宫有禄','空劫会照'],[],[]);
    if(has(ming,'天梁') && has(ming,'天马') && '巳亥寅申'.includes(mb)) add('梁马飘荡','凶','注意','天梁天马在四马地：奔波辛苦，感情不稳。',['天梁天马坐命巳、亥、寅或申'],[],[]);
    if(has(ming,'贪狼') && mb === '子') add('泛水桃花','凶','注意','贪狼在子：桃花多，感情要节制。',['贪狼坐命子宫'],[],[]);

    const order = {上吉:0, 吉:1, 平:2, 注意:3};
    return out.sort((x, y) => order[x.level] - order[y.level]);
  }
  function patterns(a){ return patternList(a); }

  /* ---------- 四化飞星（本命） ---------- */
  const SHENG = {禄:'一生的福分和机会在',权:'能力最能发挥在',科:'贵人和名声在',忌:'一生要用心面对的课题在'};
  const ZIHUA = {禄:'有缘分，但容易来得快去得快',权:'主观强，凡事想自己做主',科:'重面子名声，处理事情较温和',忌:'容易反复、留不住，要多用心'};
  const FLY = {
    命宫:{禄:t => `天生和${FOCUS[t]}有缘，这方面容易得到好处`, 忌:t => `一生最放不下的是${FOCUS[t]}`},
    财帛:{禄:t => `钱财的来源和${FOCUS[t]}有关`, 忌:t => `钱容易花在${FOCUS[t]}上`},
    官禄:{禄:t => `事业的助力来自${FOCUS[t]}`, 忌:t => `工作压力多来自${FOCUS[t]}`},
    夫妻:{禄:t => `感情的甜蜜和${FOCUS[t]}有关`, 忌:t => `感情中最在意${FOCUS[t]}`},
    福德:{禄:t => `快乐来源是${FOCUS[t]}`, 忌:t => `心里常挂念${FOCUS[t]}`},
    田宅:{禄:t => `家运的好处落在${FOCUS[t]}`, 忌:t => `家里的烦恼多和${FOCUS[t]}有关`},
  };
  function flying(a){
    const P = a.palaces, out = {birth: [], fly: [], self: []};
    const findP = n => P.find(p => has(p, n));
    for(const p of P) for(const s of all(p)) if(s.mutagen) out.birth.push({type: s.mutagen, star: s.name, to: p.name, text: `生年${s.name}化${s.mutagen}在${pn(p)}：${SHENG[s.mutagen]}${FOCUS[p.name]}`});
    out.birth.sort((x, y) => MT.indexOf(x.type) - MT.indexOf(y.type));
    for(const src of Object.keys(FLY)){
      const sp = P.find(p => p.name === src); if(!sp) continue;
      const four = SI[sp.heavenlyStem];
      for(const t of ['禄','忌']){
        const star = four[MT.indexOf(t)], tp = findP(star); if(!tp) continue;
        if(tp === sp) continue;
        let text = `${pn(sp)}化${t}入${pn(tp)}（${sp.heavenlyStem}干${star}）：${FLY[src][t](tp.name)}`;
        if(t === '忌'){ const op = P[(P.indexOf(tp) + 6) % 12]; text += `；冲${pn(op)}，${CHONG[op.name]}`; }
        out.fly.push({from: src, type: t, to: tp.name, text});
      }
    }
    for(const p of P){
      const four = SI[p.heavenlyStem];
      four.forEach((star, k) => { if(has(p, star)) out.self.push({palace: p.name, type: MT[k], text: `${pn(p)}自化${MT[k]}（${star}）：${FOCUS[p.name]}方面${ZIHUA[MT[k]]}`}); });
    }
    return out;
  }

  /* ---------- 流年深度：叠宫、化忌层次、六大运势 ---------- */
  const THEME = {命宫:'自己的发展和转变',兄弟:'家人手足和现金周转',夫妻:'感情婚姻和合作关系',子女:'子女、晚辈和投资',财帛:'赚钱和理财',疾厄:'身体健康和工作压力',迁移:'外出、出差和外面的机会',仆役:'朋友、同事和人脉',官禄:'事业工作的表现',田宅:'家庭、房产和居家变动',福德:'心情、兴趣和精神生活',父母:'长辈、上司和文书证件'};
  const AREAS = [['事业','官禄'],['财运','财帛'],['感情','夫妻'],['健康','疾厄'],['人际','仆役'],['家宅','田宅']];
  const AREA_GOOD = {事业:'工作上有表现机会，可以主动争取',财运:'收入有增加的机会',感情:'感情和睦，单身者有机会认识对象',健康:'身体状况平稳',人际:'朋友同事愿意帮忙',家宅:'家里平安，适合处理房产事务'};
  const AREA_MID = {事业:'工作平稳，按部就班就好',财运:'收支平衡，守住就是赚',感情:'感情平淡，多花时间陪伴',健康:'身体大致平稳，保持作息',人际:'人际平稳，少说多听',家宅:'家里平稳，小事自己处理'};
  const AREA_BAD = {事业:'工作压力大，做事多检查，避免是非',财运:'开销大，不要投资或借钱给人',感情:'容易有误会，多沟通多体谅',健康:'作息要规律，注意身体检查',人际:'注意小人和口舌，不要替人担保',家宅:'家里事情多，房产文件要小心'};
  const GRADE = s => s >= 80 ? '大吉' : s >= 68 ? '吉' : s >= 52 ? '平' : s >= 40 ? '注意' : '小心';

  function horo(a, Lunar, year, ti){
    const s = Lunar.fromYmd(year, 6, 15).getSolar();
    return a.horoscope(new Date(s.getYear(), s.getMonth() - 1, s.getDay(), 12), ti);
  }
  function year(a, Lunar, yr, ti, badMonths){
    const P = a.palaces, h = horo(a, Lunar, yr, ti);
    const Y = h.yearly, D = h.decadal;
    const findP = n => P.findIndex(p => has(p, n));
    const yMut = Y.mutagen.map(findP), dMut = D.mutagen.map(findP);
    const natJi = P.findIndex(p => hasMut(p, '忌'));
    const selfJi = P.map((p, i) => has(p, SI[p.heavenlyStem][3]) ? i : -1).filter(i => i >= 0);
    const yStars = (Y.stars || []).map(list => list.map(s => s.name));

    // 叠宫
    const notes = [];
    notes.push({k:'叠宫', text:`流年命宫落在本命${pn(P[Y.index])}：今年的重心在${THEME[P[Y.index].name]}`});
    if(D.index >= 0) notes.push({k:'大限', text:`目前大限命宫在本命${pn(P[D.index])}：这十年的主题是${THEME[P[D.index].name]}`});
    if(D.index === Y.index) notes.push({k:'叠宫', text:'大限和流年命宫重叠：今年吉凶都会更明显'});

    // 化忌层次
    const layers = P.map(() => []);
    if(natJi >= 0) layers[natJi].push('生年忌');
    if(dMut[3] >= 0) layers[dMut[3]].push('大限忌');
    if(yMut[3] >= 0) layers[yMut[3]].push('流年忌');
    selfJi.forEach(i => layers[i].push('自化忌'));
    layers.forEach((L, i) => {
      if(L.length >= 2 && L.includes('流年忌') || L.length >= 3) notes.push({k:'警示', text:`${L.join('、')}同在${pn(P[i])}：${FOCUS[P[i].name]}是今年最要小心的地方，重要决定放慢`});
    });
    if(yMut[3] >= 0 && natJi >= 0 && (yMut[3] + 6) % 12 === natJi) notes.push({k:'警示', text:`流年忌冲本命忌（${pn(P[natJi])}）：${FOCUS[P[natJi].name]}方面今年容易被触动`});
    if(yMut[0] >= 0 && yMut[0] === yMut[3]) notes.push({k:'提醒', text:`流年禄忌同在${pn(P[yMut[0]])}：有得有失，先甜后苦`});
    if(yMut[0] >= 0 && dMut[0] >= 0 && yMut[0] === dMut[0]) notes.push({k:'好运', text:`大限禄和流年禄同在${pn(P[yMut[0]])}：${FOCUS[P[yMut[0]].name]}方面今年特别有利`});
    // 岁前十二神：岁建在流年地支宫，顺行（参考 ziwei-doushu shier-shen.ts）
    const SUIQIAN = ['岁建','晦气','丧门','贯索','官符','小耗','岁破','龙德','白虎','天德','吊客','病符'];
    // 流年命宫永远是岁建，所以看各神煞落在本命哪一宫，代表今年哪方面受影响
    const yb = BR.indexOf(Y.earthlyBranch);
    const SQ_SHORT = {官符:'容易有口舌、官非、罚单，文件要小心',白虎:'注意意外、血光和身体',丧门:'留意长辈健康和情绪低落',龙德:'有贵人和喜事',天德:'有贵人庇佑'};
    for(const g of ['龙德','天德','官符','白虎','丧门']){
      const k = SUIQIAN.indexOf(g), br = BR[(yb + k) % 12], np = P.find(p => p.earthlyBranch === br);
      if(np && np.name !== '命宫') notes.push({k: ['龙德','天德'].includes(g) ? '好运' : '岁前', text:`${g}落本命${pn(np)}：${FOCUS[np.name]}方面${SQ_SHORT[g]}`});
    }
    const jiStar = Y.mutagen[3];
    notes.push({k:'应期', text:`流年化忌是${jiStar}，${NORTH.includes(jiStar) ? '属北斗，麻烦多出现在上半年' : SOUTH.includes(jiStar) ? '属南斗，麻烦多出现在下半年' : '属中天，全年都要留意'}`});

    // 六大运势（以流年盘的各宫为准）
    const yName = i => Y.palaceNames[i];
    const areas = AREAS.map(([label, pal]) => {
      const i = Y.palaceNames.indexOf(pal), op = (i + 6) % 12;
      const p = P[i], why = [];
      let s = 0.5 * core.palaceScore(p);
      Y.mutagen.forEach((st, k) => {
        if(yMut[k] === i){ s += [3, 2, 1.5, -3.5][k]; why.push(`流年${st}化${MT[k]}进入`); }
        else if(k === 3 && yMut[k] === op){ s -= 2; why.push(`流年${st}化忌冲照`); }
      });
      D.mutagen.forEach((st, k) => {
        if(dMut[k] === i){ s += [1.5, 1, 0.8, -1.8][k]; why.push(`大限${st}化${MT[k]}进入`); }
      });
      const ys = yStars[i] || [];
      if(ys.includes('流羊')){ s -= 1; why.push('流羊进入'); }
      if(ys.includes('流陀')){ s -= 1; why.push('流陀进入'); }
      if(ys.includes('流禄')){ s += 1; why.push('流禄进入'); }
      if(ys.includes('流魁') || ys.includes('流钺')){ s += 1; why.push('流年贵人星进入'); }
      if(natJi === i){ s -= 0.8; }
      const score = Math.round(clamp(60 + 6 * s, 15, 96));
      const stars = p.majorStars.map(x => x.name).join('、') || '无主星，借对宫';
      return {label, palace: pal, natal: p.name, score, grade: GRADE(score), why,
        text: `流年${pal}宫落本命${pn(p)}（${stars}）。${score >= 68 ? AREA_GOOD[label] : score >= 52 ? AREA_MID[label] : AREA_BAD[label]}`};
    });

    // 大限 × 流年 总论
    const avg = Math.round(areas.reduce((x, y) => x + y.score, 0) / areas.length);
    const age = yr - +String(a.solarDate).slice(0, 4) + 1;
    const cur = decades(a, age).find(x => x.current);
    const yScore = core.palaceScore(P[Y.index]) + (yMut[0] === Y.index ? 2 : 0) - (yMut[3] === Y.index ? 3 : 0);
    const dg = cur ? cur.score >= 55 : true, yg = (badMonths != null && badMonths <= 4) || (yScore >= 0 && avg >= 58);
    const verdict = dg && yg ? '大限好、流年也好：今年是可以积极进取的一年'
      : dg && !yg ? '大限好、流年较弱：今年有波折但不会太差，稳中求进'
      : !dg && yg ? '大限较弱、流年好：今年是难得的喘息机会，把握机会'
      : '大限和流年都较弱：今年以守为主，不宜冒险';
    return {notes, areas, verdict, avg, yearGZ: Y.heavenlyStem + Y.earthlyBranch, decadal: D};
  }

  /* ---------- 大限运势曲线 ---------- */
  function decades(a, currentAge){
    const P = a.palaces;
    const findP = n => P.findIndex(p => has(p, n));
    return P.filter(p => p.decadal && p.decadal.range && p.decadal.range[0] <= 96).map(p => {
      const i = P.indexOf(p), four = SI[p.decadal.heavenlyStem].map(findP);
      const tri = [0, 4, 8, 6].map(k => (i + k) % 12);
      let s = core.palaceScore(p) + 0.25 * [4, 8, 6].map(k => core.palaceScore(P[(i + k) % 12])).reduce((x, y) => x + y, 0);
      if(tri.includes(four[0])) s += 2;
      if(tri.includes(four[1])) s += 1;
      if(four[3] === i) s -= 3; else if(four[3] === (i + 6) % 12) s -= 2;
      const score = Math.round(clamp(60 + 6 * s, 15, 96));
      return {from: p.decadal.range[0], to: p.decadal.range[1], palace: p.name, score, grade: GRADE(score),
        current: currentAge >= p.decadal.range[0] && currentAge <= p.decadal.range[1],
        words: core.palaceText(p, P).slice(0, 2)};
    }).sort((x, y) => x.from - y.from);
  }

  return {patterns, flying, year, decades};
})();
if(typeof module !== 'undefined') module.exports = DEEP;
