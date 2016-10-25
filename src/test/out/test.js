"use strict";
var Q = require("./refluxion/test-model.client-graphql");
var tt = new Q.UserQuery(["email", "id"], {
    get_articles: new Q.ArticleQuery(["id", "date"], {}, { author_id: "user-1" })
}, { id: "user-1" });
console.log("Query: " + tt.toGraphQL());
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