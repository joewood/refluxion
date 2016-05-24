import * as TsTypeInfo from "ts-type-info";
import { camelToUnderscore } from "common-ts/lib/core";
import fs = require("fs");
import * as Path from "path";

import { appendLine, convertMethodName, getDictReturnType, removePrefixI, toCamel, mapClassMembers, iterateRoot} from "./helpers";

function getGraphQLTypeofProp(p: TsTypeInfo.BasePropertyDefinition): string {
    if (p.name === "id") return "GraphQL.GraphQLID";
    if (p.typeExpression.text.startsWith("\"")) return "GraphQL.GraphQLString";
    if (p.typeExpression.types.length > 0 && p.typeExpression.types[0].definitions[0] && p.typeExpression.types[0].definitions[0].isEnumDefinition()) {
        return "GraphQL.GraphQLInt";
    }
    const decs = (p as TsTypeInfo.ClassPropertyDefinition).decorators;
    if (decs && decs.find( d=> d.name==="isIsoDate")) {
        return "GraphQLDate";
    }
    switch (p.typeExpression.text) {
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

function getInnerWhereClass(ps: TsTypeInfo.PropertyDefinitions[], suffix:string) {
    let buffer = "";
    for (let p of ps) {
        if (p.typeExpression.text.startsWith("{")) {
            buffer += `\t ${p.name} : { type: new GraphQL.GraphQLInputObjectType({ name:"${p.name+"_"+suffix}", fields: {\n ${getInnerWhereClass(p.typeExpression.types[0].properties,suffix)}} })},\n`
        } else {
            buffer += `\t ${p.name} : { type: ${getGraphQLTypeofProp(p)}},\n`
        }
    }
    return buffer;
}

export function generateGraphQLArgs(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `export const ${p.name}Args : GraphQL.GraphQLFieldConfigArgumentMap = {\n`;
    buffer += getInnerWhereClass(whereClass.properties.map(pp => pp),p.name);
    buffer += "\t limit: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t offset: { type: GraphQL.GraphQLInt },\n";
    buffer += "\t order: { type: GraphQL.GraphQLString },\n";
    buffer += "};\n";
    return buffer;
}

export function generateGraphQLAttributes(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `\t types.${toCamel(collectClass.name)}Type = new GraphQL.GraphQLObjectType({\n`;
    buffer += `\t\t name: "${collectClass.name}",\n`;
    //"${collectClass.name}",\n`;
    buffer += `\t\t fields: () => ({\n`;
    buffer += `\t\t\t id : { type : GraphQL.GraphQLString  },\n`;
    for (let p of collectClass.properties) {
        buffer += `\t\t\t ${p.name} : { type : ${getGraphQLTypeofProp(p)} },\n`;
    }
    buffer += mapClassMembers(collectClass,
        (d, p) => `\t\t\t ${convertMethodName(p.name)} : {\n` +
            `\t\t\t\t type: new GraphQL.GraphQLList(types.${toCamel(getDictReturnType(p))}Type),\n` +
            `\t\t\t\t resolve: resolver(Seq.tables.${removePrefixI(collectClass)}.associations.${convertMethodName(p.name)}),\n` +
            `\t\t\t },\n`,
        (d, p) => `\t\t\t ${((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "")} : {\n` +
            `\t\t\t\t type: types.${toCamel(d.arguments[0].text)}Type,\n` +
            `\t\t\t\t resolve: resolver(Seq.tables.${removePrefixI(d.arguments[0].text)}),\n` +
            `\t\t\t},\n`);
    buffer += "\t\t})\n";
    buffer += "\t});\n";
    return buffer;
}

export function generateGraphQLEndPoints(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `export function get${removePrefixI(collectClass)}( Seq : SequelizeModel, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig {\n`;
    buffer += `\t return {\n`;
    buffer += `\t\t type: types.${toCamel(collectClass.name)}Type,\n`;
    buffer += `\t\t args: defaultArgs(Seq.tables.${removePrefixI(collectClass)}),\n`;
    buffer += `\t\t resolve: resolver(Seq.tables.${removePrefixI(collectClass)}),\n`;
    buffer += `\t};\n`;
    buffer += `}\n\n`;

    buffer += `export function get_${p.name}( Seq : SequelizeModel, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig  {\n`;
    buffer += `\t return {\n`;
    buffer += `\t\t type: new GraphQL.GraphQLList(types.${toCamel(collectClass.name)}Type),\n`;
    buffer += `\t\t args: ${p.name}Args,\n`;
    buffer += `\t\t resolve: resolver(Seq.tables.${removePrefixI(collectClass)}),\n`;
    buffer += `\t};\n`;
    buffer += `}\n`;

    return buffer;
}
