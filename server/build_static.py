#!/usr/bin/env python3
"""
把 13 维解读数据集切成「每年每月一个」压缩文件，放在网站上让 App 直接读取（不需要服务器）。

输出：data13/YYYY/MM.zst（共 924 个，每个约 0.5 MB）
文件内容（zstd 压缩前）：
  第 1 行  {"v":1,"idx":{"1982-07-19-10-male":[位移, 长度], ...}}
  之后     每张盘一行 {"ms":命宫主星,"c":{13 维全文}}（位移从第 2 行开头算，单位：字节）

资料：紫微斗数开源解读数据集 v4.0 · https://github.com/Renhuai123/ziwei-doushu · 王多鱼AI · CC BY 4.0
用法：python3 build_static.py --out ../data13 [--years 1950-2026] [--jobs 2]
"""
import argparse, io, json, os, sys, urllib.request
from concurrent.futures import ProcessPoolExecutor

BASE = 'https://github.com/Renhuai123/ziwei-doushu/releases/download/v4.0-13d/'


def fetch(name, cache):
    path = os.path.join(cache, name)
    if not os.path.exists(path):
        tmp = path + '.part'
        with urllib.request.urlopen(BASE + name, timeout=120) as r, open(tmp, 'wb') as f:
            f.write(r.read())
        os.replace(tmp, path)
    return path


def build_year(args):
    import zstandard, hashlib
    year, out, cache, sums = args
    path = fetch(f'year-{year}.jsonl.zst', cache)
    h = hashlib.sha256(open(path, 'rb').read()).hexdigest()
    if sums.get(f'year-{year}.jsonl.zst') not in (None, h):
        raise SystemExit(f'year-{year} 校验失败')
    months = {}
    with open(path, 'rb') as f:
        for raw in io.TextIOWrapper(zstandard.ZstdDecompressor(max_window_size=2 ** 31).stream_reader(f), encoding='utf-8'):
            r = json.loads(raw)
            idx, body = months.setdefault(r['m'], ({}, bytearray()))
            b = json.dumps({'ms': r.get('ms'), 'c': r['c']}, ensure_ascii=False, separators=(',', ':')).encode()
            idx[r['k']] = [len(body), len(b)]
            body += b + b'\n'
    params = zstandard.ZstdCompressionParameters.from_level(15, enable_ldm=True, window_log=26)
    comp = zstandard.ZstdCompressor(compression_params=params)
    os.makedirs(os.path.join(out, str(year)), exist_ok=True)
    total = 0
    for m, (idx, body) in sorted(months.items()):
        head = json.dumps({'v': 1, 'idx': idx}, separators=(',', ':')).encode() + b'\n'
        data = comp.compress(head + bytes(body))
        with open(os.path.join(out, str(year), f'{m:02d}.zst'), 'wb') as f:
            f.write(data)
        total += len(data)
    os.remove(path)
    return year, total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='data13')
    ap.add_argument('--years', default='1950-2026')
    ap.add_argument('--cache', default='download')
    ap.add_argument('--jobs', type=int, default=2)
    a = ap.parse_args()
    y0, y1 = map(int, a.years.split('-'))
    os.makedirs(a.cache, exist_ok=True)
    sums = dict(reversed(l.split()) for l in open(fetch('SHA256SUMS.txt', a.cache), encoding='utf-8'))
    with ProcessPoolExecutor(a.jobs) as ex:
        for year, size in ex.map(build_year, [(y, a.out, a.cache, sums) for y in range(y0, y1 + 1)]):
            print(f'{year}: {size / 2 ** 20:.1f} MB', flush=True)
    with open(os.path.join(a.out, 'ATTRIBUTION.txt'), 'w', encoding='utf-8') as f:
        f.write('本目录资料来自：紫微斗数开源解读数据集 v4.0（674,976 张命盘 × 13 维）\n'
                '来源：https://github.com/Renhuai123/ziwei-doushu\n作者：王多鱼AI\n授权：CC BY 4.0\n'
                '内文引用的倪海厦《天纪》原话按 CC BY-NC-SA 4.0，只限非商业用途。\n')


if __name__ == '__main__':
    main()
