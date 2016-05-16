export function hasMany(target: any, key: string, descriptor: PropertyDescriptor) { return descriptor; }

export function createHasOne<M>() {
    return function hasOne<T>(c: { new (x: any): T }, relative: (master: M) => Dict<T>, nameOverride = null) {
       return null;
    }
}

export function root(construc: Function) {
}

export function queryBy(fn:Function) {
    return null;
    // return function(target: any, key, descriptor: PropertyDescriptor) : PropertyDescriptor { return descriptor; }; 
}

export { toGraphQlQueryString, GraphQLWhere, Query } from "./test/query";

