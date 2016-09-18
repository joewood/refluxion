import * as Sequelize from "sequelize";

import * as Interfaces from "./test-model.interfaces";

interface Dict<T> { [index:string]:T; };
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
export function initAssociations( tables : Tables) : void {
	tables.article.hasMany(tables.comment, { as: "comments", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"} )
	tables.article.belongsTo(tables.user, { foreignKey: "author_id", as: "author", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL" })

	tables.comment.belongsTo(tables.user, { foreignKey: "author_id", as: "author", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL" })
	tables.comment.belongsTo(tables.article, { foreignKey: "article_id", as: "article", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL" })

	tables.user.hasMany(tables.article, { as: "articles", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"} )
	tables.user.hasMany(tables.comment, { as: "comments", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"} )

}
