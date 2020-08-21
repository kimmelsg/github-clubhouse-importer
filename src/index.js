#!/usr/bin/env node
const meow = require('meow')
const ghair = require('./ghair').default

const cli = meow(
  `
	Usage
    $ ghch <options>

	Options
    --github-token=<token>       Github API Token, must have repository scope
    --airtable-api-key=<key>     Airtable API Key
    --github-url=<owner/name>    Github repository owner/name, e.g. facebook/react
    --airtable-base=<id>         ID of Airtable Base to import issues into
    --airtable-table=<id>        ID of Airtable Table in the Base to import issues into
    --state=<open|closed|all>    Github issue state to import

	Examples
    $ ghch --state=open --github-url=facebook/react --airtable-base=app214j21lkjsc --airtable-table="Github Issues" --github-token=xxx --airtable-api-key=xxx
`,
  {
    flags: {
      githubToken: {
        type: 'string',
      },
      airtableApiKey: {
        type: 'string',
      },
      githubUrl: {
        type: 'string',
      },
      airtableBase: {
        type: 'string',
      },
      airtableTable: {
        type: 'string',
      },
      state: {
        type: 'string',
        default: 'open',
      },
    },
  }
)

ghair(cli.flags)
