import { Query, GraphQLWhere, Dict } from "./query"
import * as Model from "./../test-model";
export interface ArticlesQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	contentLike? : string;
	author_id? : string;
}


export type ArticlePrimitives = "content" | "date" | "archival_state" | "id" | "author_id" | "loading";
export const articleFields : ArticlePrimitives[] = ["content", "date", "archival_state", "id", "author_id", "loading"];


export class ArticleQuery extends Query {
	constructor( primitives: ArticlePrimitives[], nested: IArticleNested = null, where: ArticlesQuery | {id:string} = null, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }
}


export interface IArticleNested {
	comments?: CommentQuery;
	author?: UserQuery;
}

export interface CommentsQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	author_id? : string;
}


export type CommentPrimitives = "content" | "date" | "id" | "author_id" | "article_id";
export const commentFields : CommentPrimitives[] = ["content", "date", "id", "author_id", "article_id"];


export class CommentQuery extends Query {
	constructor( primitives: CommentPrimitives[], nested: ICommentNested = null, where: CommentsQuery | {id:string} = null, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }
}


export interface ICommentNested {
	author?: UserQuery;
	article?: ArticleQuery;
}

export interface UsersQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	email? : string;
}


export type UserPrimitives = "email" | "id" | "numberComments" | "gender";
export const userFields : UserPrimitives[] = ["email", "id", "numberComments", "gender"];


export class UserQuery extends Query {
	constructor( primitives: UserPrimitives[], nested: IUserNested = null, where: UsersQuery | {id:string} = null, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }
}


export interface IUserNested {
	articles?: ArticleQuery;
	comments?: CommentQuery;
}

