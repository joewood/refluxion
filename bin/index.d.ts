export declare function hasMany(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor;
export declare function createHasOne<M>(): <T>(c: new (x: any) => T, relative: (master: M) => Dict<T>, nameOverride?: any) => any;
export declare function root(construc: Function): void;
export declare function queryBy(fn: Function): (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export { toGraphQlQueryString, GraphQLWhere, Query } from "./test/query";
