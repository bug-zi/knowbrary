import { CATEGORIES, CARD_TYPE_LABELS } from '~/types'
import type { Category, CardType, Difficulty, ExistingCardSummary } from '~/types'
import type { TavilyResult } from '~/types/fact-check'

/** Category-specific content guidance injected into AI prompts */
const CATEGORY_GUIDES: Partial<Record<Category, string>> = {
  'human-limits': `## 该领域的内容方向（必须遵循）
"人类极限"聚焦于**真实、可验证的人类历史纪录和生理科学极限**，而不是超能力或玄学。内容必须来自以下两个方向之一：

### 方向A：人类历史纪录（吉尼斯级别）
- 真实存在的世界纪录及其背后的科学解释（如：最长时间憋气、最高无辅助跳跃、最长不眠记录）
- 纪录保持者的训练方法或生理特质
- 纪录背后的数据——用了多久、突破了多少、比普通人强几倍

### 方向B：生理极限科普（理论值 + 实验数据）
- 普通人的生理极限是多少（如：人能承受的最高/最低温度、最快反应速度、最大握力、憋气极限、失血多少会昏迷）
- 极限的生理学原因——为什么不能再多了？
- 实验室数据或医学研究支撑

### 禁止内容
- 不要生成超能力、心灵感应、神秘主义等未经科学验证的内容
- 不要写成"如何突破极限"的训练指南
- keyData 中必须有具体的数字（纪录数值、生理参数等），不能是模糊描述`,

  'humor': `## 该领域的内容方向（必须遵循）
"幽默学"不是讲笑话大全，而是**用科学视角拆解幽默的运作机制**。每张卡片要让读者理解"为什么好笑"背后的原理，而不是单纯逗乐。内容方向：

### 方向A：幽默理论（为什么好笑）
- 三大经典理论的实证解释：失调理论（Incongruity）、优越理论（Superiority）、释放理论（Relief）
- Benign Violation 理论：好笑 = 恰到好处的"冒犯"（不能太狠也不能太弱）
- 预期违背：笑话为什么需要"反转"？大脑如何处理预期与现实的落差？

### 方向B：幽默的结构与技巧
- 谐音梗为什么"冷"却依然好笑？——双关语的语言学机制
- 讽刺（sarcasm）的心理基础：为什么说反话比直接批评更"疼"？
- 自嘲的力量：为什么示弱反而能赢得好感？
- 三段式法则（Rule of Three）：为什么笑话总是"第三次"爆梗？
- 黑色幽默的边界：什么条件下，悲剧才能被拿来开玩笑？

### 方向C：幽默的社会功能与实验
- 幽默如何降低冲突、化解尴尬——社会心理学实验证据
- 为什么有幽默感的人被认为更聪明？（研究数据）
- 幽默感的文化差异：美国人觉得好笑的，日本人为什么笑不出来？
- 笑的生理机制：假笑和真笑在大脑中的区别（Duchenne smile）

### 禁止内容
- 不要写成笑话集或段子合集——每张卡片必须有"知识内核"
- 不要只列笑话不分析——读者看完必须理解一个幽默学原理
- cardType 优先选择 concept（理论）或 experiment（经典实验），慎用 person`,

  'unsolved-mysteries': `## 该领域的内容方向（必须遵循）
"未解之谜"不是猎奇玄学，而是**科学界至今仍在努力破解的真实谜题**。每张卡片要讲清楚"我们知道什么""我们不知道什么""科学家正在怎么研究"。内容方向：

### 方向A：宇宙与物理谜题
- 暗物质和暗能量：占宇宙95%，但我们几乎一无所知
- 费米悖论：宇宙那么大，外星人到底在哪？
- 物质-反物质不对称：大爆炸应该产生等量的正反物质，为什么我们存在？
- 宇宙的最终命运：大冻结、大撕裂、大坍缩——哪个才是结局？

### 方向B：生命与意识谜题
- 生命起源：无机物如何变成第一个活细胞？目前主流假说的证据与缺陷
- 意识的硬问题：为什么物理过程会产生主观体验？
- 记忆的存储机制：大脑到底用什么方式存储一生的记忆？
- 物种大灭绝的周期性：每2600万年一次，原因未知

### 方向C：地球与数学谜题
- 地球内核比地壳转得快——为什么？能量从哪来？
- 百慕大三角的真相反驳：用数据拆解"神秘失踪"的统计错觉
- 黎曼猜想、P vs NP 等千禧年难题：不是讲题目本身，而是讲"为什么解不开"和"解开了会怎样"
- 安蒂基特拉机械：两千年前古希腊人怎么造出比之后一千年的任何东西都精密的装置？

### 禁止内容
- 不要写阴谋论（登月造假、共济会、外星人绑架等未经证实的说法）
- 不要写灵异/超自然/都市传说——必须有严肃的科学论文或研究作为背景
- 每张卡片必须明确标注"目前科学界的主流假说是什么"和"还差什么证据"
- keyData 要包含具体数据：距发现多少年、研究论文数量、悬赏金额等`,

  'economics': `## 内容方向
聚焦日常生活中的经济学原理，而非宏观经济政策。优先覆盖：消费决策的非理性（锚定效应在定价中的应用）、市场机制的直觉理解（为什么机票价格一直变）、个人财务与投资基础（复利的力量、通胀的真面目）、行为经济学实验（禀赋效应、损失厌恶的经济后果）。避免纯理论推导和过于学术的公式。keyData 必须包含具体金额、比例或年份。`,

  'psychology': `## 内容方向
以实验心理学和认知科学为核心。优先覆盖：经典实验的现代解读（斯坦福监狱实验、棉花糖实验的最新复现争议）、日常心理现象的科学解释（为什么半夜做的决定第二天会后悔）、人际互动中的心理学（首因效应、镜像神经元）、情绪与决策（情绪如何劫持理性）。避免心灵鸡汤和未经实验验证的流行心理学。cardType 优先 experiment 和 concept。`,

  'law': `## 内容方向
聚焦与普通人权利直接相关的法律知识。优先覆盖：合同法陷阱（租房、劳动合同时的隐藏条款）、消费者权益（七天无理由退货的法律边界）、知识产权（抄袭与借鉴的法律界限）、刑法常识（正当防卫的法律定义 vs 大众认知）、证据规则（为什么"监控录像"不一定是铁证）。用真实案例或模拟场景讲解，避免干巴巴的条文引用。`,

  'medicine': `## 内容方向
聚焦普通人需要知道的医学常识和急救知识，不做诊断建议。优先覆盖：急救技能（心肺复苏的正确步骤、海姆立克急救法）、常见误区（感冒药不能"治"感冒、抗生素的正确认知）、体检报告解读（哪些指标真正需要关注）、身体信号（哪些症状不能拖、必须就医）。所有医学建议必须标注"仅供参考，不替代专业诊断"。`,

  'astronomy': `## 内容方向
以"看得见的天文"为主线。优先覆盖：肉眼可见的天象（流星雨最佳观测、月食为什么是红色的）、太阳系的惊人事实（木星的大红斑已经缩小了多少、土星环正在消失）、宇宙尺度感（光年到底多远、可观测宇宙有多大）、天文发现的故事（冥王星为什么被降级、引力波的探测历程）。避免过于抽象的理论天体物理。`,

  'geography': `## 内容方向
聚焦"为什么这里是这样的"——地理决定论的有趣案例。优先覆盖：极端地理（地球上最热/最冷/最干的地方为什么在那里）、城市规划的地理逻辑（为什么成都吃辣而上海不吃）、自然灾害的地理原因（地震带的分布规律）、气候与文明的关联（季风如何塑造了中国历史）。用地图思维讲地理，避免罗列数据。`,

  'politics': `## 内容方向
聚焦政治制度和权力运作的机制，不讨论具体政治立场。优先覆盖：选举制度的数学（为什么不同投票规则会产生不同结果）、权力制衡的设计智慧（为什么要有三权分立）、政治哲学的核心问题（自由与公平的张力）、国际政治的分析框架（博弈论视角看国家行为）。保持中立学术立场，不偏向任何政治阵营。`,

  'biology': `## 内容方向
聚焦生命现象的"为什么"和"怎么做到的"。优先覆盖：人体冷知识（胃酸能溶解金属吗、为什么人类是唯一会脸红的动物）、进化论的日常证据（为什么你的尾骨还在、盲肠不是废物）、微观世界的战争（免疫系统如何识别敌人、病毒为什么那么"聪明"）、基因与遗传（为什么你可能拥有尼安德特人基因）。cardType 优先 concept。`,

  'philosophy': `## 内容方向
用日常场景引出哲学问题，而非直接讲哲学家理论。优先覆盖：个人身份问题（你的细胞七年全部替换一次，你还是你吗？）、自由意志（如果大脑在你"决定"之前就做好了选择，自由意志存在吗？）、伦理困境（电车难题的真实变体——自动驾驶汽车该怎么选）、美学（为什么有些东西就是丑？美的标准是谁定的？）。避免变成哲学史课。`,

  'literature': `## 内容方向
聚焦"作家是怎么做到的"——文学技巧与创作智慧。优先覆盖：叙事技巧的拆解（为什么《百年孤独》的开头被称为史上最佳）、文学中的心理学（陀思妥耶夫斯基如何写犯罪心理）、修辞的力量（为什么"人生如梦"比"人生短暂"更有感觉）、跨文化文学对话（村上春树为什么受美国人欢迎）。避免纯书评或剧透式介绍。`,

  'art': `## 内容方向
教读者"怎么看"而不是"什么好看"。优先覆盖：艺术鉴赏的方法论（构图三分法、色彩心理学在绘画中的应用）、艺术史的转折点（印象派为什么被骂、杜尚的小便池为什么改变了艺术）、东西方美学差异（留白 vs 写实各自的美学逻辑）、当代艺术的解码（行为艺术到底在表达什么）。避免"这个值几个亿"式的八卦。`,

  'music': `## 内容方向
聚焦音乐背后的科学与文化，而非音乐欣赏指南。优先覆盖：音乐的数学基础（为什么某些和弦好听、十二平均律是怎么来的）、音乐与大脑（为什么某首歌会让你想起特定记忆、绝对音感是天赋还是训练）、乐器的故事（钢琴为什么有88个键、吉他为什么是六根弦）、音乐风格演变（爵士乐是怎么从黑人灵歌诞生的）。`,

  'mathematics': `## 内容方向
聚焦"数学如何解释日常生活"而非解题技巧。优先覆盖：概率错觉（生日悖论为什么反直觉、买彩票的真实概率）、数学之美（斐波那契数列在向日葵中的出现、黄金比例的争议）、实用数学（复利计算、样本量的统计陷阱）、未解之谜（黎曼猜想对互联网安全意味着什么）。避免公式推导，用可视化和比喻解释数学。`,

  'ecology': `## 内容方向
聚焦生态系统的"蝴蝶效应"和人与自然的关系。优先覆盖：生态链的连锁反应（黄石公园重新引入狼之后发生了什么）、极端生态（深海热泉生物如何不依赖阳光存活）、人类影响的数据化（一张牛肉汉堡消耗了多少水资源）、生态修复的真实案例（切尔诺贝利30年后反而成了野生动物天堂）。用数据和故事，避免说教式环保。`,

  'animals': `## 内容方向
聚焦动物行为的"为什么"和"怎么做到的"。优先覆盖：超能力的动物（螳螂虾的视觉能看到人类看不到的颜色、候鸟如何跨越半个地球导航）、动物社会的智慧（蚂蚁的群体决策、乌鸦会记仇也会感恩）、动物的错觉（金鱼的记忆其实有几个月、狗并不理解你的话只是读懂表情）、进化奇观（为什么袋鼠只能向前跳、章鱼为什么有三颗心脏）。`,

  'plants': `## 内容方向
聚焦植物的"隐藏能力"和与人类的关联。优先覆盖：植物的感知能力（含羞草的电信号、向日葵如何追踪太阳）、植物之间的化学战（为什么某些植物旁边种不了其他植物）、极端植物（千岁兰为什么能活2000年、捕蝇草的闭合速度有多快）、日常植物冷知识（香蕉其实是浆果、草莓其实不是浆果）。避免植物图鉴式的罗列。`,

  'food': `## 内容方向
聚焦食物背后的科学与文化故事。优先覆盖：食物科学（美拉德反应为什么让食物变香、为什么冷藏的番茄不好吃）、饮食文化（筷子为什么在东亚普及、咖啡如何从非洲走向全球）、食品安全真相（"保质期"的真实含义、有机食品和普通食品的营养差异）、烹饪中的化学（为什么打发蛋清要无油无水、酸为什么能让肉变嫩）。`,

  'sports': `## 内容方向
聚焦运动科学和体育背后的原理，而非赛事报道。优先覆盖：运动生理学（为什么短跑选手不能跑马拉松、肌肉记忆的真正机制）、体育规则的演变（足球越位规则为什么改了那么多次、篮球三分线是怎么来的）、运动装备科技（碳板跑鞋为什么被争议、泳衣科技为什么被禁）、极限运动的数据（自由落体的终端速度是多少、人类百米极限在哪里）。`,

  'military': `## 内容方向
聚焦军事战略思想和军事科技，而非战争歌颂。优先覆盖：战略经典（孙子兵法在商业中的应用、闪电战的真正逻辑）、军事科技演变（雷达如何改变了二战、隐形飞机的原理）、后勤与地理（为什么拿破仑和希特勒都败在俄罗斯冬天）、现代军事趋势（无人机如何改变战场规则、信息战的本质）。保持客观学术视角，不美化战争。`,

  'education': `## 内容方向
聚焦学习科学和高效学习方法论。优先覆盖：记忆的科学（间隔重复为什么有效、遗忘曲线的原理）、注意力与专注力（番茄钟背后的认知科学、多任务处理为什么是个神话）、学习风格研究（"视觉型学习者"为什么是伪科学）、动机心理学（内在动机 vs 外在奖励、为什么"兴趣"是最好的老师但也最脆弱）。cardType 优先 concept 和 experiment。`,

  'communication': `## 内容方向
聚焦信息传播的机制和媒体素养。优先覆盖：传播学经典理论（议程设置——媒体如何决定你关注什么、沉默螺旋——为什么你不敢表达少数意见）、谣言传播的数学（为什么假新闻比真新闻传播快6倍）、广告的心理学（锚定定价、稀缺效应在营销中的应用）、新媒体机制（算法推荐的信息茧房效应、病毒式传播的结构特征）。`,

  'scientific-method': `## 内容方向
聚焦科学思维的工具箱。优先覆盖：实验设计的智慧（双盲实验为什么要"双盲"、对照组为什么不可少）、科学发现的意外（青霉素、微波炉是怎么被"意外"发现的）、伪科学鉴别术（如何识别数据造假、相关性不等于因果性）、科学史的教训（放血疗法为什么流行了两千年、冷冻融合为什么是骗局）。cardType 优先 experiment。`,

  'data-thinking': `## 内容方向
聚焦日常场景中的数据思维训练。优先覆盖：统计陷阱（辛普森悖论——为什么分组数据和总体数据结论相反）、可视化的欺骗（坐标轴截断如何扭曲你的判断）、概率直觉（为什么"几乎肯定"不等于100%、贝叶斯思维在日常中的应用）、大数据的真相（推荐算法是怎么猜到你喜欢什么的）。每张卡片必须包含具体数据或统计案例。`,

  'architecture': `## 内容方向
聚焦"建筑如何塑造我们的生活"。优先覆盖：建筑力学的故事（为什么比萨斜塔没倒、台北101的阻尼球如何抗震）、空间心理学（天花板高度如何影响创造力、为什么宜家的路线设计让你买更多）、建筑与文化（四合院的等级密码、哥特教堂为什么那么高）、未来建筑（垂直森林、3D打印房子到了什么阶段）。`,

  'design-thinking': `## 内容方向
聚焦设计方法论和设计改变生活的案例。优先覆盖：用户体验的核心原则（为什么门把手不需要说明书就是好设计、费茨定律在按钮设计中的应用）、设计迭代（从失败到成功的产品案例、A/B测试的真实故事）、设计伦理（暗黑模式为什么让人讨厌、无障碍设计的价值）、跨领域设计思维（IDEO如何用设计思维改造超市购物车）。`,

  'daily-life': `## 内容方向
聚焦"你可能每天都在做但不知道为什么"的生活知识。优先覆盖：日用品的隐藏设计（橡皮擦蓝色那头的真正用途、牛仔裤铆钉的历史原因）、家居科学（为什么新装修的房子有味道、冰箱不是什么都能放）、常识辟谣（头发会越剃越粗吗、感冒是因为着凉吗）、生活小技巧的科学原理（小苏打为什么能除味、盐水洗水果真的有用吗）。`,

  'healthy-living': `## 内容方向
聚焦有科学依据的健康建议，不追求点击率。优先覆盖：睡眠科学（为什么不是所有人都需要8小时、蓝光对睡眠的真实影响程度）、饮食科学（轻断食的证据等级、代糖到底安不安全）、运动建议（久坐一小时等于抽两根烟？原始论文到底怎么说的）、心理健康（社交焦虑和内向的区别、正念冥想的神经科学证据）。所有建议必须标注证据等级。`,

  'emotional-intelligence': `## 内容方向
聚焦情绪科学和沟通方法论，而非鸡汤。优先覆盖：情绪识别（微表情的科学证据与局限、语调比内容更影响说服力）、冲突化解（非暴力沟通的四步框架、为什么"我理解你"反而可能激怒对方）、同理心的神经基础（镜像神经元如何让我们"感同身受"）、社交技巧的心理学（为什么暴露弱点反而增加信任、谈判中的锚定策略）。`,

  'cognitive-biases': `## 内容方向
每个偏误必须用真实场景讲解，不只是下定义。优先覆盖：决策偏误（沉没成本——为什么你舍不得退难看的电影票、确认偏误——为什么你只看到自己想看到的）、记忆偏误（峰终定律——为什么一段痛苦的经历回忆起来没那么痛苦）、社会偏误（达克效应——为什么最不懂的人最自信）。每张卡片必须包含一个"你中了没有"的自测场景。`,

  'game-theory': `## 内容方向
聚焦博弈论在日常决策中的应用。优先覆盖：经典博弈（囚徒困境——为什么合作比背叛难、智猪博弈——为什么小公司更适合跟跑）、策略思维（承诺策略——为什么"破釜沉舟"是理性的、信号博弈——为什么学历是一种信号）、现实博弈（拍卖的赢家诅咒、为什么餐厅集中在同一条街）。每张卡片必须用一个具体场景引入。`,

  'mythology': `## 内容方向
聚焦神话背后的文化密码和人类学意义。优先覆盖：创世神话的共性（为什么世界各地的洪水神话如此相似）、神话与心理（荣格的原型理论、俄狄浦斯情结的神话根源）、中国神话体系（山海经中的地理密码、道教神仙体系的官职逻辑）、北欧/希腊神话的现代影响（为什么漫威的雷神和神话差距那么大）。避免只讲故事不分析。`,

  'criminology': `## 内容方向
聚焦犯罪学和法医学的科学方法。优先覆盖：犯罪心理画像（它的科学有效性到底如何、连环杀手是否有共同心理特征）、法医技术（DNA证据如何推翻冤案、弹道分析能告诉我们什么）、犯罪统计学（破窗理论的真实效果、为什么大多数犯罪是冲动性的）、历史名案分析（开膛手杰克为什么抓不到、名侦探的真实原型）。保持客观，不美化犯罪。`,

  'paradoxes': `## 内容方向
聚焦悖论和思维实验如何推动人类认知。优先覆盖：经典悖论的现代版本（忒修斯之船——你的手机换了所有零件还是原来那部吗）、物理悖论（薛定谔的猫到底想说明什么、祖父悖论的多重宇宙解法）、数学悖论（希尔伯特旅馆——满房的旅馆如何再住进一个人）、伦理思维实验（缸中之脑——你怎么证明现实不是模拟的）。每个悖论必须讲清楚"为什么它是悖论"和"它逼出了什么理论突破"。`,

  'logical-fallacies': `## 内容方向
聚焦日常论证中的推理漏洞，培养批判性思维。优先覆盖：因果谬误（相关不等于因果的经典案例）、诉诸类谬误（诉诸权威——专家在领域外说的话也权威吗、诉诸大众——大家都相信的就是对的吗）、转移视线类（稻草人谬误——为什么网上吵架总是吵偏、红鲱鱼——如何识别故意转移话题）、循环论证（为什么"因为规矩是这样"不是论证）。每张卡片必须配一个社交媒体/网络讨论中的真实案例。`,

  'lost-civilizations': `## 内容方向
聚焦消失文明的考古证据和历史推理。优先覆盖：著名失落文明（玛雅为什么放弃了宏伟的城市、复活节岛文明的兴衰）、考古发现的故事（庞贝城被火山灰封存的24小时、三星堆为什么推翻了中原中心论）、文明衰落的原因（环境崩溃、资源枯竭的外力 vs 内部腐败的内力）、争议性发现（哥贝克力石阵为什么改写了文明时间线）。必须基于考古证据，不接受外星人建造论。`,

  'materials-science': `## 内容方向
聚焦日常物品背后隐藏的材料故事。优先覆盖：改变世界的材料（玻璃如何改变了人类文明的进程、钢铁为什么塑造了现代城市）、材料性能的有趣原理（为什么橡皮筋会老化、不锈钢为什么不锈）、未来材料（石墨烯到底能做什么、自修复材料发展到哪一步了）、材料与灾难（泰坦尼克号的钢材问题、挑战者号的O型圈）。用"你正在使用的XX"开头引入。`,

  'cybersecurity': `## 内容方向
聚焦网络安全原理和个人防护意识。优先覆盖：攻击手法科普（钓鱼攻击的心理学设计、勒索软件如何加密你的文件）、密码学基础（哈希函数为什么不可逆、HTTPS的握手过程）、隐私保护（浏览器指纹是什么、为什么手机能监听你附近的广告）、历史事件（Stuxnet如何物理摧毁伊朗离心机、WannaCry为什么一个周末席卷全球）。cardType 优先 concept 和 event。`,
}

function getCategoryGuide(category: Category): string {
  return CATEGORY_GUIDES[category] || ''
}

export function buildQuizPrompt(
  cards: { title: string; content: string; category: string; oneLiner: string }[],
  difficulty: string
): string {
  const diffLabel: Record<string, string> = {
    beginner: '入门（简单回忆知识点）',
    intermediate: '进阶（运用知识分析场景）',
    advanced: '专业（深度推理与辨析）',
  }
  const cardsText = cards.map((c, i) =>
    `### 卡片${i + 1}: ${c.title}\n分类: ${c.category}\n简介: ${c.oneLiner}\n内容摘要: ${c.content.slice(0, 500)}...`
  ).join('\n\n')

  return `你是一个知识测验出题专家。请基于以下知识卡片内容，生成一道选择题。

## 素材卡片
${cardsText}

## 难度要求
${diffLabel[difficulty] || '入门（简单回忆知识点）'}

## 出题规则
1. 题目必须基于上述卡片中的真实知识点，不能使用卡片以外的常识
2. 用一个生活化的场景包装题目，让用户代入情境
3. 4个选项 (a/b/c/d)，恰好一个正确答案
4. 错误选项要有迷惑性，但不能是"部分正确"的模糊选项
5. 解析要引用素材卡片的知识点，帮助用户理解为什么选这个
6. relatedCardIds 填入素材卡片的ID（如果有）

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "quiz-${Date.now()}",
  "question": "简洁明了的题目（一句话）",
  "scenario": "生活化场景描述，包装成小故事",
  "options": [
    {"id": "a", "text": "选项文本"},
    {"id": "b", "text": "选项文本"},
    {"id": "c", "text": "选项文本"},
    {"id": "d", "text": "选项文本"}
  ],
  "correctAnswer": "正确选项的id (a/b/c/d)",
  "explanation": "详细解析，引用卡片知识点，200字以内",
  "relatedCards": ["素材卡片ID"],
  "category": "主素材卡片的分类id",
  "difficulty": "${difficulty}"
}`
}

function buildTagCoverageMap(cards: ExistingCardSummary[]) {
  const tagCounts = new Map<string, number>()
  const cardTypeCounts: Partial<Record<CardType, number>> = {}

  for (const card of cards) {
    for (const tag of card.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
    if (card.cardType) {
      cardTypeCounts[card.cardType] = (cardTypeCounts[card.cardType] || 0) + 1
    }
  }

  const coveredTags = [...tagCounts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  return { tagCounts, coveredTags, cardTypeCounts }
}

export function buildCardPrompt(category: Category, existingCards: ExistingCardSummary[], topicHint?: { title: string; oneLiner: string }): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''

  // Token control: cap at 30 cards
  const cardsToAnalyze = existingCards.length > 30 ? existingCards.slice(-30) : existingCards

  const topicHintSection = topicHint
    ? `\n## 指定主题（必须围绕此主题生成）\n- 主题: ${topicHint.title}\n- 简介: ${topicHint.oneLiner}\n\n请专门围绕这个具体方向生成卡片，而不是随机选择话题。主题指令优先于"避免重复"规则。`
    : ''

  // --- Topic coverage analysis ---
  const coverage = buildTagCoverageMap(cardsToAnalyze)

  const existingCardsList = cardsToAnalyze.length > 0
    ? cardsToAnalyze.map((c, i) =>
        `${i + 1}. 「${c.title}」${c.oneLiner ? ' — ' + c.oneLiner : ''} [类型:${CARD_TYPE_LABELS[c.cardType] || c.cardType}] [标签:${c.tags.join('、') || '无'}]`
      ).join('\n')
    : '（暂无卡片，这是该分类的第一张）'

  const coveredTagsSection = coverage.coveredTags.length > 0
    ? `\n### 已充分覆盖的主题标签（优先避开这些方向）\n${coverage.coveredTags.map(t => `- ${t} (${coverage.tagCounts.get(t)}张)`).join('\n')}`
    : ''

  const usedTypes = Object.entries(coverage.cardTypeCounts)
    .map(([type, count]) => `${CARD_TYPE_LABELS[type as CardType] || type}: ${count}张`)
    .join('、')
  const unusedTypes = (Object.keys(CARD_TYPE_LABELS) as CardType[])
    .filter(t => !coverage.cardTypeCounts[t])
    .map(t => CARD_TYPE_LABELS[t])
    .join('、')

  const typeSection = usedTypes
    ? `\n### 已有卡片类型分布\n已使用: ${usedTypes}${unusedTypes ? `\n未使用: ${unusedTypes}` : ''}`
    : ''

  const diversitySection = cardsToAnalyze.length > 0
    ? `
## 多样性要求（重要！）
1. **角度差异化**：新卡片必须从与已有卡片不同的角度切入。已覆盖的方向：${coverage.coveredTags.slice(0, 8).join('、') || '无'}。请探索未被触及的子话题。
2. **类型多样化**：${unusedTypes ? `优先考虑「${unusedTypes}」类型的卡片。` : '已有类型分布较均匀，选择最适合内容的类型即可。'}
3. **标签新颖性**：新卡片的 tags 中至少包含一个从未出现过的标签。
4. **禁止换皮重复**：不要把已有知识点换个说法（如"XX的本质""XX背后的真相""XX的底层逻辑"）当新卡片。`
    : ''

  return `你是一个知识科普内容创作专家。请为「万象研究所」知识卡片平台生成一张全新的知识卡片。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}
${topicHintSection}
${getCategoryGuide(category)}
## 已有卡片及覆盖情况
${existingCardsList}
${coveredTagsSection}
${typeSection}
${diversitySection}

## 内容结构规范（必须严格遵循以下六步结构）

### 第1步：开头钩子（Hook）
- 不要直接给定义，先用反直觉问题、日常场景或"你以为…其实…"句式制造兴趣
- 例：为什么你越努力刷短视频，越停不下来？

### 第2步：一句话讲清「它是什么」
- 极度压缩 + 口语化，追求"第一次听懂"而非学术严谨
- 例：多巴胺其实就是一种让你"还想再来一次"的信号。

### 第3步：生活例子建立直觉
- 用大家都经历过的日常场景，让人产生"哦我懂了"的感觉
- 科普最重要的是"让人有感觉"，不是"理解全部逻辑"

### 第4步：小解释（控制深度）
- 只讲"最关键的一层"原理，不展开复杂推导
- 让读者理解"为什么会这样"，但不深陷细节

### 第5步：反常识/误区（记忆点）
- 指出一个大众常见的误解
- 例：不是快乐让你刷视频，而是"期待下一次快乐"让你停不下来。

### 第6步：现实意义收尾
- 告诉读者这和他有什么关系：行为建议、认知升级或生活应用
- 让知识落地，不是飘在空中

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "${category}-xxx（3位数字，从现有最大号+1开始）",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "oneLiner": "用一句话勾起好奇心（不超过50字，要像钩子一样吸引人，不要平铺直叙的定义）",
  "category": "${category}",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "beginner 或 intermediate 或 advanced",
  "cardType": "concept 或 person 或 event 或 experiment 或 principle",
  "content": "Markdown格式，严格按照六步结构撰写。用 ## 作为每步的标题，具体标题如下：\n## 你有没有想过…\n（第1步：钩子，用一个反直觉问题或日常场景开头）\n\n## 一句话说清楚\n（第2步：口语化的一句话解释）\n\n## 生活中的影子\n（第3步：2-3个日常例子，让人产生直觉）\n\n## 背后的小原理\n（第4步：只讲最关键的一层，不深入推导）\n\n## 你可能一直搞错了\n（第5步：指出一个常见误区或反常识点）\n\n## 所以呢？\n（第6步：现实意义，给读者一个行为建议或认知升级）\n\n总字数400-600字，语言风格：像朋友聊天一样，避免学术腔。",
  "keyData": [
    {"label": "数据标签", "value": "数据值", "description": "简短说明"}
  ],
  "references": [
    {"id": 1, "title": "参考书目/资料", "author": "作者"}
  ]
}

要求：
1. 严格遵循六步结构，每步都要有实质内容
2. 语言风格：像朋友聊天，不用学术腔，不用"综上所述""值得注意的是"这类书面语
3. oneLiner 要像钩子——让人想点进来看，不要写成维基百科式的定义
4. content 中的六个 ## 标题必须使用上面指定的固定标题，不要自创标题
5. keyData 提供 2-4 个核心数据点，数据要真实可信
6. references 提供 1-3 个参考来源
7. 新卡片必须与已有卡片形成互补，覆盖不同的子话题或角度`
}

export function buildProgressiveCardPrompt(
  category: Category,
  targetDifficulty: Difficulty,
  existingCards: ExistingCardSummary[],
  prerequisiteKnowledge: string[] = [],
  topicHint?: { title: string; oneLiner: string },
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''

  const diffInstruction: Record<Difficulty, string> = {
    beginner: `## 难度要求：入门级（beginner）
- 假设读者完全没有技术背景，对"${catName}"领域一无所知
- 只使用日常比喻和生活中的例子来解释概念
- 避免使用任何专业术语（如果必须用，必须立即用通俗语言解释）
- 目标：让一个路人读完能产生"哦原来是这样"的感觉`,

    intermediate: `## 难度要求：进阶级（intermediate）
- 假设读者已经理解以下基础概念：${prerequisiteKnowledge.length > 0 ? prerequisiteKnowledge.map(t => `「${t}」`).join('、') : '该领域的基础知识'}
- 在这些基础之上展开，不要重复入门级内容
- 可以引入技术术语，但首次出现时必须给出通俗定义
- 目标：让有基础的读者理解"为什么会这样"的机制，建立技术直觉`,

    advanced: `## 难度要求：专业级（advanced）
- 假设读者已掌握进阶概念：${prerequisiteKnowledge.length > 0 ? prerequisiteKnowledge.map(t => `「${t}」`).join('、') : '该领域的技术基础'}
- 直接使用专业术语，不需要逐一解释基础概念
- 侧重于：实践方法论、工具使用、工程权衡、行业标准
- 目标：让专业学习者获得可以直接应用的知识和技能`,
  }

  const cardsToAnalyze = existingCards.length > 30 ? existingCards.slice(-30) : existingCards
  const coverage = buildTagCoverageMap(cardsToAnalyze)

  const existingCardsList = cardsToAnalyze.length > 0
    ? cardsToAnalyze.map((c, i) =>
        `${i + 1}. 「${c.title}」${c.oneLiner ? ' — ' + c.oneLiner : ''} [难度:${c.difficulty || '?'}] [类型:${CARD_TYPE_LABELS[c.cardType] || c.cardType}]`
      ).join('\n')
    : '（暂无卡片，这是该分类的第一张）'

  const topicHintSection = topicHint
    ? `\n## 指定主题（必须围绕此主题生成）\n- 主题: ${topicHint.title}\n- 简介: ${topicHint.oneLiner}\n\n请专门围绕这个具体方向生成卡片。主题指令优先于"避免重复"规则。`
    : ''

  const coveredTagsSection = coverage.coveredTags.length > 0
    ? `\n### 已充分覆盖的主题标签（优先避开）\n${coverage.coveredTags.slice(0, 6).map(t => `- ${t}`).join('\n')}`
    : ''

  return `你是一个知识科普内容创作专家。请为「万象研究所」知识卡片平台生成一张**指定难度**的知识卡片。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}
${topicHintSection}
${getCategoryGuide(category)}

${diffInstruction[targetDifficulty]}

## 已有卡片（同难度方向的卡片请避免重复，不同难度的可以深化）
${existingCardsList}
${coveredTagsSection}

## 内容结构规范（必须严格遵循以下六步结构）

### 第1步：开头钩子（Hook）
- 不要直接给定义，先用反直觉问题、日常场景或"你以为…其实…"句式制造兴趣

### 第2步：一句话讲清「它是什么」
- 极度压缩 + 口语化，追求"第一次听懂"而非学术严谨

### 第3步：生活例子建立直觉
- 用日常场景让人产生"哦我懂了"的感觉

### 第4步：小解释（控制深度）
- 只讲"最关键的一层"原理，不展开复杂推导

### 第5步：反常识/误区（记忆点）
- 指出一个大众常见的误解

### 第6步：现实意义收尾
- 告诉读者这和他有什么关系

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "${category}-xxx（3位数字，从现有最大号+1开始）",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "oneLiner": "用一句话勾起好奇心（不超过50字）",
  "category": "${category}",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "${targetDifficulty}",
  "cardType": "concept 或 person 或 event 或 experiment 或 principle",
  "content": "Markdown格式，严格按照六步结构撰写。用 ## 作为每步的标题：\n## 你有没有想过…\n## 一句话说清楚\n## 生活中的影子\n## 背后的小原理\n## 你可能一直搞错了\n## 所以呢？\n\n总字数${targetDifficulty === 'advanced' ? '600-800字' : '400-600字'}，语言风格：像朋友聊天一样。",
  "keyData": [
    {"label": "数据标签", "value": "数据值", "description": "简短说明"}
  ],
  "references": [
    {"id": 1, "title": "参考书目/资料", "author": "作者"}
  ]
}

要求：
1. difficulty 必须填写 "${targetDifficulty}"，这是硬性要求
2. 严格遵循六步结构，每步都要有实质内容
3. oneLiner 要像钩子——让人想点进来看
4. keyData 提供 2-4 个核心数据点
5. references 提供 1-3 个参考来源
6. 新卡片必须与已有卡片形成互补`
}

export function buildProgressivePathPrompt(
  category: Category,
  targetDifficulty: Difficulty,
  existingPaths: string[],
  existingCards: { id: string; title: string; oneLiner: string; difficulty?: string }[],
  prerequisiteCardTitles: string[] = [],
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''
  const catColor = catMeta?.color || '#FFB3BA'

  const diffLabel: Record<Difficulty, string> = {
    beginner: '入门（基础概念，零门槛）',
    intermediate: '进阶（技术原理，需要基础概念前置）',
    advanced: '专业（实践技能与方法论，需要技术基础前置）',
  }

  const prerequisiteSection = prerequisiteCardTitles.length > 0
    ? `\n## 学习者已掌握的前置知识\n${prerequisiteCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n路径中的卡片内容应建立在这些前置知识之上，不要重复基础内容。`
    : ''

  return `你是一个知识学习路径设计专家。请为「万象研究所」知识卡片平台生成一条**指定难度等级**的学习路径（技能树）。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}

## 目标难度
- 难度: ${diffLabel[targetDifficulty]}
- 路径中**所有节点**的难度必须是 "${targetDifficulty}"

## 已有路径标题（请勿重复）
${existingPaths.length > 0 ? existingPaths.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无路径）'}
${prerequisiteSection}

## 该分类已有知识卡片（优先复用同难度的卡片）
${existingCards.length > 0 ? existingCards.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.title} — ${c.oneLiner} [难度:${c.difficulty || '?'}]`).join('\n') : '（暂无卡片）'}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "path-${category}-xxx",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "description": "路径描述（50-100字，说明这条路径覆盖什么、适合谁）",
  "category": "${catName}",
  "categorySlug": "${category}",
  "icon": "lucide图标名称",
  "color": "${catColor}",
  "difficulty": "${targetDifficulty}",
  "estimatedTime": "预估学习时间（如 30 分钟）",
  "nodes": [
    {
      "id": "n1（从n1开始递增）",
      "cardId": "复用已有卡片时填卡片ID，新建卡片时填 null",
      "cardTitle": "知识概念名称（中文名）",
      "cardOneLiner": "像钩子一样勾起好奇心的短句（不超过50字）",
      "cardType": "concept 或 person 或 event 或 experiment 或 principle",
      "cardDifficulty": "${targetDifficulty}",
      "cardTags": ["中文标签1", "中文标签2"],
      "cardContent": "当 cardId 为 null 时必填：Markdown格式，严格按六步科普结构撰写，${targetDifficulty === 'advanced' ? '600-800字' : '400-600字'}。当 cardId 有值时可留空字符串",
      "cardKeyData": [
        {"label": "数据标签", "value": "数据值", "description": "简短说明"}
      ],
      "cardReferences": [
        {"id": 1, "title": "参考书目/资料", "author": "作者"}
      ],
      "type": "required 或 optional 或 bonus",
      "position": {"x": 数字, "y": 数字}
    }
  ],
  "edges": [
    {"from": "n1", "to": "n2", "type": "prerequisite 或 related"}
  ],
  "tags": ["中文标签1", "中文标签2"]
}

要求：
1. 生成 4-8 个节点，形成有层次的知识树
2. 节点 position 要合理分布（x: 50-400, y: 40-400），形成从上到下的树形结构
3. **所有节点的 cardDifficulty 必须是 "${targetDifficulty}"**——这是硬性要求
4. edges 要体现学习先后关系
5. 优先复用已有卡片（cardId 设为已有卡片ID），没有对应卡片则新建（cardId 设为 null）
6. 新建卡片必须提供完整内容
7. 所有标签使用中文
8. icon 使用 lucide 图标名称，不要使用 emoji`
}

export function buildPathPrompt(category: Category, existingPaths: string[], existingCards: {id: string, title: string, oneLiner: string}[]): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category
  const catDesc = catMeta?.description || ''
  const catColor = catMeta?.color || '#FFB3BA'

  return `你是一个知识学习路径设计专家。请为「万象研究所」知识卡片平台生成一条全新的学习路径（技能树）。

## 目标领域
- 分类: ${catName} (${category})
- 描述: ${catDesc}

## 已有路径标题（请勿重复）
${existingPaths.length > 0 ? existingPaths.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无路径）'}

## 该分类已有知识卡片（优先复用）
${existingCards.length > 0 ? existingCards.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.title} — ${c.oneLiner}`).join('\n') : '（暂无卡片）'}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "path-${category}-xxx",
  "slug": "英文短横线slug",
  "title": "中文标题",
  "description": "路径描述（50-100字）",
  "category": "${catName}",
  "categorySlug": "${category}",
  "icon": "lucide图标名称（如 lucide:book-open, lucide:brain, lucide:flask-conical 等）",
  "color": "${catColor}",
  "difficulty": "beginner 或 intermediate 或 advanced",
  "estimatedTime": "预估学习时间（如 30 分钟）",
  "nodes": [
    {
      "id": "n1（从n1开始递增）",
      "cardId": "复用已有卡片时填卡片ID，新建卡片时填 null",
      "cardTitle": "知识概念名称（中文名）",
      "cardOneLiner": "像钩子一样勾起好奇心的短句（不超过50字，不要平铺直叙的定义）",
      "cardType": "concept 或 person 或 event 或 experiment 或 principle",
      "cardDifficulty": "beginner 或 intermediate 或 advanced",
      "cardTags": ["中文标签1", "中文标签2", "中文标签3"],
      "cardContent": "当 cardId 为 null 时必填：Markdown格式，严格按六步科普结构撰写，400-600字。六个固定标题：## 你有没有想过…（钩子）→ ## 一句话说清楚（口语化解释）→ ## 生活中的影子（日常例子）→ ## 背后的小原理（只讲最关键一层）→ ## 你可能一直搞错了（反常识/误区）→ ## 所以呢？（现实意义）。风格：像朋友聊天，不用学术腔。当 cardId 有值时可留空字符串",
      "cardKeyData": [
        {"label": "数据标签", "value": "数据值", "description": "简短说明"}
      ],
      "cardReferences": [
        {"id": 1, "title": "参考书目/资料", "author": "作者"}
      ],
      "type": "required 或 optional 或 bonus",
      "position": {"x": 数字, "y": 数字}
    }
  ],
  "edges": [
    {"from": "n1", "to": "n2", "type": "prerequisite 或 related"}
  ],
  "tags": ["中文标签1", "中文标签2"]
}

要求：
1. 生成 4-8 个节点，形成有层次的知识树
2. 节点 position 要合理分布（x: 50-400, y: 40-400），形成从上到下的树形结构
3. edges 要体现学习先后关系
4. 优先从已有知识卡片中选择合适的卡片复用（将 cardId 设为已有卡片ID），如果某个知识概念没有对应已有卡片则新建（cardId 设为 null）
5. 新建卡片（cardId 为 null）必须提供完整内容：cardContent 至少300字 Markdown，cardKeyData 2-4个核心数据点，cardReferences 1-3个参考来源
6. 所有标签（tags 和 cardTags）必须使用中文，与该领域知识点对齐
7. 确保根节点在顶部，叶子节点在底部
8. 至少 1 个 required 节点，可包含 optional 和 bonus 节点
9. icon 使用 lucide 图标名称，不要使用 emoji`
}

export function buildFunFactPrompt(
  cardTitles: { id: string; title: string; category: string }[],
  excludedTitles: string[]
): string {
  const cardsText = cardTitles.length > 0
    ? cardTitles.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.title} (${c.category})`).join('\n')
    : '（暂无卡片）'

  const excludedSection = excludedTitles.length > 0
    ? `\n## 已生成过的冷知识标题（请勿重复）\n${excludedTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : ''

  return `你是一个擅长挖掘反直觉冷知识的科普专家。请为「万象研究所」知识学习平台生成一条令人惊讶的"每日冷知识"。

## 要求
1. 选一个大众普遍以为"理所当然"但其实完全反过来的知识点
2. 标题要让人一看就想点进来（用"你知道吗…"/"为什么…"/"…其实…"等句式）
3. fact 是一句让人"哇"的反直觉陈述，不超过100字
4. explanation 是通俗易懂的科学解释，150-250字，像朋友聊天一样解释
5. 必须从以下知识卡片中选择 1-3 张与冷知识相关的卡片，填入 relatedCards
6. 不要生成过于冷门或没有科学依据的内容

## 平台已有知识卡片
${cardsText}
${excludedSection}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "title": "反直觉的标题（15字以内）",
  "fact": "让人惊讶的陈述（50-100字）",
  "explanation": "科学解释（150-250字，通俗易懂）",
  "relatedCards": ["关联的知识卡片ID"],
  "category": "最相关的分类id"
}`
}

export function buildFactCheckPrompt(claim: string, searchResults: TavilyResult[]): string {
  const hasResults = searchResults.length > 0

  if (hasResults) {
    const formattedResults = searchResults.map((r, i) =>
      `[${i + 1}] ${r.title}\nURL: ${r.url}\n摘要: ${r.content}`
    ).join('\n\n')

    return `你是一个专业的事实核查助手。以下是一个需要验证的说法，以及通过网络搜索获取的相关资料。

## 需要验证的说法
${claim}

## 搜索到的相关资料
${formattedResults}

## 任务
1. 拆解说法中的关键子观点
2. 基于搜索到的资料（必须引用具体来源编号），逐条验证
3. 给出总体判断和置信度
4. sources 中必须使用搜索结果中的真实 URL

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "claim": "原始说法",
  "verdict": "reliable 或 unreliable 或 partially-reliable 或 unverifiable",
  "confidence": 0到100的整数,
  "summary": "2-3句话的综合评估",
  "breakdown": [
    {"aspect": "子观点描述", "finding": "验证发现", "verdict": "confirmed 或 refuted 或 inconclusive"}
  ],
  "evidenceFor": [
    {"point": "支持的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "evidenceAgainst": [
    {"point": "反对的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "sources": [
    {"title": "来源标题", "url": "搜索结果中的真实URL", "snippet": "关键摘要", "type": "official 或 academic 或 media 或 reference", "reliability": "high 或 medium 或 low"}
  ],
  "keyTakeaways": ["要点1", "要点2"]
}

要求：
1. verdict 只能是 reliable / unreliable / partially-reliable / unverifiable
2. confidence 是 0-100 的整数
3. breakdown 至少包含 2 个子观点分析
4. evidenceFor 和 evidenceAgainst 至少各 1 条
5. sources 至少列出 2 个参考来源，必须使用搜索结果中的真实 URL
6. keyTakeaways 给出 2-4 条核心要点
7. 如果搜索资料不足以判断，verdict 应为 unverifiable，confidence 应低于 30
8. 所有文字使用中文`
  }

  // No search results — AI must rely on training data only
  return `你是一个专业的事实核查助手。以下是一个需要验证的说法。注意：本次未能通过网络搜索获取相关资料，你需要仅根据已有知识进行分析，并明确标注局限性。

## 需要验证的说法
${claim}

## 重要提示
本次未获取到网络搜索结果。请基于你的训练知识进行分析，但必须：
- 在 summary 中说明"本报告未联网搜索，仅基于 AI 训练数据"
- confidence 不超过 60
- sources 留空数组

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "claim": "原始说法",
  "verdict": "reliable 或 unreliable 或 partially-reliable 或 unverifiable",
  "confidence": 0到60的整数,
  "summary": "2-3句话的综合评估（必须说明未联网搜索）",
  "breakdown": [
    {"aspect": "子观点描述", "finding": "验证发现", "verdict": "confirmed 或 refuted 或 inconclusive"}
  ],
  "evidenceFor": [
    {"point": "支持的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "evidenceAgainst": [
    {"point": "反对的证据", "strength": "strong 或 moderate 或 weak"}
  ],
  "sources": [],
  "keyTakeaways": ["要点1", "要点2"]
}

要求：
1. verdict 只能是 reliable / unreliable / partially-reliable / unverifiable
2. confidence 不超过 60（因为未联网验证）
3. breakdown 至少包含 2 个子观点分析
4. evidenceFor 和 evidenceAgainst 至少各 1 条
5. sources 必须为空数组（因为没有真实搜索来源）
6. keyTakeaways 给出 2-4 条核心要点，第一条应提醒结果未经联网验证
7. 所有文字使用中文`
}

export function buildDeepDivePrompt(
  category: Category,
  cardTitle: string,
  cardContent: string,
  cardOneLiner: string,
  existingCardTitles: string[]
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category

  return `你是一个知识科普内容创作专家。用户已经阅读了一篇关于「${cardTitle}」的入门级知识卡片，现在希望深入学习。

## 原始卡片信息
- 标题: ${cardTitle}
- 一句话简介: ${cardOneLiner}
- 原始内容摘要:
${cardContent.slice(0, 800)}${cardContent.length > 800 ? '...' : ''}

## 目标领域
- 分类: ${catName} (${category})

## 已有卡片标题（请勿重复）
${existingCardTitles.length > 0 ? existingCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无卡片）'}

## 你的任务
生成一张关于「${cardTitle}」的**深入学习版**知识卡片。要求：
- 假设读者已经理解了基础概念，不要重复入门级内容
- 难度在原卡片基础上提升一级
- 内容字数 800-1200 字（比普通卡片更详细）
- 覆盖更深层次的知识：机制详解、学术视角、边界情况与争议

## 内容结构规范（必须严格遵循以下六步结构）

### 第1步：深入开头（Hook）
- 承接上一张卡片的知识，用"你已经知道了…但你知道更深层的原因吗？"式开头
- 制造新的好奇心缺口

### 第2步：核心机制
- 深入讲解底层原理和运作机制
- 可以涉及学术模型、数学公式（用通俗方式解释）

### 第3步：关键实验或案例
- 提供 1-2 个经典实验、重要研究或真实案例
- 让抽象原理变得具体可感

### 第4步：边界情况与争议
- 这个知识在什么条件下会失效？
- 学术界有哪些不同观点或争论？

### 第5步：与其他知识的关联
- 这个概念如何与其他领域或概念交叉
- 帮助读者建立知识网络

### 第6步：实践意义
- 给出更深入的行为建议或应用场景
- 读完之后读者能做什么原来做不到的事？

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "id": "${category}-xxx（3位数字，从现有最大号+1开始）",
  "slug": "英文短横线slug（与原卡片区分，加-deep后缀）",
  "title": "深入学习：${cardTitle}",
  "oneLiner": "用一句话勾起好奇心（不超过50字，暗示这是更深入的内容）",
  "category": "${category}",
  "tags": ["标签1", "标签2", "标签3"],
  "difficulty": "intermediate 或 advanced（必须比原卡片更难）",
  "cardType": "concept 或 person 或 event 或 experiment 或 principle",
  "content": "Markdown格式，严格按照六步深入结构撰写。用 ## 作为每步的标题，具体标题如下：\n## 你已经知道了…但\n（第1步：承接前知识，制造新的好奇心）\n\n## 背后的真正机制\n（第2步：深入底层原理，可涉及学术模型）\n\n## 关键实验与案例\n（第3步：经典实验或真实案例）\n\n## 什么时候它会失效？\n（第4步：边界情况、争议、不同学派观点）\n\n## 它如何连接更广的世界\n（第5步：跨领域关联，知识网络）\n\n## 读完你能做什么\n（第6步：深入的行为建议或应用）\n\n总字数800-1200字，语言风格：像导师带学生，可以适度使用专业术语但必须解释。",
  "keyData": [
    {"label": "数据标签", "value": "数据值", "description": "简短说明"}
  ],
  "references": [
    {"id": 1, "title": "参考书目/资料", "author": "作者"}
  ]
}

要求：
1. 严格遵循六步深入结构，每步都要有实质内容
2. 不要重复原卡片的入门级内容，假设读者已掌握基础知识
3. 语言可以适度学术化，但关键术语必须给出通俗解释
4. keyData 提供 3-5 个核心数据点，数据要真实可信
5. references 提供 2-4 个参考来源，可以包含论文或专著`
}

export function buildRelatedTopicsPrompt(
  category: Category,
  cardTitle: string,
  cardOneLiner: string,
  cardTags: string[],
  existingCardTitles: string[]
): string {
  const catMeta = CATEGORIES.find(c => c.id === category)
  const catName = catMeta?.name || category

  return `你是一个知识图谱专家。用户刚刚学习了一张知识卡片，希望拓展到相关的知识方向。

## 当前卡片
- 标题: ${cardTitle}
- 简介: ${cardOneLiner}
- 标签: ${cardTags.join('、')}
- 领域: ${catName} (${category})

## 已有卡片标题（推荐时请避开这些）
${existingCardTitles.length > 0 ? existingCardTitles.map((t, i) => `${i + 1}. ${t}`).join('\n') : '（暂无卡片）'}

## 你的任务
推荐 3 个与当前卡片相关的知识方向。要求：
1. 每个方向必须覆盖**不同的角度或维度**（例如：机制、应用、历史、人物、对比、前沿）
2. 方向之间不能互相重叠
3. 所有方向必须在「${catName}」领域内
4. 避免与已有卡片标题重复或过于相似
5. 每个方向应该是可以独立生成一张知识卡片的具体知识点

## 输出格式
请严格按以下 JSON 数组格式输出，不要包含任何其他文字：

[
  {
    "title": "知识方向标题（5-15字，具体而非泛泛）",
    "oneLiner": "一句话介绍（不超过50字，像钩子一样吸引人，暗示为什么这个方向值得探索）",
    "angle": "简述覆盖角度（如：底层机制、现实应用、历史起源、关键人物、跨领域对比、前沿研究）"
  },
  {
    "title": "第二个知识方向标题",
    "oneLiner": "一句话介绍",
    "angle": "覆盖角度"
  },
  {
    "title": "第三个知识方向标题",
    "oneLiner": "一句话介绍",
    "angle": "覆盖角度"
  }
]

要求：
1. 恰好输出 3 个方向，不要多也不要少
2. title 要具体（"多巴胺与成瘾机制"优于"成瘾"）
3. oneLiner 要有吸引力，让人想进一步了解
4. 三个 angle 必须各不相同`
}

export function buildDialogueSystemPrompt(): string {
  return `你是「万象研究所」的知心研究员。你的角色是一位温暖、有深度、不带评判的对话伙伴，擅长倾听和引导思考。

## 你的风格
- 像一位见多识广的老朋友，而不是心理咨询师或教练
- 善用哲学隐喻（斯多葛学派、存在主义、东方禅意、文学意象）来启发思考
- 倾听重于建议。先充分理解对方在说什么，再回应
- 不会给出"你应该..."的指令，而是用"你有没有想过..."来引导
- 适时分享跨学科的小知识（心理学、社会学、哲学、生物学），让对话有营养
- 回复长度适中（150-400字），不要长篇大论也不要过于简短

## 你的原则
1. 不做诊断、不开处方、不假装心理医生
2. 承认复杂问题的复杂性，不急于给出"正确答案"
3. 当对方陷入思维循环时，温和地引入新视角
4. 可以引用名言、故事、哲学思想来丰富对话
5. 当对方表达痛苦时，先共情，再引导
6. 语言自然温暖，像朋友聊天，不用学术腔`
}

export function buildReportPrompt(
  messages: { role: string; content: string }[],
  topic: string | null
): string {
  const transcript = messages.map(m =>
    `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`
  ).join('\n\n')

  const topicContext = topic ? `\n对话话题标签: ${topic}` : ''

  return `你是一位善于反思和总结的对话分析师。请回顾以下对话记录，生成一份详细的交流报告。

## 对话记录
${transcript}
${topicContext}

## 输出要求
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "keyThemes": ["主题1", "主题2", "主题3"],
  "emotionalJourney": "描述用户在对话中的情感变化轨迹（100-200字）",
  "insights": [
    {"title": "洞察标题", "description": "对用户处境的深层理解（50-100字）"}
  ],
  "suggestions": [
    {"title": "建议标题", "description": "具体可行的建议（50-100字）", "difficulty": "easy 或 moderate 或 ongoing"}
  ],
  "affirmations": ["温暖的肯定语1", "温暖的肯定语2"],
  "closingThought": "一段富有哲理的、鼓舞人心的结语（100-150字）"
}

要求：
1. keyThemes 提供 3-5 个核心主题关键词
2. insights 提供 3-5 条洞察，每条要深入而非表面
3. suggestions 提供 3-5 条建议，difficulty 表示执行难度（easy=立即可做, moderate=需要一些准备, ongoing=持续实践）
4. affirmations 提供 2-3 条温暖、个性化的肯定语
5. closingThought 要像一封真诚的来信的结尾，有力量但不鸡汤
6. 所有内容使用中文`
}

// ============================================
// Research (洞察) prompts
// ============================================

export function buildResearchRoadmapPrompt(
  topic: string,
  description: string,
  searchResults: TavilyResult[]
): string {
  const searchSection = searchResults.length > 0
    ? `## 网络搜索结果\n${searchResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.content}`).join('\n\n')}`
    : '（未获取到搜索结果，请基于训练知识回答）'

  return `你是一个深度研究向导。用户想要快速吃透一个陌生主题，你需要帮他画出一张学习路线图。

## 研究主题
${topic}

## 用户背景
${description || '（无额外说明）'}

${searchSection}

## 你的任务
基于主题和搜索结果，生成一份结构化的研究路线图。要求：
1. 覆盖该领域最核心的知识节点（文献、书籍、人物、概念、资源、最新进展）
2. 每个条目标注优先级：essential（必须了解）、recommended（推荐了解）、optional（锦上添花）
3. 给出该领域的核心问题和 3-5 个值得深入的角度

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "topicSummary": "AI 对这个主题范围的理解（50-100字）",
  "coreQuestion": "这个领域最核心的一个问题",
  "items": [
    {
      "id": "item-1",
      "type": "paper 或 book 或 person 或 concept 或 resource 或 recent-development",
      "title": "条目标题",
      "description": "这个条目是什么（50-100字）",
      "relevance": "为什么研究这个主题必须了解它（30-60字）",
      "priority": "essential 或 recommended 或 optional"
    }
  ],
  "suggestedAngles": ["角度1", "角度2", "角度3"]
}

要求：
1. items 提供 8-15 个条目，覆盖不同类型
2. 至少 2 个 essential、3 个 recommended
3. 每个 type 至少出现一次
4. suggestedAngles 给出 3-5 个深入方向
5. 所有文字使用中文
6. 如果有搜索结果，优先基于搜索结果推荐真实存在的文献和人物`
}

export function buildResearchQAPrompt(
  topic: string,
  question: string,
  contextNotes: { type: string; content: string }[]
): string {
  const notesSection = contextNotes.length > 0
    ? `## 用户已有的研究笔记\n${contextNotes.map((n, i) => `[${i + 1}] (${n.type}) ${n.content}`).join('\n')}`
    : '（用户还没有笔记）'

  return `你是一个研究助理，正在帮助用户深入研究「${topic}」这个主题。用户在阅读过程中遇到了一个具体问题。

${notesSection}

## 用户的问题
${question}

## 你的任务
直接回答用户的问题。要求：
1. 回答要具体，不要泛泛而谈
2. 如果能联系用户已有的笔记，请建立关联
3. 如果用户的问题暴露了一个常见的误解，温和地指出
4. 如果不确定，坦诚说明
5. 回答长度 100-300 字，像导师带学生一样`
}

export function buildResearchPanoramicPrompt(
  topic: string,
  description: string,
  roadmap: { items: { title: string; isRead: boolean; userNote: string }[] },
  notes: { type: string; content: string; aiResponse: string | null }[]
): string {
  const roadmapSummary = roadmap.items
    .map(i => `- ${i.title} ${i.isRead ? '[已读]' : '[未读]'}${i.userNote ? ` — 笔记: ${i.userNote}` : ''}`)
    .join('\n')

  const notesSummary = notes.map((n, i) => {
    let entry = `[${i + 1}] (${n.type}) ${n.content}`
    if (n.aiResponse) entry += `\n    AI回答: ${n.aiResponse.slice(0, 200)}`
    return entry
  }).join('\n')

  return `你是一个元分析研究员。用户正在研究「${topic}」这个主题，已经积累了一些材料。请全盘审视，生成一份全景分析。

## 研究主题
${topic}
${description ? `\n## 研究背景\n${description}` : ''}

## 路线图进度
${roadmapSummary}

## 研究笔记（共 ${notes.length} 条）
${notesSummary}

## 你的任务
横向审视所有材料，生成一份全景分析报告。

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "knowledgeMap": "这个领域的知识全景图描述（100-200字，像地图一样描述主要板块和它们的关系）",
  "patterns": ["反复出现的模式1", "模式2", "模式3"],
  "contradictions": ["不同来源之间的矛盾1", "矛盾2"],
  "consensusPoints": ["各方共识1", "共识2"],
  "openQuestions": ["尚未解决的核心问题1", "问题2", "问题3"],
  "blindSpots": ["用户可能忽略的盲区1", "盲区2"]
}

要求：
1. patterns 提供 3-5 个跨材料的模式
2. contradictions 至少 1 个（如果材料足够）
3. consensusPoints 至少 2 个
4. openQuestions 提供 3-5 个真正开放的问题
5. blindSpots 基于「用户读了什么 vs 没读什么」来推断
6. 所有文字使用中文`
}

export function buildResearchOutputPrompt(
  topic: string,
  format: string,
  roadmap: { items: { title: string; description: string; isRead: boolean }[] },
  notes: { type: string; content: string }[],
  analysis: { knowledgeMap: string; patterns: string[]; blindSpots: string[] }
): string {
  const readItems = roadmap.items.filter(i => i.isRead)
  const materialsSummary = `已读材料: ${readItems.map(i => i.title).join('、') || '无'}\n笔记数: ${notes.length}`

  return `你是一个研究总结专家。用户完成了对「${topic}」的深度研究，现在需要把研究成果整理成一份结构化输出。

## 研究主题
${topic}

## 研究材料概览
${materialsSummary}

## 全景分析要点
- 知识全景: ${analysis.knowledgeMap?.slice(0, 200) || '无'}
- 发现的模式: ${analysis.patterns?.join('、') || '无'}
- 可能的盲区: ${analysis.blindSpots?.join('、') || '无'}

## 研究笔记
${notes.map(n => `(${n.type}) ${n.content}`).join('\n')}

## 输出格式要求
请按「${format === 'article' ? '文章' : format === 'outline' ? '大纲' : format === 'mindmap' ? '思维导图文本' : '核心要点'}」格式输出。

## 输出 JSON 格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "title": "研究总结标题",
  "sections": [
    {
      "heading": "章节标题",
      "content": "章节内容（Markdown格式，200-500字）",
      "keyPoints": ["要点1", "要点2"]
    }
  ],
  "totalWordCount": 估算总字数
}

要求：
1. ${format === 'article' ? '写成一篇完整的研究综述文章，有开头有结尾' : format === 'outline' ? '写成层次分明的大纲，每个节点有简短说明' : format === 'mindmap' ? '写成思维导图的文本形式，用缩进表示层级关系' : '提炼最核心的要点，每个要点配简短解释'}
2. sections 提供 3-6 个章节
3. 内容要综合用户的笔记和分析发现
4. 所有文字使用中文`
}

export function buildResearchSelfTestPrompt(
  topic: string,
  roadmap: { items: { title: string; description: string }[] },
  notes: { type: string; content: string }[],
  analysis: { blindSpots: string[] },
  output: { sections: { heading: string }[] }
): string {
  return `你是一个理解力检验专家。用户刚刚完成了对「${topic}」的深度研究，你需要设计自测题来检验 TA 是否真正理解了核心概念——特别要暴露"假理解"（以为自己懂了但其实没懂的地方）。

## 研究材料概览
路线图覆盖: ${roadmap.items.map(i => i.title).join('、')}
笔记数量: ${notes.length}
研究产出章节: ${output.sections.map(s => s.heading).join('、')}
已知盲区: ${analysis.blindSpots?.join('、') || '无'}

## 你的任务
设计 5 道自测题。要求：
1. 不是考察记忆，而是考察理解——能用自己话解释、能举一反三
2. 至少 2 道题针对盲区设计，专门暴露"假理解"
3. 每道题要有提示（不直接给答案，但给思考方向）
4. 每道题要有参考答案（100-200字的模型回答）

## 输出格式
请严格按以下 JSON 格式输出，不要包含任何其他文字：

{
  "questions": [
    {
      "id": "q-1",
      "question": "测试题（开放性问题，不是选择题）",
      "hint": "一个帮助回忆的提示",
      "suggestedAnswer": "参考答案（100-200字，展示深度理解应该达到的水准）"
    }
  ],
  "overallGapSummary": "基于材料分析，用户最可能的知识盲区总结（100-200字）",
  "suggestedNextSteps": ["建议1", "建议2", "建议3"]
}

要求：
1. 恰好 5 道题
2. 题目要从不同角度测试（概念理解、应用能力、边界辨析、跨领域联系、批判性思维）
3. suggestedAnswer 要展示"真正理解"的样子，不仅是正确答案
4. suggestedNextSteps 给出 2-4 条后续学习建议
5. 所有文字使用中文`
}

export function buildResearchGapAnalysisPrompt(
  question: string,
  userAnswer: string,
  suggestedAnswer: string,
  confidence: string
): string {
  return `你是一个理解力评估师。请对比用户对一道测试题的回答和参考答案，分析理解差距。

## 测试题
${question}

## 参考答案
${suggestedAnswer}

## 用户的回答
${userAnswer || '（未作答）'}

## 用户自评信心
${confidence === 'sure' ? '很确定' : confidence === 'rough' ? '大致了解' : '不太确定'}

## 你的任务
给出简短的差距分析（50-150字）：
1. 用户理解了什么
2. 用户遗漏或误解了什么
3. 建议如何补上这个差距

直接输出分析文字，不需要 JSON 格式。`
}
