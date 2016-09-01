import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";

import { appendLine,  getDictReturnType, removePrefixI, toCamel, iterateRoot, Table} from "./helpers";
export function getPrimitives(tableType: TsTypeInfo.ClassDefinition): string {
    let props = [];
    if (tableType.extendsTypes && tableType.extendsTypes.length > 0) {
        props = props.concat((tableType.extendsTypes[0].definitions[0] as TsTypeInfo.ClassDefinition).properties);
    }
    props = props.concat(tableType.properties);
    const typeDef = `export type ${tableType.name}Primitives = ${props.map(prop => "\"" + prop.name + "\"").join(" | ")};`;
    const allProps = `export const ${toCamel(tableType.name)}Fields : ${tableType.name}Primitives[] = [${props.map(prop => "\"" + prop.name + "\"").join(", ")}];`;
    return typeDef + "\n" + allProps + "\n\n";
}

export function getQueryClass(table: Table, whereClass: string): string {
    const tableType = table.getTableType();
    let buffer = "";
    buffer += `export class ${tableType.name}Query extends Query {\n`;
    buffer += `\tconstructor( primitives: ${tableType.name}Primitives[], nested: ${table.getTableInterfaceTypeName()}Nested = null, where: ${whereClass} | {id:string} = null, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }\n`;
    buffer += "}\n\n";
    return buffer;
}