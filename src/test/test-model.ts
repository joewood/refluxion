import * as Moment from "moment";
import * as Entities from "../../../server/src/server/entities";
import {maxBy, minBy, values } from "common-ts/lib/core";

import { hasMany, createHasOne, root, queryBy } from "../index";

const hasOne = createHasOne<MyModel>();


// Define the root of the model. This serves as the root end-point on the server and the state of the app in Redux
@root
export class MyModel {
    @queryBy(ArticlesWhere)
    public articles: Dict<Article>;

    @queryBy(CommentsWhere)
    public comments: Dict<Comment>;

    @queryBy(UsersWhere)
    public users: Dict<User>;
}

// Define the article class, contains a foreign key to user
export class Article {
    public content: string;
    public date: string;
    public id: string;

    @hasOne(User, master => master.users)
    public author_id;

    @hasMany
    public getComments(comments: Comment[]): Comment[] {
        return comments.filter(com => this.id === com.article_id);
    }
}

export class ArticlesWhere {
    id: string;
    contentLike: string;
    author_id: string;
}

export class Comment {
    public conent: string;
    public date: string;
    public id: string;

    @hasOne(User, master => master.users)
    public author_id: string;

    @hasOne(Article, master => master.articles)
    public article_id: string;
}

export class CommentsWhere {
    id: string;
    author_id: string;
}

export class User {
    public email: string;
    public id: string;

    @hasMany
    public getArticles(articles: Article[]): Article[] {
        return articles.filter(ts => this.id === ts.author_id);
    }

    @hasMany
    public getComments(comments: Comment[]): Comment[] {
        return comments.filter(com => this.id === com.author_id);
    }
}


export class UsersWhere {
    id: string;
    email: string;
}
