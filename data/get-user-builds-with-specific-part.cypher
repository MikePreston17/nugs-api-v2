MATCH (part:Part { Name: 'Gas Tube' })
<-[rel:HAS_PART]-(build)<-[rel2:HAS_BUILD]-(user:User)
RETURN part, build, user, rel, rel2
