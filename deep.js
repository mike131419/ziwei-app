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

  /* ---------- 格局 ---------- */
  const PATTERNS = [
    // 吉格
    ['紫府同宫','吉', c => has(c.ming,'紫微') && has(c.ming,'天府'), '贵气重，稳重有格局，做决定较慢但稳'],
    ['紫府朝垣','吉', c => c.triHas('紫微') && c.triHas('天府') && !(has(c.ming,'紫微') && has(c.ming,'天府')), '三方有紫微天府拱照，贵气且有财'],
    ['君臣庆会','吉', c => has(c.ming,'紫微') && (c.triHas('左辅') || c.triHas('右弼')), '紫微得辅弼，有地位也有人帮'],
    ['极向离明','吉', c => has(c.ming,'紫微') && c.mb === '午', '紫微坐午，贵格'],
    ['机月同梁','吉', c => ['天机','太阴','天同','天梁'].every(c.triHas), '适合公职、机构、专业技术，稳定发展'],
    ['府相朝垣','吉', c => c.triHas('天府') && c.triHas('天相'), '财务稳当，适合管理'],
    ['日丽中天','吉', c => has(c.ming,'太阳') && c.mb === '午', '太阳正当午，光明有名望'],
    ['日出扶桑','吉', c => has(c.ming,'太阳') && c.mb === '卯', '旭日东升，越来越好'],
    ['日月同宫','吉', c => has(c.ming,'太阳') && has(c.ming,'太阴') && '丑未'.includes(c.mb), '日月同宫，有升迁机会'],
    ['日月并明','吉', c => { const s = c.branchOf('太阳'), m = c.branchOf('太阴'); return ((s === '巳' && m === '酉') || (s === '辰' && m === '戌')) && c.triHas('太阳') && c.triHas('太阴'); }, '日月都明亮，早年有成'],
    ['明珠出海','吉', c => c.mb === '未' && !c.ming.majorStars.length && c.branchOf('太阳') === '卯' && c.branchOf('太阴') === '亥', '考试、仕途有利'],
    ['巨日同宫','吉', c => has(c.ming,'巨门') && has(c.ming,'太阳') && '寅申'.includes(c.mb), '名声重于财，适合靠口才专业'],
    ['阳梁昌禄','吉', c => ['太阳','天梁','文昌','禄存'].every(c.triHas), '考试、证照、名声大利'],
    ['贪武同行','吉', c => has(c.ming,'武曲') && has(c.ming,'贪狼') && '丑未'.includes(c.mb), '大器晚成，三十岁后发达'],
    ['将星得地','吉', c => has(c.ming,'武曲') && '辰戌'.includes(c.mb), '武曲得地，大器晚成'],
    ['雄宿朝垣','吉', c => has(c.ming,'廉贞') && '寅申'.includes(c.mb), '能力强，适合担当要职'],
    ['月朗天门','吉', c => has(c.ming,'太阴') && c.mb === '亥', '太阴明亮，富而且贵'],
    ['月生沧海','吉', c => has(c.ming,'太阴') && has(c.ming,'天同') && c.mb === '子', '气质好，有学问，名利双收'],
    ['火贪格','吉', c => has(c.ming,'贪狼') && c.triHas('火星') && !c.triHas('铃星'), '容易有突然的好运和横财'],
    ['铃贪格','吉', c => has(c.ming,'贪狼') && c.triHas('铃星') && !c.triHas('火星'), '有意外之财，力量较火贪小'],
    ['火铃贪格','吉', c => has(c.ming,'贪狼') && c.triHas('火星') && c.triHas('铃星'), '爆发力最强的横发格'],
    ['石中隐玉','吉', c => has(c.ming,'巨门') && '子午'.includes(c.mb), '早年辛苦，越往后越好'],
    ['禄马交驰','吉', c => (c.triHas('禄存') || c.triMut('禄')) && c.triHas('天马'), '越奔波越有钱，适合外出求财'],
    ['寿星入庙','吉', c => has(c.ming,'天梁') && c.mb === '午', '长寿，求名比求利容易'],
    ['七杀朝斗','吉', c => has(c.ming,'七杀') && '子午寅申'.includes(c.mb), '有魄力，能富能贵'],
    ['英星入庙','吉', c => has(c.ming,'破军') && '子午'.includes(c.mb), '有领导力，敢开创'],
    ['善荫朝纲','吉', c => has(c.ming,'天机') && has(c.ming,'天梁') && '辰戌'.includes(c.mb), '聪明有谋略，口才好'],
    ['左右同宫','吉', c => has(c.ming,'左辅') && has(c.ming,'右弼') && '丑未'.includes(c.mb), '左辅右弼同在命宫，一生多人扶持'],
    ['文桂文华','吉', c => has(c.ming,'文昌') && has(c.ming,'文曲') && '丑未'.includes(c.mb), '昌曲同宫，聪明多才'],
    ['文星拱命','吉', c => c.triHas('文昌') && c.triHas('文曲'), '聪明多才，文书考试有利'],
    ['紫府夹命','吉', c => c.flankBoth('紫微','天府'), '左右有贵气，社会地位好'],
    ['日月夹命','吉', c => c.flankBoth('太阳','太阴'), '有财，事业有助力'],
    ['左右夹命','吉', c => c.flankBoth('左辅','右弼'), '身边多帮手'],
    ['昌曲夹命','吉', c => c.flankBoth('文昌','文曲'), '读书考试有利'],
    ['双禄交流','吉', c => c.triHas('禄存') && c.triMut('禄'), '财源多，做生意有利'],
    ['三奇嘉会','吉', c => c.triMut('禄') && c.triMut('权') && c.triMut('科'), '禄权科齐聚，名利双收'],
    ['权禄巡逢','吉', c => c.triMut('禄') && c.triMut('权') && !c.triMut('科'), '事业稳定上升'],
    ['科权禄夹','吉', c => { const f = c.flank.flatMap(p => all(p).map(s => s.mutagen)).filter(m => m && m !== '忌'); return new Set(f).size >= 2; }, '意外好运，贵人多'],
    ['坐贵向贵','吉', c => (has(c.ming,'天魁') && has(c.at(6),'天钺')) || (has(c.ming,'天钺') && has(c.at(6),'天魁')), '一生多贵人提携'],
    ['天乙拱命','吉', c => c.triHas('天魁') && c.triHas('天钺') && !((has(c.ming,'天魁') && has(c.at(6),'天钺')) || (has(c.ming,'天钺') && has(c.at(6),'天魁'))), '有贵人相助'],
    ['擎羊入庙','吉', c => has(c.ming,'擎羊') && '丑辰未戌'.includes(c.mb), '有威权，适合军警、竞争行业'],
    // 变格
    ['杀破狼','变', c => ['七杀','破军','贪狼'].every(c.triHas), '一生变动多，敢冲敢拼，起伏大'],
    // 凶格
    ['命无正曜','凶', c => !c.ming.majorStars.length, '个性随环境变化，方向要靠自己定'],
    ['命里逢空','凶', c => has(c.ming,'地空') || has(c.ming,'地劫'), '想法特别，钱财容易来去'],
    ['空劫夹命','凶', c => c.flankBoth('地空','地劫'), '钱财难聚，要稳健理财'],
    ['羊陀夹忌','凶', c => hasMut(c.ming,'忌') && c.flankBoth('擎羊','陀罗'), '化忌被夹，压力放大，凡事要稳'],
    ['羊陀夹命','凶', c => c.flankBoth('擎羊','陀罗') && !hasMut(c.ming,'忌'), '做事拘谨，守财'],
    ['火铃夹命','凶', c => c.flankBoth('火星','铃星') && !has(c.ming,'贪狼'), '个性急，容易冲突'],
    ['马头带剑','凶', c => has(c.ming,'擎羊') && c.mb === '午', '适合军警外交，在外辛苦'],
    ['极居卯酉','凶', c => has(c.ming,'紫微') && has(c.ming,'贪狼') && '卯酉'.includes(c.mb), '感情婚姻要多经营'],
    ['日月反背','凶', c => c.branchOf('太阳') === '戌' && c.branchOf('太阴') === '辰' && (has(c.ming,'太阳') || has(c.ming,'太阴')), '劳碌命，付出多'],
    ['贞杀同宫','凶', c => has(c.ming,'廉贞') && has(c.ming,'七杀') && '丑未'.includes(c.mb), '注意官非、意外'],
    ['刑囚夹印','凶', c => has(c.ming,'廉贞') && has(c.ming,'天相') && '子午'.includes(c.mb) && has(c.ming,'擎羊'), '注意官司纠纷'],
    ['巨逢四煞','凶', c => has(c.ming,'巨门') && ['擎羊','陀罗','火星','铃星'].filter(c.triHas).length >= 2, '注意意外、是非'],
    ['马落空亡','凶', c => { const p = c.find('天马'); if(!p) return false; const i = c.P.indexOf(p); const o = c.P[(i + 6) % 12]; return has(p,'地空') || has(p,'地劫') || has(o,'地空') || has(o,'地劫'); }, '忙碌但收获少'],
    ['禄逢冲破','凶', c => (has(c.ming,'禄存') || hasMut(c.ming,'禄')) && (c.triHas('地空') || c.triHas('地劫')), '有财但暗藏破耗，要谨慎'],
    ['梁马飘荡','凶', c => has(c.ming,'天梁') && has(c.ming,'天马') && '巳亥寅申'.includes(c.mb), '奔波辛苦，感情不稳'],
    ['泛水桃花','凶', c => has(c.ming,'贪狼') && c.mb === '子', '桃花多，感情要节制'],
  ];
  function patterns(a){
    const c = ctx(a);
    const broken = hasMut(c.ming, '忌') || (c.triHas('地空') && c.triHas('地劫'));
    return PATTERNS.filter(p => { try { return p[2](c); } catch(e){ return false; } })
      .map(([name, kind, , meaning]) => ({name, kind, meaning, broken: kind === '吉' && broken}));
  }

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
