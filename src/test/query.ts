const util = require("node-util");

export class Query {

    constructor(public fields: string[], public nested: Dict<Query> = null, public where : GraphQLWhere = null) {
    }

    public toGraphQL(tabSize = 1): string {
        let buffer = "\t";
        if (!!this.where || Object.keys(this.where).length > 0) {
            const whereClause = (util.inspect(this.where, 10) as string).replace(/\'/g, "\"");
            buffer = buffer + `(${whereClause.slice(1, whereClause.length - 2)}) `;
        }
            // buffer `{ ${operation} ${typeof query !== "string" ? query.toGraphQL() : query}\n}`;
        buffer = buffer + "{ " + this.fields.join(" ") + "\n";
        if (this.nested) {
            buffer = buffer + Object.keys(this.nested).map(fieldName => {
                return "\t" + fieldName + this.nested[fieldName].toGraphQL(tabSize + 1);
            }).join("\n");
        }
        buffer = buffer + " }";
        return buffer;
    }
}

export function toGraphQlQueryString(operation: string, query: Query | string): string {
    return `{ ${operation} ${typeof query !== "string" ? query.toGraphQL() : query}\n}`;
}

export interface GraphQLWhere {
    offset: number;
    limit: number;
}