# 0.3.1 - October 12 2021
- Fix starting up clean
# 0.3.0 - October 10 2021
- Replace custom lambda uploading code with simple execution of cdk --hotswap
# 0.2.6 - October 5 2021
- Fix stage listing
# 0.2.5 - October 5 2021
- Accidental publish
# 0.2.4 - October 5 2021
- Even better stage detection
# 0.2.3 - October 5 2021
- Better stage detection
# 0.2.2 - October 4 2021
- Be more explicit when cdk can't run
# 0.2.0 - October 3 2021
- Deploy with minimal jet output information as possible
- rename `writeValues` to `outputsFile`
- reduce refresh timer to 5s to ease throttling with more functions
# 0.1.2 - October 3 2021
- Fix deploy stacks
# 0.1.1 - October 3 2021
- Update documentation
# 0.1.0 - October 3 2021
- Rename JetCoreStack to JetCore, make it a stage so its name affects stack name generation
# 0.0.15 - October 3 2021
- Support specifying stacks to develop/deploy
# 0.0.14 - October 2 2021
- Fix crash when function name is undefined
# 0.0.13 - October 2 2021
- Fix crash when function name has ':' in it
# 0.0.12 - October 1 2021
- Dont crash when detecting functions without a child node
# 0.0.11 - September 30 2021
- Upload lambdas sequentially
# 0.0.10 - September 30 2021
- Properly back off the logger when there's real issues
# 0.0.9 - September 29 2021
- Format generated json
# 0.0.8 - September 29 2021
- Add values writing
# 0.0.7 - September 29 2021
- Add function to get stage from stacks
# 0.0.6 - September 29 2021
- Add stage informational output
# 0.0.5 - September 29 2021
- Substitute {user} into stage setting
# 0.0.4 - September 29 2021
- Update readme
# 0.0.3 - September 27 2021
- More verbose errors
# 0.0.2 - September 24 2021
- Add repository info to package.json
# 0.0.1 - September 24 2021
- Initial release