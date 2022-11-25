MATCH (p1:User), (p2:Build)
WHERE p1.Builds CONTAINS (p2.Name)
RETURN p1, p2
