"use strict";
var helpers_1 = require("./helpers");
function getGraphQLTypeofProp(p) {
    if (p.name === "id")
        return "GraphQL.GraphQLID";
    if (p.type.text.startsWith("\""))
        return "GraphQL.GraphQLString";
    if (p.type.definitions[0] && p.type.definitions[0].isEnumDefinition()) {
        return "GraphQL.GraphQLInt";
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
function getInnerWhereClass(ps, suffix) {
    var buffer = "";
    for (var _i = 0, ps_1 = ps; _i < ps_1.length; _i++) {
        var p = ps_1[_i];
        if (p.type.text.startsWith("{")) {
            buffer += "\t " + p.name + " : { type: new GraphQL.GraphQLInputObjectType({ name:\"" + (p.name + "_" + suffix) + "\", fields: {\n " + getInnerWhereClass(p.type.properties, suffix) + "} })},\n";
        }
        else {
            buffer += "\t " + p.name + " : { type: " + getGraphQLTypeofProp(p) + "},\n";
        }
    }
    return buffer;
}
function generateGraphQLArgs(p, collectClass, whereClass) {
    var buffer = "";
    buffer += "export const " + p.name + "Args : GraphQL.GraphQLFieldConfigArgumentMap = {\n";
    buffer += getInnerWhereClass(whereClass.properties.map(function (pp) { return pp; }), p.name);
    buffer += "\t limit: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t offset: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t order: { type: GraphQL.GraphQLString },\n";
    buffer += "};\n";
    return buffer;
}
exports.generateGraphQLArgs = generateGraphQLArgs;
function generateGraphQLAttributes(table, collectClass, whereClass, tableName) {
    var buffer = "";
    var p = table.tableProperty;
    buffer += "\t types." + helpers_1.toCamel(collectClass.name) + "Type = new GraphQL.GraphQLObjectType({\n";
    buffer += "\t\t name: \"" + collectClass.name + "\",\n";
    //"${collectClass.name}",\n`;
    buffer += "\t\t fields: () => ({\n";
    buffer += "\t\t\t id : { type : GraphQL.GraphQLString  },\n";
    for (var _i = 0, _a = collectClass.properties; _i < _a.length; _i++) {
        var p_1 = _a[_i];
        if (p_1.name == "id")
            continue;
        buffer += "\t\t\t " + p_1.name + " : { type : " + getGraphQLTypeofProp(p_1) + " },\n";
    }
    buffer += table.mapClassMembers(function (hasMany) { return ("\t\t\t " + hasMany.getName() + " : {\n") +
        ("\t\t\t\t type: new GraphQL.GraphQLList(types." + helpers_1.toCamel(hasMany.getManyType().name) + "Type ),\n") +
        ("\t\t\t\t resolve: resolver( tables." + tableName + ".associations." + hasMany.getName() + " ),\n") +
        "\t\t\t },\n"; }, function (hasOne) { return ("\t\t\t " + hasOne.getName() + " : {\n") +
        ("\t\t\t\t type: types." + helpers_1.toCamel(hasOne.getOneType().name) + "Type,\n") +
        ("\t\t\t\t resolve: resolver( tables." + tableName + ".associations." + hasOne.getName() + " ),\n") +
        "\t\t\t},\n"; });
    buffer += "\t\t})\n";
    buffer += "\t});\n";
    return buffer;
}
exports.generateGraphQLAttributes = generateGraphQLAttributes;
function generateGraphQLEndPoints(p, collectClass, whereClass, tableName) {
    var buffer = "";
    buffer += "export function get" + helpers_1.removePrefixI(collectClass) + "( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig {\n";
    buffer += "\t return {\n";
    buffer += "\t\t type: types." + helpers_1.toCamel(collectClass.name) + "Type,\n";
    buffer += "\t\t args: defaultArgs(tables." + tableName + "),\n";
    buffer += "\t\t resolve: resolver(tables." + tableName + "),\n";
    buffer += "\t};\n";
    buffer += "}\n\n";
    buffer += "export function get_" + p.name + "( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig  {\n";
    buffer += "\t return {\n";
    buffer += "\t\t type: new GraphQL.GraphQLList(types." + helpers_1.toCamel(collectClass.name) + "Type),\n";
    buffer += "\t\t args: " + p.name + "Args,\n";
    buffer += "\t\t resolve: resolver(tables." + tableName + "),\n";
    buffer += "\t};\n";
    buffer += "}\n";
    return buffer;
}
exports.generateGraphQLEndPoints = generateGraphQLEndPoints;
//# sourceMappingURL=graphql-generators.js.map