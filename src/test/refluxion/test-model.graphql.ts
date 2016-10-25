import * as GraphQL from "graphql";
var graphqlSeq = require("graphql-sequelize");
let {resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;
import { Tables } from "./test-model.sequelize";
import * as Model from "./../test-model";

import {GraphQLDate} from "./graphql-date";
export interface GraphQLTypes {
	articleType ?: GraphQL.GraphQLObjectType;
	commentType ?: GraphQL.GraphQLObjectType;
	userType ?: GraphQL.GraphQLObjectType;
}

export function getGraphQL( tables: Tables ) : GraphQLTypes {
	const types : GraphQLTypes = {};
	 types.articleType = new GraphQL.GraphQLObjectType({
		 name: "Article",
		 fields: () => ({
			 content : { type : GraphQL.GraphQLString },
			 date : { type : GraphQL.GraphQLString },
			 archival_state : { type : GraphQL.GraphQLInt },
			 ID : { type : GraphQL.GraphQLID},
			 author_id : { type : GraphQL.GraphQLString },
			 loading : { type : GraphQL.GraphQLString },
			 get_comments : {
				 type: new GraphQL.GraphQLList(types.commentType ),
				 resolve: resolver( tables.articles.associations.get_comments ),
			 },

			 get_author : {
				 type: types.userType,
				 resolve: resolver( tables.articles.associations.get_author ),
			},

		})
	});


	 types.commentType = new GraphQL.GraphQLObjectType({
		 name: "Comment",
		 fields: () => ({
			 content : { type : GraphQL.GraphQLString },
			 date : { type : GraphQLDate },
			 id : { type : GraphQL.GraphQLID},
			 author_id : { type : GraphQL.GraphQLString },
			 article_id : { type : GraphQL.GraphQLString },
			 get_author : {
				 type: types.userType,
				 resolve: resolver( tables.comments.associations.get_author ),
			},

			 get_article : {
				 type: types.articleType,
				 resolve: resolver( tables.comments.associations.get_article ),
			},

		})
	});


	 types.userType = new GraphQL.GraphQLObjectType({
		 name: "User",
		 fields: () => ({
			 email : { type : GraphQL.GraphQLString },
			 id : { type : GraphQL.GraphQLID},
			 numberComments : { type : GraphQL.GraphQLInt },
			 gender : { type : GraphQL.GraphQLString },
			 get_articles : {
				 type: new GraphQL.GraphQLList(types.articleType ),
				 resolve: resolver( tables.users.associations.get_articles ),
			 },

			 get_comments : {
				 type: new GraphQL.GraphQLList(types.commentType ),
				 resolve: resolver( tables.users.associations.get_comments ),
			 },

		})
	});


	return types;
}

export const articlesArgs /*: GraphQL.GraphQLFieldConfigArgumentMap */ = {
	 id : { type: GraphQL.GraphQLID},
	 contentLike : { type: GraphQL.GraphQLString},
	 author_id : { type: GraphQL.GraphQLString},
	 limit: { type: GraphQL.GraphQLInt },
	 offset: { type: GraphQL.GraphQLInt },
	 order: { type: GraphQL.GraphQLString },
};


export const commentsArgs /*: GraphQL.GraphQLFieldConfigArgumentMap */ = {
	 id : { type: GraphQL.GraphQLID},
	 author_id : { type: GraphQL.GraphQLString},
	 limit: { type: GraphQL.GraphQLInt },
	 offset: { type: GraphQL.GraphQLInt },
	 order: { type: GraphQL.GraphQLString },
};


export const usersArgs /*: GraphQL.GraphQLFieldConfigArgumentMap */ = {
	 id : { type: GraphQL.GraphQLID},
	 email : { type: GraphQL.GraphQLString},
	 limit: { type: GraphQL.GraphQLInt },
	 offset: { type: GraphQL.GraphQLInt },
	 order: { type: GraphQL.GraphQLString },
};


export function getArticle( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig*/ {
	 return {
		 type: types.articleType,
		 args: defaultArgs(tables.articles),
		 resolve: resolver(tables.articles),
	};
}

export function get_articles( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig */ {
	 return {
		 type: new GraphQL.GraphQLList(types.articleType),
		 args: articlesArgs,
		 resolve: resolver(tables.articles),
	};
}


export function getComment( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig*/ {
	 return {
		 type: types.commentType,
		 args: defaultArgs(tables.comments),
		 resolve: resolver(tables.comments),
	};
}

export function get_comments( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig */ {
	 return {
		 type: new GraphQL.GraphQLList(types.commentType),
		 args: commentsArgs,
		 resolve: resolver(tables.comments),
	};
}


export function getUser( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig*/ {
	 return {
		 type: types.userType,
		 args: defaultArgs(tables.users),
		 resolve: resolver(tables.users),
	};
}

export function get_users( tables : Tables, types: GraphQLTypes ) /*: GraphQL.GraphQLFieldConfig */ {
	 return {
		 type: new GraphQL.GraphQLList(types.userType),
		 args: usersArgs,
		 resolve: resolver(tables.users),
	};
}


export interface GraphQLWhere {}

export interface ArticlesQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	contentLike? : string;
	author_id? : string;
}


export interface CommentsQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	author_id? : string;
}


export interface UsersQuery extends GraphQLWhere {
	 order?: string;
	 offset?: number;
	 limit?: number;
	id? : string;
	email? : string;
}

