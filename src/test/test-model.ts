import * as Moment from "moment";
import * as Entities from "../../../server/src/server/entities";
import {maxBy, minBy, values } from "common-ts/lib/core";
export { values }

function hasMany(target: any, key: string, descriptor: PropertyDescriptor) { return descriptor; }

function hasOne<T>(c: { new (x: any): T }, relative: (master: ModelMaster) => Dict<T>, nameOverride = null) {
    return null;
    //return function (target: any, key: string, descriptor: PropertyDescriptor) { };
}

function root(construc: Function) {
}


function queryBy(fn:Function) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => descriptor; 
}


import { hasMany, hasOne, root } from "refluxion";

// Define the root of the model. This serves as the root end-point on the server and the state of the app in Redux
@root
export class MyModel {
    
    public articles : Dict<Article>;
    
    public comments: Dict<Article>;
    
    public users: Dict<User>;
}

// Define the article class, contains a foreign key to user
export class Article {
    public content:string;
    public date:string;
    public id:string;
    
    @hasOne(User, master => master.users)
    public author_id;

    @hasMany
    public getComments(comments: Comment[]): Comment[] {
        return comments.filter( com =>this.id === comm.article_id);
    }
    
}


export class Comment {
    public conent:string;
    public date:string;
    public id:string;

    @hasOne(User, master => master.users)
    public author_id:string;
    
    @hasOne(Article, master => master.articles0
    public 
}

export class User {
    public email:string;
    public id:string;
   
    @hasMany
    public getArticles(articles: Article[]): Article[] {
        return articles.filter(ts => this.id === ts.author_id);
    }
    
    @hasMany
    public getComments(comments: Comment[]): Comment[] {
        return comments.filter( com =>this.id === comm.author_id);
    }
}
