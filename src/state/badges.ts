export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: "first-step", label: "First Step", emoji: "👣", description: "Complete your very first day." },
  { id: "streak-7", label: "Week Warrior", emoji: "🔥", description: "Reach a 7-day streak." },
  { id: "streak-30", label: "Iron Will", emoji: "💪", description: "Reach a 30-day streak." },
  { id: "words-30", label: "Word Collector", emoji: "📚", description: "Learn 30 words." },
  { id: "words-100", label: "Centurion", emoji: "💯", description: "Learn 100 words." },
  { id: "explorer", label: "Explorer", emoji: "🧭", description: "Try all five topics." },
  { id: "halfway", label: "Halfway Hero", emoji: "⛰️", description: "Reach day 45." },
  { id: "graduate", label: "Graduate", emoji: "🎓", description: "Finish all 90 days." },
];
