import type { LanguageCode, Localized, Word } from "../data/types";
import { getWordPool } from "../data/vocabData";

/** Strip surrounding punctuation and lowercase (for English matching). */
export function normalizeToken(token: string): string {
  return token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

export interface Gloss {
  term: string;
  /** Localized gloss (en / fr / zh). */
  translation: Localized;
  /** Optional localized definition (en / fr / zh). */
  definition?: Localized;
}

/**
 * Supplemental mini-glossary covering common words found in the reading
 * articles that are outside the core vocabulary pool. Translation and
 * definition are localized so click-to-translate follows the interface language.
 */
const SUPPLEMENT: Record<LanguageCode, Record<string, Gloss>> = {
  en: {
    empire: { term: "empire", translation: { en: "empire", fr: "empire", zh: "帝国" }, definition: { en: "A group of countries ruled by one power.", fr: "Un ensemble de pays dirigés par une même puissance.", zh: "由一个政权统治的一群国家。" } },
    army: { term: "army", translation: { en: "army", fr: "armée", zh: "军队" }, definition: { en: "A large group of soldiers.", fr: "Un grand groupe de soldats.", zh: "一大群士兵。" } },
    soldier: { term: "soldier", translation: { en: "soldier", fr: "soldat", zh: "士兵" }, definition: { en: "A member of an army.", fr: "Un membre d'une armée.", zh: "军队的成员。" } },
    soldiers: { term: "soldiers", translation: { en: "soldiers", fr: "soldats", zh: "士兵" }, definition: { en: "Members of an army.", fr: "Des membres d'une armée.", zh: "军队的成员。" } },
    road: { term: "road", translation: { en: "road", fr: "route", zh: "道路" }, definition: { en: "A way built for travel.", fr: "Une voie construite pour se déplacer.", zh: "供通行而建的路。" } },
    roads: { term: "roads", translation: { en: "roads", fr: "routes", zh: "道路" }, definition: { en: "Ways built for travel.", fr: "Des voies construites pour se déplacer.", zh: "供通行而建的路。" } },
    citizen: { term: "citizen", translation: { en: "citizen", fr: "citoyen", zh: "公民" }, definition: { en: "A legal member of a country.", fr: "Un membre légal d'un pays.", zh: "一个国家的合法成员。" } },
    citizens: { term: "citizens", translation: { en: "citizens", fr: "citoyens", zh: "公民" }, definition: { en: "Legal members of a country.", fr: "Des membres légaux d'un pays.", zh: "一个国家的合法成员。" } },
    trade: { term: "trade", translation: { en: "trade", fr: "commerce", zh: "贸易" }, definition: { en: "Buying and selling goods.", fr: "L'achat et la vente de biens.", zh: "买卖商品。" } },
    goods: { term: "goods", translation: { en: "goods", fr: "marchandises", zh: "商品" }, definition: { en: "Things that are bought and sold.", fr: "Des choses qui s'achètent et se vendent.", zh: "用来买卖的东西。" } },
    silk: { term: "silk", translation: { en: "silk", fr: "soie", zh: "丝绸" }, definition: { en: "A soft, fine cloth.", fr: "Un tissu doux et fin.", zh: "一种柔软精细的布料。" } },
    spices: { term: "spices", translation: { en: "spices", fr: "épices", zh: "香料" }, definition: { en: "Substances used to flavour food.", fr: "Des substances pour parfumer les aliments.", zh: "用来给食物调味的物质。" } },
    philosophy: { term: "philosophy", translation: { en: "philosophy", fr: "philosophie", zh: "哲学" }, definition: { en: "The study of ideas about life and knowledge.", fr: "L'étude des idées sur la vie et le savoir.", zh: "关于人生与知识的思想研究。" } },
    control: { term: "control", translation: { en: "control", fr: "contrôler", zh: "控制" }, definition: { en: "To have power over something.", fr: "Avoir du pouvoir sur quelque chose.", zh: "对某事拥有掌控力。" } },
    calm: { term: "calm", translation: { en: "calm", fr: "calme", zh: "平静" }, definition: { en: "Peaceful and not worried.", fr: "Paisible et sans inquiétude.", zh: "平静而不焦虑。" } },
    reason: { term: "reason", translation: { en: "reason", fr: "raison", zh: "理性" }, definition: { en: "Clear, logical thinking.", fr: "Une pensée claire et logique.", zh: "清晰的逻辑思考。" } },
    athletes: { term: "athletes", translation: { en: "athletes", fr: "athlètes", zh: "运动员" }, definition: { en: "People who are good at sport.", fr: "Des personnes douées en sport.", zh: "擅长运动的人。" } },
    medal: { term: "medal", translation: { en: "medal", fr: "médaille", zh: "奖牌" }, definition: { en: "A prize for winning.", fr: "Un prix pour une victoire.", zh: "获胜的奖品。" } },
    medals: { term: "medals", translation: { en: "medals", fr: "médailles", zh: "奖牌" }, definition: { en: "Prizes for winning.", fr: "Des prix pour une victoire.", zh: "获胜的奖品。" } },
    star: { term: "star", translation: { en: "star", fr: "étoile", zh: "恒星" }, definition: { en: "A huge ball of burning gas in space.", fr: "Une énorme boule de gaz brûlant dans l'espace.", zh: "太空中燃烧的巨大气体球。" } },
    stars: { term: "stars", translation: { en: "stars", fr: "étoiles", zh: "恒星" }, definition: { en: "Huge balls of burning gas in space.", fr: "D'énormes boules de gaz brûlant dans l'espace.", zh: "太空中燃烧的巨大气体球。" } },
    galaxy: { term: "galaxy", translation: { en: "galaxy", fr: "galaxie", zh: "星系" }, definition: { en: "A very large group of stars.", fr: "Un très grand groupe d'étoiles.", zh: "由大量恒星组成的星系。" } },
    universe: { term: "universe", translation: { en: "universe", fr: "univers", zh: "宇宙" }, definition: { en: "All of space and everything in it.", fr: "Tout l'espace et tout ce qu'il contient.", zh: "整个太空及其中的一切。" } },
    planet: { term: "planet", translation: { en: "planet", fr: "planète", zh: "行星" }, definition: { en: "A large body that orbits a star.", fr: "Un grand corps qui tourne autour d'une étoile.", zh: "绕恒星运行的大天体。" } },
    planets: { term: "planets", translation: { en: "planets", fr: "planètes", zh: "行星" }, definition: { en: "Large bodies that orbit a star.", fr: "De grands corps qui tournent autour d'une étoile.", zh: "绕恒星运行的大天体。" } },
    painting: { term: "painting", translation: { en: "painting", fr: "peinture", zh: "绘画" }, definition: { en: "A picture made with paint.", fr: "Une image faite avec de la peinture.", zh: "用颜料绘成的图画。" } },
    artist: { term: "artist", translation: { en: "artist", fr: "artiste", zh: "艺术家" }, definition: { en: "A person who makes art.", fr: "Une personne qui crée de l'art.", zh: "创作艺术的人。" } },
    smile: { term: "smile", translation: { en: "smile", fr: "sourire", zh: "微笑" }, definition: { en: "A happy expression on the face.", fr: "Une expression joyeuse du visage.", zh: "脸上快乐的表情。" } },
    museum: { term: "museum", translation: { en: "museum", fr: "musée", zh: "博物馆" }, definition: { en: "A place that displays art or history.", fr: "Un lieu qui expose l'art ou l'histoire.", zh: "展示艺术或历史的地方。" } },
    famous: { term: "famous", translation: { en: "famous", fr: "célèbre", zh: "著名" }, definition: { en: "Known by many people.", fr: "Connu de beaucoup de gens.", zh: "为很多人所知的。" } },
    world: { term: "world", translation: { en: "world", fr: "monde", zh: "世界" }, definition: { en: "The earth and all its people.", fr: "La Terre et tous ses habitants.", zh: "地球及其所有的人。" } },
    people: { term: "people", translation: { en: "people", fr: "gens", zh: "人们" }, definition: { en: "Human beings in general.", fr: "Les êtres humains en général.", zh: "泛指人类。" } },
    learn: { term: "learn", translation: { en: "learn", fr: "apprendre", zh: "学习" }, definition: { en: "To gain knowledge or skill.", fr: "Acquérir des connaissances ou une compétence.", zh: "获得知识或技能。" } },
    knowledge: { term: "knowledge", translation: { en: "knowledge", fr: "connaissance", zh: "知识" }, definition: { en: "Information and understanding.", fr: "L'information et la compréhension.", zh: "信息与理解。" } },
  },
  zh: {},
};

/** Look up a single token. Tries core vocab first, then the supplement. */
export function lookupWord(lang: LanguageCode, token: string): Gloss | null {
  const pool = getWordPool(lang);

  if (lang === "zh") {
    const exact = pool.find((w) => w.term === token);
    if (exact) return glossFromWord(exact);
    return null;
  }

  const norm = normalizeToken(token).toLowerCase();
  if (!norm) return null;

  const poolMatch = pool.find((w) => w.term.toLowerCase() === norm);
  if (poolMatch) return glossFromWord(poolMatch);

  const supp = SUPPLEMENT[lang][norm];
  if (supp) return supp;

  return null;
}

function glossFromWord(w: Word): Gloss {
  return { term: w.term, translation: w.translation, definition: w.definition };
}
