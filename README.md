HAMLjr
======

A formal parser for Haml.

HAMLjr separates creating the AST from rendering the output to allow for
advanced automagical data binding between HTML elements and data.

It's like a Knockout.js that will really blow your mind.

Development
===========

To get set up:

    git clone git@github.com:STRd6/haml-jr.git
    npm install -g nserver grunt-cli
    grunt setup

To run the demo site:

    cd gh-pages
    nserver

To build the demo site:

    grunt
