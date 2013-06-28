fs = require('fs')
{parser} = require('./haml')
{lexer} = require('./build/lexer')

parser.lexer = lexer

sampleDir = "test/samples/haml"

samples = {}
global.parser = parser

fs.readdirSync(sampleDir).forEach (file) ->
  data = fs.readFileSync "#{sampleDir}/#{file}", "UTF-8"

  samples[file] = data

exports.samples = samples
exports.parser = parser

console.log parser.parse(samples["complex2.haml"])
