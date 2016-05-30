import * as TsTypeInfo from "ts-type-info";
import { camelToUnderscore } from "core-ts/lib/core";
import fs = require("fs");
import * as Path from "path";
import { appendLine, convertMethodName, getDictReturnType, removePrefixI, toCamel, mapClassMembers, iterateRoot} from "./helpers";

export function generateInterfaceForClass(collectClass: TsTypeInfo.ClassDefinition, suffix: string, makeArrays: boolean): string {
    let buffer = "";
    const name = (collectClass.name.startsWith("I") ? collectClass.name : ("I" + collectClass.name)).replace("MasterClass", "") + suffix;
    buffer += `\n// created from class ` + collectClass.name + "\n";
    buffer += `\nexport interface ${name} {\n`;
    buffer += collectClass.properties.map(p => {
        let typeName = p.typeExpression.text;
        for (let tt of p.typeExpression.types) {
            if (typeName === "boolean" || typeName === "string") continue;
            if (tt.typeArguments.length === 0) {
                typeName = "Model." + typeName;
            } else {
                for (let ta of tt.typeArguments) {
                    typeName = makeArrays ? ("Model." + ta.text + "[]") : typeName.replace(ta.text, "Model." + ta.text);
                    break;
                }
            }
        }
        return `\t${p.name}: ${typeName};`;
    }).join("\n");
    buffer += "\n}\n";
    return buffer;
}


export function generateNestedClass(collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `export interface ${collectClass.name}Nested {\n`;
    buffer += mapClassMembers(collectClass,
        (d, p) => `\t${convertMethodName(p.name)}?: ${p.returnTypeExpression.types[0].typeArguments[0].text}Query;`,
        (d, p) => `\t${((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "")}?: ${d.arguments[0].text}Query;`
    );
    buffer += "}\n";
    return buffer;
}


export function generateWhereInterface(collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `export interface ${collectClass.name} extends GraphQLWhere {\n`;
    buffer += "\t order?: string;\n";
    buffer += "\t offset?: number;\n";
    buffer += "\t limit?: number;\n";
    buffer += collectClass.properties.map(p => `\t${p.name}? : ${p.typeExpression.text};`).join('\n') + "\n";
    buffer += "}\n\n";
    return buffer;
}
