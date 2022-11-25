MATCH (p1:Part), (p2:Part)
WHERE p1.Combo CONTAINS (p2.Name)
create (p1)-[:HAS_PART]->(p2)
RETURN p1, p2
