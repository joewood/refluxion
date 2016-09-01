import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";
import { appendLine, Table, getDictReturnType, removePrefixI, toCamel, iterateRoot} from "./helpers";

export function generateInterfaceForClass(collectClass: TsTypeInfo.ClassDefinition, suffix: string, makeArrays: boolean, optional=false): string {
    if (!collectClass) {
        console.trace("Type for Class is null");
        return "<NULL>";
    }
    let buffer = "";
    const name = (collectClass.name.startsWith("I") ? collectClass.name : ("I" + collectClass.name)).replace("MasterClass", "") + suffix;
    buffer += `\n// created from class ` + collectClass.name + "\n";
    buffer += `\nexport interface ${name} extends Base {\n`;
    buffer += collectClass.properties.map(p => {
        let typeName = p.type.text;
        const propType = p.type;
        if (propType["typeArguments"] && propType["typeArguments"].length>0) {
            const typeArg = propType["typeArguments"][0];
            typeName = makeArrays ? ("Model." + typeArg.text + "[]") : typeName.replace(typeArg.text, "Model." + typeArg.text);
        } else if (propType.isEnumDefinition() 
            || (propType.definitions && propType.definitions[0] && 
                (propType.definitions[0].isInterfaceDefinition() || propType.definitions[0].isEnumDefinition()))) {
            typeName = "Model." + typeName;
        } else {
            typeName = propType.text;
        }
        return `\t${p.name}${optional ? "?:" : ":"} ${typeName};`;
    }).join("\n");
    buffer += "\n}\n";
    return buffer;
}


export function generateNestedClass(table: Table): string {
    let buffer = "";
    buffer += `export interface ${table.getTableInterfaceTypeName()}Nested {\n`;
    buffer += table.mapClassMembers(
        hasMany => `\t${hasMany.getName()}?: ${hasMany.getManyType().name}Query;`,
        hasOne => `\t${hasOne.getName()}?: ${hasOne.getOneType().name}Query;`
    );
    buffer += "}\n";
    return buffer;
}


export function generateWhereInterface(collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    if (!collectClass) {
        console.trace("Type Filter for Class is null");
        return "<NULL>";
    }

    buffer += `export interface ${collectClass.name} extends GraphQLWhere {\n`;
    buffer += "\t order?: string;\n";
    buffer += "\t offset?: number;\n";
    buffer += "\t limit?: number;\n";
    buffer += collectClass.properties.map(p => `\t${p.name}? : ${p.type.text};`).join('\n') + "\n";
    buffer += "}\n\n";
    return buffer;
}
