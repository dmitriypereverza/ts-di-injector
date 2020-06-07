import { Container } from "typedi";
import {
  compose,
  difference,
  filter,
  flatten,
  map,
  path,
  uniq,
  ifElse,
  identity,
} from "ramda";

type DiConfigParams<T extends object> = {
  [key in keyof T]: {
    class: {
      new (...args: any[]): T[key];
    };
    parameters?: (keyof T | string)[];
  };
};

// @ts-ignore
const getInjectedParameters = (obj: object): string[] =>
  compose(
    uniq,
    filter((key: string) => isKeyTackedFromDi(key)) as any,
    flatten as any,
    filter(Boolean),
    map(path(["1", "parameters"]) as any)
  )(obj as any);

function isKeyTackedFromDi(key: string): boolean {
  return ["@", "#"].includes(key[0]);
}
function getDependKeyWithoutDiType(key: string) {
  return key.slice(1);
}

function injectClasses(entriesList: any[], injectedList: string[], level = 15) {
  if (level === 0) {
    return injectedList;
  }
  entriesList.forEach(([key, injectable]) => {
    if (!injectable.parameters || !injectable.parameters.length) {
      Container.set(key, new injectable.class());
      injectedList.push(key);
      return;
    }
    const someDependenciesNotResolved = injectable.parameters
      .filter(isKeyTackedFromDi)
      .some((param) => !injectedList.includes(param.slice(1)));
    if (someDependenciesNotResolved) {
      return;
    }
    const resolvedParameters = injectable.parameters.map((param: string) => {
      if (isKeyTackedFromDi(param)) {
        return Container.get(getDependKeyWithoutDiType(param));
      }
      return param;
    });
    Container.set(key, new injectable.class(...resolvedParameters));
    injectedList.push(key);
  });
  const notResolvedList = entriesList.filter(
    (el) => !injectedList.includes(el[0])
  );
  if (notResolvedList.length > 0) {
    injectClasses(notResolvedList, injectedList, level - 1);
  }
  return injectedList;
}

function injectParams(entriesList: any[], injectedList: string[]): string[] {
  entriesList.forEach(([key, param]) => {
    Container.set(key, param);
    injectedList.push(key);
  });
  return injectedList;
}

function getInvalidDependencies(classesEntries, paramsEntries) {
  const classesKeys = classesEntries.map((el) => "@" + el[0]);
  const paramsKeys = paramsEntries.map((el) => "#" + el[0]);

  return difference(
    getInjectedParameters([...classesEntries, ...paramsEntries]),
    [...classesKeys, ...paramsKeys]
  );
}

export function buildContainer<RESULT_TYPES extends object>(di: {
  classes: DiConfigParams<RESULT_TYPES>;
  params?: object;
}) {
  const classesEntries = Object.entries(di.classes);
  const paramsEntries = Object.entries(di.params || {});

  const invalidDependencies = getInvalidDependencies(
    classesEntries,
    paramsEntries
  );
  if (invalidDependencies.length > 0) {
    throw new Error(
      `This dependencies is invalid [${invalidDependencies.join(", ")}]`
    );
  }

  compose(
    ifElse(
      () => !!di.classes,
      (injectedList) => injectClasses(classesEntries, injectedList),
      identity
    ),
    ifElse(
      () => !!di.params,
      (injectedList) => injectParams(paramsEntries, injectedList),
      identity
    )
  )([] as string[]);

  return {
    get: <KEY extends keyof RESULT_TYPES>(key: KEY): RESULT_TYPES[KEY] => {
      // @ts-ignore
      return Container.get(key);
    },
  };
}
