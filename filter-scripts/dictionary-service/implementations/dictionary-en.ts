// dictionary-en.ts
import { DictionaryService, DictionaryResponse } from "../dictionary-service";
import { JSDOM } from "jsdom";

export const dictionaryEn: DictionaryService = {
  async validateWord(word: string): Promise<DictionaryResponse> {
    try {
      return await fetchDefinition(word);
    } catch (error) {
      console.error("Error fetching English definition:", error);
      return DictionaryResponse.error();
    }
  },
};

/**
 * Fetches and extracts the definition from Cambridge Dictionary
 */
export async function fetchDefinition(word: string): Promise<DictionaryResponse> {
  const response = await fetch(`https://dictionnaire.lerobert.com/definition/${word}`);
  
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
 * Extracts the main definition from Cambridge Dictionary HTML page
 */
function extractDefinitionFromHtml(html: string): string | null {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Try to find the first definition in the .def.ddef_d class
    const definitionElement = document.querySelector('.def.ddef_d.db');
    
    if (definitionElement) {
      // Remove links but keep their text content
      const cloned = definitionElement.cloneNode(true) as Element;
      
      // Replace links with their text content
      cloned.querySelectorAll('a.query').forEach(link => {
        const textNode = dom.window.document.createTextNode(link.textContent || '');
        link.replaceWith(textNode);
      });

      const text = cloned.textContent?.trim();
      
      if (text) {
        return summarizeDefinition(text);
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing English HTML:", error);
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