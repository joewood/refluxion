"use strict";
var test_model_1 = require("./test-model");
var lodash_1 = require("lodash");
var Q = require("./refluxion/test-model.client-graphql");
var tt = new Q.UserQuery(["email", "id"], {
    get_articles: new Q.ArticleQuery(["id", "date"], {}, { author_id: "user-1" })
}, { id: "user-1" });
console.log("Query: " + tt.toGraphQL());
var model = new test_model_1.MyModel();
model.comments["ONE"] = new test_model_1.Comment({ id: "ONE", article_id: "ART-1", content: "CONTENT" });
model.comments["TWO"] = new test_model_1.Comment({ id: "TWo", article_id: "ART-1", content: "CONTENT" });
model.articles["ART-1"] = new test_model_1.Article({
    ID: "ART-1",
    content: "BLAG",
    author_id: "JOE",
    loading: "UNKNOWN",
    date: new Date().toISOString(), archival_state: test_model_1.ArchivalState.live });
console.log("RES", model.articles["ART-1"].getComments(lodash_1.values(model.comments)));
// const res = {
//     results: [
//         {
//             id: "user-1",
//             enail: "JOE@host.com",
//             address: "Here",
//             articles: [{
//                 id: "1",
//                 approved: true,
//                 expires: "2020-01-01",
//                 content: "This is an article",
//                 author_id: "user-1",
//                 comments: {
//                     id: "QUAL3",
//                     content: "Comment-1",
//                     author: "user-2"
//                 }
//             },
//                 {
//                     id: "2",
//                     approved: true,
//                     expires: "2019-01-01",
//                     content: "Second Article",
//                     author_id: "user-1",
//                     comments: {
//                         id: "comment-2",
//                         author_id: "user-2",
//                         content: "Antoher comment"
//                     }
//                 },
//             ]
//         }, {
//             id: "user-2",
//             name: "PETE",
//             email: "Here There"
//         }
//     ]
// };
// const options = {
//     assignEntity: function (obj, key, val, schema) {
//         // console.info("schema ", schema);
//         if (key === "qualification") {
//             obj[key + "_id"] = val;
//         } else {
//             obj[key] = val;
//         }
//         // delete obj[key + 'Id'];
//     }
// };
//# sourceMappingURL=test.js.map