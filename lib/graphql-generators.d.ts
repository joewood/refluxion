import * as TsTypeInfo from "ts-type-info";
import { Table } from "./helpers";
export declare function generateGraphQLArgs(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition): string;
export declare function generateGraphQLAttributes(table: Table, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition, tableName: string): string;
export declare function generateGraphQLEndPoints(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition, tableName: string): string;
