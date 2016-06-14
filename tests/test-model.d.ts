import { Dict } from "../src/main";
export declare class MyModel {
    articles: Dict<Article>;
    comments: Dict<Comment>;
    users: Dict<User>;
}
export declare class Article {
    content: string;
    date: string;
    id: string;
    author_id: any;
    getComments(comments: Comment[]): Comment[];
}
export declare class ArticlesWhere {
    id: string;
    contentLike: string;
    author_id: string;
}
export declare class Comment {
    conent: string;
    date: string;
    id: string;
    author_id: string;
    article_id: string;
}
export declare class CommentsWhere {
    id: string;
    author_id: string;
}
export declare class User {
    email: string;
    id: string;
    numberComments: number;
    getArticles(articles: Article[]): Article[];
    getComments(comments: Comment[]): Comment[];
}
export declare class UsersWhere {
    id: string;
    email: string;
}
