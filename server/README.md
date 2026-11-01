# 13 维解读服务器

把「紫微斗数开源解读数据集 v4.0」（674,976 张命盘 × 13 维，1950–2026 年）放在你自己的服务器上，App 按生日、时辰、性别调取对应那张盘的完整解读（命格总览、性格、感情、事业、财运、健康、兄弟、子女、迁移、人际、田宅、福德、父母）。

## 一、建数据库（只做一次）
```bash
pip install zstandard
python3 build_db.py --out ziwei13.db
```
自动下载 77 个年份文件（共 161 MB）、校验 SHA256，建成约 1 GB 的 `ziwei13.db`。原始资料解压后 56.6 GB，去重后存储，查询结果与原文逐字相同。

## 二、启动
```bash
API_TOKEN=自己设一个密码 python3 server.py
```
或用 Docker：
```bash
docker build -t ziwei13 .
docker run -d --restart=always -p 8787:8787 -v $PWD:/data -e API_TOKEN=自己设一个密码 ziwei13
```
检查：打开 `http://服务器IP:8787/health`

## 三、让 App 连得到（需要 https）
App 网址是 https，所以服务器也要 https。两个简单做法：
- **Cloudflare Tunnel（免费）**：在服务器上装 cloudflared，执行 `cloudflared tunnel --url http://localhost:8787`，会得到一个 https 网址；长期用可在 Cloudflare 后台建固定 Tunnel 绑到自己的网域。
- 已有网域和 Nginx / Caddy：反向代理到 8787 端口即可。

然后在 App 的「13 维深度解读」区填入服务器网址和密码。

## 四、接口
`GET /api/13d?date=1982-07-19&h=10&g=male`
- `h`：时辰序号 0–11（子=0、丑=1 … 亥=11）。晚子时（23:00–23:59）按次日的子时查。
- 可加 `&dims=overview,career` 只取部分维度。
- 设了 API_TOKEN 时，请求头要带 `X-Token: 密码`。

## 资料来源（CC BY 4.0，必须保留）
本项目使用了 **紫微斗数开源解读数据集 v4.0**（674,976 张命盘 × 13 维）
来源：https://github.com/Renhuai123/ziwei-doushu · 作者：王多鱼AI

解读里引用的倪海厦《天纪》原话另按 CC BY-NC-SA 4.0，只限非商业用途。本 App 为个人使用；若日后转为商业用途，需要先处理这部分内容。
