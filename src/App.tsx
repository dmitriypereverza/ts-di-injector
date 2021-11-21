import React from "react";
import { pureConnect } from "src/pureConnect";
import { TextServiceInterface } from "./Services";
import diContainer from "./di";

const App = ({ textService }: { textService: TextServiceInterface }) => {
  return <div>{textService.getText()}</div>;
};

export default pureConnect(() => ({
  textService: diContainer.get("textService")
}), App);

