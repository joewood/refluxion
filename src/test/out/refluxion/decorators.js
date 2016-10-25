"use strict";
function hasMany(target, key, descriptor) { return descriptor; }
exports.hasMany = hasMany;
function hasOne(c, relative, nameOverride) {
    if (nameOverride === void 0) { nameOverride = null; }
    return null;
}
exports.hasOne = hasOne;
function length(len) {
    return null;
}
exports.length = length;
function createHasOne() {
    return function hasOne(c, relative, nameOverride) {
        if (nameOverride === void 0) { nameOverride = null; }
        return null;
    };
}
exports.createHasOne = createHasOne;
function root(ctr) {
    return null;
}
exports.root = root;
function queryBy(fn) {
    return null;
}
exports.queryBy = queryBy;
function integer() {
    return null;
}
exports.integer = integer;
function useTable(tableName) {
    return null;
}
exports.useTable = useTable;
/** Use this decorator to indicate that the field should map to the backend as a DATE field, but presented as an ISO Date String */
function isIsoDate() {
    return null;
}
exports.isIsoDate = isIsoDate;
//# sourceMappingURL=decorators.js.map