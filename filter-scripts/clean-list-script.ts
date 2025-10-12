import * as fs from 'fs';
import * as readline from 'readline';
import { ALLOWED_NORMAL_AND_SPECIAL_CHARACTERS, supportedLanguages } from "./rules";
import { WordFormatValidator } from './word-format-validator';

const LANGUAGE_PLACEHOLDER = "nl";
const FILE_INPUT_PATH_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/hand-filtered/${LANGUAGE_PLACEHOLDER}-5-words.txt`;
const FILE_OUTPUT_PATH_WITH_PLACEHOLDER = `../word-lists/${LANGUAGE_PLACEHOLDER}/hand-filtered/${LANGUAGE_PLACEHOLDER}-5-filtered.txt`;

// Clean a txt file with words on each row (create new file with words that are valid)
async function cleanWordLists() {
    console.log('START cleaning word lists');

    for(let i=0; i<supportedLanguages.length; i++) {
        const language = supportedLanguages[i];

        console.log(`🧼🫧🧺🧽🧹 cleaning word list for '${language}'`);

        const FILE_INPUT_PATH = FILE_INPUT_PATH_WITH_PLACEHOLDER.replaceAll(LANGUAGE_PLACEHOLDER, language);
        const FILE_OUTPUT_PATH = FILE_OUTPUT_PATH_WITH_PLACEHOLDER.replaceAll(LANGUAGE_PLACEHOLDER, language);

        try {
            await cleanWordList(
                FILE_INPUT_PATH,
                FILE_OUTPUT_PATH, 
            );
            console.log(`✅🧼 Successfully cleaned ${FILE_INPUT_PATH}`);
        } catch(error) {
            console.error(`❌ Cleaning of ${FILE_INPUT_PATH} failed:`, error);
        }        
    }
}

async function cleanWordList(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Create a readable stream from the input file
    const fileStream = fs.createReadStream(inputPath);
    
    // Create readline interface
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    // Array to store lines that pass the filter
    const filteredLines: string[] = [];
    
    // Process each line
    for await (const line of rl) {
      const validateWordResponse = WordFormatValidator.validateFormat(line, ALLOWED_NORMAL_AND_SPECIAL_CHARACTERS);
      
      if (validateWordResponse.isValid == true) {
        filteredLines.push(validateWordResponse.word);
      } else {
        // Invalid word format
      }; 
    }
    
    // Write the filtered content back to the output file
    fs.writeFileSync(outputPath, filteredLines.join('\n'));
    
    console.log(`Processing complete. Results written to ${outputPath} length ${filteredLines.length}`);
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

cleanWordLists();