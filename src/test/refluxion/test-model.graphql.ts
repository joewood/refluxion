import * as GraphQL from "graphql";
var graphqlSeq = require("graphql-sequelize");
let {resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;
import {Tables} from "./test-model.sequelize";
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
			 id : { type : GraphQL.GraphQLString  },
			 content : { type : GraphQL.GraphQLString },
			 date : { type : GraphQL.GraphQLString },
			 archival_state : { type : GraphQL.GraphQLScalarType },
			 author_id : { type : GraphQL.GraphQLString },
			 comments : {
				 type: new GraphQL.GraphQLList(types.commentType ),
				 resolve: resolver( tables.article.associations.comments ),
			 },

			 author : {
				 type: types.userType,
				 resolve: resolver( tables.article.associations.author ),
			},

		})
	});


	 types.commentType = new GraphQL.GraphQLObjectType({
		 name: "Comment",
		 fields: () => ({
			 id : { type : GraphQL.GraphQLString  },
			 content : { type : GraphQL.GraphQLString },
			 date : { type : GraphQLDate },
			 author_id : { type : GraphQL.GraphQLString },
			 article_id : { type : GraphQL.GraphQLString },
			 author : {
				 type: types.userType,
				 resolve: resolver( tables.comment.associations.author ),
			},

			 article : {
				 type: types.articleType,
				 resolve: resolver( tables.comment.associations.article ),
			},

		})
	});


	 types.userType = new GraphQL.GraphQLObjectType({
		 name: "User",
		 fields: () => ({
			 id : { type : GraphQL.GraphQLString  },
			 email : { type : GraphQL.GraphQLString },
			 numberComments : { type : GraphQL.GraphQLInt },
			 gender : { type : GraphQL.GraphQLString },
			 articles : {
				 type: new GraphQL.GraphQLList(types.articleType ),
				 resolve: resolver( tables.user.associations.articles ),
			 },

			 comments : {
				 type: new GraphQL.GraphQLList(types.commentType ),
				 resolve: resolver( tables.user.associations.comments ),
			 },

		})
	});


	return types;
}

export const articlesArgs : GraphQL.GraphQLFieldConfigArgumentMap = {
	 id : { type: GraphQL.GraphQLID},
	 contentLike : { type: GraphQL.GraphQLString},
	 author_id : { type: GraphQL.GraphQLString},
	 limit: { type: GraphQL.GraphQLInt },
	 offset: { type: GraphQL.GraphQLInt },
	 order: { type: GraphQL.GraphQLString },
};


export const commentsArgs : GraphQL.GraphQLFieldConfigArgumentMap = {
	 id : { type: GraphQL.GraphQLID},
	 author_id : { type: GraphQL.GraphQLString},
	 limit: { type: GraphQL.GraphQLInt },
	 offset: { type: GraphQL.GraphQLInt },
	 order: { type: GraphQL.GraphQLString },
};


export const usersArgs : GraphQL.GraphQLFieldConfigArgumentMap = {
	 id : { type: GraphQL.GraphQLID},
	 email : { type: GraphQL.GraphQLString},
	 limit: { type: GraphQL.GraphQLInt },
	 offset: { type: GraphQL.GraphQLInt },
	 order: { type: GraphQL.GraphQLString },
};


export function getArticle( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig {
	 return {
		 type: types.articleType,
		 args: defaultArgs(tables.article),
		 resolve: resolver(tables.article),
	};
}

export function get_articles( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig  {
	 return {
		 type: new GraphQL.GraphQLList(types.articleType),
		 args: articlesArgs,
		 resolve: resolver(tables.article),
	};
}


export function getComment( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig {
	 return {
		 type: types.commentType,
		 args: defaultArgs(tables.comment),
		 resolve: resolver(tables.comment),
	};
}

export function get_comments( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig  {
	 return {
		 type: new GraphQL.GraphQLList(types.commentType),
		 args: commentsArgs,
		 resolve: resolver(tables.comment),
	};
}


export function getUser( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig {
	 return {
		 type: types.userType,
		 args: defaultArgs(tables.user),
		 resolve: resolver(tables.user),
	};
}

export function get_users( tables : Tables, types: GraphQLTypes ) : GraphQL.GraphQLFieldConfig  {
	 return {
		 type: new GraphQL.GraphQLList(types.userType),
		 args: usersArgs,
		 resolve: resolver(tables.user),
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


