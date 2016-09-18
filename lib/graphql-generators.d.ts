import * as TsTypeInfo from "ts-type-info";
import { Table } from "./helpers";
export declare function generateGraphQLArgs(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, table: Table, p: TsTypeInfo.ClassPropertyDefinition, whereClass: TsTypeInfo.ClassDefinition): string;
export declare function generateGraphQLAttributes(modelFile: TsTypeInfo.FileDefinition, modelRoot: TsTypeInfo.ClassDefinition, table: Table, whereClass: TsTypeInfo.ClassDefinition, tableName: string): string;
export declare function generateGraphQLEndPoints(p: TsTypeInfo.ClassPropertyDefinition, collectClass: TsTypeInfo.ClassDefinition, whereClass: TsTypeInfo.ClassDefinition, tableName: string): string;
