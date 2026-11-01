/* =====================================================================
   易经：本命卦、梅花易数时间起卦、三钱摇卦
   梅花易数：上卦 =（年支数+农历月+农历日）÷8 余数，下卦再加时支数，动爻 = 总数 ÷6 余数（先天八卦数）。
   体用：动爻所在的卦为「用」，另一卦为「体」，看五行生克。
   摇钱：三枚铜钱，字面 3、背面 2；6 老阴（变）、7 少阳、8 少阴、9 老阳（变）。
   变爻取辞按朱熹《易学启蒙》的规则。
   ===================================================================== */
const ICHING = (function(){
  const DATA = (typeof ICHING_DATA !== 'undefined') ? ICHING_DATA : require('./iching-data.js');
  const BYID = {}; DATA.forEach((h, i) => { h.no = i + 1; BYID[h.id] = h; });
  // 八卦：先天数 1-8，线由下而上
  const TRI = [null,
    {n:'乾', x:'天', wx:'金', b:'111'}, {n:'兑', x:'泽', wx:'金', b:'110'}, {n:'离', x:'火', wx:'火', b:'101'}, {n:'震', x:'雷', wx:'木', b:'100'},
    {n:'巽', x:'风', wx:'木', b:'011'}, {n:'坎', x:'水', wx:'水', b:'010'}, {n:'艮', x:'山', wx:'土', b:'001'}, {n:'坤', x:'地', wx:'土', b:'000'}];
  const triByBits = b => TRI.find(t => t && t.b === b);
  const WX = ['木','火','土','金','水'];
  const rel = (ti, yong) => {           // 体用关系
    const a = WX.indexOf(ti), b = WX.indexOf(yong);
    if(a === b) return {k:'比和', lv:'吉', t:'体用比和：同心协力，事情顺利'};
    if((b + 1) % 5 === a) return {k:'用生体', lv:'大吉', t:'用生体：外力来帮你，事情容易成功'};
    if((a + 1) % 5 === b) return {k:'体生用', lv:'小凶', t:'体生用：你要付出较多，有消耗，成果打折'};
    if((a + 2) % 5 === b) return {k:'体克用', lv:'吉', t:'体克用：你能掌控局面，事情可成，但要花力气'};
    return {k:'用克体', lv:'凶', t:'用克体：外在压力大，事情不顺，宜缓'};
  };
  const BR = '子丑寅卯辰巳午未申酉戌亥';

  function hexFromLines(lines){          // lines：由下而上 6 个 0/1
    const id = lines.join('');
    const h = BYID[id], lo = triByBits(id.slice(0, 3)), up = triByBits(id.slice(3));
    const full = lo === up ? `${h.n}为${up.x}` : `${up.x}${lo.x}${h.n}`;
    return {...h, lines: lines.slice(), up, lo, full};
  }
  const flip = (lines, idxs) => lines.map((v, i) => idxs.includes(i) ? 1 - v : v);
  const hu = lines => [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];

  /* ---------- 梅花易数（年月日时数） ---------- */
  function meihuaByNumbers(yz, lm, ld, hz){
    const sum1 = yz + lm + ld, sum2 = sum1 + hz;
    const upN = sum1 % 8 || 8, loN = sum2 % 8 || 8, dong = sum2 % 6 || 6;
    const lines = [...TRI[loN].b, ...TRI[upN].b].map(Number);
    const ben = hexFromLines(lines), bian = hexFromLines(flip(lines, [dong - 1])), huG = hexFromLines(hu(lines));
    const yongLower = dong <= 3;
    const ti = yongLower ? ben.up : ben.lo, yong = yongLower ? ben.lo : ben.up;
    const bianYong = yongLower ? bian.lo : bian.up;
    return {ben, hu: huG, bian, dong, ti, yong, r: rel(ti.wx, yong.wx), rBian: rel(ti.wx, bianYong.wx),
      line: ben.y[dong - 1], calc: {yz, lm, ld, hz, upN, loN}};
  }
  function meihuaByTime(lunar){             // lunar：lunar-javascript 的 Lunar 对象
    const yz = BR.indexOf(lunar.getYearZhi()) + 1, lm = Math.abs(lunar.getMonth()), ld = lunar.getDay();
    const hz = BR.indexOf(lunar.getTimeZhi()) + 1;
    return {...meihuaByNumbers(yz, lm, ld, hz), when: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`};
  }

  /* ---------- 三钱摇卦 ---------- */
  function rand3(){
    const a = new Uint8Array(3);
    (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.floor(Math.random() * 256));
    return Array.from(a, v => v & 1);         // 1 = 字面（3），0 = 背面（2）
  }
  function tossOnce(){ const c = rand3(); return {coins: c, v: c.reduce((s, x) => s + (x ? 3 : 2), 0)}; }
  function fromTosses(values){                // 6 个数值（6/7/8/9），由下而上
    const lines = values.map(v => (v === 7 || v === 9) ? 1 : 0);
    const moving = values.map((v, i) => (v === 6 || v === 9) ? i : -1).filter(i => i >= 0);
    const ben = hexFromLines(lines), bian = hexFromLines(flip(lines, moving)), huG = hexFromLines(hu(lines));
    const L = ['初','二','三','四','五','上'];
    const focus = [];
    const n = moving.length;
    if(n === 0) focus.push({h: ben, t: ben.g, why: '没有变爻：看本卦卦辞'});
    else if(n === 1) focus.push({h: ben, t: ben.y[moving[0]], why: `一个变爻（${L[moving[0]]}爻）：看本卦这一爻的爻辞`});
    else if(n === 2){ focus.push({h: ben, t: ben.y[moving[1]], why: `两个变爻：以上面的${L[moving[1]]}爻为主`}); focus.push({h: ben, t: ben.y[moving[0]], why: `${L[moving[0]]}爻为辅`}); }
    else if(n === 3){ focus.push({h: ben, t: ben.g, why: '三个变爻：本卦卦辞为主'}); focus.push({h: bian, t: bian.g, why: '变卦卦辞为辅'}); }
    else if(n === 4){ const still = [0,1,2,3,4,5].filter(i => !moving.includes(i)); focus.push({h: bian, t: bian.y[still[0]], why: `四个变爻：看变卦中不变的${L[still[0]]}爻为主`}); focus.push({h: bian, t: bian.y[still[1]], why: `${L[still[1]]}爻为辅`}); }
    else if(n === 5){ const still = [0,1,2,3,4,5].find(i => !moving.includes(i)); focus.push({h: bian, t: bian.y[still], why: `五个变爻：看变卦中不变的${L[still]}爻`}); }
    else { if(ben.n === '乾' || ben.n === '坤') focus.push({h: ben, t: ben.y[6], why: '六爻全变：乾坤看用九、用六'}); else focus.push({h: bian, t: bian.g, why: '六爻全变：看变卦卦辞'}); }
    return {ben, bian, hu: huG, values, moving, focus};
  }

  /* ---------- 本命卦：用出生的年支、农历月日、时辰起卦 ---------- */
  function natal(lunar){ return meihuaByTime(lunar); }

  return {meihuaByTime, meihuaByNumbers, tossOnce, fromTosses, natal, hexFromLines, TRI};
})();
if(typeof module !== 'undefined') module.exports = ICHING;
