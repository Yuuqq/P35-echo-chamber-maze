// Pure echo-chamber rules. No DOM. Loaded before app.js; also required by node:test.
var EchoLogic = (function () {
  var MIN_SAMPLES = 4;
  var ECHO_RATIO = 0.75;
  var STRONG_RATIO = 0.60;
  var NARROW_RATIO = 0.50;

  function summarize(clicks, tags) {
    var total = tags.reduce(function (sum, tag) {
      return sum + (clicks[tag] || 0);
    }, 0);
    var sorted = tags.slice().sort(function (a, b) {
      var diff = (clicks[b] || 0) - (clicks[a] || 0);
      if (diff !== 0) return diff;
      return tags.indexOf(a) - tags.indexOf(b);
    });
    var top = sorted[0];
    var topRatio = total === 0 ? 0 : (clicks[top] || 0) / total;
    return { total: total, sorted: sorted, top: top, topRatio: topRatio };
  }

  function calcDiversity(clicks, tags) {
    var stats = summarize(clicks, tags);
    if (stats.total < MIN_SAMPLES) return 1.0;
    if (stats.topRatio >= ECHO_RATIO) return 0.1;
    if (stats.topRatio >= STRONG_RATIO) return 0.35;
    if (stats.topRatio >= NARROW_RATIO) return 0.55;
    return 0.85;
  }

  // Feed shape is a function of the same click mass and topRatio as calcDiversity.
  // `step` is intentionally not an input: the fast-bias shortcut adds +2 clicks
  // per press, so a step counter and a click counter disagree.
  function getWeightedFeedTags(clicks, tags) {
    var stats = summarize(clicks, tags);
    if (stats.total < MIN_SAMPLES) return tags.slice();
    if (stats.topRatio >= ECHO_RATIO) return [stats.top];

    var clicked = stats.sorted.filter(function (tag) {
      return (clicks[tag] || 0) > 0;
    });

    if (stats.topRatio >= STRONG_RATIO) {
      var keep = clicked.slice(0, 2);
      var strong = [];
      keep.forEach(function (tag) {
        strong.push(tag);
        if (tag === stats.top) strong.push(tag, tag);
      });
      return strong;
    }

    if (stats.topRatio >= NARROW_RATIO) {
      var narrow = [];
      clicked.forEach(function (tag) {
        narrow.push(tag);
        if (tag === stats.top) narrow.push(tag);
      });
      return narrow;
    }

    return tags.slice();
  }

  function readoutText(diversity) {
    if (diversity > 0.7) return "✅ 信息多样性高";
    if (diversity > 0.4) return "⚠ 信息茧房初步形成";
    if (diversity > 0.2) return "⚠ 视野明显收窄";
    return "🔴 已陷入信息茧房！";
  }

  function toneName(diversity) {
    if (diversity > 0.7) return "is-high";
    if (diversity > 0.2) return "is-mid";
    return "is-low";
  }

  function statusText(diversity, step) {
    if (step === 0) return "开始浏览，观察算法如何逐渐改变你的信息视野";
    if (diversity > 0.7) return "信息视野仍然开阔 (第 " + step + " 步)";
    if (diversity > 0.4) return "相似内容权重提升，信息茧房初步形成 (第 " + step + " 步)";
    if (diversity > 0.2) return "视野明显收窄，第二种声音还在 (第 " + step + " 步)";
    return "⚠ 您只看到一种声音了！ (第 " + step + " 步)";
  }

  function biasStatus(tagLabel, diversity, step) {
    if (diversity >= 1) {
      return "快速偏向 " + tagLabel + " — 样本还不够，信息流尚未收窄 (第 " + step + " 步)";
    }
    if (diversity > 0.7) {
      return "快速偏向 " + tagLabel + " — 信息视野仍然开阔 (第 " + step + " 步)";
    }
    if (diversity > 0.4) {
      return "快速偏向 " + tagLabel + " — 相似内容开始占优 (第 " + step + " 步)";
    }
    if (diversity > 0.2) {
      return "快速偏向 " + tagLabel + " — 视野明显收窄，第二种声音还在 (第 " + step + " 步)";
    }
    return "快速偏向 " + tagLabel + " — ⚠ 您只看到一种声音了！ (第 " + step + " 步)";
  }

  function uniqueTags(weighted) {
    var seen = [];
    weighted.forEach(function (tag) {
      if (seen.indexOf(tag) === -1) seen.push(tag);
    });
    return seen;
  }

  return {
    MIN_SAMPLES: MIN_SAMPLES,
    ECHO_RATIO: ECHO_RATIO,
    STRONG_RATIO: STRONG_RATIO,
    NARROW_RATIO: NARROW_RATIO,
    summarize: summarize,
    calcDiversity: calcDiversity,
    getWeightedFeedTags: getWeightedFeedTags,
    readoutText: readoutText,
    toneName: toneName,
    statusText: statusText,
    biasStatus: biasStatus,
    uniqueTags: uniqueTags
  };
})();

if (typeof module === "object" && module.exports) {
  module.exports = EchoLogic;
}
