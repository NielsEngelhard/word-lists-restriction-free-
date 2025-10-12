// dictionary-resolver.ts
import { DictionaryService } from "./dictionary-service";
import { dictionaryDe } from "./implementations/dictionary-de";
import { dictionaryEn } from "./implementations/dictionary-en";
import { dictionaryNl } from "./implementations/dictionary-nl";
import { dictionaryFr } from "./implementations/dictionary-fr";

export const dictionaryImplementations: Record<string, DictionaryService> = {
  nl: dictionaryNl,
  de: dictionaryDe,
  en: dictionaryEn,
  fr: dictionaryFr
};

export function getDictionary(language: string): DictionaryService {
  const impl = dictionaryImplementations[language];
  if (!impl) throw new Error(`No dictionary implementation found for '${language}'`);
  return impl;
}
