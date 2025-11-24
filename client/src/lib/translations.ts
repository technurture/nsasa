export const translations = {
  en: {
    ourLeadership: "Our Leadership",
    ourLeadershipDescription: "Meet the dedicated team leading our department",
    viewAllStaff: "View All Staff",
    president: "President",
    vicePresident: "Vice President",
    secretary: "Secretary",
    treasurer: "Treasurer",
    position: "Position",
  },
  // Add more languages as needed
  // fr: { ... },
  // es: { ... },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang]?.[key] || translations.en[key];
}
