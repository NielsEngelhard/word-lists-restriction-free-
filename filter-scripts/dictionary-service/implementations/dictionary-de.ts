// dictionary-de.ts
import { DictionaryService, DictionaryResponse } from "../dictionary-service";
import { JSDOM } from "jsdom";

export const dictionaryDe: DictionaryService = {
  async validateWord(word: string): Promise<DictionaryResponse> {
    try {
      return await fetchDefinition(word);
    } catch (error) {
      console.error("Error fetching German definition:", error);
      return DictionaryResponse.error();
    }
  },
};

/**
 * Fetches and extracts the definition from DWDS
 */
export async function fetchDefinition(word: string): Promise<DictionaryResponse> {
  const response = await fetch(`https://www.dwds.de/wb/${word}`);
  
  if (!response.ok) {
    return DictionaryResponse.error();
  }

  const html = await response.text();
  const definition = extractDefinitionFromHtml(html);

  if (!definition) {
    return DictionaryResponse.error();
  }

  return DictionaryResponse.ok(word, definition);
}

/**
 * Extracts the main definition from DWDS HTML page
 */
function extractDefinitionFromHtml(html: string): string | null {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Try to find the main definition in the dwdswb-definition span
    const definitionElement = document.querySelector('.dwdswb-definition');
    
    if (definitionElement) {
      // Remove any nested elements we don't want (like references)
      const cloned = definitionElement.cloneNode(true) as Element;
      
      // Remove popovers and links, keeping only the text
      const unwantedSelectors = ['.dwdswb-verweis', 'a.intern'];
      unwantedSelectors.forEach(selector => {
        cloned.querySelectorAll(selector).forEach(el => {
          if (el.textContent) {
            el.replaceWith(dom.window.document.createTextNode(el.textContent));
          }
        });
      });

      const text = cloned.textContent?.trim();
      
      if (text) {
        return summarizeDefinition(text);
      }
    }

    // Fallback: try to find any definition text
    const altDefinition = document.querySelector('.dwdswb-lesart-def');
    if (altDefinition) {
      const text = altDefinition.textContent?.trim();
      if (text) {
        return summarizeDefinition(text);
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing German HTML:", error);
    return null;
  }
}

/**
 * Summarizes definition to a reasonable length
 */
function summarizeDefinition(text: string): string {
  const maxWords = 16;
  
  // Clean up extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  const words = cleanText.split(/\s+/).filter(Boolean);
  
  if (words.length <= maxWords) {
    return cleanText;
  }
  
  return words.slice(0, maxWords).join(" ") + "...";
}