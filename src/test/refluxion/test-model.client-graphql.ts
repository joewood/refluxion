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


export type ArticlePrimitives = "content" | "date" | "archival_state" | "ID" | "id" | "author_id" | "loading";
export const articleFields : ArticlePrimitives[] = ["content", "date", "archival_state", "ID", "id", "author_id", "loading"];


export class ArticleQuery extends Query {
	constructor( primitives: ArticlePrimitives[], nested: IArticleNested = null, where: ArticlesQuery | {id:string} = null, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }
}


export interface IArticleNested {
	get_comments?: CommentQuery;
	get_author?: UserQuery;
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
	get_author?: UserQuery;
	get_article?: ArticleQuery;
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
	get_articles?: ArticleQuery;
	get_comments?: CommentQuery;
}
