
assert = require('assert')

respace = require "../source/respace"

describe 'respace', ->
  it 'should respace indentation to be 2 spaces', ->
    spaced = respace """
      %h1
      \theyy
      %div
      \tYo
    """

    assert.equal spaced, """
      %h1
        heyy
      %div
        Yo
    """

    spaced = respace """
      %h1
          heyy
      %div
          Yo
    """

    assert.equal spaced, """
      %h1
        heyy
      %div
        Yo
    """
