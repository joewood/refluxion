"use strict";
var helpers_1 = require("./helpers");
function generateInterfaceForClass(collectClass, suffix, makeArrays) {
    var buffer = "";
    var name = (collectClass.name.startsWith("I") ? collectClass.name : ("I" + collectClass.name)).replace("MasterClass", "") + suffix;
    buffer += "\n// created from class " + collectClass.name + "\n";
    buffer += "\nexport interface " + name + " {\n";
    buffer += collectClass.properties.map(function (p) {
        var typeName = p.typeExpression.text;
        for (var _i = 0, _a = p.typeExpression.types; _i < _a.length; _i++) {
            var tt = _a[_i];
            if (typeName === "boolean" || typeName === "string")
                continue;
            if (tt.typeArguments.length === 0) {
                typeName = "Model." + typeName;
            }
            else {
                for (var _b = 0, _c = tt.typeArguments; _b < _c.length; _b++) {
                    var ta = _c[_b];
                    typeName = makeArrays ? ("Model." + ta.text + "[]") : typeName.replace(ta.text, "Model." + ta.text);
                    break;
                }
            }
        }
        return "\t" + p.name + ": " + typeName + ";";
    }).join("\n");
    buffer += "\n}\n";
    return buffer;
}
exports.generateInterfaceForClass = generateInterfaceForClass;
function generateNestedClass(collectClass) {
    var buffer = "";
    buffer += "export interface " + collectClass.name + "Nested {\n";
    buffer += helpers_1.mapClassMembers(collectClass, function (d, p) { return ("\t" + helpers_1.convertMethodName(p.name) + "?: " + p.returnTypeExpression.types[0].typeArguments[0].text + "Query;"); }, function (d, p) { return ("\t" + ((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "") + "?: " + d.arguments[0].text + "Query;"); });
    buffer += "}\n";
    return buffer;
}
exports.generateNestedClass = generateNestedClass;
function generateWhereInterface(collectClass) {
    var buffer = "";
    buffer += "export interface " + collectClass.name + " extends GraphQLWhere {\n";
    buffer += "\t order?: string;\n";
    buffer += "\t offset?: number;\n";
    buffer += "\t limit?: number;\n";
    buffer += collectClass.properties.map(function (p) { return ("\t" + p.name + "? : " + p.typeExpression.text + ";"); }).join('\n') + "\n";
    buffer += "}\n\n";
    return buffer;
}
exports.generateWhereInterface = generateWhereInterface;
//# sourceMappingURL=generate-interfaces.js.map