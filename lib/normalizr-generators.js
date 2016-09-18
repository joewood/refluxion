"use strict";
var helpers_1 = require("./helpers");
function generateNormalizrDefine(table) {
    var buffer = "";
    var collectClass = table.getTableType();
    var normVarName = helpers_1.toCamel(collectClass.name);
    buffer += normVarName + ".define({\n";
    buffer += table.mapEntityRelationships(function (hasMany) { return ("\t" + hasMany.getName() + " : arrayOf(" + helpers_1.toCamel(hasMany.getManyType().name) + "),"); }, function (hasOne) { return ("\t" + hasOne.getName() + " : " + helpers_1.toCamel(hasOne.getOneType().name) + ","); });
    buffer += "});\n";
    return buffer;
}
exports.generateNormalizrDefine = generateNormalizrDefine;
//# sourceMappingURL=normalizr-generators.js.map