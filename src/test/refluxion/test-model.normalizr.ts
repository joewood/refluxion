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

