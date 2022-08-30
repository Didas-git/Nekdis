export interface Module {
    name: string;
    ctor: new () => unknown;
}

export type ExctractName<T> = Extract<T, string> | ([T] extends [[]] ? [] : { [K in keyof T]: ExctractName<T[K]> });

export type WithModules<M extends Array<Module>, F = true> = F extends true ? { [N in M[number]["name"]]: CTORType<M[number]["ctor"]> } : never;

type CTORType<T> = T extends new () => infer U ? U : never;