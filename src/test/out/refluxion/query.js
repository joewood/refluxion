"use strict";
function inspect(x, depth) {
    if (depth === void 0) { depth = 10; }
    if (depth == 0)
        return "TOO DEEP";
    var keys = Object.keys(x);
    var fields = [];
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        var field = key + ": ";
        if (typeof x[key] === "string") {
            field += "\"" + x[key] + "\"";
        }
        else if (typeof x[key] === "object") {
            field += inspect(x[key], depth - 1);
        }
        else {
            field += x[key];
        }
        fields.push(field);
    }
    return "{ " + fields.join(", ") + " }";
}
var Query = (function () {
    function Query(fields, nested, where) {
        if (nested === void 0) { nested = null; }
        if (where === void 0) { where = null; }
        this.fields = fields;
        this.nested = nested;
        this.where = where;
    }
    Query.prototype.toGraphQL = function (tabSize) {
        var _this = this;
        if (tabSize === void 0) { tabSize = 1; }
        var buffer = "\t";
        if (!!this.where && Object.keys(this.where).length > 0) {
            var whereClause = inspect(this.where, 10).replace(/\'/g, "\"");
            buffer = buffer + ("(" + whereClause.slice(1, whereClause.length - 2) + ") ");
        }
        // buffer `{ ${operation} ${typeof query !== "string" ? query.toGraphQL() : query}\n}`;
        buffer = buffer + "{ " + this.fields.join(" ") + "\n";
        if (this.nested) {
            buffer = buffer + Object.keys(this.nested).map(function (fieldName) {
                return "\t" + fieldName + _this.nested[fieldName].toGraphQL(tabSize + 1);
            }).join("\n");
        }
        buffer = buffer + " }";
        return buffer;
    };
    return Query;
}());
exports.Query = Query;
function toGraphQlQueryString(operation, query) {
    return "{ " + operation + " " + (typeof query !== "string" ? query.toGraphQL() : query) + "\n}";
}
exports.toGraphQlQueryString = toGraphQlQueryString;
