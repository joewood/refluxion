import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";
import { appendLine, Table, getDictReturnType, EntityField, removePrefixI, toCamel, iterateRoot } from "./helpers";

export function generateInterfaceForClass(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, collectClass: TsTypeInfo.ClassDefinition, suffix: string, makeArrays: boolean, optional = false): string {
    if (!collectClass) {
        console.trace("Type for Class is null");
        return "<NULL>";
    }
    let buffer = "";
    const name = (collectClass.name.startsWith("I") ? collectClass.name : ("I" + collectClass.name)).replace("MasterClass", "") + suffix;
    buffer += `\n// created from class ` + collectClass.name + "\n";
    buffer += `\nexport interface ${name} extends Base {\n`;
    buffer += collectClass.properties.map(p => {
        const prop = new EntityField(modelFile, modelRoot, collectClass, p);

        let typeName = prop.getTypeName();
        const propType = p.type;
        const definition = propType.definitions && propType.definitions[0];
        const typeArgs = prop.getTypeArguments();

        // for root tables
        if (typeArgs && typeArgs.length > 0) {
            const typeArg = typeArgs[0];
            typeName = makeArrays ? ("Model." + typeArg.text + "[]") : typeName.replace(typeArg.text, "Model." + typeArg.text);
        } else if (prop.isEnum()) {
            typeName = "Model." + typeName;
        } else if (prop.isPrimitive()) {
            // do nothing
        } else if (prop.isUnionLiteralType()) {
            typeName = propType.text;
        } else {
            typeName = "Model." + typeName;
        }
        return `\t${p.name}${optional ? "?:" : ":"} ${typeName};`;
    }).join("\n");
    buffer += "\n}\n";
    return buffer;
}


export function generateNestedClass(table: Table): string {
    let buffer = "";
    buffer += `export interface ${table.getTableInterfaceTypeName()}Nested {\n`;
    buffer += table.mapEntityRelationships(
        hasMany => `\t${hasMany.getName()}?: ${hasMany.getManyType().name}Query;`,
        hasOne => `\t${hasOne.getName()}?: ${hasOne.getOneType().name}Query;`
    );
    buffer += "}\n";
    return buffer;
}


export function generateWhereInterface(
    modelFile: TsTypeInfo.FileDefinition,
    modelRoot: TsTypeInfo.ClassDefinition,
    collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    if (!collectClass) {
        console.trace("Type Filter for Class is null");
        return "<NULL>";
    }

    buffer += `export interface ${collectClass.name} extends GraphQLWhere {\n`;
    buffer += "\t order?: string;\n";
    buffer += "\t offset?: number;\n";
    buffer += "\t limit?: number;\n";
    for (let p of collectClass.properties) {
        const fp = new EntityField(modelFile, modelRoot, collectClass, p);
        let typeName = fp.getTypeName();
        if (fp.isEnum()) {
            typeName = "Model." + typeName;
        } else if (fp.isPrimitive()) {
            // do nothing
        } else if (fp.isUnionLiteralType()) {
            typeName = fp.property.type.text;
        } else {
            typeName = "Model." + typeName;
        }
        buffer +=  `\t${fp.getName()}? : ${typeName};\n`;
    }
    buffer += "}\n\n";
    return buffer;
}
