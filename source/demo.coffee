fs = require('fs')
{parser, compile} = HAMLjr = require('./haml-jr')

sampleDir = "test/samples/haml"

testFile = process.argv[2]

samples = {}

fs.readdirSync(sampleDir).forEach (file) ->
  data = fs.readFileSync "#{sampleDir}/#{file}", "UTF-8"

  samples[file] = data

runFile = (name) ->
  sample = samples["#{name}.haml"]
  result = parser.parse(sample)

  file = "results/#{name}.json"
  fs.writeFile(file, JSON.stringify(result, null, 2))
  console.log "Writing to file: #{file}"

  file = "results/#{name}.js"
  fs.writeFile(file, compile(result, name: name))
  console.log "Writing to file: #{file}"

if testFile
  runFile(testFile)
else
  Object.keys(samples).forEach (sample) ->
    name = sample.split(".")[0]

    runFile(name)
