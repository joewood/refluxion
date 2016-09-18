import * as Model from "./../test-model";

interface Dict<T> { [index:string]:T; };
export interface Base {
	id?: string;
}


// created from class MyModel

export interface IMyModel extends Base {
	articles: Dict<Model.Article>;
	comments: Dict<Model.Comment>;
	users: Dict<Model.User>;
	loading: boolean;
}


// created from class Article

export interface IArticle extends Base {
	content: string;
	date: string;
	archival_state: ArchivalState;
	id: string;
	author_id: string;
}


// created from class Comment

export interface IComment extends Base {
	content: string;
	date: string;
	id: string;
	author_id: string;
	article_id: string;
}


// created from class User

export interface IUser extends Base {
	email: string;
	id: string;
	numberComments: number;
	gender: "male" | "female";
}


// created from class MyModel

export interface IMyModelLists extends Base {
	articles: Model.Article[];
	comments: Model.Comment[];
	users: Model.User[];
	loading: boolean;
}

