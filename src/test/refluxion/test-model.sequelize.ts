import * as Sequelize from "sequelize";

import * as Interfaces from "./test-model.interfaces";

interface Dict<T> { [index:string]:T; };
interface ArticleModel extends Sequelize.Model<Interfaces.IArticle,any> {
	associations : {
		get_comments: Sequelize.Model<Interfaces.IComment,any>;
		get_author: Sequelize.Model<Interfaces.IUser,any>;
	};
}

interface CommentModel extends Sequelize.Model<Interfaces.IComment,any> {
	associations : {
		get_author: Sequelize.Model<Interfaces.IUser,any>;
		get_article: Sequelize.Model<Interfaces.IArticle,any>;
	};
}

interface UserModel extends Sequelize.Model<Interfaces.IUser,any> {
	associations : {
		get_articles: Sequelize.Model<Interfaces.IArticle,any>;
		get_comments: Sequelize.Model<Interfaces.IComment,any>;
	};
}

export interface Tables {
	articles: ArticleModel;
	comments: CommentModel;
	users: UserModel;
}

export function initEntities( sequelize : Sequelize.Sequelize, coreFields: Sequelize.DefineAttributes, commonOptions: Sequelize.DefineOptions<any>, additionalOptions: Dict<Sequelize.DefineOptions<any>>) : Tables {
	return {
		articles : sequelize.define("articles", <Sequelize.DefineAttributes>Object.assign({},coreFields,{
			content: { type: Sequelize.STRING },
			date: { type: Sequelize.STRING },
			archival_state: { type: Sequelize.INTEGER },
			ID: { type: Sequelize.STRING({length:255}), primaryKey:true  },
			author_id: { type: Sequelize.STRING },
			loading: { type: Sequelize.STRING },
		}),
			<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions["articles"])
		) as ArticleModel,
		comments : sequelize.define("comments", <Sequelize.DefineAttributes>Object.assign({},coreFields,{
			content: { type: Sequelize.STRING },
			date: { type: "DATE" },
			author_id: { type: Sequelize.STRING({length:255}) },
			article_id: { type: Sequelize.STRING({length:255}) },
		}),
			<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions["comments"])
		) as CommentModel,
		users : sequelize.define("users", <Sequelize.DefineAttributes>Object.assign({},coreFields,{
			email: { type: Sequelize.STRING },
			numberComments: { type: Sequelize.INTEGER },
			gender: { type: Sequelize.STRING },
		}),
			<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions["users"])
		) as UserModel,
	};
}
export function initAssociations( tables : Tables) : void {
	const hasManyOptions = { constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"};
	tables.articles.hasMany(tables.comments,
                Object.assign({},hasManyOptions, { foreignKey: "getComments", as: "get_comments"} ));
	tables.articles.belongsTo(tables.users,
                Object.assign({},hasManyOptions, { foreignKey: "author_id", as: "get_author"} ));

	tables.comments.belongsTo(tables.users,
                Object.assign({},hasManyOptions, { foreignKey: "author_id", as: "get_author"} ));
	tables.comments.belongsTo(tables.articles,
                Object.assign({},hasManyOptions, { foreignKey: "article_id", as: "get_article"} ));

	tables.users.hasMany(tables.articles,
                Object.assign({},hasManyOptions, { foreignKey: "getArticles", as: "get_articles"} ));
	tables.users.hasMany(tables.comments,
                Object.assign({},hasManyOptions, { foreignKey: "getComments", as: "get_comments"} ));

}