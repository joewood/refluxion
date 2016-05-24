import * as TsTypeInfo from "ts-type-info";
export declare function generateInterfaceForClass(collectClass: TsTypeInfo.ClassDefinition, suffix: string, makeArrays: boolean): string;
export declare function generateNestedClass(collectClass: TsTypeInfo.ClassDefinition): string;
export declare function generateWhereInterface(collectClass: TsTypeInfo.ClassDefinition): string;
