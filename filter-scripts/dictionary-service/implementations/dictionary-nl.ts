// dictionary-nl.ts
import { DictionaryService, DictionaryResponse } from "../dictionary-service";
import { JSDOM } from "jsdom";

export const dictionaryNl: DictionaryService = {
  async validateWord(word: string): Promise<DictionaryResponse> {
    try {
      return await fetchDefinition(word);
    } catch {
      return DictionaryResponse.error();
    }
  },
};

export interface VanDaleApiArticle {
  headword: string;
  content: string;
  index: number;
  dictionaryId: string;
  language: string;
}

export interface VanDaleApiResponse {
  searchPattern: string;
  articles: VanDaleApiArticle[];
  alternativeDictionaryTypes: string[];
}

/**
 * Fetches and extracts the summarized definition
 */
export async function fetchDefinition(word: string): Promise<DictionaryResponse> {
  const response = await fetch(`https://zoeken.vandale.nl/api/zoeken/rest/free/freesearch?language=nn&limit=1&pattern=${word}`);
  
  const json = (await response.json()) as VanDaleApiResponse;
 
  const firstArticle = json.articles?.[0];

  if (!firstArticle) return DictionaryResponse.error();
  const plainText = extractPlainTextFromHtml(firstArticle.content);

  const shortDefinition = summarizeDefinition(plainText);

  const okResponse = DictionaryResponse.ok(word.toUpperCase(), shortDefinition);

  return okResponse;
}

/**
 * Removes all HTML tags and extracts plain text
 */
function extractPlainTextFromHtml(html: string): string {
  try {
    const dom = new JSDOM(html);
    return dom.window.document.body.textContent?.trim() ?? "";
  } catch(e) {
    console.log("error");
    console.log(e);
    return "-";
  }
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