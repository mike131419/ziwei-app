#!/usr/bin/env python3
"""
13 维解读查询服务器（零依赖，只用 Python 标准库）

  GET /health
  GET /api/13d?date=1982-07-19&h=10&g=male      h = 时辰序号 0–11（子=0 … 亥=11）
      可选 &dims=overview,career  只取部分维度

环境变量：
  DB_PATH       数据库位置（默认 ./ziwei13.db）
  PORT          端口（默认 8787）
  API_TOKEN     设了就必须在请求头 X-Token 或 ?token= 带上（个人用建议设置）
  ALLOW_ORIGIN  允许跨域的网址（默认 https://ziwei-app.pages.dev；填 * 表示全部）

资料：紫微斗数开源解读数据集 v4.0（674,976 张命盘 × 13 维）
来源：https://github.com/Renhuai123/ziwei-doushu · 作者：王多鱼AI · CC BY 4.0
"""
import gzip, json, os, re, sqlite3, struct, threading, zlib
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

DB_PATH = os.environ.get('DB_PATH', 'ziwei13.db')
PORT = int(os.environ.get('PORT', '8787'))
TOKEN = os.environ.get('API_TOKEN', '')
ORIGINS = [o.strip() for o in os.environ.get('ALLOW_ORIGIN', 'https://ziwei-app.pages.dev').split(',')]
DIMS = ['overview', 'personality', 'love', 'career', 'wealth', 'health', 'family',
        'children', 'move', 'friends', 'home', 'spirit', 'parents']
ATTR = {'dataset': '紫微斗数开源解读数据集 v4.0', 'source': 'https://github.com/Renhuai123/ziwei-doushu',
        'author': '王多鱼AI', 'license': 'CC BY 4.0'}

_local = threading.local()


def conn():
    c = getattr(_local, 'c', None)
    if c is None:
        c = _local.c = sqlite3.connect(f'file:{DB_PATH}?mode=ro', uri=True, check_same_thread=False)
        c.execute('PRAGMA query_only=1')
    return c


def unvarint(b):
    out, n, shift = [], 0, 0
    for x in b:
        n |= (x & 0x7F) << shift
        if x & 0x80:
            shift += 7
        else:
            out.append(n)
            n, shift = 0, 0
    return out


@lru_cache(maxsize=200_000)
def line(i):
    return conn().execute('SELECT t FROM lines WHERE id=?', (i,)).fetchone()[0]


@lru_cache(maxsize=20_000)
def dim_text(j):
    b = conn().execute('SELECT b FROM dims WHERE id=?', (j,)).fetchone()[0]
    return '\n'.join(line(i) for i in unvarint(zlib.decompress(b)))


def lookup(key, want):
    row = conn().execute('SELECT ms, d FROM charts WHERE k=?', (key,)).fetchone()
    if not row:
        return None
    ids = struct.unpack('<13I', row[1])
    return {'k': key, 'ms': row[0], 'dims': {d: dim_text(ids[i]) for i, d in enumerate(DIMS) if d in want}}


META = {}


class H(BaseHTTPRequestHandler):
    server_version = 'ziwei13/1.0'

    def cors(self):
        o = self.headers.get('Origin', '')
        if '*' in ORIGINS:
            self.send_header('Access-Control-Allow-Origin', '*')
        elif o in ORIGINS:
            self.send_header('Access-Control-Allow-Origin', o)
            self.send_header('Vary', 'Origin')
        self.send_header('Access-Control-Allow-Headers', 'X-Token')

    def send(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        gz = 'gzip' in self.headers.get('Accept-Encoding', '') and len(body) > 1024
        if gz:
            body = gzip.compress(body, 6)
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        if gz:
            self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'private, max-age=86400' if code == 200 else 'no-store')
        self.cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()

    def do_GET(self):
        u = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        if u.path == '/health':
            return self.send(200, {'ok': True, **META, 'attribution': ATTR})
        if u.path != '/api/13d':
            return self.send(404, {'error': '没有这个网址'})
        if TOKEN and (self.headers.get('X-Token') or q.get('token')) != TOKEN:
            return self.send(401, {'error': '密码不对'})
        date, h, g = q.get('date', ''), q.get('h', ''), q.get('g', '')
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', date) or not h.isdigit() or not 0 <= int(h) <= 11 or g not in ('male', 'female'):
            return self.send(400, {'error': '参数要像这样：date=1982-07-19&h=10&g=male（h 是时辰 0–11）'})
        want = set(q.get('dims', '').split(',')) & set(DIMS) or set(DIMS)
        y, m, d = map(int, date.split('-'))
        key = f'{y}-{m:02d}-{d:02d}-{int(h)}-{g}'
        r = lookup(key, want)
        if not r:
            return self.send(404, {'error': f'资料库没有这张盘（只有 {META.get("years", "1950-2026")} 年）', 'k': key})
        r['attribution'] = ATTR
        return self.send(200, r)

    def log_message(self, fmt, *args):
        if os.environ.get('QUIET') != '1':
            super().log_message(fmt, *args)


if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        raise SystemExit(f'找不到数据库 {DB_PATH}，请先运行 build_db.py')
    META.update(dict(conn().execute('SELECT k, v FROM meta').fetchall()))
    print(f'13 维解读服务器启动：http://0.0.0.0:{PORT}  资料 {META.get("charts")} 张盘  {META.get("years")}', flush=True)
    ThreadingHTTPServer(('0.0.0.0', PORT), H).serve_forever()
