import { buildContainer } from "./DI/diContainer";

import {
  StringService,
  StringServiceInterface,
  TestService,
  TextServiceInterface,
} from "./Services";

export default buildContainer<{
  textService: TextServiceInterface;
  stringService: StringServiceInterface;
}>({
  params: {
    apiKey: "dfse3dwedc2342ecd3wda",
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
