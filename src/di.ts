import {
  StringService,
  StringServiceInterface,
  TestService,
  TextServiceInterface,
} from "./Services";
import { buildContainer } from "./DI/diContainer";

export default buildContainer<{
  textService: TextServiceInterface;
  stringService: StringServiceInterface;
}>({
  params: {
    apiKey: 7771,
  },
  classes: {
    textService: {
      class: TestService,
      parameters: ["@stringService", "#apiKey"],
    },
    stringService: {
      class: StringService,
    },
  },
});
