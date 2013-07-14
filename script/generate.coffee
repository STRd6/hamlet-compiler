#!/usr/bin/env coffee

fs = require('fs')
path = require('path')

parserSource = require('../source/parser').parser.generate()

fs.writeFile path.join(__dirname, "..", "build", "parser.js"), parserSource, ->
