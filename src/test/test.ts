import * as Q from "./model.query";
import { normalize, Schema, arrayOf, valuesOf } from "normalizr";

const tt = new Q.IUserQuery(
    ["email", "id"],
    {
        timesheets: new Q.TimesheetQuery(["user_id", "date"], {})
    });

console.log("Query: " + tt.toGraphQL())



const res = {
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

const options = {
    assignEntity: function (obj, key, val, schema) {
        // console.info("schema ", schema);
        if (key === "qualification") {
            obj[key + "_id"] = val;
        } else {
            obj[key] = val;
        }
        // delete obj[key + 'Id'];
    }
};

const qualification = new Schema('qualifications', { assignEntity: (obj, key, val) => obj["qualification_id"] = val } as any);
const capability = new Schema("capabilities");
const user = new Schema('users');
user.define({
    capabilities: arrayOf(capability, {
        assignEntity: (obj, key, val, schema) => {
            // console.info(schema);
        }
    } as any)
});
capability.define({
    qualification: qualification
});
