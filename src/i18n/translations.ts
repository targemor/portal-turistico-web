/**
 * i18n/translations.ts
 * Importa las traducciones desde translations.json y exporta los tipos.
 */

import translationsData from "./translations.json";

export type Lang = 'es' | 'en';

export const translations = translationsData as Record<Lang, Record<keyof typeof translationsData.es, string>>;

export type Translations = Record<keyof typeof translationsData.es, string>;
