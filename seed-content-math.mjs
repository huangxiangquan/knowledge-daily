// AP Precalculus / Algebra II（美高/国际班高一）第 1\u201314 天卡片内容。
export const math = [
  {
    day: 1,
    blocks: [
      {
        section: "concept", position: 1, title: "定义域与值域：先看限制，再看范围",
        terms: "domain（定义域）· range（值域）· interval notation（区间记号）",
        body: "- 找定义域只需查三件事：**分母不为 0**、**偶次根号内 \u2265 0**、**log 的真数 > 0**。\n- 值域优先靠图像：二次函数看顶点， rational（有理式）看水平渐近线。\n- AP 记号：`x \u2208 [-3, 5)` 表示含 -3 不含 5；无限端一律用圆括号。",
      },
      {
        section: "example", position: 1, title: "含根号与分式的定义域",
        body: "求 `f(x) = \u221a(x \u2212 3) / (x \u2212 7)` 的定义域。",
        answer: "两条限制要同时成立：\n- 根号：`x \u2212 3 \u2265 0` \u2192 `x \u2265 3`\n- 分母：`x \u2212 7 \u2260 0` \u2192 `x \u2260 7`\n所以定义域是 **`[3, 7) \u222a (7, \u221e)`**。\n易错点：写成 `x > 3`（漏了 x = 3 时根号为 0 是允许的）。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "求 `g(x) = log\u2082(x \u2212 1) + \u221a(5 \u2212 x)` 的定义域。",
        answer: "`x \u2212 1 > 0` 且 `5 \u2212 x \u2265 0` → **`(1, 5]`**。注意 log 的边界是严格大于，根号的边界可以取等。",
      },
      {
        section: "practice", position: 2, title: "练习 B（值域）",
        body: "求 `f(x) = x\u00b2 \u2212 6x + 5` 在 `x \u2208 [0, 4]` 上的值域（这是定义域受限后的值域题）。",
        answer: "顶点 `x = 3` 在区间内，`f(3) = 9 \u2212 18 + 5 = -4` 为最小；端点 `f(0) = 5`、`f(4) = -3` → 最大 5。\n值域 **`[-4, 5]`**。别直接把全体实数的值域 `[-4, \u221e)` 抄过来。",
      },
    ],
  },
  {
    day: 2,
    blocks: [
      {
        section: "concept", position: 1, title: "图像变换：对 x 动手要反着来",
        terms: "translation（平移）· reflection（翻折）· dilation（伸缩）",
        body: "- `y = f(x - h) + k`：向右移 `h`，向上移 `k`。**括号内改变方向相反**，这是最高频错误。\n- `y = -f(x)` 关于 x 轴翻；`y = f(-x)` 关于 y 轴翻。\n- `y = af(x)` 纵向拉伸 `a` 倍；`y = f(bx)` 横向压缩为 `1/b`。\n- 检验法：代一个特殊点（如顶点或零点）看它去哪儿了。",
      },
      {
        section: "example", position: 1, title: "从基本函数出发",
        body: "已知 `f(x) = |x|`。写出先向右平移 2、再关于 x 轴翻折、再向上平移 3 后的解析式，并给出顶点。",
        answer: "按顺序作用：`|x - 2|` \u2192 `-|x - 2|` \u2192 **`g(x) = -|x - 2| + 3`**。\n顶点 `(2, 3)`，开口向下，零点在 `-|x-2| + 3 = 0` \u2192 `x = -1` 或 `5`。\n翻折发生在「整体取负」那一步，所以顶点 y 坐标也随之变号再 +3。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "`f(x) = x\u00b3` 经变换得到 `g(x) = (x + 1)\u00b3 - 4`。描述变换过程，并求 `g(0)` 与零点。",
        answer: "向左平移 1，再向下平移 4。`g(0) = 1 - 4 = **-3**`；零点 `(x+1)\u00b3 = 4` \u2192 `x = \u221b4 \u2212 1 \u2248 **0.587**`。",
      },
      {
        section: "practice", position: 2, title: "练习 B（反向思维）",
        body: "`h(x) = f(2x - 6)` 相当于把 `f(x)` 作了什么变换？为什么不是「向左 6」？",
        answer: "先提系数：`f(2(x - 3))` → 横向**压缩到 1/2**，再向**右**移 3。括号里是 `x - 3` 而不是 `x - 6`；不提取 2 直接读 6 是经典错误。",
      },
    ],
  },
  {
    day: 3,
    blocks: [
      {
        section: "concept", position: 1, title: "反函数：先判存在，再求表达式",
        terms: "one-to-one（一对一）· inverse function（反函数）· horizontal line test（水平线检验）",
        body: "- 存在条件：定义域内**一对一**（水平线检验）。二次函数必须限制定义域才有反函数。\n- 求法：交换 `x` 与 `y` 再解 `y`；或由 `f(a) = b \u21d4 f\u207b\u00b9(b) = a` 直接对点。\n- 图像关系：关于 `y = x` 对称；**定义域与值域互换**。",
      },
      {
        section: "example", position: 1, title: "分式函数的反函数",
        body: "设 `f(x) = (2x + 1)/(x - 3)`，`x \u2260 3`。求 `f\u207b\u00b9(x)` 并写出其定义域。",
        answer: "`y(x - 3) = 2x + 1` → `xy - 3y = 2x + 1` → `x(y - 2) = 3y + 1`\n`x = (3y + 1)/(y - 2)`，交换变量：\n**`f\u207b\u00b9(x) = (3x + 1)/(x - 2)`**，定义域 `x \u2260 2`。\n自检：原函数水平渐近线 `y = 2` 变成反函数的垂直渐近线 `x = 2` ✔",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "`f(x) = 4/(x + 1)`（`x \u2260 -1`）。求 `f\u207b\u00b9(x)`，并求 `f\u207b\u00b9(2)`。",
        answer: "`y = 4/(x+1)` → `x = 4/y \u2212 1` → **`f\u207b\u00b9(x) = 4/x \u2212 1`**；`f\u207b\u00b9(2) = 4/2 \u2212 1 = **1**`。\n验算 `f(1) = 4/2 = 2` ✔",
      },
      {
        section: "practice", position: 2, title: "练习 B（存在性）",
        body: "`f(x) = (x - 2)\u00b2`。在什么定义域限制下它才有反函数？给出对应 `f\u207b\u00b9`。",
        answer: "取 **`x \u2265 2`**（或 `x \u2264 2`）使函数单调。对 `x \u2265 2`：`f\u207b\u00b9(x) = 2 + \u221ax`，定义域 `x \u2265 0`。\n不加限制就不通过水平线检验，例如 `f(0) = f(4) = 4`。",
      },
    ],
  },
  {
    day: 4,
    blocks: [
      {
        section: "concept", position: 1, title: "二次函数：三种形式随时切换",
        terms: "standard / vertex / factored form（标准式 / 顶点式 / 因式式）· axis of symmetry（对称轴）",
        body: "- 标准式 `ax\u00b2 + bx + c` \u2192 看开口与 y 截距。\n- 顶点式 `a(x - h)\u00b2 + k` \u2192 顶点 `(h, k)`、最值 `k`。\n- 因式式 `a(x - r\u2081)(x - r\u2082)` \u2192 零点，对称轴 `x = (r\u2081 + r\u2082)/2`。\n- 由标准式转顶点式：`h = -b/(2a)`，`k = f(h)`。**代回 f 求 k**，别背 `\u0394` 公式。",
      },
      {
        section: "example", position: 1, title: "最大面积问题",
        body: "用 `40 m` 篱笆靠墙围一个矩形（一面用墙）。求最大面积及尺寸。",
        answer: "设垂直墙的两边为 `x`，平行墙的边为 `40 - 2x`。\n`A = x(40 - 2x) = 40x - 2x\u00b2`\n`h = -b/(2a) = -40/(2 \u00d7 (-2)) = 10` → `A(10) = 10 \u00d7 20 = **200 m\u00b2**`。\n尺寸：**垂直墙 10 m，平行墙 20 m**。\n定义域 `0 < x < 20`，最值在内部取得，无需检查端点。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "把 `y = 2x\u00b2 - 12x + 7` 写成顶点式，指出最小值与零点个数。",
        answer: "`y = 2(x\u00b2 - 6x) + 7 = 2(x - 3)\u00b2 - 18 + 7 = **2(x - 3)\u00b2 - 11**`。\n最小值 `-11`；因最小值 < 0 且开口向上 → **两个零点**。",
      },
      {
        section: "practice", position: 2, title: "练习 B（符号推理，不算具体值）",
        body: "`f(x) = ax\u00b2 + bx + c` 的图像开口向下、顶点在第一象限、与 y 轴交于负半轴。判断 `b` 与 `\u0394 = b\u00b2 - 4ac` 的符号。",
        answer: "顶点横坐标 `-b/(2a) > 0`，且 `a < 0` → **`b > 0`**。\n顶点在第一象限（y > 0）且开口向下 \u21d2 图像穿越 x 轴两次 \u21d2 **`\u0394 > 0`**。\n这类「读符号」题在 AP 选择题里比计算更常见。",
      },
    ],
  },
  {
    day: 5,
    blocks: [
      {
        section: "concept", position: 1, title: "多项式与有理函数：先看零点的「重数」",
        terms: "multiplicity（重数）· end behavior（末端行为）· vertical / horizontal asymptote（垂直/水平渐近线）· hole（可去间断点）",
        body: "- 重数为奇：图像**穿过** x 轴；重数为偶：图像**相切折回**。\n- 末端行为只看最高次项 `a\u2099x\u207f`。\n- 有理式：分子的零点若在分母也出现 → **hole**，不是渐近线。\n- 水平渐近线：次数比较（分母高 \u2192 `y = 0`；同次 \u2192 首项系数比；分子高 \u2192 无，可能是斜渐近线）。",
      },
      {
        section: "example", position: 1, title: "画图所需的全部信息",
        body: "分析 `f(x) = x(x - 2)\u00b2 / (x + 1)` 的零点、渐近线与符号，并描述末端行为。",
        answer: "- 零点：`x = 0`（重数 1，穿过），`x = 2`（重数 2，**相切折回**，仍与 x 轴接触）\n- 垂直渐近线 `x = -1`；分子 3 次、分母 1 次 \u2192 无水平渐近线，**斜渐近线** `y = x\u00b2 + \u2026`（做多项式除法可得，AP 常只要求判断存在）\n- 末端行为同 `x\u00b2`：**两端都趋 +\u221e**\n- 符号表以 -1、0、2 分区间，逐段代一个测试点即可。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "`g(x) = (x + 3)(x - 1)\u00b2 / ((x - 1)(x + 2))`。写出 hole 与垂直渐近线，并求 `g(0)`。",
        answer: "分子分母公因子 `(x - 1)` → **hole at x = 1**；垂直渐近线 **`x = -2`**。\n化简 `g(x) = (x+3)(x-1)/(x+2)`（`x \u2260 1`）→ `g(0) = (3)(-1)/2 = **-3/2**`。",
      },
      {
        section: "practice", position: 2, title: "练习 B（反推）",
        body: "某三次函数图像在 x = -2 处穿过 x 轴、在 x = 3 处相切、且过 (0, 4)。写出一个满足条件的解析式。",
        answer: "`f(x) = a(x + 2)(x - 3)\u00b2`。代 (0,4)：`4 = a \u00b7 2 \u00b7 9 = 18a` \u2192 `a = 2/9`。\n**`f(x) = (2/9)(x + 2)(x - 3)\u00b2`**。「穿过 \u2192 奇重数、相切 \u2192 偶重数」是这类题的唯一钥匙。",
      },
    ],
  },
  {
    day: 6,
    blocks: [
      {
        section: "concept", position: 1, title: "指数与对数：四条运算律必须能反用",
        terms: "exponential（指数）· logarithm（对数）· natural log（ln）· product/quotient/power rules（积/商/幂律）",
        body: "- `log_b(xy) = log_b x + log_b y`；`log_b(x/y) = log_b x \u2212 log_b y`；`log_b(x\u207f) = n\u00b7log_b x`。\n- 幂律**不能**用于 `log(x + y)`；`log\u00b2x` 表示 `(log x)\u00b2`，不是 `log(log x)`。\n- 换底：`log_b a = ln a / ln b`。\n- 定义关系：`y = log_b x \u21d4 x = b\u0771`——所有对数方程最终都靠这句转化。",
      },
      {
        section: "example", position: 1, title: "化简与求值",
        body: "计算 `log\u2082 12 \u2212 log\u2082 3 + log\u2082 4`，并化简 `2 ln a \u2212 \u00bd ln b + ln c`。",
        answer: "- `log\u2082(12/3 \u00d7 4) = log\u2082 16 = **4**`\n- `2 ln a = ln a\u00b2`，`\u00bd ln b = ln \u221ab` \u2192 **`ln(a\u00b2 c / \u221ab)`**\n合并前先确认各项系数已搬进指数位置，这是幂律的反向使用。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "解方程 `log\u2083(x + 1) + log\u2083(x \u2212 1) = 2`。",
        answer: "`log\u2083[(x+1)(x-1)] = 2` → `x\u00b2 - 1 = 9` → `x = \u00b1\u221a10`。\n验真数：`x = -\u221a10` 使 `x + 1 < 0`，**舍去**。答案 **`x = \u221a10 \u2248 3.16`**。对数方程必须验根。",
      },
      {
        section: "practice", position: 2, title: "练习 B（指数方程）",
        body: "解 `5^x = 8`，用 ln 表示并给出近似值。",
        answer: "两边取 ln：`x ln 5 = ln 8` → `x = ln 8 / ln 5 \u2248 2.079/1.609 \u2248 **1.29**`。\n换底公式的实战形态，AP 允许保留 `ln 8/ln 5` 这种精确形式。",
      },
    ],
  },
  {
    day: 7,
    blocks: [
      {
        section: "concept", position: 1, title: "指数增长与衰减建模",
        terms: "growth rate（增长率）· half-life（半衰期）· doubling time（倍增时间）· continuous compounding（连续复利）",
        body: "- 离散：`A = P(1 + r)\u1d69`；连续：`A = Pe^(rt)`。\n- 倍增时间 `t = ln 2 / r`；半衰期 `t = ln 2 / \u03bb`（衰减 `A = A\u2080e^(-\u03bbt)`）。两者形式相同，别混淆含义。\n- 每年按百分比增长的量，**每单位时间增量在变大**，图像向上弯曲；线性增长才是等量增加。",
      },
      {
        section: "example", position: 1, title: "细菌培养",
        body: "某菌群每 3 小时翻倍，初始 `500` 个。写出数量模型，并求 10 小时后的数量。",
        answer: "`N(t) = 500 \u00b7 2^(t/3)`（t 以小时计）。\n`N(10) = 500 \u00b7 2^(10/3) = 500 \u00b7 2^3.333 \u2248 500 \u00d7 10.08 \u2248 **5.0 \u00d7 10\u00b3**`。\n指数写成 `2^(t/3)` 而不是 `2^(3t)`：让指数在 `t = 3` 时恰为 1。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "某放射性物质半衰期 12 天。现有 `200 g`，求 30 天后剩余质量，并写出衰减常数 `\u03bb`。",
        answer: "`m = 200 \u00b7 (1/2)^(30/12) = 200 \u00b7 2^(-2.5) \u2248 200 \u00d7 0.177 \u2248 **35 g**`。\n`\u03bb = ln2 / 12 \u2248 **0.0578 天\u207b\u00b9**`。",
      },
      {
        section: "practice", position: 2, title: "练习 B（比较增长）",
        body: "`1000` 元按年化 6% 投资：连续复利 vs 每年复利，10 年后各是多少？",
        answer: "连续：`1000e^0.6 \u2248 **1822 元**`；每年：`1000(1.06)^10 \u2248 **1791 元**`。\n差约 31 元。连续复利永远更高，但差距不大；记这个数量级能帮你识别选项里明显错误的数字。",
      },
    ],
  },
  {
    day: 8,
    blocks: [
      {
        section: "concept", position: 1, title: "不等式与符号表（sign chart）",
        terms: "critical points（关键点）· sign chart（符号表）· strict inequality（严格不等号）",
        body: "- 标准流程：**移项使一侧为 0** \u2192 因式分解 \u2192 标关键点（零点与分母零点）\u2192 逐区间取符号。\n- 分母为零的点永远用开区间；不等号含等号时零点可取。\n- 不要「两边同乘含 x 的式子」——符号未知，容易翻错方向。",
      },
      {
        section: "example", position: 1, title: "分式不等式",
        body: "解 `(x - 2)/(x + 1) \u2264 3`。",
        answer: "移项通分：`(x-2)/(x+1) - 3 \u2264 0` \u2192 `(x - 2 - 3x - 3)/(x+1) \u2264 0` \u2192 `(-2x - 6)/(x+1) \u2264 0` \u2192 `(x + 3)/(x + 1) \u2265 0`（同乘 -2 变号）。\n关键点 -3、-1；符号表得 **`x \u2208 (-\u221e, -3] \u222a (-1, \u221e)`**。\n-1 处取不到（分母为 0），-3 处取得到（值为 0）。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "解 `x\u00b2 - 5x + 6 > 0`。",
        answer: "`(x-2)(x-3) > 0` → **`x < 2` 或 `x > 3`**，即 `(-\u221e,2) \u222a (3,\u221e)`。二次项系数为正时，「> 0 取两头」。",
      },
      {
        section: "practice", position: 2, title: "练习 B（陷阱）",
        body: "解 `1/x > 2`。有同学写 `x > 1/2`，错在哪？",
        answer: "错在两边同乘了 `x` 而没讨论 `x` 的正负。正确做法：`1/x - 2 > 0` \u2192 `(1 - 2x)/x > 0`，符号表关键点 0、1/2 \u2192 **`0 < x < 1/2`**。\n取 `x = -1` 验算原式：`-1 > 2` 不成立，说明负数一律排除。",
      },
    ],
  },
  {
    day: 9,
    blocks: [
      {
        section: "concept", position: 1, title: "弧度与单位圆",
        terms: "radian（弧度）· unit circle（单位圆）· reference angle（参考角）· coterminal angle（同界角）",
        body: "- `\u03c0 rad = 180\u00b0`；`1 rad \u2248 57.3\u00b0`。弧长 `s = r\u03b8`、扇形面积 `A = \u00bd r\u00b2\u03b8`（**必须用弧度**）。\n- 单位圆上点 `(cos \u03b8, sin \u03b8)`；AP 常考特殊角：`\u03c0/6`、`\u03c0/4`、`\u03c0/3` 及其在各象限的镜像。\n- 符号口诀：第一象限全正，第二象限 sin 正，第三 tan 正，第四 cos 正。",
      },
      {
        section: "example", position: 1, title: "非特殊角转化",
        body: "求 `cos(7\u03c0/6)` 与 `sin(-4\u03c0/3)` 的精确值。",
        answer: "- `7\u03c0/6 = \u03c0 + \u03c0/6` 在第三象限，cos 为负 → **`-\u221a3/2`**\n- `-4\u03c0/3` 加 `2\u03c0` 得同界角 `2\u03c0/3`（第二象限，sin 为正）→ **`\u221a3/2`**\n统一流程：化成 0\u20132\u03c0 内的同界角 \u2192 找参考角 \u2192 定符号。",
      },
      {
        section: "practice", position: 1, title: "练习 A（弧长应用）",
        body: "半径 `8 m` 的轮子转过 `45\u00b0`，求轮缘走过的弧长与扇形面积。",
        answer: "`45\u00b0 = \u03c0/4 rad`。`s = 8 \u00b7 \u03c0/4 = **2\u03c0 \u2248 6.28 m**`；`A = \u00bd \u00b7 64 \u00b7 \u03c0/4 = **8\u03c0 \u2248 25.1 m\u00b2**`。用角度直接乘会算错。",
      },
      {
        section: "practice", position: 2, title: "练习 B（三角函数值反推）",
        body: "`sin \u03b8 = 3/5` 且 `\u03b8` 在第二象限。求 `cos \u03b8` 与 `tan \u03b8`。",
        answer: "`cos\u00b2\u03b8 = 1 \u2212 9/25 = 16/25`，第二象限 cos 负 \u2192 `cos \u03b8 = **-4/5**`，`tan \u03b8 = sin/cos = **-3/4**`。\n永远用恒等式 + 象限符号，不要靠计算器反推。",
      },
    ],
  },
  {
    day: 10,
    blocks: [
      {
        section: "concept", position: 1, title: "`y = A sin(Bx - C) + D` 四个参数各管什么",
        terms: "amplitude（振幅 A）· period（周期 2\u03c0/B）· phase shift（相移 C/B）· midline（中位线 y = D）",
        body: "- 振幅 = `|A|`；周期 = `2\u03c0/|B|`；中位线 `y = D`；**相移 = C/B，不是 C**。\n- 关键点先画中位线，再在 1/4 周期处打峰谷点，最后连光顺曲线。\n- 余弦与正弦只差四分之一个周期，建模时选让初相位最简的那个。",
      },
      {
        section: "example", position: 1, title: "潮汐建模",
        body: "某港口水深在 `y = 12 + 4 sin(\u03c0 t / 6)`（t 为小时）之间变化。求周期、最大最小水深与达到最大水深的时刻。",
        answer: "- `B = \u03c0/6` \u2192 周期 `= 2\u03c0/(\u03c0/6) = **12 小时**`\n- 中位线 12，振幅 4 \u2192 最大 **16 m**、最小 **8 m**\n- 最大时 `\u03c0t/6 = \u03c0/2` \u2192 `t = **3 小时**`（之后每 12 小时重复）\n读题时把「最高/最低/两次最高间隔」三件事与 A、D、周期一一对应。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "写出函数 `y = -2 cos(2x) + 1` 的振幅、周期、中位线，并说明它与 `y = 2 cos(2x) + 1` 的图像关系。",
        answer: "振幅 **2**、周期 **\u03c0**、中位线 **y = 1**。两者关于中位线 `y = 1` **上下翻折**（相差半个周期，也是同一形状的平移）。",
      },
      {
        section: "practice", position: 2, title: "练习 B（写解析式）",
        body: "某体温在 3 点最低 36.2 \u00b0C、9 点最高 37.4 \u00b0C，之后每 24 小时重复。用正弦函数建模。",
        answer: "振幅 `A = 0.6`，中位线 `D = 36.8`，周期 24 \u2192 `B = 2\u03c0/24 = \u03c0/12`。\n最高在 t = 9，若用正弦（其峰值在相位 \u03c0/2 处）\u2192 相移 9 \u2212 6 = 3：\n**`T(t) = 36.8 + 0.6 sin[\u03c0(t - 3)/12]`**。用余弦可写成 `36.8 + 0.6 cos[\u03c0(t - 9)/12]`，两者等价。",
      },
    ],
  },
  {
    day: 11,
    blocks: [
      {
        section: "concept", position: 1, title: "恒等式：先平方关系，再和角",
        terms: "Pythagorean identity（平方关系）· sum/difference identities（和差公式）· double angle（倍角）",
        body: "- `sin\u00b2\u03b8 + cos\u00b2\u03b8 = 1`；`1 + tan\u00b2\u03b8 = sec\u00b2\u03b8`。\n- `sin(\u03b1 \u00b1 \u03b2) = sin\u03b1cos\u03b2 \u00b1 cos\u03b1sin\u03b2`；`cos(\u03b1 \u00b1 \u03b2) = cos\u03b1cos\u03b2 \u2213 sin\u03b1sin\u03b2`（余弦变号）。\n- 倍角：`sin 2\u03b8 = 2 sin\u03b8 cos\u03b8`；`cos 2\u03b8 = cos\u00b2\u03b8 \u2212 sin\u00b2\u03b8`。\n- 证明策略：把复杂一侧全部化成正余弦、通分、用平方关系消次。",
      },
      {
        section: "example", position: 1, title: "和角的精确值",
        body: "不用计算器求 `cos 15\u00b0`。",
        answer: "`15\u00b0 = 45\u00b0 \u2212 30\u00b0`\n`cos(45\u221230) = cos45 cos30 + sin45 sin30`\n`= (\u221a2/2)(\u221a3/2) + (\u221a2/2)(1/2) = **(\u221a6 + \u221a2)/4 \u2248 0.966**`\n检验：接近 1 且 > cos30\u00b0 ✔ 角度越小余弦越大。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "已知 `sin \u03b1 = 3/5`（\u03b1 第一象限），`cos \u03b2 = -5/13`（\u03b2 第二象限）。求 `sin(\u03b1 + \u03b2)`。",
        answer: "`cos \u03b1 = 4/5`，`sin \u03b2 = 12/13`。\n`sin(\u03b1+\u03b2) = sin\u03b1 cos\u03b2 + cos\u03b1 sin\u03b2 = (3/5)(-5/13) + (4/5)(12/13) = (-15 + 48)/65 = **33/65**`。\n先补全四个值再套公式，能避免符号乱。",
      },
      {
        section: "practice", position: 2, title: "练习 B（证明）",
        body: "证明 `tan(\u03b8/2) = sin \u03b8 / (1 + cos \u03b8)`。",
        answer: "右式：`sin\u03b8/(1+cos\u03b8) = 2sin(\u03b8/2)cos(\u03b8/2) / [1 + 2cos\u00b2(\u03b8/2) \u2212 1]`\n`= 2sin(\u03b8/2)cos(\u03b8/2) / [2cos\u00b2(\u03b8/2)] = sin(\u03b8/2)/cos(\u03b8/2) = **tan(\u03b8/2)**` ✔\n用倍角公式「往半角方向拆」是这类证明的标准突破口。",
      },
    ],
  },
  {
    day: 12,
    blocks: [
      {
        section: "concept", position: 1, title: "向量的分量法与点积",
        terms: "component form（分量式）· magnitude（模）· dot product（点积）· angle between vectors（夹角）",
        body: "- 分解：`\u27e8|v| cos\u03b8, |v| sin\u03b8\u27e9`。加法做分量，别去画不闭合的三角形。\n- 点积两种写法：`a\u00b7b = a\u2081b\u2081 + a\u2082b\u2082 = |a||b|cos\u03b8`。\n- 点积 > 0 锐角，= 0 **垂直**，< 0 钝角。它是标量，不是向量。",
      },
      {
        section: "example", position: 1, title: "求夹角",
        body: "`a = \u27e83, -4\u27e9`，`b = \u27e81, 2\u27e9`。求 `a\u00b7b`、`|a|` 与两向量夹角。",
        answer: "- `a\u00b7b = 3(1) + (-4)(2) = **-5**`\n- `|a| = \u221a(9+16) = 5`，`|b| = \u221a5`\n- `cos \u03b8 = -5/(5\u221a5) = -1/\u221a5 \u2248 -0.447` \u2192 `\u03b8 \u2248 **116.6\u00b0**`\n点积为负已经预告了钝角，可以先判断再算，防止按错符号。",
      },
      {
        section: "practice", position: 1, title: "练习 A（同型）",
        body: "若 `\u27e82, k\u27e9` 与 `\u27e8-6, 4\u27e9` 垂直，求 k。",
        answer: "垂直 \u2192 点积为 0：`2(-6) + 4k = 0` \u2192 `k = **3**`。",
      },
      {
        section: "practice", position: 2, title: "练习 B（应用：力的功）",
        body: "力 `F = \u27e810, 3\u27e9 N` 使物体沿位移 `d = \u27e84, -1\u27e9 m` 移动。求该力做的功。",
        answer: "`W = F\u00b7d = 10 \u00d7 4 + 3 \u00d7 (-1) = **37 J**`。\n功就是点积（第 9 天物理卡 `W = Fd cos\u03b8` 的向量形式），两科在这里连通。",
      },
    ],
  },
  {
    day: 13,
    blocks: [
      {
        section: "concept", position: 1, title: "解三角形：什么时候用正弦、什么时候用余弦",
        terms: "Law of Sines（正弦定理）· Law of Cosines（余弦定理）· ambiguous case（SSA 多解）",
        body: "- 已知**两边一角（夹角）** 或 **三边** \u2192 余弦定理。\n- 已知**两角一边** 或 **两边及其中一边的对角** \u2192 正弦定理；后者可能有两解/一解/无解，即 SSA 多解情形。\n- 面积：`K = \u00bd ab sin C`。任何三角形内角和 180\u00b0 先用来补第三个角。",
      },
      {
        section: "example", position: 1, title: "余弦定理求第三边与面积",
        body: "`b = 7`，`c = 5`，夹角 `A = 60\u00b0`。求 a 与三角形面积。",
        answer: "- `a\u00b2 = b\u00b2 + c\u00b2 \u2212 2bc cos A = 49 + 25 \u2212 2(7)(5)(0.5) = 39` \u2192 `a = \u221a39 \u2248 **6.24**`\n- `K = \u00bd bc sin A = \u00bd \u00b7 7 \u00b7 5 \u00b7 (\u221a3/2) \u2248 **15.2**`\nSAS 结构直接走余弦定理，别去正弦定理绕。",
      },
      {
        section: "practice", position: 1, title: "练习 A（SSA 多解）",
        body: "`A = 30\u00b0`，`a = 5`，`b = 8`。判断解的个数并求出对应角 B。",
        answer: "`sin B = b sin A / a = 8(0.5)/5 = 0.8`。因 `a < b` 且 `a > b sin A = 4` \u2192 **两解**：\n`B \u2248 53.1\u00b0` 或 `B \u2248 126.9\u00b0`。\n判据：`h = b sin A`，当 `h < a < b` 时两解。",
      },
      {
        section: "practice", position: 2, title: "练习 B（测量应用）",
        body: "河对岸有一棵树。在相距 20 m 的 A、B 两点分别测得对树的角为 70\u00b0 与 55\u00b0（树与 A、B 同平面）。求树到 A 的距离。",
        answer: "第三角 `= 180 \u2212 70 \u2212 55 = 55\u00b0`。\n由正弦定理：`d_A / sin 55\u00b0 = 20 / sin 55\u00b0` \u2192 `d_A = 20 \u00b7 sin55\u00b0/sin55\u00b0 = **20 m**`（此时三角形等腰）。\n先补第三角，再挑「已知角的对边配对」写正弦定理。",
      },
    ],
  },
  {
    day: 14,
    blocks: [
      {
        section: "concept", position: 1, title: "函数综合：零点、交点与图像语言",
        terms: "zero of a function（零点）· intersection（交点）· average rate of change（平均变化率）",
        body: "- 求交点 = 解 `f(x) = g(x)`：**不要**在图上估，AP 要求精确式或指定精度。\n- 平均变化率 = 割线斜率 `(f(b) - f(a))/(b - a)`；瞬时变化率 = 该点切线斜率（后续微积分入口）。\n- 「方程有几个实根」转成「图像有几个交点」，靠草图 + 端点行为判断。",
      },
      {
        section: "example", position: 1, title: "指数与二次的交点",
        body: "解 `2^(x\u00b2) = 8`，并说明解的个数。",
        answer: "`8 = 2\u00b3` → `x\u00b2 = 3` → `x = \u00b1\u221a3`，**两个解**（\u2248 \u00b11.73）。\n关键是化到同底；同底之后「指数相等」才可推 `x\u00b2 = 3`。若不能同底就取对数（第 6 天练习 A）。",
      },
      {
        section: "practice", position: 1, title: "练习 A（回收第 5 天）",
        body: "`f(x) = x\u00b3 - 4x`。求零点、末端行为，并写出 `f(x) > 0` 的解集。",
        answer: "`x(x-2)(x+2) = 0` → 零点 `-2, 0, 2`；最高次 `x\u00b3` → 左下右上。\n符号表 → **`(-2, 0) \u222a (2, \u221e)`**。零点题与不等式题是同一套图。",
      },
      {
        section: "practice", position: 2, title: "练习 B（回收第 10 天）",
        body: "`y = 3 sin(2x) + 1` 在 `[0, \u03c0]` 上有几个零点？说明理由而不是硬算。",
        answer: "`3 sin 2x = -1` \u2192 `sin 2x = -1/3`。在 `2x \u2208 [0, 2\u03c0]` 内正弦取 `-1/3` **恰两次**（第三、四象限各一次），故 x 有 **2 个零点**。\n用「中位线与振幅」判断交点个数，比解方程快且更常见于 AP 选择题。",
      },
    ],
  },
];
