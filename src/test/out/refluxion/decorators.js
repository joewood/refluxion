"use strict";
function hasMany(target, key, descriptor) { return descriptor; }
exports.hasMany = hasMany;
exports.hasMany2 = function (foreignKey) {
    return function (target, key, descriptor) {
        return descriptor;
    };
};
function hasMany3(relative) {
    return function (target, key, descriptor) {
        var _this = this;
        console.log("Updating Target " + key);
        return target[key] = function (entities) {
            console.log("Filtering " + _this.id);
            return entities.filter(function (e) { return _this.id === relative(e); });
        };
    };
}
exports.hasMany3 = hasMany3;
function hasOne2(relative, nameOverride) {
    if (nameOverride === void 0) { nameOverride = null; }
    return null;
}
exports.hasOne2 = hasOne2;
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