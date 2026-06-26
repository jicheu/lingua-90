import type { LanguageCode, Topic, TopicId, TopicMeta } from "./types";
import { VIDEO_LESSONS } from "./videoLessons.generated";

export const TOPIC_META: TopicMeta[] = [
  { id: "history", label: "History", emoji: "🏛️" },
  { id: "philosophy", label: "Philosophy", emoji: "🦉" },
  { id: "sport", label: "Sport", emoji: "⚽" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "art", label: "Art", emoji: "🎨" },
];

/**
 * VIDEOS come from src/data/videoLessons.generated.ts — REAL YouTube captions
 * scraped from TED-Ed lessons (manual en + zh-CN tracks) by
 * scripts/fetch-captions.py. The inline `video` objects below are only kept as
 * an offline fallback; getLessonForDay() always prefers the real-caption video.
 *
 * READINGS (the 1-page documents + quizzes) are hand-authored per topic.
 */

const EN_TOPICS: Topic[] = [
  {
    id: "history",
    label: "History",
    emoji: "🏛️",
    lessons: [
      {
        video: {
          title: "The rise of the Roman Empire",
          youtubeId: "46ZXl-V4qwA",
          duration: "5 min",
          transcript: [
            { start: 0, end: 30, text: "Rome began as a small city on the banks of the river Tiber." },
            { start: 30, end: 75, text: "Over centuries it grew into a vast and powerful empire." },
            { start: 75, end: 120, text: "Roman roads connected distant lands and helped trade flourish." },
            { start: 120, end: 175, text: "Its soldiers, called legions, were famous for their discipline." },
            { start: 175, end: 230, text: "Latin, the language of Rome, shaped many modern languages." },
            { start: 230, end: 300, text: "Even today, Roman law and architecture influence our world." },
          ],
        },
        reading: {
          title: "How Rome Built an Empire",
          paragraphs: [
            "The story of Rome began almost three thousand years ago. According to legend, the city was founded by two brothers, Romulus and Remus. Whether or not the legend is true, Rome slowly grew from a small settlement into the centre of a huge empire.",
            "One important reason for Rome's success was its army. Roman soldiers were well trained and very disciplined. They built strong camps and long, straight roads that allowed them to move quickly across the land. Many of these roads still exist today.",
            "Rome was also clever in the way it treated the people it conquered. Instead of destroying them, it often offered them a chance to become Roman citizens. This made people loyal and helped the empire stay together for a long time.",
            "When we study Rome, we learn about more than old battles. We learn how laws, language, and ideas can travel across the world and last for thousands of years.",
          ],
          quiz: [
            { question: { en: "According to legend, who founded Rome?", fr: "Selon la légende, qui a fondé Rome ?", zh: "传说中，谁建立了罗马？" }, options: [{ en: "Caesar and Brutus", fr: "César et Brutus", zh: "凯撒和布鲁图斯" }, { en: "Romulus and Remus", fr: "Romulus et Remus", zh: "罗慕路斯和雷穆斯" }, { en: "Hannibal and Scipio", fr: "Hannibal et Scipion", zh: "汉尼拔和西庇阿" }], answer: 1 },
            { question: { en: "What was one key reason for Rome's success?", fr: "Quelle fut une raison clé du succès de Rome ?", zh: "罗马成功的一个关键原因是什么？" }, options: [{ en: "Its disciplined army", fr: "Son armée disciplinée", zh: "纪律严明的军队" }, { en: "Its large forests", fr: "Ses grandes forêts", zh: "广阔的森林" }, { en: "Its cold climate", fr: "Son climat froid", zh: "寒冷的气候" }], answer: 0 },
            { question: { en: "How did Rome often treat conquered peoples?", fr: "Comment Rome traitait-elle souvent les peuples conquis ?", zh: "罗马通常如何对待被征服的民族？" }, options: [{ en: "It ignored them", fr: "Elle les ignorait", zh: "无视他们" }, { en: "It offered citizenship", fr: "Elle offrait la citoyenneté", zh: "给予公民身份" }, { en: "It moved them to islands", fr: "Elle les déplaçait sur des îles", zh: "把他们迁到岛上" }], answer: 1 },
          ],
        },
      },
      {
        video: {
          title: "The Silk Road and ancient trade",
          youtubeId: "vfe-eNq-146",
          duration: "5 min",
          transcript: [
            { start: 0, end: 35, text: "The Silk Road was not one road, but a network of trade routes." },
            { start: 35, end: 80, text: "It connected China with the Middle East and Europe." },
            { start: 80, end: 130, text: "Merchants carried silk, spices, paper, and precious stones." },
            { start: 130, end: 185, text: "But ideas and religions also travelled along these routes." },
            { start: 185, end: 240, text: "Cities along the way grew rich and full of culture." },
            { start: 240, end: 300, text: "The Silk Road shows how connected the ancient world truly was." },
          ],
        },
        reading: {
          title: "Trading Across the Ancient World",
          paragraphs: [
            "Long before airplanes and ships crossed the oceans, traders travelled overland along a famous set of routes known as the Silk Road. These routes connected the East and the West, stretching for thousands of kilometres.",
            "Silk was one of the most valuable goods carried along these roads, which is how they got their name. But traders also carried spices, paper, glass, and many other items that people could not find at home.",
            "The Silk Road was about more than goods. Travellers shared their religions, their inventions, and their stories. In this way, knowledge spread from one civilisation to another.",
            "Studying the Silk Road reminds us that people have always wanted to connect, trade, and learn from one another, even across great distances.",
          ],
          quiz: [
            { question: { en: "What was the Silk Road?", fr: "Qu'était la Route de la soie ?", zh: "丝绸之路是什么？" }, options: [{ en: "A single paved road", fr: "Une seule route pavée", zh: "一条铺好的道路" }, { en: "A network of trade routes", fr: "Un réseau de routes commerciales", zh: "一张贸易路线网" }, { en: "A type of ship", fr: "Un type de navire", zh: "一种船" }], answer: 1 },
            { question: { en: "Why was it called the Silk Road?", fr: "Pourquoi l'appelait-on la Route de la soie ?", zh: "为什么叫丝绸之路？" }, options: [{ en: "Silk was a key traded good", fr: "La soie était une marchandise clé", zh: "丝绸是重要的贸易商品" }, { en: "It was soft to walk on", fr: "Elle était douce sous les pieds", zh: "走在上面很柔软" }, { en: "It was built by silk workers", fr: "Elle fut bâtie par des ouvriers de la soie", zh: "由丝绸工人修建" }], answer: 0 },
            { question: { en: "Besides goods, what else travelled along it?", fr: "Outre les marchandises, qu'y circulait aussi ?", zh: "除了商品，还有什么沿路传播？" }, options: [{ en: "Only soldiers", fr: "Seulement des soldats", zh: "只有士兵" }, { en: "Ideas and religions", fr: "Des idées et des religions", zh: "思想与宗教" }, { en: "Nothing else", fr: "Rien d'autre", zh: "别无其他" }], answer: 1 },
          ],
        },
      },
    ],
  },
  {
    id: "philosophy",
    label: "Philosophy",
    emoji: "🦉",
    lessons: [
      {
        video: {
          title: "The philosophy of Stoicism",
          youtubeId: "R9OCA6UFE-0",
          duration: "5 min",
          transcript: [
            { start: 0, end: 35, text: "The Stoics were ancient philosophers from Greece and Rome." },
            { start: 35, end: 85, text: "They taught that we cannot control everything that happens." },
            { start: 85, end: 140, text: "But we can always control how we choose to respond." },
            { start: 140, end: 195, text: "A calm and rational mind, they said, leads to a good life." },
            { start: 195, end: 250, text: "Thinkers like Seneca and Marcus Aurelius shared these ideas." },
            { start: 250, end: 300, text: "Stoic wisdom still helps people stay calm under pressure today." },
          ],
        },
        reading: {
          title: "What the Stoics Teach Us",
          paragraphs: [
            "Stoicism is a school of philosophy that began in ancient Greece more than two thousand years ago. Its followers, the Stoics, were interested in one simple but powerful question: how can we live a good and peaceful life?",
            "The Stoics believed that many things in life are outside our control. We cannot control the weather, other people, or the past. However, we can always control our own thoughts, choices, and actions.",
            "Because of this, the Stoics taught people not to worry about things they cannot change. Instead, they should focus their energy on doing their best with what they can control. This idea brings a sense of calm and freedom.",
            "Today, many people still read Stoic writers like Seneca and Marcus Aurelius. Their advice about staying calm and acting with reason is just as useful now as it was long ago.",
          ],
          quiz: [
            { question: { en: "Where did Stoicism begin?", fr: "Où le stoïcisme a-t-il commencé ?", zh: "斯多葛主义起源于哪里？" }, options: [{ en: "Ancient Egypt", fr: "L'Égypte antique", zh: "古埃及" }, { en: "Ancient Greece", fr: "La Grèce antique", zh: "古希腊" }, { en: "Medieval France", fr: "La France médiévale", zh: "中世纪法国" }], answer: 1 },
            { question: { en: "What did the Stoics say we can always control?", fr: "Que pouvons-nous toujours contrôler, selon les stoïciens ?", zh: "斯多葛学派认为我们始终能控制什么？" }, options: [{ en: "The weather", fr: "Le temps qu'il fait", zh: "天气" }, { en: "Our own thoughts and actions", fr: "Nos propres pensées et actions", zh: "我们自己的想法和行动" }, { en: "Other people", fr: "Les autres", zh: "其他人" }], answer: 1 },
            { question: { en: "Which writer was a famous Stoic?", fr: "Quel auteur était un célèbre stoïcien ?", zh: "哪位作家是著名的斯多葛派？" }, options: [{ en: "Marcus Aurelius", fr: "Marc Aurèle", zh: "马可·奥勒留" }, { en: "Isaac Newton", fr: "Isaac Newton", zh: "艾萨克·牛顿" }, { en: "Leonardo da Vinci", fr: "Léonard de Vinci", zh: "列奥纳多·达·芬奇" }], answer: 0 },
          ],
        },
      },
    ],
  },
  {
    id: "sport",
    label: "Sport",
    emoji: "⚽",
    lessons: [
      {
        video: {
          title: "The history of the Olympic Games",
          youtubeId: "OnW1Ym6Tg_o",
          duration: "5 min",
          transcript: [
            { start: 0, end: 35, text: "The Olympic Games began in ancient Greece, in a place called Olympia." },
            { start: 35, end: 85, text: "They were held every four years to honour the god Zeus." },
            { start: 85, end: 140, text: "Athletes competed in running, wrestling, and other events." },
            { start: 140, end: 195, text: "Winners were celebrated as heroes in their home cities." },
            { start: 195, end: 250, text: "The modern Olympics began again in 1896 in Athens." },
            { start: 250, end: 300, text: "Today, athletes from around the world gather to compete in peace." },
          ],
        },
        reading: {
          title: "From Ancient Olympia to Today",
          paragraphs: [
            "The Olympic Games are one of the oldest sporting events in the world. They began in ancient Greece, in a town called Olympia, almost three thousand years ago.",
            "In those days, the games were held every four years and were dedicated to Zeus, the king of the Greek gods. Athletes competed in events such as running, jumping, and wrestling. Winning was a great honour.",
            "After many centuries, the games stopped. But in 1896, a Frenchman named Pierre de Coubertin helped bring them back. The first modern Olympic Games were held in Athens, Greece.",
            "Today, the Olympic Games bring together athletes from almost every country. The event is not only about winning medals, but also about friendship and respect between nations.",
          ],
          quiz: [
            { question: { en: "Where did the ancient Olympics take place?", fr: "Où se déroulaient les Jeux olympiques antiques ?", zh: "古代奥运会在哪里举行？" }, options: [{ en: "Rome", fr: "Rome", zh: "罗马" }, { en: "Olympia", fr: "Olympie", zh: "奥林匹亚" }, { en: "Sparta", fr: "Sparte", zh: "斯巴达" }], answer: 1 },
            { question: { en: "How often were the games held?", fr: "À quelle fréquence les jeux avaient-ils lieu ?", zh: "运动会多久举行一次？" }, options: [{ en: "Every year", fr: "Chaque année", zh: "每年" }, { en: "Every four years", fr: "Tous les quatre ans", zh: "每四年" }, { en: "Every ten years", fr: "Tous les dix ans", zh: "每十年" }], answer: 1 },
            { question: { en: "When did the modern Olympics begin?", fr: "Quand les Jeux olympiques modernes ont-ils commencé ?", zh: "现代奥运会何时开始？" }, options: [{ en: "1896", fr: "1896", zh: "1896 年" }, { en: "1750", fr: "1750", zh: "1750 年" }, { en: "1950", fr: "1950", zh: "1950 年" }], answer: 0 },
          ],
        },
      },
    ],
  },
  {
    id: "science",
    label: "Science",
    emoji: "🔬",
    lessons: [
      {
        video: {
          title: "How big is the universe?",
          youtubeId: "K8aDfO5T1S8",
          duration: "5 min",
          transcript: [
            { start: 0, end: 35, text: "Our planet Earth is part of a system that orbits the Sun." },
            { start: 35, end: 85, text: "The Sun is just one of billions of stars in our galaxy." },
            { start: 85, end: 140, text: "Our galaxy, the Milky Way, is only one of billions of galaxies." },
            { start: 140, end: 195, text: "Light from distant stars takes millions of years to reach us." },
            { start: 195, end: 250, text: "So when we look at the night sky, we look into the past." },
            { start: 250, end: 300, text: "The universe is far larger than we can easily imagine." },
          ],
        },
        reading: {
          title: "Our Place in the Universe",
          paragraphs: [
            "When we look up at the night sky, we see thousands of tiny points of light. Most of these are stars, and many are far larger than our own Sun.",
            "Our Sun is a star too. The Earth and several other planets travel around it. Together they form our solar system. But the solar system is only a very small part of a much bigger structure.",
            "All the stars we can see belong to a huge group called the Milky Way galaxy. And the Milky Way is just one of billions of galaxies in the universe.",
            "Because the universe is so large, light from distant stars takes a very long time to reach us. When we look at those stars, we are really seeing light that left them long ago. In a way, looking at the sky is like looking back in time.",
          ],
          quiz: [
            { question: { en: "What is our Sun?", fr: "Qu'est-ce que notre Soleil ?", zh: "我们的太阳是什么？" }, options: [{ en: "A planet", fr: "Une planète", zh: "一颗行星" }, { en: "A star", fr: "Une étoile", zh: "一颗恒星" }, { en: "A galaxy", fr: "Une galaxie", zh: "一个星系" }], answer: 1 },
            { question: { en: "What is the name of our galaxy?", fr: "Comment s'appelle notre galaxie ?", zh: "我们的星系叫什么名字？" }, options: [{ en: "Andromeda", fr: "Andromède", zh: "仙女座" }, { en: "The Milky Way", fr: "La Voie lactée", zh: "银河系" }, { en: "The Solar System", fr: "Le Système solaire", zh: "太阳系" }], answer: 1 },
            { question: { en: "Why is looking at distant stars like looking into the past?", fr: "Pourquoi regarder des étoiles lointaines, c'est regarder le passé ?", zh: "为什么观看遥远的恒星就像看到过去？" }, options: [{ en: "The stars are old", fr: "Les étoiles sont vieilles", zh: "因为恒星很古老" }, { en: "Their light took a long time to reach us", fr: "Leur lumière a mis longtemps à nous parvenir", zh: "它们的光经过很长时间才到达我们" }, { en: "The sky is dark", fr: "Le ciel est sombre", zh: "因为天空是黑的" }], answer: 1 },
          ],
        },
      },
    ],
  },
  {
    id: "art",
    label: "Art",
    emoji: "🎨",
    lessons: [
      {
        video: {
          title: "Why is the Mona Lisa so famous?",
          youtubeId: "Wk5MgD_QvN0",
          duration: "5 min",
          transcript: [
            { start: 0, end: 35, text: "The Mona Lisa was painted by Leonardo da Vinci in Italy." },
            { start: 35, end: 85, text: "It is a portrait of a woman with a mysterious smile." },
            { start: 85, end: 140, text: "Leonardo used soft shadows to make her look very real." },
            { start: 140, end: 195, text: "The painting was once stolen, which made it even more famous." },
            { start: 195, end: 250, text: "Today it hangs in the Louvre museum in Paris." },
            { start: 250, end: 300, text: "Millions of people visit every year just to see her smile." },
          ],
        },
        reading: {
          title: "The Secret of the Mona Lisa",
          paragraphs: [
            "The Mona Lisa is perhaps the most famous painting in the world. It was created by the Italian artist Leonardo da Vinci about five hundred years ago.",
            "The painting shows a woman sitting calmly, with a gentle and mysterious smile. People have argued for centuries about what she might be thinking. Leonardo used a special technique with soft shadows to make her face look alive.",
            "Interestingly, the Mona Lisa became even more famous after it was stolen from a museum in 1911. Newspapers around the world wrote about the theft, and crowds came to see the empty space on the wall.",
            "Today the painting is kept safely behind glass in the Louvre museum in Paris. Every year, millions of visitors come to look at her famous smile.",
          ],
          quiz: [
            { question: { en: "Who painted the Mona Lisa?", fr: "Qui a peint la Joconde ?", zh: "《蒙娜丽莎》是谁画的？" }, options: [{ en: "Pablo Picasso", fr: "Pablo Picasso", zh: "巴勃罗·毕加索" }, { en: "Leonardo da Vinci", fr: "Léonard de Vinci", zh: "列奥纳多·达·芬奇" }, { en: "Vincent van Gogh", fr: "Vincent van Gogh", zh: "文森特·梵高" }], answer: 1 },
            { question: { en: "What made the painting even more famous in 1911?", fr: "Qu'est-ce qui rendit le tableau encore plus célèbre en 1911 ?", zh: "1911 年什么让这幅画更出名？" }, options: [{ en: "It was sold", fr: "Il fut vendu", zh: "它被卖掉了" }, { en: "It was stolen", fr: "Il fut volé", zh: "它被偷走了" }, { en: "It was repainted", fr: "Il fut repeint", zh: "它被重新绘制" }], answer: 1 },
            { question: { en: "Where is the Mona Lisa kept today?", fr: "Où se trouve la Joconde aujourd'hui ?", zh: "《蒙娜丽莎》如今保存在哪里？" }, options: [{ en: "The Louvre in Paris", fr: "Le Louvre à Paris", zh: "巴黎的卢浮宫" }, { en: "A castle in Italy", fr: "Un château en Italie", zh: "意大利的一座城堡" }, { en: "A private home", fr: "Une maison privée", zh: "一户私人住宅" }], answer: 0 },
          ],
        },
      },
    ],
  },
];

// Simplified Chinese lessons (one per topic). Day cycling reuses them.
const ZH_TOPICS: Topic[] = [
  {
    id: "history",
    label: "历史",
    emoji: "🏛️",
    lessons: [
      {
        video: {
          title: "长城的故事",
          youtubeId: "46ZXl-V4qwA",
          duration: "5 分钟",
          transcript: [
            { start: 0, end: 40, text: "长城 是 中国 古代 的 伟大 工程。" },
            { start: 40, end: 90, text: "它 用来 保护 国家 不 受 敌人 进攻。" },
            { start: 90, end: 150, text: "长城 很 长，跨过 山 和 沙漠。" },
            { start: 150, end: 210, text: "今天，很多 人 来 中国 参观 长城。" },
            { start: 210, end: 300, text: "长城 是 中国 历史 的 重要 象征。" },
          ],
        },
        reading: {
          title: "长城",
          paragraphs: [
            "长城 是 中国 最 有名 的 古代 建筑 之一。它 非常 长，跨过 很多 山 和 沙漠。",
            "古时候，人们 修建 长城 来 保护 国家。士兵 在 长城 上 守卫，注意 敌人。",
            "今天，长城 不再 用于 打仗。它 成为 一个 著名 的 旅游 地方。",
            "每年，很多 游客 来 中国 参观 长城。它 是 中国 历史 的 重要 象征。",
          ],
          quiz: [
            { question: { en: "What was the Great Wall used for in ancient times?", fr: "À quoi servait la Grande Muraille autrefois ?", zh: "长城 古时候 用来 做 什么？" }, options: [{ en: "To protect the country", fr: "Protéger le pays", zh: "保护 国家" }, { en: "To grow flowers", fr: "Cultiver des fleurs", zh: "种 花" }, { en: "To sell things", fr: "Vendre des choses", zh: "卖 东西" }], answer: 0 },
            { question: { en: "What is the Great Wall today?", fr: "Qu'est la Grande Muraille aujourd'hui ?", zh: "今天 长城 是 什么 地方？" }, options: [{ en: "A tourist place", fr: "Un lieu touristique", zh: "旅游 地方" }, { en: "A school", fr: "Une école", zh: "学校" }, { en: "A restaurant", fr: "Un restaurant", zh: "餐厅" }], answer: 0 },
            { question: { en: "The Great Wall is a symbol of China's what?", fr: "La Grande Muraille symbolise quoi de la Chine ?", zh: "长城 是 中国 什么 的 象征？" }, options: [{ en: "History", fr: "L'histoire", zh: "历史" }, { en: "Weather", fr: "La météo", zh: "天气" }, { en: "Food", fr: "La nourriture", zh: "食物" }], answer: 0 },
          ],
        },
      },
    ],
  },
  {
    id: "philosophy",
    label: "哲学",
    emoji: "🦉",
    lessons: [
      {
        video: {
          title: "孔子 的 智慧",
          youtubeId: "R9OCA6UFE-0",
          duration: "5 分钟",
          transcript: [
            { start: 0, end: 45, text: "孔子 是 中国 古代 著名 的 老师。" },
            { start: 45, end: 100, text: "他 教 人们 要 善良 和 尊重 别人。" },
            { start: 100, end: 160, text: "他 说，学习 是 一件 快乐 的 事。" },
            { start: 160, end: 220, text: "他 的 学生 把 他 的 话 写 成 书。" },
            { start: 220, end: 300, text: "今天，很多 人 还 在 学习 孔子 的 思想。" },
          ],
        },
        reading: {
          title: "孔子",
          paragraphs: [
            "孔子 是 中国 古代 一位 伟大 的 老师 和 思想家。他 生活 在 两千多 年 前。",
            "孔子 教 人们 要 善良、诚实，并且 尊重 父母 和 老师。",
            "他 也 认为 学习 非常 重要。他 说，温习 旧 知识 可以 学到 新 东西。",
            "他 的 学生 把 他 的 话 记 下来，写 成 一 本 书。今天 很多 人 还 在 读 它。",
          ],
          quiz: [
            { question: { en: "Who was Confucius?", fr: "Qui était Confucius ?", zh: "孔子 是 什么 人？" }, options: [{ en: "A teacher and thinker", fr: "Un professeur et penseur", zh: "老师 和 思想家" }, { en: "An emperor", fr: "Un empereur", zh: "皇帝" }, { en: "A merchant", fr: "Un marchand", zh: "商人" }], answer: 0 },
            { question: { en: "What did Confucius think was important?", fr: "Qu'est-ce que Confucius jugeait important ?", zh: "孔子 认为 什么 很 重要？" }, options: [{ en: "Learning", fr: "L'apprentissage", zh: "学习" }, { en: "War", fr: "La guerre", zh: "打仗" }, { en: "Travel", fr: "Le voyage", zh: "旅行" }], answer: 0 },
            { question: { en: "What did his words later become?", fr: "Que sont devenues ses paroles ?", zh: "他 的 话 后来 变成 了 什么？" }, options: [{ en: "A book", fr: "Un livre", zh: "一 本 书" }, { en: "A song", fr: "Une chanson", zh: "一 首 歌" }, { en: "A painting", fr: "Un tableau", zh: "一 幅 画" }], answer: 0 },
          ],
        },
      },
    ],
  },
  {
    id: "sport",
    label: "运动",
    emoji: "⚽",
    lessons: [
      {
        video: {
          title: "乒乓球",
          youtubeId: "OnW1Ym6Tg_o",
          duration: "5 分钟",
          transcript: [
            { start: 0, end: 45, text: "乒乓球 是 一 项 很 受欢迎 的 运动。" },
            { start: 45, end: 100, text: "在 中国，很多 人 都 喜欢 打 乒乓球。" },
            { start: 100, end: 160, text: "它 需要 快速 的 反应 和 好 的 技术。" },
            { start: 160, end: 220, text: "中国 队 在 比赛 中 经常 获胜。" },
            { start: 220, end: 300, text: "打 乒乓球 对 身体 和 头脑 都 有 好处。" },
          ],
        },
        reading: {
          title: "乒乓球",
          paragraphs: [
            "乒乓球 是 一 项 非常 受欢迎 的 运动。在 中国，几乎 每个 人 都 玩 过。",
            "这 项 运动 需要 两 个 人，一 张 桌子，一个 小 球 和 球拍。",
            "玩 乒乓球 的 时候，你 需要 快速 反应 和 好 的 技术。",
            "打 乒乓球 不但 有趣，而且 对 身体 和 头脑 都 有 好处。",
          ],
          quiz: [
            { question: { en: "How popular is table tennis in China?", fr: "Le tennis de table est-il populaire en Chine ?", zh: "在 中国 乒乓球 怎么样？" }, options: [{ en: "Very popular", fr: "Très populaire", zh: "很 受欢迎" }, { en: "Nobody plays it", fr: "Personne n'y joue", zh: "没有 人 玩" }, { en: "Very expensive", fr: "Très cher", zh: "很 贵" }], answer: 0 },
            { question: { en: "How many people are needed to play?", fr: "Combien de personnes faut-il pour jouer ?", zh: "玩 乒乓球 需要 几 个 人？" }, options: [{ en: "Two", fr: "Deux", zh: "两 个" }, { en: "Ten", fr: "Dix", zh: "十 个" }, { en: "One", fr: "Une", zh: "一 个" }], answer: 0 },
            { question: { en: "Table tennis is good for what?", fr: "Le tennis de table est bon pour quoi ?", zh: "打 乒乓球 对 什么 有 好处？" }, options: [{ en: "The body and mind", fr: "Le corps et l'esprit", zh: "身体 和 头脑" }, { en: "Only money", fr: "Seulement l'argent", zh: "只 有 钱" }, { en: "Nothing", fr: "Rien", zh: "没有 好处" }], answer: 0 },
          ],
        },
      },
    ],
  },
  {
    id: "science",
    label: "科学",
    emoji: "🔬",
    lessons: [
      {
        video: {
          title: "水 的 旅程",
          youtubeId: "K8aDfO5T1S8",
          duration: "5 分钟",
          transcript: [
            { start: 0, end: 45, text: "水 对 所有 生命 都 非常 重要。" },
            { start: 45, end: 100, text: "太阳 把 海里 的 水 变成 水汽。" },
            { start: 100, end: 160, text: "水汽 上升，变成 天上 的 云。" },
            { start: 160, end: 220, text: "云 里 的 水 又 变成 雨 落 下来。" },
            { start: 220, end: 300, text: "这 个 过程 一直 在 重复，叫 水 循环。" },
          ],
        },
        reading: {
          title: "水 循环",
          paragraphs: [
            "水 对 我们 的 生活 非常 重要。人、动物 和 植物 都 需要 水。",
            "太阳 照 在 海 上，把 水 变成 看不见 的 水汽。水汽 慢慢 上升 到 天空。",
            "在 高 的 地方，水汽 变 冷，形成 云。云 里 的 水 越来越 多。",
            "最后，水 变成 雨 或 雪 落 回 地面。这 个 过程 一直 重复，我们 叫 它 水 循环。",
          ],
          quiz: [
            { question: { en: "What turns sea water into vapour?", fr: "Qu'est-ce qui transforme l'eau de mer en vapeur ?", zh: "谁 把 海里 的 水 变成 水汽？" }, options: [{ en: "The Sun", fr: "Le Soleil", zh: "太阳" }, { en: "The Moon", fr: "La Lune", zh: "月亮" }, { en: "The wind", fr: "Le vent", zh: "风" }], answer: 0 },
            { question: { en: "What does vapour form in the sky?", fr: "Que forme la vapeur dans le ciel ?", zh: "水汽 在 天上 形成 什么？" }, options: [{ en: "Clouds", fr: "Des nuages", zh: "云" }, { en: "Mountains", fr: "Des montagnes", zh: "山" }, { en: "Trees", fr: "Des arbres", zh: "树" }], answer: 0 },
            { question: { en: "What is this repeating process called?", fr: "Comment s'appelle ce processus qui se répète ?", zh: "这 个 重复 的 过程 叫 什么？" }, options: [{ en: "The water cycle", fr: "Le cycle de l'eau", zh: "水 循环" }, { en: "Rain", fr: "La pluie", zh: "下雨" }, { en: "Wind", fr: "Le vent", zh: "刮风" }], answer: 0 },
          ],
        },
      },
    ],
  },
  {
    id: "art",
    label: "艺术",
    emoji: "🎨",
    lessons: [
      {
        video: {
          title: "中国 书法",
          youtubeId: "Wk5MgD_QvN0",
          duration: "5 分钟",
          transcript: [
            { start: 0, end: 45, text: "书法 是 写 汉字 的 艺术。" },
            { start: 45, end: 100, text: "人们 用 毛笔 和 墨 来 写 字。" },
            { start: 100, end: 160, text: "好 的 书法 又 美 又 有 力量。" },
            { start: 160, end: 220, text: "学习 书法 需要 很多 年 的 练习。" },
            { start: 220, end: 300, text: "书法 是 中国 文化 的 重要 部分。" },
          ],
        },
        reading: {
          title: "中国 书法",
          paragraphs: [
            "书法 是 一 种 古老 的 中国 艺术。它 就是 用 美丽 的 方式 来 写 汉字。",
            "写 书法 的 时候，人们 用 一 支 毛笔 和 黑色 的 墨。",
            "好 的 书法 看起来 又 美 又 有 力量。每 一 个 字 都 像 一 幅 画。",
            "学习 书法 需要 很多 年 的 练习。它 是 中国 文化 很 重要 的 一 部分。",
          ],
          quiz: [
            { question: { en: "Calligraphy is the art of writing what?", fr: "La calligraphie est l'art d'écrire quoi ?", zh: "书法 是 写 什么 的 艺术？" }, options: [{ en: "Chinese characters", fr: "Des caractères chinois", zh: "汉字" }, { en: "Numbers", fr: "Des chiffres", zh: "数字" }, { en: "Music", fr: "De la musique", zh: "音乐" }], answer: 0 },
            { question: { en: "What tools are used for calligraphy?", fr: "Quels outils utilise-t-on pour la calligraphie ?", zh: "写 书法 用 什么 工具？" }, options: [{ en: "A brush and ink", fr: "Un pinceau et de l'encre", zh: "毛笔 和 墨" }, { en: "A computer", fr: "Un ordinateur", zh: "电脑" }, { en: "A pencil", fr: "Un crayon", zh: "铅笔" }], answer: 0 },
            { question: { en: "What does learning calligraphy require?", fr: "Que demande l'apprentissage de la calligraphie ?", zh: "学习 书法 需要 什么？" }, options: [{ en: "A lot of practice", fr: "Beaucoup de pratique", zh: "很多 练习" }, { en: "A lot of money", fr: "Beaucoup d'argent", zh: "很多 钱" }, { en: "One day", fr: "Un jour", zh: "一 天" }], answer: 0 },
          ],
        },
      },
    ],
  },
];

const TOPICS_BY_LANG: Record<LanguageCode, Topic[]> = {
  en: EN_TOPICS,
  zh: ZH_TOPICS,
};

export function getTopics(lang: LanguageCode): Topic[] {
  return TOPICS_BY_LANG[lang];
}

export function getTopic(lang: LanguageCode, id: TopicId): Topic {
  const topics = TOPICS_BY_LANG[lang];
  return topics.find((t) => t.id === id) ?? topics[0];
}

/**
 * Pick the lesson for a given topic + day. The VIDEO uses real YouTube captions
 * from videoLessons.generated.ts (cycling through the available clips); the
 * READING is the hand-authored 1-page document for that topic. Video and
 * reading cycle independently so combinations vary across the 90 days.
 */
export function getLessonForDay(lang: LanguageCode, id: TopicId, day: number) {
  const topic = getTopic(lang, id);
  const readingIdx = (day - 1) % topic.lessons.length;
  const base = topic.lessons[readingIdx];

  const videos = VIDEO_LESSONS[lang]?.[id] ?? [];
  const video =
    videos.length > 0 ? videos[(day - 1) % videos.length] : base.video;

  return { video, reading: base.reading };
}
