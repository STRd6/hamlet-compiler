module.exports = (grunt) ->

  coffeeFiles = {}
  [
    "browser"
    "grammar_dsl"
    "parser"
    "renderer"
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

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-shell')

  # Default task(s).
  grunt.registerTask 'default', ['shell:lexer', 'coffee', 'browserify']
