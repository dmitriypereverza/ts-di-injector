import {
  StringService,
  StringServiceInterface,
  TestService,
  TextServiceInterface
} from "./Services";
import { BaseDiList, makeDiConfig } from "./DI/diContainer";

export interface DiContainerListInterface extends BaseDiList {
  textService: TextServiceInterface;
  stringService: StringServiceInterface;
}
export default makeDiConfig({
  textService: {
    class: TestService,
    parameters: ["stringService"]
  },
  stringService: {
    class: StringService
  }
});


