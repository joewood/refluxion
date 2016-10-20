import * as TsTypeInfo from "ts-type-info";
export declare function camelToUnderscore(str: string): string;
export declare function splitCamel(str: string): string[];
export declare function lowerFirstChar(str: string): string;
/** Convert the name of the class to the schema key name used for normalizr */
export declare function toCamel(typeName: string): string;
export declare class Table {
    private modelFile;
    private root;
    tableProperty: TsTypeInfo.ClassPropertyDefinition;
    isTable: boolean;
    constructor(modelFile: TsTypeInfo.FileDefinition, root: TsTypeInfo.ClassDefinition, tableProperty: TsTypeInfo.ClassPropertyDefinition);
    getTableName(): string;
    getTableType(): TsTypeInfo.ClassDefinition;
    getTableInterfaceTypeName(): string;
    getWhereClass(): TsTypeInfo.ClassDefinition;
    /** For a specific class, for each many relationship add the specified line through the callback, same for each one-to-one */
    mapEntityRelationships(hasMany: (hasMany: HasMany) => string, hasOne: (hasOne: HasOne) => string): string;
    mapEntityFields(fieldIteration: (field: EntityField) => string): string;
}
export declare class EntityField {
    private modelFile;
    private root;
    private tableType;
    property: TsTypeInfo.BasePropertyDefinition;
    constructor(modelFile: TsTypeInfo.FileDefinition, root: TsTypeInfo.ClassDefinition, tableType: TsTypeInfo.ClassDefinition, property: TsTypeInfo.BasePropertyDefinition);
    isUnionLiteralType(): boolean;
    isUnionType(): boolean;
    isEnum(): boolean;
    getName(): string;
    getTypeName(): string;
    getTypeArguments(): TsTypeInfo.TypeDefinition[];
    isPrimitive(): boolean;
}
export declare class HasMany {
    private modelFile;
    private root;
    private tableType;
    property: TsTypeInfo.ClassMethodDefinition;
    decorator: TsTypeInfo.DecoratorDefinition;
    constructor(modelFile: TsTypeInfo.FileDefinition, root: TsTypeInfo.ClassDefinition, tableType: TsTypeInfo.ClassDefinition, property: TsTypeInfo.ClassMethodDefinition);
    getName(): string;
    getManyType(): TsTypeInfo.ClassDefinition;
    getManyTypeInterfaceName(): string;
    getManyTableName(): string;
}
export declare class HasOne {
    private modelFile;
    private root;
    private tableType;
    property: TsTypeInfo.ClassPropertyDefinition;
    decorator: TsTypeInfo.DecoratorDefinition;
    constructor(modelFile: TsTypeInfo.FileDefinition, root: TsTypeInfo.ClassDefinition, tableType: TsTypeInfo.ClassDefinition, property: TsTypeInfo.ClassPropertyDefinition);
    getName(): string;
    getOneType(): TsTypeInfo.ClassDefinition;
    getOneInterfaceTypeName(): string;
    getOneTableName(): string;
}
export declare function appendLine(path: string, line: string): void;
export declare function flushLines(): void;
/** returns the type of a Dictionary used as the return type of the specified method */
export declare function getDictReturnType(p: TsTypeInfo.ClassMethodDefinition): string;
export declare function removePrefixI(c: TsTypeInfo.ClassDefinition | string): string;
export declare function iterateRoot(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, processMember: (p: Table) => void): void;
export declare function initializeFile(filename: string): string;
