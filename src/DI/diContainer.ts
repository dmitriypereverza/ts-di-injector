import compose from "ramda/es/compose";
import difference from "ramda/es/difference";
import filter from "ramda/es/filter";
import flatten from "ramda/es/flatten";
import map from "ramda/es/map";
import path from "ramda/es/path";
import uniq from "ramda/es/uniq";
import ifElse from "ramda/es/ifElse";
import identity from "ramda/es/identity";

let diContainer: Record<string, any> = {};

type DiConfigParams<T extends Record<string, any>> = {
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
    filter(isKeyTackedFromDi) as any,
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
      diContainer[key] = new injectable.class();
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
        return diContainer[getDependKeyWithoutDiType(param)];
      }
      return param;
    });
    diContainer[key] = new injectable.class(...resolvedParameters);
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
    diContainer[key] = param;
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

export function buildContainer<RESULT_TYPES extends Record<string, any>>(di: {
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
      return diContainer[key];
    },
  };
}
