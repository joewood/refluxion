import * as TsTypeInfo from "ts-type-info";
/** Convert the name of the class to the schema key name used for normalizr */
export declare function toCamel(typeName: string): string;
export declare function convertMethodName(name: string): string;
export declare function appendLine(path: string, line: string): void;
export declare function getDictReturnType(p: TsTypeInfo.ClassMethodDefinition): string;
export declare function removePrefixI(c: TsTypeInfo.ClassDefinition | string): string;
/** For a specific class, for each many relationship add the specified line through the callback, same for each one-to-one */
export declare function mapClassMembers(c: TsTypeInfo.ClassDefinition, hasMany: (d: TsTypeInfo.DecoratorDefinition, p: TsTypeInfo.ClassMethodDefinition) => string, hasOne: (d: TsTypeInfo.DecoratorDefinition, p: TsTypeInfo.ClassPropertyDefinition) => string): string;
export declare function iterateRoot(modelFile: TsTypeInfo.FileDefinition, _root: TsTypeInfo.ClassDefinition, processMember: (p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition) => void): void;
export declare function initializeFile(filename: string): string;
