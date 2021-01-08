#!/usr/bin/env node
const meow = require('meow')
const ghch = require('./ghch').default

const cli = meow(
  `
	Usage
    $ ghch <options>

  Options
    --github-token=<token>       Github API Token, must have repository scope
    --clubhouse-token=<token>    Clubhouse API Token
    --github-url=<onwer/name>    Github repository owner/name, e.g. facebook/react
    --clubhouse-project=<id>     ID of Clubhouse Project to import issues into
    --state=<open|closed|all>    Github issue state to import
    --github-base-url=<baseurl>   Github Base URL for GitHub Enterprise support (ex. https://<hostname>/api/v3)

	Examples
    $ ghch --state=open --github-url=facebook/react --clubhouse-project=4 --github-token=xxx --clubhouse-token=xxx
`,
  {
    flags: {
      githubToken: {
        type: 'string',
      },
      clubhouseToken: {
        type: 'string',
      },
      githubUrl: {
        type: 'string',
      },
      clubhouseProject: {
        type: 'string',
      },
      state: {
        type: 'string',
        default: 'open',
      },
      githubBaseUrl: {
        type: 'string'
      }
    },
  }
)

ghch(cli.flags)
