const test = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../echo-logic.js");

const TAGS = ["A", "B", "C", "D"];

function voices(clicks) {
  return logic.uniqueTags(logic.getWeightedFeedTags(clicks, TAGS));
}

test("two fast-bias clicks enter echo on the meter, the copy, and the feed together", function () {
  const clicks = { A: 4 };
  const diversity = logic.calcDiversity(clicks, TAGS);
  assert.equal(diversity, 0.1);
  assert.deepEqual(voices(clicks), ["A"]);
  assert.match(logic.statusText(diversity, 2), /一种声音/);
  assert.match(logic.biasStatus("🟢 支持方叙事", diversity, 2), /一种声音/);
  assert.match(logic.biasStatus("🟢 支持方叙事", diversity, 2), /快速偏向/);
});

test("one fast-bias click stays open on both the meter and the feed", function () {
  const clicks = { A: 2 };
  const diversity = logic.calcDiversity(clicks, TAGS);
  assert.equal(diversity, 1);
  assert.deepEqual(voices(clicks), TAGS);
  assert.match(logic.biasStatus("🟢 支持方叙事", diversity, 1), /尚未收窄/);
  assert.doesNotMatch(logic.biasStatus("🟢 支持方叙事", diversity, 1), /一种声音/);
});

test("three reads of one tag do not weight the feed while the meter is still full", function () {
  const clicks = { A: 3 };
  assert.equal(logic.calcDiversity(clicks, TAGS), 1);
  assert.deepEqual(voices(clicks), TAGS);
  assert.doesNotMatch(logic.statusText(1, 3), /一种声音/);
});

test("four reads of one tag cross into echo together", function () {
  const clicks = { A: 4 };
  assert.equal(logic.calcDiversity(clicks, TAGS), 0.1);
  assert.deepEqual(logic.getWeightedFeedTags(clicks, TAGS), ["A"]);
  assert.match(logic.statusText(0.1, 4), /一种声音/);
});

test("four balanced clicks never claim a single voice", function () {
  const clicks = { A: 1, B: 1, C: 1, D: 1 };
  const diversity = logic.calcDiversity(clicks, TAGS);
  assert.ok(diversity > 0.7);
  assert.deepEqual(voices(clicks), TAGS);
  assert.doesNotMatch(logic.statusText(diversity, 4), /一种声音/);
});

test("an even 2-and-2 split narrows to the clicked tags without the echo alarm", function () {
  const clicks = { A: 2, B: 2 };
  const diversity = logic.calcDiversity(clicks, TAGS);
  assert.equal(diversity, 0.55);
  assert.deepEqual(voices(clicks), ["A", "B"]);
  assert.doesNotMatch(logic.statusText(diversity, 4), /一种声音/);
  assert.match(logic.statusText(diversity, 4), /初步形成/);
});

test("strong dominance keeps a second voice until the echo ratio", function () {
  const clicks = { A: 5, B: 2, C: 1 };
  assert.equal(logic.calcDiversity(clicks, TAGS), 0.35);
  assert.deepEqual(voices(clicks), ["A", "B"]);
  assert.doesNotMatch(logic.statusText(0.35, 8), /一种声音/);
  assert.match(logic.statusText(0.35, 8), /第二种声音/);
  assert.equal(logic.toneName(0.35), "is-mid");
  assert.equal(logic.toneName(0.1), "is-low");
});

test("exactly the echo ratio drops every other tag", function () {
  const clicks = { A: 3, B: 1 };
  assert.equal(logic.calcDiversity(clicks, TAGS), 0.1);
  assert.deepEqual(voices(clicks), ["A"]);
});

test("a mild lead below the narrow ratio keeps every tag", function () {
  const clicks = { A: 3, B: 2, C: 2, D: 1 };
  const diversity = logic.calcDiversity(clicks, TAGS);
  assert.equal(diversity, 0.85);
  assert.deepEqual(voices(clicks), TAGS);
  assert.doesNotMatch(logic.statusText(diversity, 8), /一种声音/);
});

test("a balanced fast-bias round stays open without claiming the sample floor", function () {
  const clicks = { A: 2, B: 2, C: 2, D: 2 };
  const diversity = logic.calcDiversity(clicks, TAGS);
  assert.equal(diversity, 0.85);
  assert.deepEqual(voices(clicks), TAGS);
  const text = logic.biasStatus("⚪ 中立分析", diversity, 4);
  assert.match(text, /仍然开阔/);
  assert.doesNotMatch(text, /样本还不够|一种声音/);
});

test("the empty chamber is fully open", function () {
  assert.equal(logic.calcDiversity({}, TAGS), 1);
  assert.deepEqual(voices({}), TAGS);
  assert.match(logic.statusText(1, 0), /开始浏览/);
});
