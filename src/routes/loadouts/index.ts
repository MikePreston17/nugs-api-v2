import { FastifyPluginAsync } from "fastify";
// import { find_build_by_name } from "../../../src/neo.js";
const { find_build_by_name } = require("../../../src/neo.js");

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    var result = await find_build_by_name("Kestrel");
    console.log("result of search :>> ", result);
    // return "this is an example";
    return result;
  });
};

export default example;
