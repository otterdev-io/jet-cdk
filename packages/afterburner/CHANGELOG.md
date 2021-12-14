# 0.3.4 - October 26 2021
- Remove authorized-scoped, add withOptions
- Name authorizers
# 0.3.3 - October 26 2021
- Add authorization-scoped helper

# 0.3.2 - October 26 2021
- Fix bug in template string concatenation
# 0.3.1 - October 8 2021
- Fix bug in appsync setup output
# 0.3.0 - October 8 2021
- Add template tags for prefab handlers
- Add tagOf function to make your own tags
- Remove defaultOptions
- Make authorizers curry integrations
# 0.2.1 - September 29 2021
- Make functions available from appsync datasources.
# 0.2.0 - September 29 2021
- Add cognito triggers api

# 0.1.1 - September 29 2021
- Fix publish of wrong folder

# 0.1.0 - September 29 2021
- Add all missing appsync datasources, integrations, and authorizers
- Rename imports to stick to aws naming convention 
- Rename fns to functions
- Add resolvers function to explicitly create resolvers, make it necessary for use for lambda datasource 

# 0.0.2 - September 28 2021
- Remove some imports from index files to avoid unnecessary dependencies
- Change id generation of datasources to avoid '-'