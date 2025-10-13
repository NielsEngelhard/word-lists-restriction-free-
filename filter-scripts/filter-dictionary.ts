import * as fs from 'fs';
import * as readline from 'readline';
import { getDictionary } from './dictionary-service/dictionary-resolver';
import { DictionaryService } from './dictionary-service/dictionary-service';

const LANGUAGE = process.argv[2];
const MAX_RETRIES = 3;
const CONCURRENCY_LIMIT = 10;
const DELAY_BETWEEN_CHUNKS_MS = 100;

if (!LANGUAGE) {
  console.error("❌ No language provided. Usage: pnpm clean:dictionary <language>");
  process.exit(1);
}

const LANGUAGE_PLACEHOLDER = "{LANGUAGE}";
const FILE_INPUT_PATH_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/${LANGUAGE_PLACEHOLDER}-words-clean.txt`;
const FILE_OUTPUT_PATH_WORDS_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/${LANGUAGE_PLACEHOLDER}-words-dictionary-validated.txt`;
const FILE_OUTPUT_PATH_WITH_DEFINITIONS_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/${LANGUAGE_PLACEHOLDER}-words-with-definitions.txt`;

async function cleanWordListsByDictionary() {
  console.log(`START cleaning word lists by dictionary - ${LANGUAGE}`);
  console.log(`🧼🫧🧺🧽🧹 dictionary check word list for '${LANGUAGE}' (concurrency: ${CONCURRENCY_LIMIT})`);

  const FILE_INPUT_PATH = FILE_INPUT_PATH_WITH_PLACEHOLDER.replaceAll(LANGUAGE_PLACEHOLDER, LANGUAGE);
  const FILE_OUTPUT_PATH_WORDS = FILE_OUTPUT_PATH_WORDS_WITH_PLACEHOLDER.replaceAll(LANGUAGE_PLACEHOLDER, LANGUAGE);
  const FILE_OUTPUT_PATH_WITH_DEFINITIONS = FILE_OUTPUT_PATH_WITH_DEFINITIONS_WITH_PLACEHOLDER.replaceAll(LANGUAGE_PLACEHOLDER, LANGUAGE);

  const dictionary = getDictionary(LANGUAGE);

  try {
    await cleanWordList(FILE_INPUT_PATH, FILE_OUTPUT_PATH_WORDS, FILE_OUTPUT_PATH_WITH_DEFINITIONS, dictionary);
    console.log(`✅🧼 Successfully cleaned ${FILE_INPUT_PATH}`);
  } catch(error) {
    console.error(`❌ Cleaning of ${FILE_INPUT_PATH} failed:`, error);
  }
}

async function cleanWordList(
  inputPath: string,
  outputWordsPath: string,
  outputDefinitionsPath: string,
  dictionary: DictionaryService
): Promise<void> {
  try {
    const fileStream = fs.createReadStream(inputPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    const words: string[] = [];
    const wordsAndDefinitions: string[] = [];
    let chunk: string[] = [];
    let totalProcessed = 0;
    let validCount = 0;
    
    console.log('📖 Reading and processing words...');
    
    for await (const line of rl) {
      const word = line.trim();
      if (!word) continue;
      
      chunk.push(word);
      
      // Process when we have CONCURRENCY_LIMIT words
      if (chunk.length === CONCURRENCY_LIMIT) {
        const results = await processChunk(chunk, dictionary);
        
        for (const result of results) {
          if (result.valid) {
            words.push(result.word.toUpperCase());
            wordsAndDefinitions.push(`${result.word.toUpperCase()} - ${result.definition}`);
            validCount++;
          }
        }
        
        totalProcessed += chunk.length;
        console.log(`✓ Processed ${totalProcessed} words (${validCount} valid)`);
        
        chunk = [];
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS_MS));
      }
    }
    
    // Process remaining words
    if (chunk.length > 0) {
      const results = await processChunk(chunk, dictionary);
      
      for (const result of results) {
        if (result.valid) {
          words.push(result.word.toUpperCase());
          wordsAndDefinitions.push(`${result.word.toUpperCase()} - ${result.definition}`);
          validCount++;
        }
      }
      
      totalProcessed += chunk.length;
    }
    
    console.log(`\n📊 Final stats: ${validCount}/${totalProcessed} valid words`);
    
    fs.writeFileSync(outputWordsPath, words.join('\n'));
    fs.writeFileSync(outputDefinitionsPath, wordsAndDefinitions.join('\n'));
    
    console.log(`✅ Processing complete for language: ${LANGUAGE}`);
  } catch (error) {
    console.error('❌ Error processing file:', error);
    throw error;
  }
}

async function processChunk(
  chunk: string[],
  dictionary: DictionaryService
): Promise<Array<{ word: string; valid: boolean; definition?: string }>> {
  const promises = chunk.map(word => validateWordWithRetry(word, dictionary));
  return await Promise.all(promises);
}

async function validateWordWithRetry(
  word: string,
  dictionary: DictionaryService,
  retries = MAX_RETRIES
): Promise<{ word: string; valid: boolean; definition?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await dictionary.validateWord(word);
      return {
        word,
        valid: response.valid,
        definition: response.definition
      };
    } catch (error) {
      if (attempt === retries) {
        console.error(`❌ Failed to validate "${word}" after ${retries + 1} attempts`);
        return { word, valid: false };
      }
      
      // Exponential backoff: 100ms, 200ms, 400ms
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
    }
  }
  
  return { word, valid: false };
}

cleanWordListsByDictionary();