"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var refluxion_1 = require("refluxion");
exports.articleFields = ["content", "date", "archival_state", "id", "author_id"];
var ArticleQuery = (function (_super) {
    __extends(ArticleQuery, _super);
    function ArticleQuery(primitives, nested, where, options) {
        if (nested === void 0) { nested = null; }
        if (where === void 0) { where = null; }
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested, where);
    }
    return ArticleQuery;
}(refluxion_1.Query));
exports.ArticleQuery = ArticleQuery;
exports.commentFields = ["content", "date", "id", "author_id", "article_id"];
var CommentQuery = (function (_super) {
    __extends(CommentQuery, _super);
    function CommentQuery(primitives, nested, where, options) {
        if (nested === void 0) { nested = null; }
        if (where === void 0) { where = null; }
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested, where);
    }
    return CommentQuery;
}(refluxion_1.Query));
exports.CommentQuery = CommentQuery;
exports.userFields = ["email", "id", "numberComments", "gender"];
var UserQuery = (function (_super) {
    __extends(UserQuery, _super);
    function UserQuery(primitives, nested, where, options) {
        if (nested === void 0) { nested = null; }
        if (where === void 0) { where = null; }
        if (options === void 0) { options = {}; }
        _super.call(this, primitives, nested, where);
    }
    return UserQuery;
}(refluxion_1.Query));
exports.UserQuery = UserQuery;
//# sourceMappingURL=test-model.client-graphql.js.map