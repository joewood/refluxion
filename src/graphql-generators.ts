import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";
import { EntityField } from "./helpers";

import { appendLine, getDictReturnType, removePrefixI, toCamel, Table, iterateRoot } from "./helpers";

function getGraphQLTypeofProp(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, entity: TsTypeInfo.ClassDefinition, p: TsTypeInfo.BasePropertyDefinition): string {
    const prop = new EntityField(modelFile, modelRoot, entity, p);
    if (p.name === "id") return "GraphQL.GraphQLID";
    if (p.type.text.startsWith("\"")) return "GraphQL.GraphQLString";
    if (prop.isEnum()) {
        return "GraphQL.GraphQLInt";
    }
    if (prop.isUnionLiteralType() || prop.isUnionType()) {
        return "GraphQL.GraphQLString";
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

function getInnerWhereClass(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, entity: TsTypeInfo.ClassDefinition, ps: TsTypeInfo.BasePropertyDefinition[], suffix: string) {
    let buffer = "";
    for (let p of ps) {
        if (p.type.text.startsWith("{")) {
            buffer += `\t ${p.name} : { type: new GraphQL.GraphQLInputObjectType({ name:"${p.name + "_" + suffix}", fields: {\n ${getInnerWhereClass(modelFile, modelRoot, entity, p.type.properties, suffix)}} })},\n`
        } else {
            buffer += `\t ${p.name} : { type: ${getGraphQLTypeofProp(modelFile, modelRoot, entity, p)}},\n`
        }
    }
    return buffer;
}

export function generateGraphQLArgs(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, table: Table, p: TsTypeInfo.ClassPropertyDefinition, whereClass: TsTypeInfo.ClassDefinition): string {
    const entity: TsTypeInfo.ClassDefinition = table.getTableType();
    let buffer = "";
    buffer += `export const ${p.name}Args : GraphQL.GraphQLFieldConfigArgumentMap = {\n`;
    buffer += getInnerWhereClass(modelFile, modelRoot, entity, whereClass.properties.map(pp => pp), p.name);
    buffer += "\t limit: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t offset: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t order: { type: GraphQL.GraphQLString },\n";
    buffer += "};\n";
    return buffer;
}

export function generateGraphQLAttributes(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, table: Table, whereClass: TsTypeInfo.ClassDefinition, tableName: string): string {
    let buffer = "";
    const p = table.tableProperty;
    const entity = table.getTableType();
    buffer += `\t types.${toCamel(entity.name)}Type = new GraphQL.GraphQLObjectType({\n`;
    buffer += `\t\t name: "${entity.name}",\n`;
    //"${collectClass.name}",\n`;
    buffer += `\t\t fields: () => ({\n`;
    buffer += `\t\t\t id : { type : GraphQL.GraphQLString  },\n`;
    for (let p of entity.properties) {
        if (p.name == "id") continue;
        buffer += `\t\t\t ${p.name} : { type : ${getGraphQLTypeofProp(modelFile, modelRoot, entity, p)} },\n`;
    }
    buffer += table.mapEntityRelationships(
        hasMany => `\t\t\t ${hasMany.getName()} : {\n` +
            `\t\t\t\t type: new GraphQL.GraphQLList(types.${toCamel(hasMany.getManyType().name)}Type ),\n` +
            `\t\t\t\t resolve: resolver( tables.${tableName}.associations.${hasMany.getName()} ),\n` +
            `\t\t\t },\n`,
        hasOne => `\t\t\t ${hasOne.getName()} : {\n` +
            `\t\t\t\t type: types.${toCamel(hasOne.getOneType().name)}Type,\n` +
            `\t\t\t\t resolve: resolver( tables.${tableName}.associations.${hasOne.getName()} ),\n` +
            `\t\t\t},\n`);
    buffer += "\t\t})\n";
    buffer += "\t});\n";
    return buffer;
}

export function generateGraphQLEndPoints(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition, tableName: string): string {
    let buffer = "";
    buffer += `export function get${removePrefixI(collectClass)}( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig {\n`;
    buffer += `\t return {\n`;
    buffer += `\t\t type: types.${toCamel(collectClass.name)}Type,\n`;
    buffer += `\t\t args: defaultArgs(tables.${tableName}),\n`;
    buffer += `\t\t resolve: resolver(tables.${tableName}),\n`;
    buffer += `\t};\n`;
    buffer += `}\n\n`;

    buffer += `export function get_${p.name}( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig  {\n`;
    buffer += `\t return {\n`;
    buffer += `\t\t type: new GraphQL.GraphQLList(types.${toCamel(collectClass.name)}Type),\n`;
    buffer += `\t\t args: ${p.name}Args,\n`;
    buffer += `\t\t resolve: resolver(tables.${tableName}),\n`;
    buffer += `\t};\n`;
    buffer += `}\n`;

    return buffer;
}
