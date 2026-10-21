# Lanfang Sun — 学术个人主页（大海 / 海图风格）

可直接用于 GitHub Pages 的静态网站，无需安装或构建。

## 页面
- 每个页面都有中英文两版：index / publications / projects / teaching / service（英文），对应 *-zh.html（中文）；右上角“中文 / English”切换到同一页的另一语言
- 首页（灯塔海岸线、简介、四个研究方向、"From Yantai, outward" 旅行地球〔45 个去过的地方，按国家/地区分组〕、代表作）
- projects.html / teaching.html / service.html：研究项目、教学、学术服务
- publications.html：
  - 海图式 Publication map：岛屿 = 研究方向，浮标 = 论文；大浮标 = 第一作者；深蓝 = JCR Q1，海玻璃色 = Q2，白色 = 未收录 JCR。悬停/Tab 键查看详情，回车打开 DOI。
  - At a glance：按年份 × 作者身份排列的期刊缩写，点击直达论文
  - Where my work travels：浏览器实时从 OpenAlex 读取引用你 DOI 论文的作者所在国家/地区，画成世界地图和排行（每天自动更新，结果在访问者浏览器缓存 24 小时）
  - 全部论文：带 DOI、SSCI/ESCI、JCR 分区、影响因子标签，可搜索、按年份筛选、只看 SSCI/ESCI
- 已删除 CV 页面链接和 CV PDF。
- 右上角可切换白天 / 夜海配色（默认跟随系统）。

## 如何更新论文、分区、影响因子
所有数据都在 assets/data.js：
- links：首页的 ORCID、Google Scholar、LinkedIn 链接（LinkedIn 目前留空）（留空 "" 就不显示）
- journals：每个期刊的 index（SSCI/ESCI）、q（Q1/Q2）、jif（影响因子，未知写 null 即隐藏）
- pubs：每篇论文；pos: [x, y] 决定它在海图上的位置（x：-1 正式/海岸 → 1 非正式/外海；y：-1 学习者 → 1 教师），ai: true 加 GenAI 光圈；doi 填写后自动生成 DOI 链接，也会自动计入引用地图；role: "first" 为第一作者
- talks：会议报告（title、authors、venue 会议名、place 城市、when 时间、type: Paper/Roundtable/Poster、upcoming: true 标“Upcoming”、award 奖项）
- stops：旅行地点（英文名、中文名、国家/地区、group 分组 cn | tw | us | asia、经纬度）；加一行就能在地球上多一个点
- jcrLabel：分区标签显示的年份（目前 "JCR 2025"）

## 数据来源与需要你核对的地方
- 影响因子按 2025 JIF（JCR 2026 年 6 月发布）填写，来自公开转载页面（wos-journal.info、BioxBio、MDPI 期刊页），建议用学校图书馆 JCR 再核对一次。
- Innovation in Language Learning and Teaching、Computers and Composition 的 2025 JIF 没查到可靠数值，暂未显示，只显示 CV 中的 Q1。
- Reflective Practice：2025 JIF 1.8，在 Education & Educational Research 类别中百分位约 61.8%，按 JCR 规则为 Q2（CV 中写的是 Q1，网站目前显示 Q2，请核对）。
- DOI 10.1111/jcal.70244 由文章编号 e70244 按 Wiley 格式推断；其余 DOI 都核对过出版商或 HKU Scholars Hub。

## 以后在 GitHub 上更新
方法一：网页上直接改（适合加一篇论文、一个报告、改几个字）
1. 打开仓库 → 点进 assets → 点 data.js → 右上角铅笔图标（Edit this file）。
2. 照着已有条目的格式复制一条、改内容（注意每条之间的英文逗号）。
3. 点右上角 Commit changes… → 再点 Commit changes。1–2 分钟后网站自动更新（浏览器可按 Ctrl+F5 / Cmd+Shift+R 强制刷新）。

方法二：上传覆盖（适合改了很多文件）
1. 在仓库首页点 Add file → Upload files，把改好的 HTML 拖进去，同名文件会被覆盖。
2. assets 里的文件要先点进 assets 文件夹，再 Add file → Upload files 上传，否则会传到根目录。
3. Commit changes。

小提示：改完如果页面空白或某部分不显示，多半是 data.js 里少了逗号或引号；在 GitHub 的 Commits 历史里可以一键查看和回退之前的版本。

## 发布到 GitHub Pages
1. 登录 GitHub，新建公开仓库，名字必须是 `你的用户名.github.io`（例如 LanfangSun → lanfangsun.github.io）。
2. 在仓库页面点 Add file → Upload files，把解压后的全部内容拖进去：10 个 HTML、README.md、assets 文件夹（含 avatar.jpg、data.js、geo.js、main.js、style.css）。不要上传 zip 本身，也不要多套一层文件夹。
3. 点 Commit changes。
4. Settings → Pages → Source 选 Deploy from a branch → Branch 选 main、文件夹 / (root) → Save。
5. 几分钟后打开 https://你的用户名.github.io/ 即可。
6. 以后改内容：在 GitHub 上打开文件点铅笔编辑，或重新上传同名文件覆盖，提交后一两分钟自动更新。

## 引用地图如何保持更新
- 不需要任何操作：地图是访客打开网页时由浏览器实时向 OpenAlex 查询的，OpenAlex 收录新引用后会自动出现（每位访客的浏览器缓存 24 小时）。
- 发表新论文时，只要在 assets/data.js 的 pubs 里加上这篇论文并填写 doi，它的被引用情况就会自动计入地图。
- OpenAlex 收录新引用通常比 Google Scholar 慢几天到几周，这是正常的。
