import { Dict } from "./query";

export function hasMany(target: any, key: string, descriptor: PropertyDescriptor): any { return descriptor; }

export function hasOne<M, T>(c: { new (x: any): T }, relative: (master: M) => Dict<T>, nameOverride: string = null): any {
    return null;
}

export function length(len: number): any {
    return null;
}

export function createHasOne<M>() {
    return function hasOne<T>(c: { new (x: any): T }, relative: (master: M) => Dict<T>, nameOverride: string = null): any {
        return null;
    }
}

export function root(ctr: Function): any {
    return null;
}

export function queryBy(fn: Function): any {
    return null;
}

export function integer(): any {
    return null;
}

export function useTable(tableName: string): any {
    return null;
}

/** Use this decorator to indicate that the field should map to the backend as a DATE field, but presented as an ISO Date String */
export function isIsoDate(): any {
    return null;
}