# refluxion run-time library
This is the run-time library for the code generated from [**refluxion-cli**](https://github.com/joewood/refluxion-cli).

    Note: This is an experimental tool testing some ideas of using TypeScript with Decorators as data model
    across client and server.
    
## Installation

This is a run-time library and expreimental, so to install:
```
npm install https://github.com/joewood/refluxion
```

For background please visit the [command-line documentation](https://github.com/joewood/refluxion-cli).

## Decorators

This library contains a set of decorators that are used at develop-time to generate boilerplate code oriented
around the data model for your application. As the model changes these artifacts can be re-generated.

The data-model is defined by a set of classes representing each entity, and single root container - equivalent 
to a **store** in redux - which contains everything.

```typescript
import { integer, hasMany, createHasOne, root, queryBy, Dict } from "refluxion";

@root
export class MyModel {
    @queryBy(ArticlesWhere)
    public articles: Dict<Article>;

    @queryBy(CommentsWhere)
    public comments: Dict<Comment>;

    @queryBy(UsersWhere)
    public users: Dict<User>;
}
``` 

The contents of this class defines entity collections as Dictionaries. The example shows a simple data model for a blog, 
with articles, comments and users. These entities are defined as follows:

**The Article entity defined as follows**
```typescript
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

/** Define how Articles are queried, using which parameters */
export class ArticlesWhere {
    id: string;
    contentLike: string;
    author_id: string;
}
```

**The Comment entity defined as follows**
```typescript
/** Defines a Comment entity */
export class Comment {
    public conent: string;
    public date: string;
    public id: string;

    @hasOne(User, master => master.users)
    public author_id: string;

    @hasOne(Article, master => master.articles)
    public article_id: string;
}

/** Defines which fields comments can be queried by*/
export class CommentsWhere {
    id: string;
    author_id: string;
}
```
**The User entity defined as follows**
```typescript
/** Defines a User entity */
export class User {
    public email: string;
    public id: string;

    @integer()
    public numberComments: number;

    @hasMany
    public getArticles(articles: Article[]): Article[] {
        return articles.filter(ts => this.id === ts.author_id);
    }

    @hasMany
    public getComments(comments: Comment[]): Comment[] {
        return comments.filter(com => this.id === com.author_id);
    }
}

/** Defines how a User can be queried */
export class UsersWhere {
    id: string;
    email: string;
}
```

The decorators can be broken down as follows:
* `root` - the container store for the data model. The structure of the model
should be flat with no nested data models. All references should be made through
foreign keys.
* `queryBy(QUERY_CLASS)` - defines how the entity set can be queried. The class
parameter should contain the set of fields that are used as query arguments in GraphQL.
* `hasMany` - decorator applied to a function in an entity class. The return type
of this function defines a one-to-many relationship. 
* `hasOne(FOREIGN_ENTITY, fn)` - decorator applied to a property that acts as a foreign key to another
entity.  
* `integer` - simple decator applied to numeric fields to indicate that the field is
an integer and not floating point

