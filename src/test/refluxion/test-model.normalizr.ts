import { normalize, Schema, arrayOf, valuesOf } from "normalizr";
export var article = new Schema("articles");
export var comment = new Schema("comments");
export var user = new Schema("users");
article.define({
	get_comments : arrayOf(comment),
	get_author : user,
});

comment.define({
	get_author : user,
	get_article : article,
});

user.define({
	get_articles : arrayOf(article),
	get_comments : arrayOf(comment),
});
