import type { LanguageCode, VerbEntry } from "./types";

/**
 * Growing pool of verbs for the daily "verbs" exercise.
 *
 * English: irregular verbs (infinitive / past / past-participle + example
 * sentences testing different tenses).
 *
 * Chinese: verb-aspect patterns. Chinese verbs don't conjugate, so the
 * "conjugation" here really encodes the base verb combined with aspect
 * markers (了 / 过 / 在 / 正在 / 会 / 已经).
 */

const EN_VERBS: VerbEntry[] = [
  {
    infinitive: "be",
    translation: { en: "to be", fr: "être", zh: "是" },
    conjugation: {
      present: "am / is / are",
      past: "was / were",
      pastParticiple: "been",
      future: "will be",
      presentPerfect: "have been",
      pastPerfect: "had been",
    },
    examples: [
      { sentence: "Yesterday I ___ at the library.", answer: "was", tense: "past" },
      { sentence: "She has ___ my friend for years.", answer: "been", tense: "presentPerfect" },
    ],
  },
  {
    infinitive: "have",
    translation: { en: "to have", fr: "avoir", zh: "有" },
    conjugation: {
      present: "have / has",
      past: "had",
      pastParticiple: "had",
      future: "will have",
      presentPerfect: "have had",
      pastPerfect: "had had",
    },
    examples: [
      { sentence: "I ___ dinner an hour ago.", answer: "had", tense: "past" },
      { sentence: "We ___ never seen that film.", answer: "have", tense: "presentPerfect" },
    ],
  },
  {
    infinitive: "go",
    translation: { en: "to go", fr: "aller", zh: "去" },
    conjugation: {
      present: "go / goes",
      past: "went",
      pastParticiple: "gone",
      future: "will go",
      presentPerfect: "have gone",
      pastPerfect: "had gone",
    },
    examples: [
      { sentence: "Last week we ___ to Paris.", answer: "went", tense: "past" },
      { sentence: "She has ___ home already.", answer: "gone", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "take",
    translation: { en: "to take", fr: "prendre", zh: "拿" },
    conjugation: {
      present: "take / takes",
      past: "took",
      pastParticiple: "taken",
      future: "will take",
      presentPerfect: "have taken",
      pastPerfect: "had taken",
    },
    examples: [
      { sentence: "He ___ the bus this morning.", answer: "took", tense: "past" },
      { sentence: "They have ___ the wrong path.", answer: "taken", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "see",
    translation: { en: "to see", fr: "voir", zh: "看见" },
    conjugation: {
      present: "see / sees",
      past: "saw",
      pastParticiple: "seen",
      future: "will see",
      presentPerfect: "have seen",
      pastPerfect: "had seen",
    },
    examples: [
      { sentence: "I ___ her at the market yesterday.", answer: "saw", tense: "past" },
      { sentence: "Have you ever ___ this before?", answer: "seen", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "come",
    translation: { en: "to come", fr: "venir", zh: "来" },
    conjugation: {
      present: "come / comes",
      past: "came",
      pastParticiple: "come",
      future: "will come",
      presentPerfect: "have come",
      pastPerfect: "had come",
    },
    examples: [
      { sentence: "They ___ back late last night.", answer: "came", tense: "past" },
      { sentence: "Winter has ___ early this year.", answer: "come", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "know",
    translation: { en: "to know", fr: "savoir / connaître", zh: "知道" },
    conjugation: {
      present: "know / knows",
      past: "knew",
      pastParticiple: "known",
      future: "will know",
      presentPerfect: "have known",
      pastPerfect: "had known",
    },
    examples: [
      { sentence: "I ___ the answer when I was younger.", answer: "knew", tense: "past" },
      { sentence: "We have ___ each other since school.", answer: "known", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "give",
    translation: { en: "to give", fr: "donner", zh: "给" },
    conjugation: {
      present: "give / gives",
      past: "gave",
      pastParticiple: "given",
      future: "will give",
      presentPerfect: "have given",
      pastPerfect: "had given",
    },
    examples: [
      { sentence: "She ___ me a book for my birthday.", answer: "gave", tense: "past" },
      { sentence: "They have ___ their answer.", answer: "given", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "make",
    translation: { en: "to make", fr: "faire", zh: "做" },
    conjugation: {
      present: "make / makes",
      past: "made",
      pastParticiple: "made",
      future: "will make",
      presentPerfect: "have made",
      pastPerfect: "had made",
    },
    examples: [
      { sentence: "I ___ a cake this morning.", answer: "made", tense: "past" },
      { sentence: "We have ___ our decision.", answer: "made", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "think",
    translation: { en: "to think", fr: "penser", zh: "想" },
    conjugation: {
      present: "think / thinks",
      past: "thought",
      pastParticiple: "thought",
      future: "will think",
      presentPerfect: "have thought",
      pastPerfect: "had thought",
    },
    examples: [
      { sentence: "I ___ you were joking.", answer: "thought", tense: "past" },
      { sentence: "She has ___ about it a lot.", answer: "thought", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "eat",
    translation: { en: "to eat", fr: "manger", zh: "吃" },
    conjugation: {
      present: "eat / eats",
      past: "ate",
      pastParticiple: "eaten",
      future: "will eat",
      presentPerfect: "have eaten",
      pastPerfect: "had eaten",
    },
    examples: [
      { sentence: "We ___ dinner at eight.", answer: "ate", tense: "past" },
      { sentence: "Have you ___ yet?", answer: "eaten", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "drink",
    translation: { en: "to drink", fr: "boire", zh: "喝" },
    conjugation: {
      present: "drink / drinks",
      past: "drank",
      pastParticiple: "drunk",
      future: "will drink",
      presentPerfect: "have drunk",
      pastPerfect: "had drunk",
    },
    examples: [
      { sentence: "He ___ two cups of tea.", answer: "drank", tense: "past" },
      { sentence: "She has never ___ coffee.", answer: "drunk", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "write",
    translation: { en: "to write", fr: "écrire", zh: "写" },
    conjugation: {
      present: "write / writes",
      past: "wrote",
      pastParticiple: "written",
      future: "will write",
      presentPerfect: "have written",
      pastPerfect: "had written",
    },
    examples: [
      { sentence: "She ___ a letter last week.", answer: "wrote", tense: "past" },
      { sentence: "I have ___ three chapters.", answer: "written", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "read",
    translation: { en: "to read", fr: "lire", zh: "读" },
    conjugation: {
      present: "read / reads",
      past: "read",
      pastParticiple: "read",
      future: "will read",
      presentPerfect: "have read",
      pastPerfect: "had read",
    },
    examples: [
      { sentence: "He ___ the whole book yesterday.", answer: "read", tense: "past" },
      { sentence: "We have ___ that article.", answer: "read", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "speak",
    translation: { en: "to speak", fr: "parler", zh: "说" },
    conjugation: {
      present: "speak / speaks",
      past: "spoke",
      pastParticiple: "spoken",
      future: "will speak",
      presentPerfect: "have spoken",
      pastPerfect: "had spoken",
    },
    examples: [
      { sentence: "She ___ to the manager this morning.", answer: "spoke", tense: "past" },
      { sentence: "He has ___ at that conference before.", answer: "spoken", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "run",
    translation: { en: "to run", fr: "courir", zh: "跑" },
    conjugation: {
      present: "run / runs",
      past: "ran",
      pastParticiple: "run",
      future: "will run",
      presentPerfect: "have run",
      pastPerfect: "had run",
    },
    examples: [
      { sentence: "He ___ five kilometres yesterday.", answer: "ran", tense: "past" },
      { sentence: "She has ___ every morning this month.", answer: "run", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "sleep",
    translation: { en: "to sleep", fr: "dormir", zh: "睡觉" },
    conjugation: {
      present: "sleep / sleeps",
      past: "slept",
      pastParticiple: "slept",
      future: "will sleep",
      presentPerfect: "have slept",
      pastPerfect: "had slept",
    },
    examples: [
      { sentence: "I ___ badly last night.", answer: "slept", tense: "past" },
      { sentence: "He has ___ for ten hours.", answer: "slept", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "buy",
    translation: { en: "to buy", fr: "acheter", zh: "买" },
    conjugation: {
      present: "buy / buys",
      past: "bought",
      pastParticiple: "bought",
      future: "will buy",
      presentPerfect: "have bought",
      pastPerfect: "had bought",
    },
    examples: [
      { sentence: "She ___ a new phone.", answer: "bought", tense: "past" },
      { sentence: "We have ___ the tickets.", answer: "bought", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "bring",
    translation: { en: "to bring", fr: "apporter", zh: "带" },
    conjugation: {
      present: "bring / brings",
      past: "brought",
      pastParticiple: "brought",
      future: "will bring",
      presentPerfect: "have brought",
      pastPerfect: "had brought",
    },
    examples: [
      { sentence: "He ___ the wine to the party.", answer: "brought", tense: "past" },
      { sentence: "They have ___ good news.", answer: "brought", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "understand",
    translation: { en: "to understand", fr: "comprendre", zh: "明白" },
    conjugation: {
      present: "understand / understands",
      past: "understood",
      pastParticiple: "understood",
      future: "will understand",
      presentPerfect: "have understood",
      pastPerfect: "had understood",
    },
    examples: [
      { sentence: "I finally ___ the joke.", answer: "understood", tense: "past" },
      { sentence: "She has ___ the problem from the start.", answer: "understood", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "leave",
    translation: { en: "to leave", fr: "partir / laisser", zh: "离开" },
    conjugation: {
      present: "leave / leaves",
      past: "left",
      pastParticiple: "left",
      future: "will leave",
      presentPerfect: "have left",
      pastPerfect: "had left",
    },
    examples: [
      { sentence: "The train ___ ten minutes ago.", answer: "left", tense: "past" },
      { sentence: "He has ___ the country.", answer: "left", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "find",
    translation: { en: "to find", fr: "trouver", zh: "找到" },
    conjugation: {
      present: "find / finds",
      past: "found",
      pastParticiple: "found",
      future: "will find",
      presentPerfect: "have found",
      pastPerfect: "had found",
    },
    examples: [
      { sentence: "I ___ my keys under the sofa.", answer: "found", tense: "past" },
      { sentence: "They have ___ a solution.", answer: "found", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "feel",
    translation: { en: "to feel", fr: "sentir / ressentir", zh: "感觉" },
    conjugation: {
      present: "feel / feels",
      past: "felt",
      pastParticiple: "felt",
      future: "will feel",
      presentPerfect: "have felt",
      pastPerfect: "had felt",
    },
    examples: [
      { sentence: "I ___ tired all day yesterday.", answer: "felt", tense: "past" },
      { sentence: "She has ___ that way for weeks.", answer: "felt", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "keep",
    translation: { en: "to keep", fr: "garder", zh: "保持" },
    conjugation: {
      present: "keep / keeps",
      past: "kept",
      pastParticiple: "kept",
      future: "will keep",
      presentPerfect: "have kept",
      pastPerfect: "had kept",
    },
    examples: [
      { sentence: "He ___ his promise.", answer: "kept", tense: "past" },
      { sentence: "She has ___ every letter.", answer: "kept", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "hold",
    translation: { en: "to hold", fr: "tenir", zh: "拿住" },
    conjugation: {
      present: "hold / holds",
      past: "held",
      pastParticiple: "held",
      future: "will hold",
      presentPerfect: "have held",
      pastPerfect: "had held",
    },
    examples: [
      { sentence: "She ___ the baby all afternoon.", answer: "held", tense: "past" },
      { sentence: "The meeting has been ___ twice.", answer: "held", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "stand",
    translation: { en: "to stand", fr: "se tenir debout", zh: "站" },
    conjugation: {
      present: "stand / stands",
      past: "stood",
      pastParticiple: "stood",
      future: "will stand",
      presentPerfect: "have stood",
      pastPerfect: "had stood",
    },
    examples: [
      { sentence: "He ___ by the window.", answer: "stood", tense: "past" },
      { sentence: "We have ___ here for an hour.", answer: "stood", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "become",
    translation: { en: "to become", fr: "devenir", zh: "变成" },
    conjugation: {
      present: "become / becomes",
      past: "became",
      pastParticiple: "become",
      future: "will become",
      presentPerfect: "have become",
      pastPerfect: "had become",
    },
    examples: [
      { sentence: "She ___ a doctor at 30.", answer: "became", tense: "past" },
      { sentence: "It has ___ a habit.", answer: "become", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "grow",
    translation: { en: "to grow", fr: "grandir / pousser", zh: "生长" },
    conjugation: {
      present: "grow / grows",
      past: "grew",
      pastParticiple: "grown",
      future: "will grow",
      presentPerfect: "have grown",
      pastPerfect: "had grown",
    },
    examples: [
      { sentence: "The tree ___ tall over the years.", answer: "grew", tense: "past" },
      { sentence: "The children have ___ so fast.", answer: "grown", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "teach",
    translation: { en: "to teach", fr: "enseigner", zh: "教" },
    conjugation: {
      present: "teach / teaches",
      past: "taught",
      pastParticiple: "taught",
      future: "will teach",
      presentPerfect: "have taught",
      pastPerfect: "had taught",
    },
    examples: [
      { sentence: "She ___ me how to cook.", answer: "taught", tense: "past" },
      { sentence: "He has ___ here for ten years.", answer: "taught", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "learn",
    translation: { en: "to learn", fr: "apprendre", zh: "学" },
    conjugation: {
      present: "learn / learns",
      past: "learned",
      pastParticiple: "learned",
      future: "will learn",
      presentPerfect: "have learned",
      pastPerfect: "had learned",
    },
    examples: [
      { sentence: "I ___ a lot from that book.", answer: "learned", tense: "past" },
      { sentence: "We have ___ the lesson.", answer: "learned", tense: "pastParticiple" },
    ],
  },
];

/**
 * Chinese "verbs" pool. Since Chinese verbs don't conjugate, each entry
 * teaches the interaction of the base verb with an aspect marker
 * (了 completed, 过 experiential, 在 progressive, 会 will, 已经 already).
 *
 * The `conjugation` fields are reinterpreted:
 *  - present         → base
 *  - past            → base + 了
 *  - pastParticiple  → base + 过
 *  - future          → 会 + base
 *  - presentPerfect  → 已经 + base + 了
 *  - pastPerfect     → base + 了
 */
const ZH_VERBS: VerbEntry[] = [
  {
    infinitive: "吃",
    translation: { en: "to eat", fr: "manger", zh: "吃" },
    conjugation: {
      present: "吃",
      past: "吃了",
      pastParticiple: "吃过",
      future: "会吃",
      presentPerfect: "已经吃了",
      pastPerfect: "吃了",
    },
    examples: [
      { sentence: "我 ___ 早饭了。", answer: "吃", tense: "past" },
      { sentence: "你 ___ 中国菜吗？", answer: "吃过", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "去",
    translation: { en: "to go", fr: "aller", zh: "去" },
    conjugation: {
      present: "去",
      past: "去了",
      pastParticiple: "去过",
      future: "会去",
      presentPerfect: "已经去了",
      pastPerfect: "去了",
    },
    examples: [
      { sentence: "昨天我 ___ 商店。", answer: "去了", tense: "past" },
      { sentence: "我没 ___ 北京。", answer: "去过", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "看",
    translation: { en: "to watch / see", fr: "regarder / voir", zh: "看" },
    conjugation: {
      present: "看",
      past: "看了",
      pastParticiple: "看过",
      future: "会看",
      presentPerfect: "已经看了",
      pastPerfect: "看了",
    },
    examples: [
      { sentence: "我 ___ 这部电影。", answer: "看过", tense: "pastParticiple" },
      { sentence: "我在 ___ 书。", answer: "看", tense: "present" },
    ],
  },
  {
    infinitive: "买",
    translation: { en: "to buy", fr: "acheter", zh: "买" },
    conjugation: {
      present: "买",
      past: "买了",
      pastParticiple: "买过",
      future: "会买",
      presentPerfect: "已经买了",
      pastPerfect: "买了",
    },
    examples: [
      { sentence: "他 ___ 一本新书。", answer: "买了", tense: "past" },
      { sentence: "我 ___ 咖啡。", answer: "会买", tense: "future" },
    ],
  },
  {
    infinitive: "写",
    translation: { en: "to write", fr: "écrire", zh: "写" },
    conjugation: {
      present: "写",
      past: "写了",
      pastParticiple: "写过",
      future: "会写",
      presentPerfect: "已经写了",
      pastPerfect: "写了",
    },
    examples: [
      { sentence: "他 ___ 三封信。", answer: "写了", tense: "past" },
      { sentence: "我 ___ 完作业了。", answer: "已经写了", tense: "presentPerfect" },
    ],
  },
  {
    infinitive: "说",
    translation: { en: "to speak", fr: "parler", zh: "说" },
    conjugation: {
      present: "说",
      past: "说了",
      pastParticiple: "说过",
      future: "会说",
      presentPerfect: "已经说了",
      pastPerfect: "说了",
    },
    examples: [
      { sentence: "她 ___ 中文吗？", answer: "会说", tense: "future" },
      { sentence: "他 ___ 一个故事。", answer: "说了", tense: "past" },
    ],
  },
  {
    infinitive: "喝",
    translation: { en: "to drink", fr: "boire", zh: "喝" },
    conjugation: {
      present: "喝",
      past: "喝了",
      pastParticiple: "喝过",
      future: "会喝",
      presentPerfect: "已经喝了",
      pastPerfect: "喝了",
    },
    examples: [
      { sentence: "我 ___ 两杯茶。", answer: "喝了", tense: "past" },
      { sentence: "你 ___ 咖啡吗？", answer: "喝过", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "来",
    translation: { en: "to come", fr: "venir", zh: "来" },
    conjugation: {
      present: "来",
      past: "来了",
      pastParticiple: "来过",
      future: "会来",
      presentPerfect: "已经来了",
      pastPerfect: "来了",
    },
    examples: [
      { sentence: "他 ___ 我家。", answer: "来过", tense: "pastParticiple" },
      { sentence: "明天她 ___ 。", answer: "会来", tense: "future" },
    ],
  },
  {
    infinitive: "学",
    translation: { en: "to learn", fr: "apprendre", zh: "学" },
    conjugation: {
      present: "学",
      past: "学了",
      pastParticiple: "学过",
      future: "会学",
      presentPerfect: "已经学了",
      pastPerfect: "学了",
    },
    examples: [
      { sentence: "我 ___ 中文一年了。", answer: "学了", tense: "past" },
      { sentence: "他 ___ 法语吗？", answer: "学过", tense: "pastParticiple" },
    ],
  },
  {
    infinitive: "做",
    translation: { en: "to make / do", fr: "faire", zh: "做" },
    conjugation: {
      present: "做",
      past: "做了",
      pastParticiple: "做过",
      future: "会做",
      presentPerfect: "已经做了",
      pastPerfect: "做了",
    },
    examples: [
      { sentence: "我 ___ 晚饭。", answer: "做了", tense: "past" },
      { sentence: "他 ___ 这个工作。", answer: "做过", tense: "pastParticiple" },
    ],
  },
];

const POOLS: Record<LanguageCode, VerbEntry[]> = { en: EN_VERBS, zh: ZH_VERBS };

/** Number of new verbs unlocked per day. */
const VERBS_PER_DAY = 1;
/** How many verbs a session tests. */
export const VERBS_SESSION_SIZE = 5;

/**
 * The verbs available on day N: verbs 1..min(N, poolSize). Newer verbs
 * appear earlier so they get more practice.
 */
export function getVerbPool(lang: LanguageCode, day: number): VerbEntry[] {
  const pool = POOLS[lang];
  const count = Math.min(pool.length, day * VERBS_PER_DAY);
  return pool.slice(0, count);
}
