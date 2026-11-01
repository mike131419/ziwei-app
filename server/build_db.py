#!/usr/bin/env python3
"""
把「紫微斗数开源解读数据集 v4.0」（674,976 张命盘 × 13 维）建成一个可查询的 SQLite 数据库。

资料来源：https://github.com/Renhuai123/ziwei-doushu （Releases → v4.0-13d）
作者：王多鱼AI · 授权 CC BY 4.0（使用时需保留来源标注；内文引用的倪海厦《天纪》原话
另按 CC BY-NC-SA 4.0，只限非商业用途）

做法：原始资料解压后 56.6 GB，但内容由同一套断语库生成，大量重复。
  · lines   每一行不重复的文字只存一次
  · dims    每一段「维度全文」存成行号列表（varint + zlib）
  · charts  每张命盘存 13 个维度编号
查询时按编号拼回原文，与原始资料逐字相同。

用法：
  pip install zstandard
  python3 build_db.py --out ziwei13.db                # 全部 1950–2026
  python3 build_db.py --out test.db --years 1982-1982 # 只建一年（测试用）
需要约 1–2 GB 磁盘（下载 161 MB + 数据库），8 GB 内存足够。
"""
import argparse, hashlib, io, json, os, sqlite3, struct, sys, time, urllib.request, zlib

BASE = 'https://github.com/Renhuai123/ziwei-doushu/releases/download/v4.0-13d/'
DIMS = ['overview', 'personality', 'love', 'career', 'wealth', 'health', 'family',
        'children', 'move', 'friends', 'home', 'spirit', 'parents']


def varint(nums):
    out = bytearray()
    for n in nums:
        while n >= 0x80:
            out.append((n & 0x7F) | 0x80)
            n >>= 7
        out.append(n)
    return bytes(out)


def fetch(name, cache):
    path = os.path.join(cache, name)
    if not os.path.exists(path):
        tmp = path + '.part'
        with urllib.request.urlopen(BASE + name, timeout=120) as r, open(tmp, 'wb') as f:
            while True:
                b = r.read(1 << 20)
                if not b:
                    break
                f.write(b)
        os.replace(tmp, path)
    return path


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def main():
    import zstandard
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='ziwei13.db')
    ap.add_argument('--years', default='1950-2026')
    ap.add_argument('--cache', default='download')
    ap.add_argument('--keep', action='store_true', help='保留下载的 .zst 文件')
    a = ap.parse_args()
    y0, y1 = map(int, a.years.split('-'))
    os.makedirs(a.cache, exist_ok=True)

    sums = {}
    for ln in open(fetch('SHA256SUMS.txt', a.cache), encoding='utf-8'):
        h, n = ln.split()
        sums[n] = h

    if os.path.exists(a.out):
        os.remove(a.out)
    db = sqlite3.connect(a.out)
    db.executescript('''
      PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF; PRAGMA page_size=8192;
      CREATE TABLE meta(k TEXT PRIMARY KEY, v TEXT);
      CREATE TABLE lines(id INTEGER PRIMARY KEY, t TEXT NOT NULL);
      CREATE TABLE dims(id INTEGER PRIMARY KEY, b BLOB NOT NULL);
      CREATE TABLE charts(k TEXT PRIMARY KEY, ms TEXT, d BLOB NOT NULL) WITHOUT ROWID;
    ''')
    line_id, dim_id = {}, {}
    total = 0
    t_all = time.time()
    for year in range(y0, y1 + 1):
        t0 = time.time()
        name = f'year-{year}.jsonl.zst'
        path = fetch(name, a.cache)
        if sums.get(name) and sha256(path) != sums[name]:
            sys.exit(f'{name} 校验失败，请删除后重新下载')
        new_lines, new_dims, charts = [], [], []
        with open(path, 'rb') as f:
            reader = zstandard.ZstdDecompressor(max_window_size=2 ** 31).stream_reader(f)
            for raw in io.TextIOWrapper(reader, encoding='utf-8'):
                rec = json.loads(raw)
                ids13 = []
                for d in DIMS:
                    ids = []
                    for ln in rec['c'][d].split('\n'):
                        i = line_id.get(ln)
                        if i is None:
                            i = line_id[ln] = len(line_id)
                            new_lines.append((i, ln))
                        ids.append(i)
                    packed = varint(ids)
                    key = hashlib.blake2b(packed, digest_size=16).digest()
                    j = dim_id.get(key)
                    if j is None:
                        j = dim_id[key] = len(dim_id)
                        new_dims.append((j, zlib.compress(packed, 9)))
                    ids13.append(j)
                charts.append((rec['k'], rec.get('ms'), struct.pack('<13I', *ids13)))
        db.executemany('INSERT INTO lines VALUES (?,?)', new_lines)
        db.executemany('INSERT INTO dims VALUES (?,?)', new_dims)
        db.executemany('INSERT INTO charts VALUES (?,?,?)', charts)
        db.commit()
        total += len(charts)
        print(f'{year}: {len(charts)} 张盘，新句子 {len(new_lines)}，新段落 {len(new_dims)}，{time.time() - t0:.0f}s', flush=True)
        if not a.keep:
            os.remove(path)

    meta = {
        'dataset': '紫微斗数开源解读数据集 v4.0（674,976 张命盘 × 13 维）',
        'source': 'https://github.com/Renhuai123/ziwei-doushu',
        'author': '王多鱼AI', 'license': 'CC BY 4.0（倪海厦《天纪》原话另按 CC BY-NC-SA 4.0）',
        'contentVersion': 'ca268829f7a9', 'years': f'{y0}-{y1}', 'charts': str(total),
        'dims': ','.join(DIMS), 'builtAt': time.strftime('%Y-%m-%d'),
    }
    db.executemany('INSERT INTO meta VALUES (?,?)', meta.items())
    db.commit()
    db.execute('VACUUM')
    db.close()
    print(f'完成：{total} 张盘，{len(line_id)} 句，{len(dim_id)} 段，'
          f'{os.path.getsize(a.out) / 2 ** 20:.0f} MB，用时 {(time.time() - t_all) / 60:.1f} 分钟')


if __name__ == '__main__':
    main()
