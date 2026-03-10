/**
 * P35 信息茧房收敛迷宫
 * Upgraded: richer content pool, diversity chart, step-by-step convergence visualization,
 * explanation text, history log
 */
const feed = document.getElementById("feed");
const statusEl = document.getElementById("status");
const diversityEl = document.getElementById("diversity");
const resetBtn = document.getElementById("resetBtn");
const tagBtns = [...document.querySelectorAll("[data-tag]")];
const historyEl = document.getElementById("history");

const NEWS = {
  A: [
    "A-政策落地成效显著，多地复制推广经验",
    "A-行业协会发表声明表示全力支持新规",
    "A-专家解读：长期利好经济结构转型",
    "A-受益企业分享正面数据，季度增长超预期",
    "A-国际媒体关注中国改革进展与成效",
    "A-官方白皮书详解政策制定过程与科学依据",
    "A-试点城市居民满意度调查结果公布：78%表示受益",
    "A-产业链上下游配套措施全面铺开",
    "A-相关领域论文被权威期刊收录，获学术认可",
    "A-国际组织肯定相关实践，建议全球推广",
    "A-智库报告：该路径是发展中国家最优解之一",
    "A-技术创新驱动政策效果超出预期",
    "A-就业数据显示新增岗位同比增长12%",
    "A-社区治理创新案例入选联合国最佳实践",
    "A-上市公司年报证实转型红利释放"
  ],
  B: [
    "B-基层执行困难重重，配套须加强",
    "B-学者质疑短期成本转嫁问题与分配公平",
    "B-受影响群体呼吁更灵活过渡方案",
    "B-反对方提交替代方案建议书，附数据论证",
    "B-历史类似政策效果回顾：半数未达预期",
    "B-环保组织指出实施过程中的环境代价被低估",
    "B-小微企业联名信：合规成本增加30%难以承受",
    "B-教育工作者担忧新规对偏远地区的负面影响",
    "B-劳动权益组织：灵活就业者保障缺口扩大",
    "B-独立审计报告与官方数据存在显著差异",
    "B-法律学者：部分条款可能与上位法冲突",
    "B-消费者投诉量同比上升40%值得关注",
    "B-老年群体数字鸿沟问题在新政下加剧",
    "B-地方财政压力数据揭示执行资金缺口",
    "B-跨国对比研究显示类似政策多数需要修正"
  ],
  C: [
    "C-数据核查：官方数字与独立统计的差异分析",
    "C-中立机构发布第三方评估报告，方法论透明",
    "C-多方声音并列呈现，留待读者判断",
    "C-事实核查：热传图文的真伪鉴定结果",
    "C-权威学术期刊发表系统性综述",
    "C-平衡报道：三位不同立场专家的圆桌对话",
    "C-田野调查：记者走访5个社区记录真实故事",
    "C-信息图解：政策变化的时间线与关键节点",
    "C-国际比较：10个国家类似改革的数据对照",
    "C-方法论解读：这份报告的数据应该怎样读",
    "C-长篇特稿：改革中三个家庭的真实经历",
    "C-播客访谈：政策制定者与批评者首次对话",
    "C-互动可视化：政策影响的地区差异地图",
    "C-调查报道：追踪一笔专项资金的流向",
    "C-读者来信精选：来自不同地区的十种声音"
  ]
};


let focus = null;
let round = 0;
let diversityHistory = [100];

function setStatus(text) {
  statusEl.textContent = `状态: ${text}`;
}

function diversityScore() {
  if (!focus) return 100;
  // More gradual convergence: exponential decay
  return Math.max(5, Math.round(100 * Math.pow(0.65, round)));
}

function renderFeed() {
  feed.innerHTML = "";
  const items = [];
  if (!focus) {
    // Show balanced mix: 3 from each
    ["A", "B", "C"].forEach(tag => {
      items.push(...NEWS[tag].slice(0, 3));
    });
  } else {
    // Main viewpoint dominates increasingly
    const main = NEWS[focus];
    const otherTags = ["A", "B", "C"].filter(t => t !== focus);
    const mainCount = Math.min(main.length, 3 + round);
    const leakCount = Math.max(0, 3 - round);
    items.push(...main.slice(0, mainCount));
    otherTags.forEach(t => items.push(...NEWS[t].slice(0, leakCount)));
  }

  // Shuffle for natural feel
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  items.forEach(text => {
    const tag = text[0];
    const div = document.createElement("div");
    div.className = `bubble ${tag}`;
    div.textContent = text;
    // Fade-in animation
    div.style.opacity = "0";
    div.style.transform = "translateY(10px)";
    div.style.transition = "opacity 0.3s, transform 0.3s";
    feed.appendChild(div);
    requestAnimationFrame(() => {
      div.style.opacity = "1";
      div.style.transform = "translateY(0)";
    });
  });
}

function renderDiversityBar() {
  const score = diversityScore();
  const color = score > 60 ? "var(--ok, #0b7a3b)" : score > 30 ? "var(--warn, #b86e00)" : "var(--bad, #a61f12)";
  diversityEl.innerHTML = `
    <span>多样性指数: <strong>${score}</strong></span>
    <div class="diversity-bar">
      <div class="diversity-fill" style="width:${score}%;background:${color};transition:width 0.5s ease"></div>
    </div>
  `;
}

function addHistoryEntry(tag, score) {
  if (!historyEl) return;
  const entry = document.createElement("div");
  entry.className = "history-entry";

  const label = document.createElement("span");
  label.className = `badge badge-${tag}`;
  label.textContent = `第 ${round} 轮 → 观点 ${tag}`;

  const scoreSpan = document.createElement("span");
  scoreSpan.className = "history-score";
  scoreSpan.textContent = `多样性: ${score}`;

  entry.append(label, scoreSpan);
  historyEl.prepend(entry);
}

function getExplanation() {
  const score = diversityScore();
  if (score >= 70) return "📡 信息源仍然较为多元，各方声音基本均衡。";
  if (score >= 40) return "⚠️ 注意：你的信息流正在收窄，部分声音已开始消失。";
  if (score >= 20) return "🔒 警告：信息茧房已初步形成，90%+ 内容来自同一立场。";
  return "🚨 完全收敛：你只能看到单一观点了。这就是算法茧房。";
}

tagBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    focus = btn.dataset.tag;
    round += 1;
    const score = diversityScore();
    diversityHistory.push(score);
    renderDiversityBar();
    setStatus(getExplanation());
    addHistoryEntry(focus, score);
    renderFeed();

    // Highlight active button
    tagBtns.forEach(b => b.classList.toggle("active", b === btn));
  });
});

resetBtn.addEventListener("click", () => {
  focus = null;
  round = 0;
  diversityHistory = [100];
  renderDiversityBar();
  setStatus("已重置为多元信息流。再次选择观点开始体验茧房收敛。");
  renderFeed();
  if (historyEl) historyEl.innerHTML = "";
  tagBtns.forEach(b => b.classList.remove("active"));
});

renderFeed();
renderDiversityBar();

// === PM Metrics Integration ===
(function () {
  try {
    if (!window.pmMetrics) return;
    let taskStarted = false;
    document.addEventListener('click', function (e) {
      if (taskStarted) return;
      const btn = e.target.closest('button');
      if (btn) {
        taskStarted = true;
        window.pmMetrics.markTaskStart('echo_chamber_task');
      }
    }, { once: false });
  } catch (_e) { }
})();
