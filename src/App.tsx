import React from "react";
import { pureConnect } from "./DI/pureConnect";
import { TextServiceInterface } from "./Services";
import { diContainer } from "./DI/diContainer";

const App = ({ textService }: { textService: TextServiceInterface }) => {
  return <div>{textService.hello()}</div>;
};

export default pureConnect(() => ({
  textService: diContainer.get("textService")
}), App);

