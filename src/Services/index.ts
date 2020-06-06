export interface TextServiceInterface {
  hello(): string;
}

export interface StringServiceInterface {
  makeTest(): string;
}

export class TestService implements TextServiceInterface {
  private stringService: StringService;
  constructor (stringService: StringService) {
    this.stringService = stringService;
  }

  public hello (): string {
    return this.stringService.makeTest();
  }
}

export class StringService implements StringServiceInterface {
  public makeTest (): string {
    return "Hello2!!!";
  }
}
