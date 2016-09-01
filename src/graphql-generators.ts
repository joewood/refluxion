import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";

import { appendLine,  getDictReturnType, removePrefixI, toCamel, Table, iterateRoot} from "./helpers";

function getGraphQLTypeofProp(p: TsTypeInfo.BasePropertyDefinition): string {
    if (p.name === "id") return "GraphQL.GraphQLID";
    if (p.type.text.startsWith("\"")) return "GraphQL.GraphQLString";
    if (p.type.definitions[0] && p.type.definitions[0].isEnumDefinition()) {
        return "GraphQL.GraphQLInt";
    }
    const decs = (p as TsTypeInfo.ClassPropertyDefinition).decorators;
    if (decs && decs.find(d => d.name === "isIsoDate")) {
        return "GraphQLDate";
    }
    switch (p.type.text) {
        case "boolean":
            return "GraphQL.GraphQLBoolean";
        case "string":
            return "GraphQL.GraphQLString";
        case "number":
            return (decs && decs.find(pp => pp.name === "integer")) ? "GraphQL.GraphQLInt" : "GraphQL.GraphQLFloat";
        default:
            return "GraphQL.GraphQLScalarType";
    }
}

function getInnerWhereClass(ps: TsTypeInfo.PropertyDefinitions[], suffix: string) {
    let buffer = "";
    for (let p of ps) {
        if (p.type.text.startsWith("{")) {
            buffer += `\t ${p.name} : { type: new GraphQL.GraphQLInputObjectType({ name:"${p.name + "_" + suffix}", fields: {\n ${getInnerWhereClass(p.type.properties, suffix)}} })},\n`
        } else {
            buffer += `\t ${p.name} : { type: ${getGraphQLTypeofProp(p)}},\n`
        }
    }
    return buffer;
}

export function generateGraphQLArgs(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `export const ${p.name}Args : GraphQL.GraphQLFieldConfigArgumentMap = {\n`;
    buffer += getInnerWhereClass(whereClass.properties.map(pp => pp), p.name);
    buffer += "\t limit: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t offset: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t order: { type: GraphQL.GraphQLString },\n";
    buffer += "};\n";
    return buffer;
}

export function generateGraphQLAttributes(table: Table, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition,tableName:string): string {
    let buffer = "";
    const p = table.tableProperty;
    buffer += `\t types.${toCamel(collectClass.name)}Type = new GraphQL.GraphQLObjectType({\n`;
    buffer += `\t\t name: "${collectClass.name}",\n`;
    //"${collectClass.name}",\n`;
    buffer += `\t\t fields: () => ({\n`;
    buffer += `\t\t\t id : { type : GraphQL.GraphQLString  },\n`;
    for (let p of collectClass.properties) {
        if (p.name == "id") continue;
        buffer += `\t\t\t ${p.name} : { type : ${getGraphQLTypeofProp(p)} },\n`;
    }
    buffer += table.mapClassMembers(
        hasMany => `\t\t\t ${hasMany.getName()} : {\n` +
            `\t\t\t\t type: new GraphQL.GraphQLList(types.${toCamel(hasMany.getManyType().name)}Type),\n` +
            `\t\t\t\t resolve: resolver(Seq.tables.${tableName}.associations.${hasMany.getName()}),\n` +
            `\t\t\t },\n`,
        hasOne => `\t\t\t ${hasOne.getName()} : {\n` +
            `\t\t\t\t type: types.${toCamel(hasOne.getOneType().name)}Type,\n` +
            `\t\t\t\t resolve: resolver(Seq.tables.${tableName}.associations.${hasOne.getName()}),\n` +
            `\t\t\t},\n`);
    buffer += "\t\t})\n";
    buffer += "\t});\n";
    return buffer;
}

export function generateGraphQLEndPoints(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition, tableName:string): string {
    let buffer = "";
    buffer += `export function get${removePrefixI(collectClass)}( Seq : SequelizeModel, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig {\n`;
    buffer += `\t return {\n`;
    buffer += `\t\t type: types.${toCamel(collectClass.name)}Type,\n`;
    buffer += `\t\t args: defaultArgs(Seq.tables.${tableName}),\n`;
    buffer += `\t\t resolve: resolver(Seq.tables.${tableName}),\n`;
    buffer += `\t};\n`;
    buffer += `}\n\n`;

    buffer += `export function get_${p.name}( Seq : SequelizeModel, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig  {\n`;
    buffer += `\t return {\n`;
    buffer += `\t\t type: new GraphQL.GraphQLList(types.${toCamel(collectClass.name)}Type),\n`;
    buffer += `\t\t args: ${p.name}Args,\n`;
    buffer += `\t\t resolve: resolver(Seq.tables.${tableName}),\n`;
    buffer += `\t};\n`;
    buffer += `}\n`;

    return buffer;
}