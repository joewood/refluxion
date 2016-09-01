# refluxion
A TypeScript code-first full-stack generator for GraphQL, Reflux, Normalizr and Sequelizer.

**Note:** This is an experimental tool testing some ideas of using TypeScript with Decorators as data model across client and server.
    
## What is this?
A code-generator that can take a set of decorated model classes written in TypeScript to generate different boiler-plate code fragments useful
for full-stack development. The goal is avoid the code generation iteration time going through model schema changes, especially for React/Redux/GraphQL
based web, mobile and server side applications. Generated code fragments can be used independently of each other or all together. Supported right now 
is:
* **GraphQL** - node.js server side code that works with [express-graphql](https://github.com/graphql/express-graphql)
* **GraphQL Client** - JavaScript client side support for constructing type-safe GraphQL queries
* **Sequelize** - Server side code to create a Sequelize Model from the TypeScript Model
* **Interfaces** - Client and Server side TypeScript interfaces from the classes defined below
* **Normalizr** - Normalizr relationship schema useful on the server or client side to convert a
hierarchical graph to a flat structure (more useful for redux and flux based applications)
* **Redux** - Redux Actions for processing GraphQL queryies onto a Redux Store 

## Installation
This is a develop-time tool to generate code that is best installed locally in the repository.

```
npm install https://github.com/joewood/refluxion --save-dev
```

Installing locally is preferred. The tool can then be used with an npm script to re-generate the code artifacts.

## The Model

This library contains a set of decorators that are used on your existing TypeScript data model classes
to describe how the model entities are related. Using these simple decorators the **refluxion** tool generates
a set of boilerplate artifacts to help implement a full-stack GraphQL/node.js/redux based application.
As the model changes these artifacts can be re-generated.

The data-model is defined by a set of classes representing each entity, and single root container - equivalent 
to a **store** in redux - which contains everything.

```typescript
import { integer, hasMany, createHasOne, root, queryBy, Dict } from "refluxion";

@root
export class MyModel {
    @queryBy(ArticlesQuery)
    public articles: Dict<Article>;

    @queryBy(CommentsQuery)
    public comments: Dict<Comment>;

    @queryBy(UsersQuery)
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
export class ArticlesQuery {
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
export class CommentsQuery {
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
export class UsersQuery {
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


## Command Line

The full set of command line parameters can be found using `-h` or `--help`:
```
refluxion -h
```

For help on no command line arguments or `-h`.  Also use `-o` or `--output` to direct output to a specified path.

-----------------------------------------------------------

# Generated Artifacts
Any of the below can be used to generate fragments of boilerplate code based on the model.

## GraphQL
The option `-g` or `--graphql` can be used to generate a set of server-side node.js functions 
that define a GraphQL model.

The output assumes the use of [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize), which provides
an easy implementation of GraphQL on top of a SQL based relational database.

The tool generates the GraphQL type representing each entity, this function is exposed as simple `getGraphQL`. For example using the test-model:

```typescript

export function getGraphQL( Seq: SequelizeModel ) : GraphQLTypes {
	const types : GraphQLTypes = {};
	 types.articleType = new GraphQL.GraphQLObjectType({
		 name: "Article",
		 fields: () => ({
			 id : { type : GraphQL.GraphQLString  },
			 content : { type : GraphQL.GraphQLString },
			 date : { type : GraphQL.GraphQLString },
			 author_id : { type : GraphQL.GraphQLScalarType },
			 comments : {
				 type: new GraphQL.GraphQLList(types.commentType),
				 resolve: resolver(Seq.tables.Article.associations.comments),
			 },

			 author : {
				 type: types.userType,
				 resolve: resolver(Seq.tables.Article.associations.author),
			},

		})
	});

```

The resolver functions here are using the **graphql-sequelize** library, alongwith the Sequelize associations defined in the Sequelize model.

**Refluxion** also generates the arguments type used by GraphQL (the query structure). For example this is defined and exported as follows:
```typescript

export const articlesArgs : GraphQL.GraphQLFieldConfigArgumentMap = {
	 id : { type: GraphQL.GraphQLID},
	 contentLike : { type: GraphQL.GraphQLString},
	 author_id : { type: GraphQL.GraphQLString},
	 limit: { type: GraphQL.GraphQLInt },
	 offset: { type: GraphQL.GraphQLInt },
	 order: { type: GraphQL.GraphQLString },
};
```

Note that this includes the standard collection arguments `order`, `offset` and `limit`.  In addition a equivalent TypeScript interface
is generated representing this same structure:

```typescript
export interface ArticlesQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	contentLike? : string;
	author_id? : string;
}
```

## Normalizr

The [normalizr](https://github.com/paularmstrong/normalizr) library converts deeply nested JSON structures
into flatter entity-relational type structures, more useful in a Redux or Flux app.

The `-n` or `--normalizr` option outputs the following code for the test model:

```typescript
import { normalize, Schema, arrayOf, valuesOf } from "normalizr";
export var article = new Schema("articles");
export var comment = new Schema("comments");
export var user = new Schema("users");
article.define({
	comments : arrayOf(comment),
	author : user,
});

comment.define({
	author : user,
	article : article,
});

user.define({
	articles : arrayOf(article),
	comments : arrayOf(comment),
});
```

This defines the key relationships in the model so that normalizr has knowledge of the returned structure.
This can now be used on the client or server side to flatten query responses.

## Sequelize

The Sequelize generator is generated using the `-s` or `--sequelize` option. It will output a file
called **MODEL-FILE.sequelize.ts**. There are three parts to this output artifact.

The first part is a function that creates the set of Sequelize types (the *models* in Sequelize terminology).
An example output is as follows:
```typescript
export function initEntities( sequelize : Sequelize.Sequelize, coreFields: Sequelize.DefineAttributes, commonOptions: Sequelize.DefineOptions<any>, additionalOptions: Dict<Sequelize.DefineOptions<any>>) : Tables {
	return {
		article : sequelize.define("article", <Sequelize.DefineAttributes>Object.assign({},coreFields,{
				content: { type: Sequelize.STRING },
				date: { type: Sequelize.STRING },
				archival_state: { type: Sequelize.ArchivalState },
				author_id: { type: Sequelize.STRING },
			}),
				<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions["article"])
			) as ArticleModel,
		comment : sequelize.define("comment", <Sequelize.DefineAttributes>Object.assign({},coreFields,{
				content: { type: Sequelize.STRING },
				date: { type: "DATE" },
				author_id: { type: Sequelize.STRING({length:255}) },
				article_id: { type: Sequelize.STRING({length:255}) },
			}),
				<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions["comment"])
			) as CommentModel,
		user : sequelize.define("user", <Sequelize.DefineAttributes>Object.assign({},coreFields,{
				email: { type: Sequelize.STRING },
				numberComments: { type: Sequelize.INTEGER },
				gender: { type: Sequelize.STRING },
			}),
				<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions["user"])
			) as UserModel,
	};
}
```

The next part of the output is a function defines the associations for the entities:
```typescript
export function initAssociations( tables : Tables) : void {
	tables.article.hasMany(tables.comment, { as: "comments", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"} )
	tables.article.belongsTo(tables.user, { foreignKey: "author_id", as: "author", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL" })

	tables.comment.belongsTo(tables.user, { foreignKey: "author_id", as: "author", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL" })
	tables.comment.belongsTo(tables.article, { foreignKey: "article_id", as: "article", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL" })

	tables.user.hasMany(tables.article, { as: "articles", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"} )
	tables.user.hasMany(tables.comment, { as: "comments", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"} )
}
``` 

The final part is a set of interfaces that describe these types and associations to ensure 
type safe access to the Sequelize model and associations:
```typescript
interface ArticleModel extends Sequelize.Model<Interfaces.IArticle,any> {
	associations : {
		comments: Sequelize.Model<Interfaces.IComment,any>;
		author: Sequelize.Model<Interfaces.IUser,any>;
	}
}

interface CommentModel extends Sequelize.Model<Interfaces.IComment,any> {
	associations : {
		author: Sequelize.Model<Interfaces.IUser,any>;
		article: Sequelize.Model<Interfaces.IArticle,any>;
	}
}

interface UserModel extends Sequelize.Model<Interfaces.IUser,any> {
	associations : {
		articles: Sequelize.Model<Interfaces.IArticle,any>;
		comments: Sequelize.Model<Interfaces.IComment,any>;
	}
}

export interface Tables {
	article: ArticleModel;
	comment: CommentModel;
	user: UserModel;
}
```

## Interfaces

The `-i` or `--interfaces` option generates a set of interfaces that correspond to the definitions in the model.
This also includes a read-only version of the entity definition, useful for up-coming immutability support in
TypeScript. 

A separate file **MY-MODEL.optional-interfaces.ts** is also generated where each field in the interface
is defined as being optional. This can be usedful for describing interfaces that require a partial Object
(e.g. `Object.assign` or `React setState`).

## GraphQL Consumption - Type Safe Queries

The `-c` or `--client-ql` option generates a set of helper classes that can be used to create GraphQL nested
queries that follow the definition of the model.

**refluxion** defines a string literal type array that contains all the fields in the class. This helps
provide compile-time checks that the referenced fields in a GraphQL query match the model:

```typescript
export type ArticlePrimitives = "content" | "date" | "id" | "author_id";
export const articleFields : ArticlePrimitives[] = ["content", "date", "id", "author_id"];
```

In addition, an interface is created that represents the Query arguments:

```typescript
export interface ArticlesQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	contentLike? : string;
	author_id? : string;
}
```

And a `Query` derived class is created that represents the query structure for GraphQL:

```typescript
export class ArticleQuery extends Query {
	constructor( primitives: ArticlePrimitives[], nested: ArticleNested = null, where: ArticlesQuery | {id:string} = null, options = {}) {
        super(primitives,nested as Dict<Query>,where);
    }
}

export interface ArticleNested {
	comments?: CommentQuery;
	author?: UserQuery;
}
```

Creating an instance of the above `ArticleQuery` class provides a type safe method of creating a GraphQL
query, along with nested sub-queries. The class supports a `toGraphQL` function that creates the 
string representation of the query.

What Else?
=============

Additional output for following is being worked on:
* Non-Sequelize GraphQL support using Graph support in some databases. Useful for queries that are hard 
to execute using Sequelize
* Propagated comments from the code into Sequelize and GraphQL
* Typescript 2 Readonly interface for immutable model support





