"use strict";
function generateInterfaceForClass(collectClass, suffix, makeArrays, optional) {
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
        var typeName = p.type.text;
        var propType = p.type;
        if (propType["typeArguments"] && propType["typeArguments"].length > 0) {
            var typeArg = propType["typeArguments"][0];
            typeName = makeArrays ? ("Model." + typeArg.text + "[]") : typeName.replace(typeArg.text, "Model." + typeArg.text);
        }
        else if (propType.isEnumDefinition()
            || (propType.definitions && propType.definitions[0] &&
                (propType.definitions[0].isInterfaceDefinition() || propType.definitions[0].isEnumDefinition()))) {
            typeName = "Model." + typeName;
        }
        else {
            typeName = propType.text;
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
    buffer += table.mapClassMembers(function (hasMany) { return ("\t" + hasMany.getName() + "?: " + hasMany.getManyType().name + "Query;"); }, function (hasOne) { return ("\t" + hasOne.getName() + "?: " + hasOne.getOneType().name + "Query;"); });
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