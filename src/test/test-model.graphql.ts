import * as GraphQL from "graphql"
export const articleType = new GraphQL.GraphQLObjectType({
    name: "Article",
    fields: {
		content : { type : GraphQL.GraphQLString },
		date : { type : GraphQL.GraphQLString },
		id : { type : GraphQL.GraphQLID },
		author_id : { type : GraphQL.GraphQLScalarType },
	comments : { 
            type: GraphQL.GraphQLList(commentType),
            resolve: resolver(Seq.tables.Article.assocations.comments)
	author : {
            type: user,
	}
});



export const commentType = new GraphQL.GraphQLObjectType({
    name: "Comment",
    fields: {
		conent : { type : GraphQL.GraphQLString },
		date : { type : GraphQL.GraphQLString },
		id : { type : GraphQL.GraphQLID },
		author_id : { type : GraphQL.GraphQLString },
		article_id : { type : GraphQL.GraphQLString },
	author : {
            type: user,
	article : {
            type: article,
	}
});



export const userType = new GraphQL.GraphQLObjectType({
    name: "User",
    fields: {
		email : { type : GraphQL.GraphQLString },
		id : { type : GraphQL.GraphQLID },
		numberComments : { type : GraphQL.GraphQLInt },
	articles : { 
            type: GraphQL.GraphQLList(articleType),
            resolve: resolver(Seq.tables.User.assocations.articles)
	comments : { 
            type: GraphQL.GraphQLList(commentType),
            resolve: resolver(Seq.tables.User.assocations.comments)
	}
});



