export { Dict, toGraphQlQueryString, GraphQLWhere, Query } from "./query";
import { Dict } from "./query";
export declare function hasMany(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor;
export declare function hasOne<M, T>(c: {
    new (x: any): T;
}, relative: (master: M) => Dict<T>, nameOverride?: any): any;
export declare function createHasOne<M>(): <T>(c: new (x: any) => T, relative: (master: M) => Dict<T>, nameOverride?: any) => any;
export declare function root(ctr: Function): void;
export declare function queryBy(fn: Function): any;
export declare function integer(): any;
export declare function useTable(tableName: string): any;
/** Use this decorator to indicate that the field should map to the backend as a DATE field, but presented as an ISO Date String */
export declare function isIsoDate(): any;
