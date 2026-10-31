/**
 * UI language for the LAN web chat.
 *
 * The browser exposes a single preferred language (navigator.language) and the
 * page has no language switcher, so the language is resolved once at load:
 * Russian browsers get Russian, Chinese browsers get Chinese, every other tag
 * gets English (the same product policy as the JS tool packages, D11).
 * This is not a fallback chain: each tag hits exactly one branch, and the
 * product decision puts unlisted tags in English.
 */
export type UiLanguage = 'ru' | 'en' | 'zh';

const UI_LANGUAGE_TAGS: Record<UiLanguage, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  zh: 'zh-CN'
};

export function resolveUiLanguage(language: string): UiLanguage {
  const tag = language.toLowerCase();
  if (tag.startsWith('ru')) {
    return 'ru';
  }
  if (tag.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

/** Active UI language; Intl sorting/formatting uses it so ru pages get no zh formats. */
export const UI_LANGUAGE: UiLanguage = resolveUiLanguage(navigator.language);

/** Value for the document lang attribute (screen readers, spell checking). */
export const UI_LANGUAGE_TAG: string = UI_LANGUAGE_TAGS[UI_LANGUAGE];

/** Three-way UI copy; the zh argument is always the original source string. */
export function t(zh: string, en: string, ru: string): string {
  if (UI_LANGUAGE === 'ru') {
    return ru;
  }
  if (UI_LANGUAGE === 'zh') {
    return zh;
  }
  return en;
}

const PLACEHOLDER_PATTERN = /\{(\d+)\}/g;

/** Three-way UI copy with {0}, {1} placeholders filled from the arguments in order. */
export function tf(
  zh: string,
  en: string,
  ru: string,
  ...values: ReadonlyArray<string | number>
): string {
  return t(zh, en, ru).replace(PLACEHOLDER_PATTERN, (match: string, index: string) => {
    const value = values[Number(index)];
    return value === undefined ? match : String(value);
  });
}
