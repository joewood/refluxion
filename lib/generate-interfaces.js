"use strict";
var helpers_1 = require("./helpers");
function generateInterfaceForClass(modelFile, modelRoot, collectClass, suffix, makeArrays, optional) {
    if (optional === void 0) { optional = false; }
    if (!collectClass) {
        console.trace("Type for Class is null");
        return "<NULL>";
    }
    var buffer = "";
    var name = (collectClass.name.startsWith("I") ? collectClass.name : ("I" + collectClass.name)).replace("MasterClass", "") + suffix;
    buffer += "\n// created from class " + collectClass.name + "\n";
    buffer += "\nexport interface " + name + " extends Base {\n";
    buffer += collectClass.properties.map(function (p) {
        var prop = new helpers_1.EntityField(modelFile, modelRoot, collectClass, p);
        var typeName = prop.getTypeName();
        var propType = p.type;
        var definition = propType.definitions && propType.definitions[0];
        var typeArgs = prop.getTypeArguments();
        // for root tables
        if (typeArgs && typeArgs.length > 0) {
            var typeArg = typeArgs[0];
            typeName = makeArrays ? ("Model." + typeArg.text + "[]") : typeName.replace(typeArg.text, "Model." + typeArg.text);
        }
        else if (prop.isEnum()) {
            typeName = "Model." + typeName;
        }
        else if (prop.isPrimitive()) {
        }
        else if (prop.isUnionLiteralType()) {
            typeName = propType.text;
        }
        else {
            typeName = "Model." + typeName;
        }
        return "\t" + p.name + (optional ? "?:" : ":") + " " + typeName + ";";
    }).join("\n");
    buffer += "\n}\n";
    return buffer;
}
exports.generateInterfaceForClass = generateInterfaceForClass;
function generateNestedClass(table) {
    var buffer = "";
    buffer += "export interface " + table.getTableInterfaceTypeName() + "Nested {\n";
    buffer += table.mapEntityRelationships(function (hasMany) { return ("\t" + hasMany.getName() + "?: " + hasMany.getManyType().name + "Query;"); }, function (hasOne) { return ("\t" + hasOne.getName() + "?: " + hasOne.getOneType().name + "Query;"); });
    buffer += "}\n";
    return buffer;
}
exports.generateNestedClass = generateNestedClass;
function generateWhereInterface(collectClass) {
    var buffer = "";
    if (!collectClass) {
        console.trace("Type Filter for Class is null");
        return "<NULL>";
    }
    buffer += "export interface " + collectClass.name + " extends GraphQLWhere {\n";
    buffer += "\t order?: string;\n";
    buffer += "\t offset?: number;\n";
    buffer += "\t limit?: number;\n";
    buffer += collectClass.properties.map(function (p) { return ("\t" + p.name + "? : " + p.type.text + ";"); }).join('\n') + "\n";
    buffer += "}\n\n";
    return buffer;
}
exports.generateWhereInterface = generateWhereInterface;
//# sourceMappingURL=generate-interfaces.js.map