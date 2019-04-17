const Octokit = require('@octokit/rest')
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
        spinner.succeed(
          `Retrieved ${chalk.bold(issues.length)} issues from Github`
        )
        return issues
      })
      .catch(err => {
        spinner.fail(
          `Failed to fetch issues from ${chalk.underline(options.githubUrl)}\n`
        )
        log(chalk.red(err))
      })
  }

  const spinner = ora('Retrieving issues from Github').start()
  const issues = fetchGithubIssues()
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

module.exports.default = githubClubhouseImport
