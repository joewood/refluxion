"use strict";
var query_1 = require("./query");
exports.toGraphQlQueryString = query_1.toGraphQlQueryString;
exports.Query = query_1.Query;
function hasMany(target, key, descriptor) { return descriptor; }
exports.hasMany = hasMany;
function createHasOne() {
    return function hasOne(c, relative, nameOverride) {
        if (nameOverride === void 0) { nameOverride = null; }
        return null;
    };
}
exports.createHasOne = createHasOne;
function root(construc) {
}
exports.root = root;
function queryBy(fn) {
    return null;
    // return function(target: any, key, descriptor: PropertyDescriptor) : PropertyDescriptor { return descriptor; }; 
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
//# sourceMappingURL=main.js.map