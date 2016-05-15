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
    offset?: number;
    limit?: number;
}



import { normalize, Schema, arrayOf, valuesOf } from "normalizr";
import * as Model from "./test-model.ts";
export var article = new Schema("articles");
export var comment = new Schema("comments");
export var user = new Schema("users");
export interface ArticlesWhere {
	id? : string;
	contentLike? : string;
	author_id? : string;
}


type ArticlePrimitives = "content" | "date" | "id" | "author_id";
const ArticleAll = ["content", "date", "id", "author_id"];


export class ArticleQuery extends Query {
	constructor( primitives: ArticlePrimitives[], nested: ArticleNested, where: ArticlesWhere, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }
}


export interface ArticleNested {
	comments?: CommentQuery;
	author?: UserQuery;
}

article.define({
	comments : arrayOf(comment),
	author : user,
});

export interface CommentsWhere {
	id? : string;
	author_id? : string;
}


type CommentPrimitives = "conent" | "date" | "id" | "author_id" | "article_id";
const CommentAll = ["conent", "date", "id", "author_id", "article_id"];


export class CommentQuery extends Query {
	constructor( primitives: CommentPrimitives[], nested: CommentNested, where: CommentsWhere, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }
}


export interface CommentNested {
	author?: UserQuery;
	article?: ArticleQuery;
}

comment.define({
	author : user,
	article : article,
});

export interface UsersWhere {
	id? : string;
	email? : string;
}


type UserPrimitives = "email" | "id";
const UserAll = ["email", "id"];


export class UserQuery extends Query {
	constructor( primitives: UserPrimitives[], nested: UserNested, where: UsersWhere, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }
}


export interface UserNested {
	articles?: ArticleQuery;
	comments?: CommentQuery;
}

user.define({
	articles : arrayOf(article),
	comments : arrayOf(comment),
});

