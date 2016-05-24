import * as TsTypeInfo from "ts-type-info";
import { camelToUnderscore } from "common-ts/lib/core";
import fs = require("fs");
import * as Path from "path";

import { appendLine, convertMethodName, getDictReturnType, removePrefixI, toCamel, mapClassMembers, iterateRoot} from "./helpers";
export function getPrimitives(classDef: TsTypeInfo.ClassDefinition): string {
    let props = [];
    if (classDef.extendsTypeExpressions && classDef.extendsTypeExpressions.length > 0) {
        props = props.concat((classDef.extendsTypeExpressions[0].types[0].definitions[0] as TsTypeInfo.ClassDefinition).properties);
    }
    props = props.concat(classDef.properties);
    const typeDef = `export type ${classDef.name}Primitives = ${props.map(prop => "\"" + prop.name + "\"").join(" | ")};`;
    const allProps = `export const ${toCamel(classDef.name)}Fields : ${classDef.name}Primitives[] = [${props.map(prop => "\"" + prop.name + "\"").join(", ")}];`;
    return typeDef + "\n" + allProps + "\n\n";
}

export function getQueryClass(c: TsTypeInfo.ClassDefinition, whereClass: string): string {
    let buffer = "";
    buffer += `export class ${c.name}Query extends Query {\n`;
    buffer += `\tconstructor( primitives: ${c.name}Primitives[], nested: ${c.name}Nested = null, where: ${whereClass} | {id:string} = null, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }\n`;
    buffer += "}\n\n";
    return buffer;
}