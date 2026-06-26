import type { LanguageCode, Word } from "./types";

/**
 * Vocabulary pools per language. `translation` and `definition` are localized
 * (en/fr/zh) so they follow the interface language; `example` stays in the
 * target language for immersion.
 *
 * Day N deterministically selects 3 words (see selectDailyWords).
 * The English "casual" set is seeded from the original vocabulary.json.
 */
const EN_WORDS: Word[] = [
  // --- casual ---
  { term: "hello", phonetic: "/həˈloʊ/", translation: { en: "hello", fr: "bonjour", zh: "你好" }, definition: { en: "A greeting used when meeting someone.", fr: "Une salutation utilisée quand on rencontre quelqu'un.", zh: "见面时使用的问候语。" }, example: "Hello, how are you today?", category: "casual" },
  { term: "goodbye", phonetic: "/ɡʊdˈbaɪ/", translation: { en: "goodbye", fr: "au revoir", zh: "再见" }, definition: { en: "Said when leaving or parting.", fr: "Se dit en partant ou en se quittant.", zh: "离开或告别时说的话。" }, example: "Goodbye, see you tomorrow!", category: "casual" },
  { term: "please", phonetic: "/pliːz/", translation: { en: "please", fr: "s'il vous plaît", zh: "请" }, definition: { en: "A polite word used when asking for something.", fr: "Un mot poli pour demander quelque chose.", zh: "请求某事时使用的礼貌用语。" }, example: "Can you help me, please?", category: "casual" },
  { term: "thank you", phonetic: "/ˈθæŋk juː/", translation: { en: "thank you", fr: "merci", zh: "谢谢" }, definition: { en: "An expression of gratitude.", fr: "Une expression de gratitude.", zh: "表示感谢的话。" }, example: "Thank you for your help.", category: "casual" },
  { term: "sorry", phonetic: "/ˈsɒri/", translation: { en: "sorry", fr: "désolé", zh: "对不起" }, definition: { en: "Used to apologise or express regret.", fr: "Pour s'excuser ou exprimer un regret.", zh: "用来道歉或表示遗憾。" }, example: "I'm sorry I was late.", category: "casual" },
  { term: "nice", phonetic: "/naɪs/", translation: { en: "nice / pleasant", fr: "agréable", zh: "好的" }, definition: { en: "Pleasant, enjoyable or kind.", fr: "Agréable, plaisant ou gentil.", zh: "令人愉快的、友好的。" }, example: "It was nice to meet you.", category: "casual" },
  { term: "yes", phonetic: "/jɛs/", translation: { en: "yes", fr: "oui", zh: "是" }, definition: { en: "An affirmative answer.", fr: "Une réponse affirmative.", zh: "肯定的回答。" }, example: "Yes, I agree with you.", category: "casual" },
  { term: "no", phonetic: "/noʊ/", translation: { en: "no", fr: "non", zh: "不" }, definition: { en: "A negative answer.", fr: "Une réponse négative.", zh: "否定的回答。" }, example: "No, thank you.", category: "casual" },
  { term: "friend", phonetic: "/frɛnd/", translation: { en: "friend", fr: "ami", zh: "朋友" }, definition: { en: "A person you like and trust.", fr: "Une personne que vous aimez et en qui vous avez confiance.", zh: "你喜欢并信任的人。" }, example: "She is my best friend.", category: "casual" },
  { term: "happy", phonetic: "/ˈhæpi/", translation: { en: "happy", fr: "heureux", zh: "高兴" }, definition: { en: "Feeling or showing pleasure.", fr: "Qui ressent ou montre du plaisir.", zh: "感到或表现出快乐。" }, example: "I am happy to see you.", category: "casual" },
  // --- professional ---
  { term: "important", phonetic: "/ɪmˈpɔːrtənt/", translation: { en: "important", fr: "important", zh: "重要" }, definition: { en: "Of great significance or value.", fr: "D'une grande importance ou valeur.", zh: "非常重要或有价值的。" }, example: "This is an important meeting.", category: "professional" },
  { term: "urgent", phonetic: "/ˈɜːrdʒənt/", translation: { en: "urgent", fr: "urgent", zh: "紧急" }, definition: { en: "Requiring immediate action.", fr: "Qui demande une action immédiate.", zh: "需要立即处理的。" }, example: "Please reply, it is urgent.", category: "professional" },
  { term: "email", phonetic: "/ˈiːmeɪl/", translation: { en: "email", fr: "courriel", zh: "电子邮件" }, definition: { en: "A message sent electronically.", fr: "Un message envoyé électroniquement.", zh: "通过电子方式发送的消息。" }, example: "I will send you an email.", category: "professional" },
  { term: "report", phonetic: "/rɪˈpɔːrt/", translation: { en: "report", fr: "rapport", zh: "报告" }, definition: { en: "A document giving information.", fr: "Un document qui donne des informations.", zh: "提供信息的文件。" }, example: "She wrote a detailed report.", category: "professional" },
  { term: "project", phonetic: "/ˈprɒdʒɛkt/", translation: { en: "project", fr: "projet", zh: "项目" }, definition: { en: "A planned piece of work.", fr: "Un travail planifié.", zh: "计划好的工作。" }, example: "Our project is due Friday.", category: "professional" },
  { term: "deadline", phonetic: "/ˈdɛdlaɪn/", translation: { en: "deadline", fr: "échéance", zh: "截止日期" }, definition: { en: "The latest time to finish something.", fr: "Le moment limite pour terminer quelque chose.", zh: "完成某事的最后时限。" }, example: "The deadline is next week.", category: "professional" },
  { term: "task", phonetic: "/tæsk/", translation: { en: "task", fr: "tâche", zh: "任务" }, definition: { en: "A piece of work to be done.", fr: "Un travail à accomplir.", zh: "要完成的一项工作。" }, example: "I finished every task.", category: "professional" },
  { term: "meeting", phonetic: "/ˈmiːtɪŋ/", translation: { en: "meeting", fr: "réunion", zh: "会议" }, definition: { en: "A gathering to discuss things.", fr: "Un rassemblement pour discuter.", zh: "一起讨论事情的聚会。" }, example: "The meeting starts at nine.", category: "professional" },
  { term: "schedule", phonetic: "/ˈskɛdʒuːl/", translation: { en: "schedule", fr: "emploi du temps", zh: "日程" }, definition: { en: "A plan of times for events.", fr: "Un plan des horaires des événements.", zh: "安排事件时间的计划。" }, example: "Check your schedule first.", category: "professional" },
  { term: "decision", phonetic: "/dɪˈsɪʒən/", translation: { en: "decision", fr: "décision", zh: "决定" }, definition: { en: "A choice made after thinking.", fr: "Un choix fait après réflexion.", zh: "经过思考后做出的选择。" }, example: "We made the right decision.", category: "professional" },
  // --- food & travel ---
  { term: "eat", phonetic: "/iːt/", translation: { en: "to eat", fr: "manger", zh: "吃" }, definition: { en: "To put food in your mouth.", fr: "Mettre de la nourriture dans sa bouche.", zh: "把食物放进嘴里。" }, example: "Let's eat lunch together.", category: "food & travel" },
  { term: "drink", phonetic: "/drɪŋk/", translation: { en: "to drink", fr: "boire", zh: "喝" }, definition: { en: "To take liquid into your body.", fr: "Absorber un liquide.", zh: "把液体喝进身体。" }, example: "I drink water every day.", category: "food & travel" },
  { term: "restaurant", phonetic: "/ˈrɛstrɒnt/", translation: { en: "restaurant", fr: "restaurant", zh: "餐厅" }, definition: { en: "A place where meals are served.", fr: "Un lieu où l'on sert des repas.", zh: "供应饭菜的地方。" }, example: "We ate at a nice restaurant.", category: "food & travel" },
  { term: "hotel", phonetic: "/hoʊˈtɛl/", translation: { en: "hotel", fr: "hôtel", zh: "酒店" }, definition: { en: "A place to stay overnight.", fr: "Un lieu où passer la nuit.", zh: "过夜住宿的地方。" }, example: "Our hotel is near the beach.", category: "food & travel" },
  { term: "movie", phonetic: "/ˈmuːvi/", translation: { en: "movie", fr: "film", zh: "电影" }, definition: { en: "A story shown on screen.", fr: "Une histoire montrée à l'écran.", zh: "在屏幕上播放的故事。" }, example: "Let's watch a movie tonight.", category: "food & travel" },
  { term: "concert", phonetic: "/ˈkɒnsərt/", translation: { en: "concert", fr: "concert", zh: "音乐会" }, definition: { en: "A live music performance.", fr: "Un spectacle de musique en direct.", zh: "现场音乐表演。" }, example: "The concert was amazing.", category: "food & travel" },
  { term: "travel", phonetic: "/ˈtrævəl/", translation: { en: "to travel", fr: "voyager", zh: "旅行" }, definition: { en: "To go from one place to another.", fr: "Aller d'un endroit à un autre.", zh: "从一个地方去另一个地方。" }, example: "I love to travel in summer.", category: "food & travel" },
  { term: "ticket", phonetic: "/ˈtɪkɪt/", translation: { en: "ticket", fr: "billet", zh: "票" }, definition: { en: "A paper allowing entry or travel.", fr: "Un papier permettant d'entrer ou de voyager.", zh: "允许进入或乘坐的票据。" }, example: "I bought a train ticket.", category: "food & travel" },
  // --- connectors ---
  { term: "because", phonetic: "/bɪˈkɔːz/", translation: { en: "because", fr: "parce que", zh: "因为" }, definition: { en: "For the reason that.", fr: "Pour la raison que.", zh: "因为，出于某种原因。" }, example: "I stayed home because it rained.", category: "connectors" },
  { term: "although", phonetic: "/ɔːlˈðoʊ/", translation: { en: "although", fr: "bien que", zh: "虽然" }, definition: { en: "In spite of the fact that.", fr: "Malgré le fait que.", zh: "尽管，虽然如此。" }, example: "Although it was hard, she won.", category: "connectors" },
  { term: "understand", phonetic: "/ˌʌndərˈstænd/", translation: { en: "to understand", fr: "comprendre", zh: "理解" }, definition: { en: "To know the meaning of something.", fr: "Connaître le sens de quelque chose.", zh: "知道某事的含义。" }, example: "Do you understand the rules?", category: "connectors" },
  { term: "remember", phonetic: "/rɪˈmɛmbər/", translation: { en: "to remember", fr: "se souvenir", zh: "记得" }, definition: { en: "To keep something in your mind.", fr: "Garder quelque chose en mémoire.", zh: "把某事记在心里。" }, example: "I remember that day well.", category: "connectors" },
  { term: "improve", phonetic: "/ɪmˈpruːv/", translation: { en: "to improve", fr: "améliorer", zh: "提高" }, definition: { en: "To make or become better.", fr: "Rendre ou devenir meilleur.", zh: "使变得更好。" }, example: "Practice helps you improve.", category: "connectors" },
  { term: "however", phonetic: "/haʊˈɛvər/", translation: { en: "however", fr: "cependant", zh: "然而" }, definition: { en: "Used to add a contrasting idea.", fr: "Pour ajouter une idée contrastée.", zh: "用来引出相反的想法。" }, example: "It's cold; however, it's sunny.", category: "connectors" },
];

const ZH_WORDS: Word[] = [
  { term: "你好", phonetic: "nǐ hǎo", translation: { en: "hello", fr: "bonjour", zh: "你好（问候语）" }, definition: { en: "A common greeting.", fr: "Une salutation courante.", zh: "常用的问候语。" }, example: "你好，很高兴见到你。", category: "casual" },
  { term: "再见", phonetic: "zài jiàn", translation: { en: "goodbye", fr: "au revoir", zh: "再见" }, definition: { en: "Said when parting.", fr: "Se dit en se quittant.", zh: "分别时说的话。" }, example: "再见，明天见！", category: "casual" },
  { term: "请", phonetic: "qǐng", translation: { en: "please", fr: "s'il vous plaît", zh: "请（礼貌用语）" }, definition: { en: "A polite request word.", fr: "Un mot de requête poli.", zh: "礼貌地请求时用。" }, example: "请坐。", category: "casual" },
  { term: "谢谢", phonetic: "xiè xie", translation: { en: "thank you", fr: "merci", zh: "谢谢" }, definition: { en: "An expression of thanks.", fr: "Une expression de remerciement.", zh: "表示感谢。" }, example: "谢谢你的帮助。", category: "casual" },
  { term: "对不起", phonetic: "duì bu qǐ", translation: { en: "sorry", fr: "désolé", zh: "对不起" }, definition: { en: "Used to apologise.", fr: "Pour s'excuser.", zh: "用来道歉。" }, example: "对不起，我迟到了。", category: "casual" },
  { term: "朋友", phonetic: "péng you", translation: { en: "friend", fr: "ami", zh: "朋友" }, definition: { en: "A person you trust.", fr: "Une personne en qui vous avez confiance.", zh: "你信任的人。" }, example: "他是我的好朋友。", category: "casual" },
  { term: "高兴", phonetic: "gāo xìng", translation: { en: "happy", fr: "heureux", zh: "高兴" }, definition: { en: "Glad, pleased.", fr: "Content, ravi.", zh: "感到快乐。" }, example: "我很高兴。", category: "casual" },
  { term: "重要", phonetic: "zhòng yào", translation: { en: "important", fr: "important", zh: "重要" }, definition: { en: "Of great value.", fr: "De grande valeur.", zh: "很有价值的。" }, example: "这是一个重要的会议。", category: "professional" },
  { term: "会议", phonetic: "huì yì", translation: { en: "meeting", fr: "réunion", zh: "会议" }, definition: { en: "A gathering to discuss.", fr: "Un rassemblement pour discuter.", zh: "一起讨论的聚会。" }, example: "会议九点开始。", category: "professional" },
  { term: "项目", phonetic: "xiàng mù", translation: { en: "project", fr: "projet", zh: "项目" }, definition: { en: "A planned piece of work.", fr: "Un travail planifié.", zh: "计划好的工作。" }, example: "我们的项目很成功。", category: "professional" },
  { term: "报告", phonetic: "bào gào", translation: { en: "report", fr: "rapport", zh: "报告" }, definition: { en: "A document with information.", fr: "Un document avec des informations.", zh: "提供信息的文件。" }, example: "请写一份报告。", category: "professional" },
  { term: "任务", phonetic: "rèn wu", translation: { en: "task", fr: "tâche", zh: "任务" }, definition: { en: "Work to be done.", fr: "Un travail à accomplir.", zh: "要做的工作。" }, example: "我完成了任务。", category: "professional" },
  { term: "吃", phonetic: "chī", translation: { en: "to eat", fr: "manger", zh: "吃" }, definition: { en: "To consume food.", fr: "Consommer de la nourriture.", zh: "把食物放进嘴里。" }, example: "我们一起吃饭吧。", category: "food & travel" },
  { term: "喝", phonetic: "hē", translation: { en: "to drink", fr: "boire", zh: "喝" }, definition: { en: "To consume liquid.", fr: "Consommer un liquide.", zh: "喝下液体。" }, example: "我每天喝水。", category: "food & travel" },
  { term: "餐厅", phonetic: "cān tīng", translation: { en: "restaurant", fr: "restaurant", zh: "餐厅" }, definition: { en: "A place that serves meals.", fr: "Un lieu qui sert des repas.", zh: "提供饭菜的地方。" }, example: "这家餐厅很好。", category: "food & travel" },
  { term: "旅行", phonetic: "lǚ xíng", translation: { en: "to travel", fr: "voyager", zh: "旅行" }, definition: { en: "To go to another place.", fr: "Aller dans un autre lieu.", zh: "去别的地方。" }, example: "我喜欢旅行。", category: "food & travel" },
  { term: "酒店", phonetic: "jiǔ diàn", translation: { en: "hotel", fr: "hôtel", zh: "酒店" }, definition: { en: "A place to stay overnight.", fr: "Un lieu où passer la nuit.", zh: "过夜住的地方。" }, example: "酒店在海边。", category: "food & travel" },
  { term: "因为", phonetic: "yīn wèi", translation: { en: "because", fr: "parce que", zh: "因为" }, definition: { en: "For the reason that.", fr: "Pour la raison que.", zh: "表示原因。" }, example: "因为下雨，我没去。", category: "connectors" },
  { term: "虽然", phonetic: "suī rán", translation: { en: "although", fr: "bien que", zh: "虽然" }, definition: { en: "In spite of the fact that.", fr: "Malgré le fait que.", zh: "尽管……。" }, example: "虽然很难，但她赢了。", category: "connectors" },
  { term: "明白", phonetic: "míng bai", translation: { en: "to understand", fr: "comprendre", zh: "明白" }, definition: { en: "To grasp the meaning.", fr: "Saisir le sens.", zh: "懂得意思。" }, example: "你明白吗？", category: "connectors" },
  { term: "记得", phonetic: "jì de", translation: { en: "to remember", fr: "se souvenir", zh: "记得" }, definition: { en: "To keep in mind.", fr: "Garder en mémoire.", zh: "放在心里不忘。" }, example: "我记得那一天。", category: "connectors" },
  { term: "提高", phonetic: "tí gāo", translation: { en: "to improve", fr: "améliorer", zh: "提高" }, definition: { en: "To make better.", fr: "Rendre meilleur.", zh: "变得更好。" }, example: "练习帮助你提高。", category: "connectors" },
  { term: "但是", phonetic: "dàn shì", translation: { en: "but / however", fr: "mais / cependant", zh: "但是" }, definition: { en: "Introduces a contrast.", fr: "Introduit un contraste.", zh: "引出相反的意思。" }, example: "很冷，但是有太阳。", category: "connectors" },
  { term: "学习", phonetic: "xué xí", translation: { en: "to study / learn", fr: "étudier / apprendre", zh: "学习" }, definition: { en: "To gain knowledge.", fr: "Acquérir des connaissances.", zh: "获得知识。" }, example: "我每天学习中文。", category: "connectors" },
];

const POOLS: Record<LanguageCode, Word[]> = {
  en: EN_WORDS,
  zh: ZH_WORDS,
};

export function getWordPool(lang: LanguageCode): Word[] {
  return POOLS[lang];
}

/**
 * Deterministically select 3 words for a given day so the learner always
 * sees the same trio for "Day N". Uses a simple stride over the pool.
 */
export function selectDailyWords(lang: LanguageCode, day: number): Word[] {
  const pool = POOLS[lang];
  const n = pool.length;
  const start = ((day - 1) * 3) % n;
  return [0, 1, 2].map((i) => pool[(start + i) % n]);
}
