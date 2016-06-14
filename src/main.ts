
export { Dict, toGraphQlQueryString, GraphQLWhere, Query } from "./query";
import { Dict } from "./query";

export function hasMany(target: any, key: string, descriptor: PropertyDescriptor) { return descriptor; }

export function hasOne<M, T>(c: { new (x: any): T }, relative: (master: M) => Dict<T>, nameOverride = null) {
    return null;
}

export function createHasOne<M>() {
    return function hasOne<T>(c: { new (x: any): T }, relative: (master: M) => Dict<T>, nameOverride = null) {
        return null;
    }
}

export function root(ctr: Function) {
}

export function queryBy(fn: Function) {
    return null;
    // return function(target: any, key, descriptor: PropertyDescriptor) : PropertyDescriptor { return descriptor; }; 
}


export function integer() {
    return null;
}

export function useTable(tableName: string) {
    return null;
}

/** Use this decorator to indicate that the field should map to the backend as a DATE field, but presented as an ISO Date String */
export function isIsoDate() {
    return null;
}