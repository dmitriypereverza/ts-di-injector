import { Container } from "typedi";
import diConfig, { DiContainerListInterface } from "../diConfig";
import { compose, filter, flatten, map, path, prop, uniq, intersection } from "ramda";

export interface BaseDiList {
  [key: string]: any;
}

interface DiConfigParams {
  [key: string]: {
    class: {
      new(...args: any[]): void;
    },
    parameters?: string[];
  };
}

export function makeDiConfig <T extends DiConfigParams>(config: T): T {
  return config;
}

// @ts-ignore
const getInjectedParameters = (obj: object): string[] => compose(
  uniq,
  flatten as any,
  filter(Boolean),
  map(path(["1", "parameters"]) as any),
  Object.entries
)(obj);

export function buildContainer (di: DiConfigParams) {
  const entries = Object.entries(di);
  const dependencyKeys = entries.map(prop("0"));
  const invalidDependencies = intersection(getInjectedParameters(entries), dependencyKeys);
  if (invalidDependencies.length > 0) {
    throw new Error(`This dependency is invalid [${invalidDependencies.join(", ")}]`);
  }

  const injectedList: string[] = [];
  function inject (entriesList: any[], level = 10) {
    if (level === 0) {
      return;
    }
    entriesList.forEach(([key, injectable]) => {
      if (!injectable.parameters || !injectable.parameters.length) {
        Container.set(key, new injectable.class());
        injectedList.push(key);
        return;
      }
      if (injectable.parameters.some(param => !injectedList.includes(param))) {
        return;
      }
      const resolvedParameters = injectable.parameters.map(param => Container.get(param))
      Container.set(key, new injectable.class(...resolvedParameters));
      injectedList.push(key);
    });
    const notResolvedList = entriesList.filter(el => !injectedList.includes(el[0]))
    if (notResolvedList.length > 0) {
      inject(notResolvedList, level - 1);
    }
    return;
  }
  inject(entries);
}

export const diContainer = {
  get: <KEY extends keyof typeof diConfig>(key: KEY): DiContainerListInterface[KEY] => {
    // @ts-ignore
    return Container.get(key);
  }
};
