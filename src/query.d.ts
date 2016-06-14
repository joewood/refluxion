export interface Dict<T> {
    [index: string]: T;
}
export declare class Query {
    fields: string[];
    nested: Dict<Query>;
    where: GraphQLWhere;
    constructor(fields: string[], nested?: Dict<Query>, where?: GraphQLWhere);
    toGraphQL(tabSize?: number): string;
}
export declare function toGraphQlQueryString(operation: string, query: Query | string): string;
export interface GraphQLWhere {
    offset?: number;
    limit?: number;
}
