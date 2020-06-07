export interface TextServiceInterface {
  hello(): string;
}

export interface StringServiceInterface {
  makeTest(): string;
}

export class TestService implements TextServiceInterface {
  private stringService: StringService;
  private apiKey;
  constructor(stringService: StringService, apiKey) {
    this.stringService = stringService;
    this.apiKey = apiKey;
  }

  public hello(): string {
    return this.apiKey;
  }
}

export class StringService implements StringServiceInterface {
  public makeTest(): string {
    return "Hello2!!!";
  }
}
