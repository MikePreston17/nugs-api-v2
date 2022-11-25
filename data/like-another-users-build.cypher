MERGE (p1:User { name: 'Nick' })
MERGE (p2:User { Name: "NC" })
MERGE (p1)-[:LIKES]->(p2)
RETURN p1, p2
