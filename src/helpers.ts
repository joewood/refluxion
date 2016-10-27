import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";

export function camelToUnderscore(str: string): string {
    return splitCamel(str).join("_").toLowerCase();
}

export function splitCamel(str: string): string[] {
    const target = [];
    let index = 0;
    for (let n = 0; n < str.length; n++) {
        if (n == 0 || (str[n] >= "a" && str[n] <= "z")) continue;
        target.push(str.substr(index, n));
        index = n;
    }
    if (index < str.length) target.push(str.substr(index));
    return target;
}

export function lowerFirstChar(str: string): string {
    return str.slice(0, 1).toLowerCase() + str.slice(1);
}


/** Convert the name of the class to the schema key name used for normalizr */
export function toCamel(typeName: string): string {
    let normVarName = typeName;
    if (normVarName.startsWith("I")) normVarName = normVarName.slice(1);
    normVarName = normVarName.charAt(0).toLowerCase() + normVarName.slice(1);
    return normVarName;
};

export class Table {
    public isTable: boolean;
    constructor(
        private modelFile: TsTypeInfo.FileDefinition,
        private root: TsTypeInfo.ClassDefinition,
        public tableProperty: TsTypeInfo.ClassPropertyDefinition
    ) {
        this.isTable = !!tableProperty.decorators.find(d => d.name === "queryBy");
    }

    public getTableName(): string {
        const tableNameDec = this.tableProperty.decorators.find(d => d.name === "useTable");
        let tableName = this.tableProperty.name;
        if (!!tableNameDec) {
            const args = tableNameDec.arguments;
            if (!args || args.length === 0) {
                throw "useTable with no name " + tableName;
            }
            tableName = tableNameDec["arguments"][0].text;
            if (tableName.length > 1) tableName = tableName.slice(1, -1);
        } else {
            if (tableName.slice(-1) === "s") tableName = tableName.slice(0, -1);
            tableName = camelToUnderscore(tableName);
        }
        return tableName;
    }

    public getTableType(): TsTypeInfo.ClassDefinition {
        if (!this.isTable) throw Error("getTableType called on a non-table: " + this.tableProperty.name);
        let tableTypeName = this.tableProperty.type.text;
        if (tableTypeName.startsWith("Dict")) tableTypeName = tableTypeName.replace("Dict<", "").replace(">", "");
        const tableType = this.modelFile.classes.find(c => c.name === tableTypeName);
        if (!tableType) {
            console.warn("Cannot find Class for Type Name: " + tableTypeName, this.tableProperty);
        }
        return tableType;
    }

    public getTableInterfaceTypeName(): string {
        return "I" + removePrefixI(this.getTableType().name);
    }

    public getWhereClass(): TsTypeInfo.ClassDefinition {
        const queryByDec: TsTypeInfo.DecoratorDefinition = this.tableProperty.decorators.find(d => d.name === "queryBy");
        const whereClassName = queryByDec && queryByDec["arguments"] && queryByDec["arguments"][0] && queryByDec["arguments"][0].text;
        if (!whereClassName) {
            console.warn("No Query By Decorator for " + this.tableProperty.name);
            return null;
        }
        const whereClass = this.modelFile.classes.find(c => c.name === whereClassName);
        if (!whereClass) console.warn("Cannot Find Query Class :" + whereClassName);
        return whereClass;
    }

    /** For a specific class, for each many relationship add the specified line through the callback, same for each one-to-one */
    public mapEntityRelationships(hasMany: (hasMany: HasMany) => string, hasOne: (hasOne: HasOne) => string): string {
        let buffer = "";
        const tableType = this.getTableType();
        for (let p of tableType.methods || []) {
            if (!p.decorators || p.decorators.length === 0) continue;
            if (!p.decorators.find(d => (d.name === "hasMany" || d.name === "hasMany2"))) continue;
            buffer += hasMany(new HasMany(this.modelFile, this.root, tableType, p)) + "\n";
        }
        for (let p of tableType.properties || []) {
            if (!p.decorators || p.decorators.length === 0) continue;
            if (!p.decorators.find(d => d.name === "hasOne")) continue;
            buffer += hasOne(new HasOne(this.modelFile, this.root, tableType, p)) + "\n";
        }
        return buffer;
    }

    public mapEntityFields(fieldIteration: (field: EntityField) => string): string {
        let buffer = "";
        const tableType = this.getTableType();
        for (let p of tableType.properties || []) {
            if (!p.decorators || p.decorators.length === 0) continue;
            if (!p.decorators.find(d => (d.name === "hasMany" || d.name === "hasMany2"))) continue;
            buffer += fieldIteration(new EntityField(this.modelFile, this.root, tableType, p)) + "\n";
        }
        return buffer;

    }
}

export class EntityField {
    constructor(
        private modelFile: TsTypeInfo.FileDefinition,
        private root: TsTypeInfo.ClassDefinition,
        private tableType: TsTypeInfo.ClassDefinition,
        public property: TsTypeInfo.BasePropertyDefinition) {
    }

    public isUnionLiteralType(): boolean {
        const propType = this.property.type;
        return (propType.unionTypes.length > 0) || ((propType.text.startsWith("\"")) || (propType.text.indexOf("|") >= 0));
    }

    public isUnionType(): boolean {
        const definition = this.property.type.definitions[0];
        if (definition && definition instanceof TsTypeInfo.TypeAliasDefinition) {
            return ((!!definition.type && definition.type.unionTypes.length > 0));
        }
        return this.property.type && this.property.type.unionTypes.length > 0;
    }

    public isEnum(): boolean {
        const definition = this.property.type.definitions[0];
        return definition && (definition instanceof TsTypeInfo.EnumDefinition);
    }

    public getName(): string {
        return this.property.name;
    }

    public getTypeName(): string {
        return this.property.type.text;
    }

    public getTypeArguments(): TsTypeInfo.TypeDefinition[] {
        return this.property.type["typeArguments"];
    }

    public isPrimitive(): boolean {
        const name = this.getTypeName();
        return name === "string" || name === "boolean" || name === "number";
    }

}

export class HasMany {
    public decorator: TsTypeInfo.DecoratorDefinition;
    public foreignKey:string = null;

    constructor(
        private modelFile: TsTypeInfo.FileDefinition,
        private root: TsTypeInfo.ClassDefinition,
        private tableType: TsTypeInfo.ClassDefinition,
        public property: TsTypeInfo.ClassMethodDefinition) {
        this.decorator = property.decorators.find(d => d.name === "hasMany" || d.name === "hasMany2");
        if (this.decorator.name==="hasMany2") {
            this.foreignKey = this.decorator.arguments[0].text;
        }
    }

    public getName() {
        const noGet = this.property.name.replace("get", "");
        return "get_" + noGet.slice(0, 1).toLowerCase() + noGet.slice(1);
    }

    public getManyType(): TsTypeInfo.ClassDefinition {
        // assume this is an array
        const foundType = this.modelFile.classes.find(c => c.name === (this.property.returnType && this.property.returnType.arrayElementType && this.property.returnType.arrayElementType && this.property.returnType.arrayElementType.text));
        if (!foundType) {
            console.warn("Cannot find type to match the return type of " + this.property.name, this.property.returnType);
            console.trace("Stop");
        }
        return foundType;
    }

    public getManyTypeInterfaceName(): string {
        return "I" + removePrefixI(this.getManyType().name);
    }

    public getManyTableName(): string {
        const param = this.property.parameters[0];
        if (!param) { throw "No Parameter for getMany " + this.property.name; }
        if (!param.type.isArrayType()) { throw "getMany parameter type is not an array " + this.property.name; }
        const manyType = param.type.arrayElementType.definitions[0].name;
        if (!manyType) { throw "Cannot find definition for type used in getMany " + this.property.name; }
        const tableProp = this.root.properties.find(p => {
            const tab = new Table(this.modelFile, this.root, p);
            if (!tab.isTable) { return false; }
            return tab.getTableType().name === manyType;
        });
        if (!tableProp) {
            throw "Cannot find Root Property for " + manyType;
        }
        const table = new Table(this.modelFile, this.root, tableProp);
        return table.getTableName();
    }


}

export class HasOne {
    public decorator: TsTypeInfo.DecoratorDefinition;
    constructor(
        private modelFile: TsTypeInfo.FileDefinition,
        private root: TsTypeInfo.ClassDefinition,
        private tableType: TsTypeInfo.ClassDefinition,
        public property: TsTypeInfo.ClassPropertyDefinition) {
        this.decorator = property.decorators.find(d => d.name === "hasOne");
    }

    public getName(): string {
        let name = this.decorator["arguments"][2] && this.decorator["arguments"][2].text;
        if (name && name[0] === "\"") { name = name.slice(1, -1); }
        if (!name) { name = this.property.name.replace("_id", "").replace("_code", "").replace(/\"/g, ""); }
        return "get_" + name;
    }

    public getOneType(): TsTypeInfo.ClassDefinition {
        const name = this.decorator["arguments"][0].text;
        return this.modelFile.classes.find(c => c.name === name);
    }

    public getOneInterfaceTypeName(): string {
        return "I" + removePrefixI(this.getOneType().name);
    }

    public getOneTableName(): string {
        const lastDot = this.decorator.arguments[1].text.lastIndexOf(".");
        if (lastDot < 0) return null;
        const propName = this.decorator.arguments[1].text.slice(lastDot + 1);
        const prop = this.root.properties.find(p => p.name === propName);
        if (!prop) return null;
        const table = new Table(this.modelFile, this.root, prop);
        return table.getTableName();
    }

}

const lines: { [filename: string]: string[] } = {};

export function appendLine(path: string, line: string) {
    if (!lines[path]) { lines[path] = []; }
    lines[path].push(line);
}

export function flushLines() {
    for (let f of Object.keys(lines)) {
        fs.writeFileSync(f, lines[f].join("\n"));
    }
}

/** returns the type of a Dictionary used as the return type of the specified method */
export function getDictReturnType(p: TsTypeInfo.ClassMethodDefinition): string {
    return p.returnType.typeArguments[0].text;
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



export function iterateRoot(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, processMember: (p: Table) => void) {
    for (let rootProp of modelRoot.properties) {
        processMember(new Table(modelFile, modelRoot, rootProp));
    }
}


export function initializeFile(filename: string): string {
    if (fs.existsSync(filename)) {
        fs.truncateSync(filename);
    }
    return Path.resolve(filename);
}