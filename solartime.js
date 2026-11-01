/* =====================================================================
   真太阳时校正
   公式（参考 ziwei-doushu 开源项目 true-solar-time.ts，MIT）：
   真太阳时 = 标准钟表时间 + (出生地经度 − 时区中央经线) × 4 分钟 + 均时差
   均时差用 NOAA 近似式。马来西亚 / 新加坡按出生当年的历史时区换算；
   中国 1986–1991 年夏令时只提示，不自动扣除。
   ===================================================================== */
const SOLARTIME = (function(){
  // [名称, 经度, 时区规则]
  const PLACES = [
    ['马来西亚（西马）', [
      ['吉隆坡', 101.69, 'MYW'], ['雪兰莪 巴生', 101.45, 'MYW'], ['槟城', 100.33, 'MYW'], ['怡保', 101.08, 'MYW'],
      ['新山', 103.76, 'MYW'], ['马六甲', 102.25, 'MYW'], ['芙蓉', 101.94, 'MYW'], ['关丹', 103.33, 'MYW'],
      ['亚罗士打', 100.37, 'MYW'], ['哥打巴鲁', 102.24, 'MYW'], ['瓜拉登嘉楼', 103.14, 'MYW'], ['太平', 100.73, 'MYW'],
      ['麻坡', 102.57, 'MYW'], ['峇株巴辖', 102.93, 'MYW'], ['金宝', 101.16, 'MYW'], ['淡马鲁', 102.38, 'MYW']]],
    ['马来西亚（东马）', [
      ['古晋', 110.35, 'MYE'], ['诗巫', 111.82, 'MYE'], ['美里', 113.99, 'MYE'], ['民都鲁', 113.03, 'MYE'],
      ['亚庇', 116.07, 'MYE'], ['山打根', 118.07, 'MYE'], ['斗湖', 118.12, 'MYE']]],
    ['新加坡', [['新加坡', 103.82, 'MYW']]],
    ['港澳台', [['香港', 114.17, 'C8'], ['澳门', 113.55, 'C8'], ['台北', 121.56, 'C8'], ['台中', 120.68, 'C8'], ['高雄', 120.30, 'C8']]],
    ['中国大陆', [
      ['北京', 116.40, 'CN'], ['上海', 121.47, 'CN'], ['广州', 113.26, 'CN'], ['深圳', 114.06, 'CN'], ['厦门', 118.09, 'CN'],
      ['福州', 119.30, 'CN'], ['汕头', 116.68, 'CN'], ['潮州', 116.62, 'CN'], ['梅州', 116.12, 'CN'], ['海口', 110.35, 'CN'],
      ['南宁', 108.37, 'CN'], ['昆明', 102.71, 'CN'], ['成都', 104.07, 'CN'], ['重庆', 106.55, 'CN'], ['武汉', 114.31, 'CN'],
      ['杭州', 120.16, 'CN'], ['南京', 118.80, 'CN'], ['西安', 108.94, 'CN'], ['沈阳', 123.43, 'CN'], ['乌鲁木齐', 87.62, 'CN']]],
    ['东南亚其他', [['曼谷', 100.50, 'TH'], ['雅加达', 106.85, 'ID'], ['棉兰', 98.67, 'ID'], ['马尼拉', 120.98, 'C8'], ['胡志明市', 106.70, 'TH']]],
  ];
  const LIST = PLACES.flatMap(([g, arr]) => arr.map(([n, lon, tz]) => ({group: g, name: n, lon, tz})));

  const d8 = (y, m, d) => y * 10000 + m * 100 + d;
  // 返回出生当日钟表的标准时区偏移（分钟）
  function zoneOffset(tz, y, m, d){
    const v = d8(y, m, d);
    if(tz === 'MYW'){                       // 西马、新加坡
      if(v < 19050601) return 415;          // 当地平时（约 +6:55），近似
      if(v < 19330101) return 420;
      if(v < 19410901) return 440;          // +7:20
      if(v < 19420216) return 450;
      if(v < 19450912) return 540;          // 日据东京时间
      if(v < 19820101) return 450;          // +7:30
      return 480;
    }
    if(tz === 'MYE'){                       // 沙巴、砂拉越
      if(v >= 19420216 && v < 19450912) return 540;
      return 480;
    }
    if(tz === 'TH' || tz === 'ID') return 420;
    return 480;
  }
  const CN_DST = [[1986,5,4,9,14],[1987,4,12,9,13],[1988,4,10,9,11],[1989,4,16,9,17],[1990,4,15,9,16],[1991,4,14,9,15]];
  function inCnDst(y, m, d){
    const r = CN_DST.find(x => x[0] === y); if(!r) return false;
    const v = m * 100 + d; return v >= r[1] * 100 + r[2] && v <= r[3] * 100 + r[4];
  }
  function isLeap(y){ return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0); }
  function eot(y, m, d, h, mi){
    const doy = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5);
    const g = 2 * Math.PI / (isLeap(y) ? 366 : 365) * (doy - 1 + (h + mi / 60 - 12) / 24);
    return 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  }
  // 时辰序号（iztro 用）：0 早子 00:00–00:59，1 丑 … 11 亥，12 晚子 23:00–23:59
  function timeIndex(minOfDay){
    if(minOfDay < 60) return 0;
    if(minOfDay >= 1380) return 12;
    return Math.floor((minOfDay - 60) / 120) + 1;
  }
  const SHI = ['早子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','晚子'];

  // place 为空 → 只按钟表时间换算时辰
  function compute(y, m, d, hh, mm, placeName){
    const p = LIST.find(x => x.name === placeName);
    const clock = hh * 60 + mm;
    if(!p) return {corrected: false, y, m, d, ti: timeIndex(clock), shi: SHI[timeIndex(clock)], clock};
    const zone = zoneOffset(p.tz, y, m, d);
    const lonFix = (p.lon - zone / 4) * 4, e = eot(y, m, d, hh, mm);
    let t = Math.round(clock + lonFix + e), shift = 0;
    while(t < 0){ t += 1440; shift--; }
    while(t >= 1440){ t -= 1440; shift++; }
    const dt = new Date(Date.UTC(y, m - 1, d + shift));
    const ti = timeIndex(t);
    return {corrected: true, place: p.name, zone, lonFix: Math.round(lonFix), eot: Math.round(e), total: Math.round(lonFix + e),
      y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(), shift, minutes: t,
      hm: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`,
      ti, shi: SHI[ti], clock, clockTi: timeIndex(clock), cnDst: p.tz === 'CN' && inCnDst(y, m, d)};
  }
  return {PLACES, LIST, compute, zoneOffset, timeIndex, SHI};
})();
if(typeof module !== 'undefined') module.exports = SOLARTIME;
