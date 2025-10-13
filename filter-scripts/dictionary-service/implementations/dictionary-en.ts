// dictionary-en.ts
import { DictionaryService, DictionaryResponse } from "../dictionary-service";

export const dictionaryEn: DictionaryService = {
  async validateWord(word: string): Promise<DictionaryResponse> {
    try {
      return await fetchDefinition(word);
    } catch {
      return DictionaryResponse.error();
    }
  },
};

export interface IResult {
  definition?: string;
}

export interface FreeDictionaryApiResponse {
  word: string;
  results: IResult[];
}

/**
 * Fetches and extracts the summarized definition
 */
export async function fetchDefinition(word: string): Promise<DictionaryResponse> {
  const response = await fetch(
    `https://www.wordsapi.com/mashape/words/${word.toLowerCase()}?when=2025-10-13T09:20:05.413Z&encrypted=8cfdb18fe723939beb9207bfe658bcb9aeb0280934fe94b8`
  );

  if (response.status != 200) {
    return DictionaryResponse.error();
  }

  const json = (await response.json()) as FreeDictionaryApiResponse;
  if (!json) return DictionaryResponse.error();

  const definition = json.results[0].definition;

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