module.exports = (grunt) ->

  coffeeFiles = {}
  [
    "browser"
    "cli"
    "demo"
    "gistquire"
    "grammar_dsl"
    "haml-jr"
    "observable"
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

    uglify:
      web:
        files:
          'build/web.min.js': ['build/web.js']

    browserify:
      options:
        ignore: "coffee-script"
      'build/web.js': ['build/browser.js']

    shell:
      options:
        stdout: true
        stderr: true
        failOnError: true
      lexer:
        command: [
          "jison-lex -o build/lexer.js source/haml.jisonlex"
          "echo 'exports.lexer = lexer;' >> build/lexer.js"
        ].join(' && ')
      parser:
        command: "./script/generate.coffee"
      demo:
        command: [
          "mkdir -p gh-pages"
          "node build/cli.js demo.haml > gh-pages/index.html"
        ].join(' && ')

      setup:
        command: [
          "if [ ! -d gh-pages ]; then git clone -b gh-pages `git config --get remote.origin.url` gh-pages; fi"
          "mkdir -p build"
          "npm install -g coffee-script jison jison-lex simple-http-server"
        ].join(' && ')

      test:
        command: "node build/demo.js"

      "gh-pages":
        command: [
          "rm -r gh-pages/*"
          "mkdir -p gh-pages/javascripts"
          "cp -r lib gh-pages/javascripts/"
          "cp build/*.js gh-pages/javascripts"
          "node build/cli.js demo.haml > gh-pages/index.html"
        ].join(' && ')

      "gh-pages-push":
        command: [
          "cd gh-pages"
          "git add ."
          "git ci -am 'updating pages'"
          "git push"
        ].join(' && ')

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask 'test', ['build', 'shell:test']
  grunt.registerTask 'build', [
    'shell:lexer'
    'shell:parser'
    'coffee'
    'browserify'
    'uglify'
    'shell:demo'
  ]

  grunt.registerTask 'setup', [
    'shell:setup'
  ]

  grunt.registerTask 'gh-pages', [
    'build'
    'shell:gh-pages'
    'shell:gh-pages-push'
  ]

  grunt.registerTask 'default', ['build', 'shell:gh-pages']
