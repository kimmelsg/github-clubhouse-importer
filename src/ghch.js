const { Octokit } = require('@octokit/rest')
const Clubhouse = require('clubhouse-lib')
const ora = require('ora')
const chalk = require('chalk')

const log = console.log

const githubClubhouseImport = options => {
  validateOptions(options)
  const octokit = new Octokit({
    auth: options.githubToken,
  })

  const [owner, repo] = options.githubUrl.split('/')

  function fetchGithubIssues() {
    const octokitOptions = octokit.issues.listForRepo.endpoint.merge({
      owner,
      repo,
      per_page: 100,
      state: options.state,
    })
    return octokit
      .paginate(octokitOptions)
      .then(data => {
        const issues = data.filter(issue => !issue.pull_request)
        return issues
      })
      .catch(err => {
        spinner.fail(
          `Failed to fetch issues from ${chalk.underline(options.githubUrl)}\n`
        )
        log(chalk.red(err))
      })
  }

  function importIssuesToClubhouse(issues) {
    const clubhouse = Clubhouse.create(options.clubhouseToken)
    return clubhouse
      .getProject(options.clubhouseProject)
      .then(project => {
        let issuesImported = 0
        return Promise.all(
          issues.map(({ created_at, updated_at, labels, title, body, html_url, number }) => {
            const story_type = getStoryType(labels)
            return reflect(
              clubhouse
                .createStory({
                  created_at,
                  updated_at,
                  story_type,
                  name: title,
                  description: body,
                  external_id: html_url,
                  project_id: project.id,
                })
                .then(() => (issuesImported = issuesImported + 1))
                .catch(() => {
                  log(chalk.red(`Failed to import issue #${number}`))
                })
            )
          })
        ).then(() => {
          return issuesImported
        })
      })
      .catch(() => {
        log(
          chalk.red(
            `Clubhouse Project ID ${
              options.clubhouseProject
            } could not be found`
          )
        )
      })
  }

  const githubSpinner = ora('Retrieving issues from Github').start()
  fetchGithubIssues().then(issues => {
    githubSpinner.succeed(
      `Retrieved ${chalk.bold(issues.length)} issues from Github`
    )
    const clubhouseSpinner = ora('Importing issues into Clubhouse').start()
    importIssuesToClubhouse(issues).then(issuesImported => {
      clubhouseSpinner.succeed(
        `Imported ${chalk.bold(issuesImported)} issues into Clubhouse`
      )
    })
  })
}

const validateOptions = options => {
  let hasError = false
  if (!options.githubToken) {
    hasError = true
    log(chalk.red(`Usage: ${chalk.bold('--github-token')} arg is required`))
  }

  if (!options.clubhouseToken) {
    hasError = true
    log(chalk.red(`Usage: ${chalk.bold('--clubhouse-token')} arg is required`))
  }

  if (!options.clubhouseProject) {
    hasError = true
    log(
      chalk.red(`Usage: ${chalk.bold('--clubhouse-project')} arg is required`)
    )
  }

  if (!options.githubUrl) {
    hasError = true
    log(chalk.red(`Usage: ${chalk.bold('--github-url')} arg is required`))
  }

  if (!['open', 'closed', 'all'].includes(options.state.toLowerCase())) {
    hasError = true
    log(
      chalk.red(
        `Usage: ${chalk.bold('--state')} must be one of open | closed | all`
      )
    )
  }

  if (hasError) {
    log()
    process.exit(1)
  }
}

function getStoryType(labels) {
  if (labels.find(label => label.name.includes('bug'))) return 'bug'
  if (labels.find(label => label.name.includes('chore'))) return 'chore'
  return 'feature'
}

const reflect = p =>
  p.then(v => ({ v, status: 'fulfilled' }), e => ({ e, status: 'rejected' }))

module.exports.default = githubClubhouseImport
