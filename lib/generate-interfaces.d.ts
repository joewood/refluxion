import * as TsTypeInfo from "ts-type-info";
import { Table } from "./helpers";
export declare function generateInterfaceForClass(collectClass: TsTypeInfo.ClassDefinition, suffix: string, makeArrays: boolean, optional?: boolean): string;
export declare function generateNestedClass(table: Table): string;
export declare function generateWhereInterface(collectClass: TsTypeInfo.ClassDefinition): string;
