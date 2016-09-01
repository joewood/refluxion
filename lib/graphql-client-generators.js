"use strict";
var helpers_1 = require("./helpers");
function getPrimitives(tableType) {
    var props = [];
    if (tableType.extendsTypes && tableType.extendsTypes.length > 0) {
        props = props.concat(tableType.extendsTypes[0].definitions[0].properties);
    }
    props = props.concat(tableType.properties);
    var typeDef = "export type " + tableType.name + "Primitives = " + props.map(function (prop) { return "\"" + prop.name + "\""; }).join(" | ") + ";";
    var allProps = "export const " + helpers_1.toCamel(tableType.name) + "Fields : " + tableType.name + "Primitives[] = [" + props.map(function (prop) { return "\"" + prop.name + "\""; }).join(", ") + "];";
    return typeDef + "\n" + allProps + "\n\n";
}
exports.getPrimitives = getPrimitives;
function getQueryClass(table, whereClass) {
    var tableType = table.getTableType();
    var buffer = "";
    buffer += "export class " + tableType.name + "Query extends Query {\n";
    buffer += "\tconstructor( primitives: " + tableType.name + "Primitives[], nested: " + table.getTableInterfaceTypeName() + "Nested = null, where: " + whereClass + " | {id:string} = null, options = {}) {\n            super(primitives,nested as Dict<Query>,where);\n         }\n";
    buffer += "}\n\n";
    return buffer;
}
exports.getQueryClass = getQueryClass;
//# sourceMappingURL=graphql-client-generators.js.map