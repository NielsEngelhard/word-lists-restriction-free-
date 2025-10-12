import * as fs from 'fs';
import * as readline from 'readline';
import { getDictionary } from './dictionary-service/dictionary-resolver';
import { DictionaryService } from './dictionary-service/dictionary-service';

const LANGUAGE = process.argv[2]; // third argument, e.g. "nl"

if (!LANGUAGE) {
  console.error("❌ No language provided. Usage: pnpm clean:dictionary <language>");
  process.exit(1);
}

const LANGUAGE_PLACEHOLDER = "{LANGUAGE}";
const FILE_INPUT_PATH_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/${LANGUAGE_PLACEHOLDER}-words-poc.txt`;

const FILE_OUTPUT_PATH_WORDS_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/${LANGUAGE_PLACEHOLDER}-words-dictionary-validated.txt`;
const FILE_OUTPUT_PATH_WITH_DEFINITIONS_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/${LANGUAGE_PLACEHOLDER}-words-with-definitions.txt`;


// Clean a txt file with words on each row (create new file with words that are valid)
async function cleanWordListsByDictionary() {
    console.log(`START cleaning word lists by dictionary - ${LANGUAGE}`);

      console.log(`🧼🫧🧺🧽🧹 dictionary check word list for '${LANGUAGE}'`);

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
    // Create a readable stream from the input file
    const fileStream = fs.createReadStream(inputPath);
    
    // Create readline interface
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    // Array to store lines that pass the filter
    const words: string[] = [];
    const wordsAndDefinitions: string[] = [];
    
    // Process each line
    for await (const line of rl) {
      const word = line as string;

      console.log(`CHECKING ${word}`);
      const dictionaryResponse = await dictionary.validateWord(word);

      console.log(`${word}=${dictionaryResponse.valid}`);
      
      if (dictionaryResponse.valid) {
        words.push(word.toUpperCase());
        wordsAndDefinitions.push(`${word.toUpperCase()} - ${dictionaryResponse.definition}`);
      } else {
        // Invalid word format
      }; 
    }
    
    // Write the filtered content back to the output file
    fs.writeFileSync(outputWordsPath, words.join('\n'));
    fs.writeFileSync(outputDefinitionsPath, wordsAndDefinitions.join('\n'));
    
    console.log(`Processing complete for language: ${LANGUAGE}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

cleanWordListsByDictionary();