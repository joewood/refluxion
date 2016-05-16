"use strict";
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
var query_1 = require("./test/query");
exports.toGraphQlQueryString = query_1.toGraphQlQueryString;
exports.Query = query_1.Query;
//# sourceMappingURL=index.js.map