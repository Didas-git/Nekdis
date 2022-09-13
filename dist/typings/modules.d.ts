export interface Module {
    name: string;
    ctor: new () => unknown;
}
export declare type ExctractName<T> = Extract<T, string> | ([T] extends [[]] ? [] : {
    [K in keyof T]: ExctractName<T[K]>;
});
export declare type WithModules<M extends Array<Module>, F = true> = F extends true ? {
    [N in M[number]["name"]]: CTORType<M[number]["ctor"]>;
} : never;
declare type CTORType<T> = T extends new () => infer U ? U : never;
export {};
//# sourceMappingURL=modules.d.ts.map