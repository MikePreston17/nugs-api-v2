const neo4j = require("neo4j-driver");
// import neo4j from "neo4j-driver";

// const apiKey = process.env.VITE_VERCEL_AIRTABLE_API_KEY;
const uri = process.env.VITE_VERCEL_URI;
const user = process.env.VITE_VERCEL_USER;
const password = process.env.VITE_VERCEL_PASSWORD;
const dbname = "neo4j";

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function user_likes_build(userName, buildName) {
  // To learn more about sessions: https://neo4j.com/docs/javascript-manual/current/session-api/
  const session = driver.session({ database: dbname });

  try {
    // To learn more about the Cypher syntax, see: https://neo4j.com/docs/cypher-manual/current/
    // The Reference Card is also a good resource for keywords: https://neo4j.com/docs/cypher-refcard/current/
    const writeQuery = `MERGE (p1:User { name: $userName })
                                MERGE (p2:Build { name: $buildName })
                                MERGE (p1)-[:LIKES]->(p2)
                                RETURN p1, p2`;

    // Write transactions allow the driver to handle retries and transient errors.
    const writeResult = await session.executeWrite((tx) =>
      tx.run(writeQuery, { userName, buildName })
    );

    // Check the write results.
    writeResult.records.forEach((record) => {
      const user = record.get("p1");
      const build = record.get("p2");
      console.info(
        `Created Like between: ${user.properties.name}, ${build.properties.name}`
      );
    });
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  } finally {
    // Close down the session if you're not using it anymore.
    await session.close();
  }
}

async function find_build_by_name(buildName = "") {
  const session = driver.session({ database: dbname });

  try {
    const readQuery = `
        MATCH (build:Build)
        WHERE build.Name contains $buildName
        RETURN build
    `;

    const readResult = await session.executeRead((transaction) =>
      transaction.run(readQuery, { buildName })
    );
    console.log("readResult :>> ", readResult);
    readResult.records.forEach((record) => {
      console.log(`Found Build: ${record.get("build")}`);
    });
    return readResult;
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  } finally {
    await session.close();
  }
}

async function find_builds_for_user(userName = null) {
  const session = driver.session({ database: dbname });

  const readQuery = `
    match (user:User)
    where user.Name = 'Nick'
    OPTIONAL MATCH (user)-[rb:HAS_BUILD]->(build:Build)-[rp:HAS_PART]->(part)
    return user, build, part, rp, rb
`;
  //   const readQuery = `
  //         MATCH (user:User {Name:$userName}), (build:Build)
  //         MATCH (user)-[rel:HAS_BUILD]->(build)
  //         RETURN user, rel, build
  //     `;

  try {
    const readResult = await session.executeRead((transaction) =>
      transaction.run(readQuery, { userName })
    );
    // console.log("readQuery :>> ", readQuery);
    // console.log("readResult :>> ", readResult);
    readResult.records.forEach((record) => {
      console.log(`Found Build for ${userName}`);
    });
    return readResult;
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  } finally {
    await session.close();
  }
}

async function get_recommended_builds(partName = "") {
  const session = driver.session({ database: dbname });

  const readQuery = `
        match (user:User)-[like:LIKES]-(build:Build )-[p:HAS_PART]->(part:Part)
        where part.Name contains $partName
        return user, build, like, p, part, count(*) as occurrence
        order by occurrence desc
        limit 5
    `;

  try {
    const readResult = await session.executeRead((transaction) =>
      transaction.run(readQuery, { partName })
    );
    console.log("readResult :>> ", readResult);
    readResult.records.forEach((record) => {
      console.log(
        `Found Recommended Builds with Part ${partName}: ${record.get("part")}`
      );
    });
    return readResult;
  } catch (error) {
    console.error(`Something went wrong: ${error}`);
  } finally {
    await session.close();
  }
}

/**TODO:
     * 
     * Place these in a test
     * 
     * 
     * 
     * 
     * 
    (async () => {
      try {
        const userName = "Nick";
        const build2Name = "Spectre";
        await user_likes_build(userName, build2Name);

        let builds = await find_build_by_name(build2Name);
        console.log("builds :>> ", builds);

        const builds_for_user = await find_builds_for_user(userName);
        console.log("builds_for_user :>> ", builds_for_user);
        const recommendations = await get_recommended_builds("80");
        console.log("recommendations :>> ", recommendations);

    } catch (error) {
        console.error(`Something went wrong: ${error}`);
      } finally {
        // Don't forget to close the driver connection when you're finished with it.
        await driver.close();
      }
    })();
*/

module.exports = {
  find_build_by_name,
};
