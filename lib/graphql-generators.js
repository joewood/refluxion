"use strict";
var TsTypeInfo = require("ts-type-info");
var helpers_1 = require("./helpers");
var helpers_2 = require("./helpers");
function getGraphQLTypeofProp(modelFile, modelRoot, entity, p) {
    var prop = new helpers_1.EntityField(modelFile, modelRoot, entity, p);
    if (p.name === "id" || p.name === "ID")
        return "GraphQL.GraphQLID";
    if (p.type.text.startsWith("\""))
        return "GraphQL.GraphQLString";
    if (prop.isEnum()) {
        return "GraphQL.GraphQLInt";
    }
    if (prop.isUnionLiteralType() || prop.isUnionType()) {
        return "GraphQL.GraphQLString";
    }
    var decs = p.decorators;
    if (decs && decs.find(function (d) { return d.name === "isIsoDate"; })) {
        return "GraphQLDate";
    }
    switch (p.type.text) {
        case "boolean":
            return "GraphQL.GraphQLBoolean";
        case "string":
            return "GraphQL.GraphQLString";
        case "number":
            return (decs && decs.find(function (pp) { return pp.name === "integer"; })) ? "GraphQL.GraphQLInt" : "GraphQL.GraphQLFloat";
        default:
            return "GraphQL.GraphQLScalarType";
    }
}
function getInnerWhereClass(modelFile, modelRoot, entity, ps, suffix) {
    var buffer = "";
    for (var _i = 0, ps_1 = ps; _i < ps_1.length; _i++) {
        var p = ps_1[_i];
        if (p.type.text.startsWith("{")) {
            buffer += "\t " + p.name + " : { type: new GraphQL.GraphQLInputObjectType({ name:\"" + (p.name + "_" + suffix) + "\", fields: {\n " + getInnerWhereClass(modelFile, modelRoot, entity, p.type.properties, suffix) + "} })},\n";
        }
        else {
            buffer += "\t " + p.name + " : { type: " + getGraphQLTypeofProp(modelFile, modelRoot, entity, p) + "},\n";
        }
    }
    return buffer;
}
function generateGraphQLArgs(modelFile, modelRoot, table, p, whereClass) {
    var entity = table.getTableType();
    var buffer = "";
    buffer += "export const " + p.name + "Args /*: GraphQL.GraphQLFieldConfigArgumentMap */ = {\n";
    buffer += getInnerWhereClass(modelFile, modelRoot, entity, whereClass.properties.map(function (pp) { return pp; }), p.name);
    buffer += "\t limit: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t offset: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t order: { type: GraphQL.GraphQLString },\n";
    buffer += "};\n";
    return buffer;
}
exports.generateGraphQLArgs = generateGraphQLArgs;
function generateGraphQLAttributes(modelFile, modelRoot, table, whereClass, tableName) {
    var buffer = "";
    var p = table.tableProperty;
    var entity = table.getTableType();
    buffer += "\t types." + helpers_2.toCamel(entity.name) + "Type = new GraphQL.GraphQLObjectType({\n";
    buffer += "\t\t name: \"" + entity.name + "\",\n";
    buffer += "\t\t fields: () => ({\n";
    // buffer += `\t\t\t id: { type : GraphQL.GraphQLString  },\n`;
    for (var _i = 0, _a = entity.properties; _i < _a.length; _i++) {
        var p_1 = _a[_i];
        if (p_1.kind != TsTypeInfo.ClassPropertyKind.Normal)
            continue;
        if (p_1.name === "id" || p_1.name === "ID") {
            buffer += "\t\t\t " + p_1.name + " : { type : " + getGraphQLTypeofProp(modelFile, modelRoot, entity, p_1) + "},\n";
            continue;
        }
        buffer += "\t\t\t " + p_1.name + " : { type : " + getGraphQLTypeofProp(modelFile, modelRoot, entity, p_1) + " },\n";
    }
    buffer += table.mapEntityRelationships(function (hasMany) { return ("\t\t\t " + hasMany.getName() + " : {\n") +
        ("\t\t\t\t type: new GraphQL.GraphQLList(types." + helpers_2.toCamel(hasMany.getManyType().name) + "Type ),\n") +
        ("\t\t\t\t resolve: resolver( tables." + tableName + ".associations." + hasMany.getName() + " ),\n") +
        "\t\t\t },\n"; }, function (hasOne) { return ("\t\t\t " + hasOne.getName() + " : {\n") +
        ("\t\t\t\t type: types." + helpers_2.toCamel(hasOne.getOneType().name) + "Type,\n") +
        ("\t\t\t\t resolve: resolver( tables." + tableName + ".associations." + hasOne.getName() + " ),\n") +
        "\t\t\t},\n"; });
    buffer += "\t\t})\n";
    buffer += "\t});\n";
    return buffer;
}
exports.generateGraphQLAttributes = generateGraphQLAttributes;
function generateGraphQLEndPoints(p, collectClass, whereClass, tableName) {
    var buffer = "";
    buffer += "export function get" + helpers_2.removePrefixI(collectClass) + "( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig*/ {\n";
    buffer += "\t return {\n";
    buffer += "\t\t type: types." + helpers_2.toCamel(collectClass.name) + "Type,\n";
    buffer += "\t\t args: defaultArgs(tables." + tableName + "),\n";
    buffer += "\t\t resolve: resolver(tables." + tableName + "),\n";
    buffer += "\t};\n";
    buffer += "}\n\n";
    buffer += "export function get_" + p.name + "( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig */ {\n";
    buffer += "\t return {\n";
    buffer += "\t\t type: new GraphQL.GraphQLList(types." + helpers_2.toCamel(collectClass.name) + "Type),\n";
    buffer += "\t\t args: " + p.name + "Args,\n";
    buffer += "\t\t resolve: resolver(tables." + tableName + "),\n";
    buffer += "\t};\n";
    buffer += "}\n";
    return buffer;
}
exports.generateGraphQLEndPoints = generateGraphQLEndPoints;
//# sourceMappingURL=graphql-generators.js.map