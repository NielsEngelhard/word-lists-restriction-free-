export class DictionaryResponse {
  constructor(
    public valid: boolean,
    public word: string,
    public definition?: string | undefined
  ) {}

  static error(): DictionaryResponse {
    return new DictionaryResponse(false, "", "");
  }

  static ok(word: string, definition?: string): DictionaryResponse {
    return new DictionaryResponse(true, word, definition);
  }  
}

export interface DictionaryService {
  validateWord(word: string): Promise<DictionaryResponse>;
  getDefinition?(word: string): Promise<string | null>;
}