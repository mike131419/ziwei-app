# 紫微命盘运势


一、上线（需要 HTTPS 网址，PWA 才能安装）
最简单：Netlify Drop
  1. 解压这个 zip
  2. 打开 https://app.netlify.com/drop
  3. 把整个解压后的文件夹拖进去，几秒后就有一个 https 网址
其他免费选择：Cloudflare Pages、GitHub Pages、Vercel（上传整个文件夹即可）

二、安装到手机
Android（Chrome）：打开网址 → 右上角 ⋮ → 「安装应用」或「添加到主屏幕」
iPhone（Safari）：打开网址 → 下方「分享」按钮 → 「添加到主屏幕」
安装后有红色「紫」字图标，全屏打开，装好后没有网络也能用。

三、修改内容
- 解读文字、吉凶计分规则：core.js 最上方的资料库
- 改完之后，把 sw.js 第一行的 'ziwei-v1' 改成 'ziwei-v2'（每次加一），
  客人手机才会更新到新版。

四、文件说明
index.html            主页面
core.js               解读资料库 + 吉凶规则
sw.js                 离线缓存
manifest.webmanifest  App 名称、图标、颜色
icons/                App 图标
lib/                  排盘库 iztro、农历库 lunar-javascript（均为 MIT 授权）

## 13 维深度解读（自建服务器）
见 server/README.md：建数据库、启动服务器、在 App 里填网址和密码。

## 第三方资料与授权
- 紫微排盘：iztro（MIT）
- 农历、八字、黄历：lunar-javascript（MIT）
- 天文位置（星座）：astronomy-engine（MIT）
- 格局三层判断、真太阳时公式、岁前十二神：参考 renhuai123/ziwei-doushu（代码 MIT），说明文字为白话改写，未使用其中倪海厦原话（CC BY-NC-SA）
- 周易原文：freizl/yijing（MIT，周易原文属公版）
- 13 维解读：本项目使用了紫微斗数开源解读数据集 v4.0（674,976 张命盘 × 13 维），来源 https://github.com/Renhuai123/ziwei-doushu ，作者 王多鱼AI，CC BY 4.0；内文的倪海厦《天纪》原话按 CC BY-NC-SA 4.0，本 App 仅个人使用
授权文件在 lib/ 目录。
