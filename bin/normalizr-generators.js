"use strict";
var helpers_1 = require("./helpers");
function generateNormalizrDefine(collectClass) {
    var buffer = "";
    var normVarName = helpers_1.toCamel(collectClass.name);
    buffer += normVarName + ".define({\n";
    buffer += helpers_1.mapClassMembers(collectClass, function (d, p) { return ("\t" + helpers_1.convertMethodName(p.name) + " : arrayOf(" + helpers_1.toCamel(p.returnTypeExpression.types[0].typeArguments[0].text) + "),"); }, function (d, p) { return ("\t" + ((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "") + " : " + helpers_1.toCamel(d.arguments[0].text) + ","); });
    buffer += "});\n";
    return buffer;
}
exports.generateNormalizrDefine = generateNormalizrDefine;
//# sourceMappingURL=normalizr-generators.js.map