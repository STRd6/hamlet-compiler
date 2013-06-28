{log} = console
{exec} = require('child_process')

sh = (cmd, fn=->) ->
  log cmd

  exec cmd, (error, stdout, stderr) ->
    log(stdout) if stdout

    if error
      log(stderr)
      process.exit(1)

    fn()

module.exports = sh
