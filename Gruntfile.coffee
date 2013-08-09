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
      test:
        command: [
          "script/test"
          "node build/demo.js"
        ].join(' && ')

      "gh-pages-push":
        command: [
          "cd gh-pages"
          "git add ."
          "git ci -am 'updating pages'"
          "git push"
        ].join(' && ')


  grunt.registerTask 'test', ['build', 'shell:test']
  grunt.registerTask 'build', [
    'shell:lexer'
    'shell:coffee'
    'shell:parser'
  ]

  grunt.registerTask 'gh-pages', [
    'build'
    'shell:gh-pages-push'
  ]

  grunt.registerTask 'default', ['build']
