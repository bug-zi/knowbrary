<template>
  <div class="relative overflow-hidden" style="height: calc(100dvh - 3.5rem - 3.5rem);">
    <!-- Background -->
    <div
      class="fixed inset-0 bg-cover bg-center bg-no-repeat"
      style="background-image: url('/bg1.png'); z-index: 0;"
    >
      <div class="absolute inset-0 bg-macaron-card/40 dark:bg-[#1A1512]/70"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 relative h-full" style="z-index: 1;">

    <!-- 1. 标题区：调 top 值上下移动 -->
    <section class="absolute left-0 right-0 text-center" style="top: 15%;">
      <h1 class="text-3xl md:text-4xl font-bold text-macaron-text">
        <Icon name="lucide:microscope" class="inline w-8 h-8 align-text-bottom" /> 万象研究所
      </h1>
      <p class="mt-[18px] text-base text-macaron-text-secondary max-w-md mx-auto">
        每个人的随身知识实验室，通过知识卡片探索 21 个领域
      </p>
    </section>

    <!-- 2. 按钮区：调 top 值上下移动 -->
    <div class="absolute left-0 right-0 px-4" style="top: 40%;">
      <div class="max-w-md mx-auto flex items-center gap-4">
        <button
          @click="exploreRandom"
          class="flex-1 py-2.5 bg-macaron-cta text-white rounded-card font-medium hover:bg-macaron-cta-hover transition-colors text-center"
        >
          开始探索
        </button>
        <NuxtLink
          to="/experiment"
          class="flex-1 py-2.5 bg-macaron-card text-macaron-text rounded-card font-medium shadow-card hover:shadow-card-hover transition-all no-underline text-center"
        >
          今日实验
        </NuxtLink>
      </div>
    </div>

    <!-- 3. 每日知识：调 bottom 值上下移动 -->
    <section class="absolute left-0 right-0 px-4" style="bottom: 30%;">
      <div class="max-w-[688px] mx-auto">
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-macaron-card/60 backdrop-blur-md border border-macaron-border/40 shadow-card"
        >
          <Icon name="lucide:lightbulb" class="shrink-0 w-5 h-5 text-macaron-cta" />
          <p class="text-sm md:text-base text-macaron-text leading-relaxed flex-1 min-w-0">
            {{ dailyFact }}
          </p>
          <button
            class="shrink-0 p-1.5 rounded-full hover:bg-macaron-border/30 transition-all duration-200 active:scale-90 active:rotate-180"
            aria-label="换一个"
            @click="refreshFact"
          >
            <Icon name="lucide:refresh-cw" class="w-4 h-4 text-macaron-text-secondary" />
          </button>
        </div>
      </div>
    </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllCards } from '~/utils/cards'

useHead({
  bodyAttrs: { style: 'background-color: transparent' },
})

const { data: allCards } = await useAsyncData('home-cards', () => getAllCards())
const cards = allCards.value ?? []
const router = useRouter()

function exploreRandom() {
  if (!cards.length) return
  const randomCard = cards[Math.floor(Math.random() * cards.length)]
  router.push(`/cards/${randomCard.slug}`)
}

// Daily knowledge: one-sentence science fact, rotates daily
const dailyFacts = [
  '蜜蜂的翅膀每秒振动约 230 次，这就是我们听到嗡嗡声的原因。',
  '光从太阳到达地球大约需要 8 分 20 秒。',
  '人类大脑的存储容量约为 2.5 拍字节，相当于 300 万小时的电视节目。',
  '宇宙中可观测到的恒星数量比地球上所有沙滩的沙粒总数还多。',
  '章鱼有三颗心脏，血液是蓝色的。',
  '一支铅笔的石墨芯足够画出约 56 公里长的线条。',
  '蜂蜜永远不会变质——考古学家发现过 3000 年前的蜂蜜，依然可以食用。',
  '你身体中的铁元素全部来自数十亿年前爆炸的恒星。',
  '一颗中子星的密度如此之高，一茶匙的重量约为 60 亿吨。',
  '鲨鱼在地球上存在的时间比树还要长。',
  '水母已经在地球上漂流了超过 5 亿年——它们甚至没有大脑。',
  '地球上所有蚂蚁的总重量大约等于所有人类的总重量。',
  '一张纸折叠 42 次后的厚度可以到达月球。',
  '声音在水中传播的速度是空气中的约 4.3 倍。',
  '你眨眼的时候，大脑会让你短暂"看不见"这个动作，所以世界不会变暗。',
  '每秒钟有约 100 道闪电击中地球表面。',
  '世界上最古老的已知生物是一棵 4850 岁的刺果松。',
  '如果能把土星放进一个巨大的浴缸里，它会浮在水面上。',
  '人类的 DNA 与香蕉有约 60% 是相同的。',
  '北极光实际上是太阳带电粒子与地球大气层碰撞的结果。',
  '一个喷嚏的气流速度可达每小时 160 公里。',
  '世界上最深的海洋点——马里亚纳海沟——深约 11 公里。',
  '火烈鸟天生是灰色的，它们因为吃的虾和藻类才变成粉色。',
  '木星上的"大红斑"是一场持续了至少 400 年的超级风暴。',
  '你每天大约会呼吸 2 万次。',
  '月球正在以每年约 3.8 厘米的速度远离地球。',
  '河马的汗液是天然的防晒霜，呈现红色。',
  '蝴蝶用脚来品尝食物的味道。',
  '一个成年人体内约有 37.2 万亿个细胞。',
  '冥王星上的一年相当于地球上的 248 年。',
  '猫的大脑与人类大脑的结构相似度高达 90%。',
]
const todaySeed = Math.floor(Date.now() / 86400000)
const dailyFact = ref(dailyFacts[todaySeed % dailyFacts.length])
let lastFactIndex = todaySeed % dailyFacts.length

function refreshFact() {
  let next: number
  do {
    next = Math.floor(Math.random() * dailyFacts.length)
  } while (next === lastFactIndex && dailyFacts.length > 1)
  lastFactIndex = next
  dailyFact.value = dailyFacts[next]
}

let autoTimer: ReturnType<typeof setInterval> | null = null
function startAutoRefresh() {
  stopAutoRefresh()
  autoTimer = setInterval(refreshFact, 10000)
}
function stopAutoRefresh() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
}
onMounted(startAutoRefresh)
onUnmounted(stopAutoRefresh)
</script>
