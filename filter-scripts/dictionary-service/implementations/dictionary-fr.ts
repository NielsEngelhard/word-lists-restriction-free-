// dictionary-en.ts
import { DictionaryService, DictionaryResponse } from "../dictionary-service";

export const dictionaryFr: DictionaryService = {
  async validateWord(word: string): Promise<DictionaryResponse> {
    try {
      return await fetchDefinition(word);
    } catch {
      return DictionaryResponse.error();
    }
  },
};

export interface ISense {
  definition?: string;
}

export interface IResult {
  senses?: ISense[];
}

export interface FrenchDictResp {
  word: string;
  entries: IResult[];
}

/**
 * Fetches and extracts the summarized definition
 */
export async function fetchDefinition(word: string): Promise<DictionaryResponse> {
  const response = await fetch(
    `https://freedictionaryapi.com/api/v1/entries/fr/${word.toLowerCase()}`
  );

  if (response.status != 200) {
    return DictionaryResponse.error();
  }

  const json = (await response.json()) as FrenchDictResp;
  if (!json) return DictionaryResponse.error();

  if (json.entries.length < 1) return DictionaryResponse.error();
  if (json.entries[0]!.senses!.length < 1) return DictionaryResponse.error();

  const definition = json.entries[0]!.senses![0].definition;

  return DictionaryResponse.ok(word.toUpperCase(), definition);
}

/**
 * Summarizes text to the first x words
 */
function summarizeDefinition(text: string): string {
  const nWords = 16;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= nWords) {
    return words.join(" ");
  }
  return words.slice(0, nWords).join(" ") + "...";
}