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
    return function (target, key, descriptor) { return descriptor; };
}
exports.queryBy = queryBy;
//# sourceMappingURL=index.js.map