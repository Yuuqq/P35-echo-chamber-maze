// P35 信息茧房收敛迷宫 v2.0
  // 4类信息池（更丰富）、算法偏向模拟、多样性进度条、阅读轨迹历史

  const feed = document.getElementById("feed");
  const statusEl = document.getElementById("status");
  const diversityEl = document.getElementById("diversity");
  const resetBtn = document.getElementById("resetBtn");
  const tagBtns = [...(document.querySelectorAll("[data-tag]") || [])];
  const historyEl = document.getElementById("history");
  const diversityBar = document.getElementById("diversityBar");
  const diversityLabel = document.getElementById("diversityLabel");

  const NEWS = {
    A: [
      "A-政策落地成效显著，多地复制推广经验",
      "A-行业协会全力支持新规，表示将加速落地",
      "A-专家解读：长期利好经济结构转型",
      "A-受益企业季度增长超预期，信心十足",
      "A-市场信心回暖，投资者情绪改善",
      "A-基层干部：执行顺畅，群众反映良好",
      "A-国际评级机构上调预期，看好前景",
      "A-配套措施同步跟进，形成政策合力",
    ],
    B: [
      "B-质疑：政策执行过程中暗藏漏洞",
      "B-调查：多数受访者对政策感到困惑",
      "B-学者批评：顶层设计缺乏实证依据",
      "B-企业反映：合规成本骤增，利润空间压缩",
      "B-数据疑点：官方数据与第三方出入明显",
      "B-基层执行变形，'上有政策下有对策'",
      "B-国际观察：改革节奏过快，风险积累",
      "B-分析：短期收益可能以长期代价换取",
    ],
    C: [
      "C-调查报道：某工程项目涉嫌违规发包",
      "C-深度：政策背后的利益博弈",
      "C-数据核查：环保指标是否存在虚报？",
      "C-独家：内部文件显示预警被压制",
      "C-对话当事人：他们为何选择沉默",
      "C-地方政府财政数据交叉核实报告",
      "C-专访知情人：决策过程为何不透明",
      "C-企业注册信息穿透：关联交易浮出水面",
    ],
    D: [
      "D-立场无关，此事值得所有人关注",
      "D-中立分析：政策的两面性与真实效果",
      "D-专家圆桌：各方观点汇集对照",
      "D-数据说话：剔除情绪后的纯粹分析",
      "D-横向比较：其他国家同类政策效果",
      "D-时间轴梳理：事件发展全貌",
      "D-关键问题清单：你应该追问的10件事",
      "D-读者来信：不同背景的人如何解读此事",
    ],
  };

  const TAG_LABELS = { A:"🟢 支持方叙事", B:"🔴 批评方叙事", C:"🔎 调查报道", D:"⚪ 中立分析" };
  const CONVERGENCE_MSGS = [
    "算法注意到你的偏好……",
    "相似内容权重提升……",
    "与你'观点相近'的内容增多……",
    "信息茧房正在成形……",
    "⚠ 您只看到一种声音了！",
  ];

  let clicks = {};
  let step = 0;
  let historyLog = [];

  function setStatus(t) { if (statusEl) statusEl.textContent = "状态: " + t; }

  function calcDiversity() {
    const total = Object.values(clicks).reduce(function(a,b){return a+b;}, 0);
    if (total === 0) return 1.0;
    const maxCat = Math.max.apply(null, Object.keys(NEWS).map(function(t){return clicks[t]||0;}));
    if (maxCat >= total * 0.75) return 0.1;
    if (maxCat >= total * 0.60) return 0.35;
    if (maxCat >= total * 0.50) return 0.55;
    return 0.85;
  }

  function updateDiversityDisplay(diversity) {
    const pct = Math.round(diversity * 100);
    if (diversityBar) {
      diversityBar.style.width = pct + "%";
      diversityBar.style.background = diversity > 0.7 ? "#16a34a" : diversity > 0.4 ? "#d97706" : "#dc2626";
    }
    if (diversityLabel) diversityLabel.textContent = pct + "% 多样性";
    if (diversityEl) {
      diversityEl.textContent = diversity > 0.7 ? "✅ 信息多样性高" : diversity > 0.4 ? "⚠ 信息茧房初步形成" : "🔴 已陷入信息茧房！";
      diversityEl.style.color = diversity > 0.7 ? "#16a34a" : diversity > 0.4 ? "#d97706" : "#dc2626";
    }
  }

  function getWeightedFeedTags() {
    const tags = Object.keys(NEWS);
    if (step < 3) return tags;
    const sorted = tags.slice().sort(function(a,b){return (clicks[b]||0)-(clicks[a]||0);});
    const top = sorted[0];
    const total = Object.values(clicks).reduce(function(a,b){return a+b;}, 0);
    if (total === 0) return tags;
    const topRatio = (clicks[top]||0) / total;
    const result = [];
    tags.forEach(function(t) {
      result.push(t);
      if (t === top && topRatio > 0.5) result.push(t, t);
      else if (t === top && topRatio > 0.35) result.push(t);
    });
    return result;
  }

  function renderFeed() {
    if (!feed) return;
    const diversity = calcDiversity();
    updateDiversityDisplay(diversity);
    const weighted = getWeightedFeedTags();
    const items = [];
    for (let i = 0; i < 6; i++) {
      const tag = weighted[Math.floor(Math.random() * weighted.length)];
      const pool = NEWS[tag];
      const text = pool[Math.floor(Math.random() * pool.length)];
      items.push({ tag: tag, text: text });
    }
    feed.innerHTML = items.map(function(item) {
      return '<div class="news-item"><span class="tag-pill tag-' + item.tag.toLowerCase() + '">' + TAG_LABELS[item.tag] + '</span><p class="news-text">' + item.text + '</p><button type="button" class="read-btn" data-tag="' + item.tag + '">点击阅读</button></div>';
    }).join("");
    feed.querySelectorAll(".read-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const tag = btn.dataset.tag;
        clicks[tag] = (clicks[tag] || 0) + 1;
        step++;
        const convMsg = step <= CONVERGENCE_MSGS.length ? CONVERGENCE_MSGS[step-1] : CONVERGENCE_MSGS[CONVERGENCE_MSGS.length-1];
        setStatus(convMsg + " (第 " + step + " 次阅读)");
        historyLog.unshift({ tag: TAG_LABELS[tag], text: btn.parentElement.querySelector(".news-text").textContent.substring(0,40)+"…", step: step });
        renderHistory();
        renderFeed();
      });
    });
  }

  function renderHistory() {
    if (!historyEl) return;
    if (!historyLog.length) { historyEl.innerHTML = '<li style="opacity:.5;font-size:13px">点击新闻后将在此显示阅读轨迹</li>'; return; }
    historyEl.innerHTML = historyLog.slice(0, 12).map(function(h) {
      return '<li class="hist-row"><span class="hist-step">第' + h.step + '步</span><span class="hist-tag">' + h.tag + '</span><span class="hist-text">' + h.text + '</span></li>';
    }).join("");
  }

  if (resetBtn) resetBtn.addEventListener("click", function() {
    clicks = {}; step = 0; historyLog = [];
    setStatus("已重置，重新开始探索");
    updateDiversityDisplay(1.0);
    renderHistory();
    renderFeed();
  });

  tagBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      const tag = btn.dataset.tag;
      clicks[tag] = (clicks[tag] || 0) + 2;
      step++;
      setStatus("快速偏向 " + TAG_LABELS[tag]);
      historyLog.unshift({ tag: TAG_LABELS[tag], text: "[主动选择分类]", step: step });
      renderHistory();
      renderFeed();
    });
  });

  renderHistory();
  renderFeed();
  setStatus("开始浏览，观察算法如何逐渐改变你的信息视野");
  