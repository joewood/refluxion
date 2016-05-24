import * as TsTypeInfo from "ts-type-info";
import { camelToUnderscore } from "common-ts/lib/core";
import fs = require("fs");
import * as Path from "path";


/** Convert the name of the class to the schema key name used for normalizr */
export function toCamel(typeName: string): string {
    let normVarName = typeName;
    if (normVarName.startsWith("I")) normVarName = normVarName.slice(1);
    normVarName = normVarName.charAt(0).toLowerCase() + normVarName.slice(1);
    return normVarName;
};

export function convertMethodName(name: string): string {
    const noGet = name.replace("get", "");
    return noGet.slice(0, 1).toLowerCase() + noGet.slice(1);
}

export function appendLine(path: string, line: string) {
    fs.appendFileSync(path, line + "\n");
}

export function getDictReturnType(p: TsTypeInfo.ClassMethodDefinition): string {
    return p.returnTypeExpression.types[0].typeArguments[0].text;
}

export function removePrefixI(c: TsTypeInfo.ClassDefinition | string): string {
    let name = "";
    if (c instanceof TsTypeInfo.ClassDefinition) {
        name = c.name;
    } else {
        name = c;
    }
    if (name.startsWith("I")) return name.slice(1);
    else return name;
}

/** For a specific class, for each many relationship add the specified line through the callback, same for each one-to-one */
export function mapClassMembers(
    c: TsTypeInfo.ClassDefinition,
    hasMany: (d: TsTypeInfo.DecoratorDefinition, p: TsTypeInfo.ClassMethodDefinition) => string,
    hasOne: (d: TsTypeInfo.DecoratorDefinition, p: TsTypeInfo.ClassPropertyDefinition) => string)
    : string {
    let buffer = "";
    for (let p of c.methods || []) {
        if (!p.decorators || p.decorators.length === 0) continue;
        for (let d of p.decorators) {
            if (d.name === "hasMany") {
                buffer += hasMany(d, p) + "\n";
            }
        }
    }
    for (let p of c.properties || []) {
        if (!p.decorators || p.decorators.length === 0) continue;
        for (let d of p.decorators) {
            if (d.name === "hasOne") {
                buffer += hasOne(d, p) + "\n";
            }
        }
    }
    return buffer;
}


export function iterateRoot(modelFile: TsTypeInfo.FileDefinition, _root: TsTypeInfo.ClassDefinition, processMember: (p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition) => void) {
    for (let cmemb of _root.properties) {
        const _dec: TsTypeInfo.DecoratorDefinition = cmemb.decorators.find(d => d.name === "queryBy");
        if (!_dec) continue;
        if (!_dec["arguments"] || !_dec["arguments"][0]) {
            console.warn("No Query By Decorator for " + cmemb.name);
            continue;
        }
        const _whereClassName = _dec["arguments"][0].text;
        if (!_whereClassName) continue;
        const _whereClass = modelFile.classes.find(c => c.name === _whereClassName);
        if (!_whereClass) continue;

        let _collectType = cmemb.typeExpression.text;
        if (_collectType.startsWith("Dict")) _collectType = _collectType.replace("Dict<", "").replace(">", "");
        const _collectClass = modelFile.classes.find(c => c.name === _collectType);
        processMember(cmemb, _collectClass, _whereClass);
    }
}


export function initializeFile(filename: string): string {
    if (fs.existsSync(filename)) {
        fs.truncateSync(filename);
    }
    return Path.resolve(filename);
}