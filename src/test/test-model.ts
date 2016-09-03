import { integer, hasMany, createHasOne, root, queryBy, isIsoDate, length} from "./refluxion/decorators";
import { Dict } from "./refluxion/query";

const hasOne = createHasOne<MyModel>();

export enum ArchivalState { live, pending, archived };
// Define the root of the model. This serves as the root end-point on the server and the state of the app in Redux
@root
export class MyModel {
    @queryBy(ArticlesQuery)
    public articles: Dict<Article>;

    @queryBy(CommentsQuery)
    public comments: Dict<Comment>;

    @queryBy(UsersQuery)
    public users: Dict<User>;

    public loading:boolean;
}

// Define the article class, contains a foreign key to user
export class Article {
    public content: string;
    public date: string;
    public archival_state: ArchivalState;

    @length(255)
    public id: string;

    @hasOne(User, master => master.users)
    public  author_id : string;

    @hasMany
    public getComments(comments: Comment[]): Comment[] {
        return comments.filter(com => this.id === com.article_id);
    }
}

export class ArticlesQuery {
    @length(255)
    id: string;
    contentLike: string;
    @length(255)
    author_id: string;
}

export class Comment {
    public content: string;
    
    @isIsoDate()
    public date: string;
    
    @length(255)
    public id: string;

    @hasOne(User, master => master.users)
    @length(255)
    public author_id: string;

    @hasOne(Article, master => master.articles)
    @length(255)
    public article_id: string;
}

export class CommentsQuery {
    id: string;
    author_id: string;
}

export class User {
    public email: string;
    @length(255)
    public id: string;

    @integer()
    public numberComments: number;

    public gender: "male" | "female";

    @hasMany
    public getArticles(articles: Article[]): Article[] {
        return articles.filter(ts => this.id === ts.author_id);
    }

    @hasMany
    public getComments(comments: Comment[]): Comment[] {
        return comments.filter(com => this.id === com.author_id);
    }
}


export class UsersQuery {
    id: string;
    email: string;
}
