export interface Module {
    name: string;
    ctor: new () => unknown;
}

export type WithModules<M extends ReadonlyArray<Module>, F = true> = F extends true ? { [N in M[number]["name"]]: CTORType<M[number]["ctor"]> } : never;

type CTORType<T> = T extends new () => infer U ? U : never;