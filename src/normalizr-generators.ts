import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";

import { appendLine,  getDictReturnType, removePrefixI, toCamel, Table, iterateRoot} from "./helpers";

export function generateNormalizrDefine(table: Table): string {
    let buffer = "";
    const collectClass = table.getTableType();
    let normVarName = toCamel(collectClass.name);
    buffer += `${normVarName}.define({\n`;
    buffer += table.mapEntityRelationships(
        hasMany => `\t${hasMany.getName()} : arrayOf(${toCamel(hasMany.getManyType().name)}),`,
        hasOne => `\t${hasOne.getName()} : ${toCamel(hasOne.getOneType().name)},`);
    buffer += "});\n";
    return buffer;
}