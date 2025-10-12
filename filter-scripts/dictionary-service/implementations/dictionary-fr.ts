// dictionary-fr.ts
import { DictionaryService, DictionaryResponse } from "../dictionary-service";
import { JSDOM } from "jsdom";

export const dictionaryFr: DictionaryService = {
  async validateWord(word: string): Promise<DictionaryResponse> {
    try {
      return await fetchDefinition(word);
    } catch (error) {
      console.error("Error fetching French definition:", error);
      return DictionaryResponse.error();
    }
  },
};

/**
 * Fetches and extracts the definition from Le Robert
 */
export async function fetchDefinition(word: string): Promise<DictionaryResponse> {
  const response = await fetch(`https://dictionnaire.lerobert.com/definition/${encodeURIComponent(word)}`);
  
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
 * Extracts the main definition from Le Robert HTML page
 */
function extractDefinitionFromHtml(html: string): string | null {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Try to find the first definition in the d_dfn span
    const definitionElement = document.querySelector('.d_dfn');
    
    if (definitionElement) {
      // Clone the element to manipulate it
      const cloned = definitionElement.cloneNode(true) as Element;
      
      // Remove unwanted elements (references, examples, etc.)
      const unwantedSelectors = [
        '.d_rvd',     // References (➙)
        '.d_xpl',     // Examples
        '.d_gls',     // Glosses
        '.d_mta',     // Metadata
        '.d_im',      // Italics/metadata
        'a',          // Links
      ];
      
      unwantedSelectors.forEach(selector => {
        cloned.querySelectorAll(selector).forEach(el => el.remove());
      });

      const text = cloned.textContent?.trim();
      
      if (text) {
        return summarizeDefinition(text);
      }
    }

    // Fallback: try alternative selectors
    const altDefinition = document.querySelector('.d_ptma .d_dfn');
    if (altDefinition) {
      const text = altDefinition.textContent?.trim();
      if (text) {
        return summarizeDefinition(text);
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing French HTML:", error);
    return null;
  }
}

/**
 * Summarizes definition to a reasonable length
 */
function summarizeDefinition(text: string): string {
  const maxWords = 16;
  
  // Clean up extra whitespace and newlines
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  const words = cleanText.split(/\s+/).filter(Boolean);
  
  if (words.length <= maxWords) {
    return cleanText;
  }
  
  return words.slice(0, maxWords).join(" ") + "...";
}