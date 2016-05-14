"use strict";
var Q = require("./model.query");
var normalizr_1 = require("normalizr");
var tt = new Q.IUserQuery(["email", "id"], {
    timesheets: new Q.TimesheetQuery(["user_id", "date"], {})
});
console.log("Query: " + tt.toGraphQL());
var res = {
    results: [
        {
            id: "ONE",
            name: "JOE",
            address: "Here",
            capabilities: [{
                    id: "User1-Cap1",
                    approved: true,
                    expires: "2020-01-01",
                    qualification: {
                        id: "QUAL3",
                        name: "QUAL3Desc"
                    }
                },
                {
                    id: "User1-Cap2",
                    approved: true,
                    expires: "2019-01-01",
                    qualification: {
                        id: "QUAL2",
                        name: "QUAL2"
                    }
                },
            ]
        }, {
            id: "TWO",
            name: "PETE",
            address: "Here There",
            capabilities: [{
                    id: "User2-Cap1",
                    approved: true,
                    expires: "2017-01-01",
                    qualification: {
                        id: "QUAL1",
                        name: "QUAL1"
                    }
                },
                {
                    id: "User2-Cap2",
                    approved: true,
                    expires: "2019-01-01",
                    qualification: {
                        id: "QUAL2",
                        name: "QUAL2"
                    }
                },
            ]
        }
    ]
};
var options = {
    assignEntity: function (obj, key, val, schema) {
        // console.info("schema ", schema);
        if (key === "qualification") {
            obj[key + "_id"] = val;
        }
        else {
            obj[key] = val;
        }
        // delete obj[key + 'Id'];
    }
};
var qualification = new normalizr_1.Schema('qualifications', { assignEntity: function (obj, key, val) { return obj["qualification_id"] = val; } });
var capability = new normalizr_1.Schema("capabilities");
var user = new normalizr_1.Schema('users');
user.define({
    capabilities: normalizr_1.arrayOf(capability, {
        assignEntity: function (obj, key, val, schema) {
            // console.info(schema);
        }
    })
});
capability.define({
    qualification: qualification
});
//# sourceMappingURL=test.js.map