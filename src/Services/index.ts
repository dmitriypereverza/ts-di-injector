export interface TextServiceInterface {
  getText(): string;
}
export class TestService implements TextServiceInterface {
  private stringService: StringService;
  private apiKey: string;
  constructor(stringService: StringService, apiKey) {
    this.stringService = stringService;
    this.apiKey = apiKey;
  }

  public getText(): string {
    return `Text: ${this.stringService.makeText()} Key: ${this.apiKey}`;
  }
}

export interface StringServiceInterface {
  makeText(): string;
}
export class StringService implements StringServiceInterface {
  public makeText(): string {
    return "Text from StringService.";
  }
}
