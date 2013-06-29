sh = require("./util/sh")

task "build", "Build the parser", ->
  sh "mkdir -p build", ->
    sh "jison-lex -o build/lexer.js haml.jisonlex", ->
      sh "echo 'exports.lexer = lexer;' >> build/lexer.js"

task "test", "Run the tests", ->
  sh "mocha -u tdd --compilers coffee:coffee-script --reporter spec"

task "setup", "Set up the project", ->
  sh "npm install jison"
