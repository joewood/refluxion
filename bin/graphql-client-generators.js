"use strict";
var helpers_1 = require("./helpers");
function getPrimitives(classDef) {
    var props = [];
    if (classDef.extendsTypeExpressions && classDef.extendsTypeExpressions.length > 0) {
        props = props.concat(classDef.extendsTypeExpressions[0].types[0].definitions[0].properties);
    }
    props = props.concat(classDef.properties);
    var typeDef = "export type " + classDef.name + "Primitives = " + props.map(function (prop) { return "\"" + prop.name + "\""; }).join(" | ") + ";";
    var allProps = "export const " + helpers_1.toCamel(classDef.name) + "Fields : " + classDef.name + "Primitives[] = [" + props.map(function (prop) { return "\"" + prop.name + "\""; }).join(", ") + "];";
    return typeDef + "\n" + allProps + "\n\n";
}
exports.getPrimitives = getPrimitives;
function getQueryClass(c, whereClass) {
    var buffer = "";
    buffer += "export class " + c.name + "Query extends Query {\n";
    buffer += "\tconstructor( primitives: " + c.name + "Primitives[], nested: " + c.name + "Nested = null, where: " + whereClass + " | {id:string} = null, options = {}) {\n            super(primitives,nested as Dict<Query>,where);\n         }\n";
    buffer += "}\n\n";
    return buffer;
}
exports.getQueryClass = getQueryClass;
//# sourceMappingURL=graphql-client-generators.js.map