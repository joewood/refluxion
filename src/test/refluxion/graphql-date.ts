import Sequelize = require("sequelize");
var graphqlSeq = require("graphql-sequelize");

let {typeMapper, resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;

import * as GraphQL from "graphql";


function fromISODate(value) {
    // console.log("fromISO");
    try {
        if (!value) return null;
        return new Date(value);
    }
    catch (e) {
        console.error("Error converting date", e);
        return null;
    }
}

function toISODate(d: Date): any {
    if (!d) return null;
    if ((d instanceof Date)) {
        return d.toISOString();
    }
    return new Date(d as any).toISOString();
}

export const GraphQLDate = new GraphQL.GraphQLScalarType({
    name: "Date",
    description: "A special custom Scalar type for Dates that converts to a ISO formatted string ",
    serialize: toISODate,
    parseValue: fromISODate,
    parseLiteral(ast) {
        return new Date(ast.value);
    }
});

