import * as TsTypeInfo from "ts-type-info";
import { Table } from "./helpers";
export declare function getPrimitives(tableType: TsTypeInfo.ClassDefinition): string;
export declare function getQueryClass(table: Table, whereClass: string): string;
