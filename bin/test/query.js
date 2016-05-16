"use strict";
var util = require("node-util");
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
            var whereClause = util.inspect(this.where, 10).replace(/\'/g, "\"");
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
//# sourceMappingURL=query.js.map