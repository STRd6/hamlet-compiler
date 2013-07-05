module.exports = (grunt) ->

  coffeeFiles = {}
  [
    "browser"
    "grammar_dsl"
    "parser"
    "renderer"
    "runtime"
  ].forEach (name) ->
    destination = "build/#{name}.js"
    source = "source/#{name}.coffee"
    coffeeFiles[destination] = source

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    coffee:
      compile:
        files: coffeeFiles

    browserify:
      options:
        ignore: "coffee-script"
      'build/web.js': ['build/browser.js']

    shell:
      lexer:
        command:[
          "jison-lex -o build/lexer.js source/haml.jisonlex"
          "echo 'exports.lexer = lexer;' >> build/lexer.js"
        ].join(' && ')
      demo:
        command: "coffee source/cli.coffee demo.haml > demo.html"

      test:
        command: "coffee source/demo.coffee"

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask 'test', ['build', 'shell:test']
  grunt.registerTask 'build', ['shell:lexer', 'coffee', 'browserify', 'shell:demo']

  grunt.registerTask 'default', ['test']
