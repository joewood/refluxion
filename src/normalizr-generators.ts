import * as TsTypeInfo from "ts-type-info";
import { camelToUnderscore } from "core-ts/lib/core";
import fs = require("fs");
import * as Path from "path";

import { appendLine, convertMethodName, getDictReturnType, removePrefixI, toCamel, mapClassMembers, iterateRoot} from "./helpers";

export function generateNormalizrDefine(collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    let normVarName = toCamel(collectClass.name);
    buffer += `${normVarName}.define({\n`;
    buffer += mapClassMembers(collectClass,
        (d, p) => `\t${convertMethodName(p.name)} : arrayOf(${toCamel(p.returnTypeExpression.types[0].typeArguments[0].text)}),`,
        (d, p) => `\t${((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "")} : ${toCamel(d.arguments[0].text)},`);
    buffer += "});\n";
    return buffer;
}