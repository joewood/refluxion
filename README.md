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
This is a develop-time tool to generate code.

```
npm install -g https://github.com/joewood/refluxion-cli
```

Installing locally is preferred, along with an npm script to re-generate the code artifacts.

## Defining the Model

To define the TypeScript model please see the sample and tests in the [runtime library](https://github.com/joewood/refluxion). 

## Command Line

For help use no command line arguments or `-h`.  Also use `-o` or `--output` to direct output to a specified path.

## Output Options
Any of the below can be used to generate fragments of code based on the model.

### GraphQL
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
export interface ArticlesWhere extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	contentLike? : string;
	author_id? : string;
}
```

### Normalizr

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

### Sequelize

Documentation TBD

### Interfaces

The `-i` or `--interfaces` option generates a set of interfaces that correspond to the definitions in the model.
This also includes a read-only version of the entity definition, useful for up-coming immutability support in
TypeScript. 

### Client GraphQL

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
export interface ArticlesWhere extends GraphQLWhere {
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
	constructor( primitives: ArticlePrimitives[], nested: ArticleNested = null, where: ArticlesWhere | {id:string} = null, options = {}) {
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

## What Else?

Additional output for following is being worked on:
* Full Sequelize model schema (associations and fields). This is useful to recreate a database structure.
* Non-Sequelize GraphQL support using Graph support in some databases. Useful for queries that are hard 
to execute using Sequelize
* Propagated comments from the code into Sequelize and GraphQL





