module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    browserify:
      options:
        ignore: "coffee-script"
      'build/web.js': ['build/browser.js']

    shell:
      options:
        stdout: true
        stderr: true
        failOnError: true
      coffee:
        command: "./node_modules/.bin/coffee -co build/ source/"
      lexer:
        command: [
          "jison-lex -o build/lexer.js source/haml.jisonlex"
          "echo 'exports.lexer = lexer;' >> build/lexer.js"
        ].join(' && ')
      parser:
        command: "./script/generate.coffee"
      demo:
        command: "script/demo"
      test:
        command: [
          "script/test"
          "node build/demo.js"
        ].join(' && ')
      setup:
        command: [
          "if [ ! -d gh-pages ]; then git clone -b gh-pages `git config --get remote.origin.url` gh-pages; fi"
          "mkdir -p build"
          "npm install -g coffee-script jison jison-lex simple-http-server mocha"
        ].join(' && ')

      "gh-pages-push":
        command: [
          "cd gh-pages"
          "git add ."
          "git ci -am 'updating pages'"
          "git push"
        ].join(' && ')

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask 'test', ['build', 'shell:test']
  grunt.registerTask 'build', [
    'shell:lexer'
    'shell:coffee'
    'shell:parser'
    'browserify'
    'shell:demo'
  ]

  grunt.registerTask 'setup', [
    'shell:setup'
  ]

  grunt.registerTask 'gh-pages', [
    'build'
    'shell:gh-pages-push'
  ]

  grunt.registerTask 'default', ['build']
