(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["browser"] = function(data) {
    return (function() {
      var __attribute, __each, __element, __filter, __on, __pop, __push, __render, __text, __with, _ref;
      _ref = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __filter = _ref.__filter, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
      __push(document.createDocumentFragment());
      __element = document.createElement("html");
      __push(__element);
      __element = document.createElement("head");
      __push(__element);
      __element = document.createElement("script");
      __push(__element);
      __attribute(__element, "src", "lib/cornerstone.js");
      __pop();
      __element = document.createElement("script");
      __push(__element);
      __attribute(__element, "src", "lib/coffee-script.js");
      __pop();
      __element = document.createElement("script");
      __push(__element);
      __attribute(__element, "src", "lib/jquery-1.10.2.min.js");
      __pop();
      __element = document.createElement("script");
      __push(__element);
      __attribute(__element, "src", "build/web.js");
      __pop();
      __pop();
      __element = document.createElement("body");
      __push(__element);
      __element = document.createElement("textarea");
      __push(__element);
      __element = document.createTextNode('');
      __text(__element, "Choose a ticket class:\n%select\n  - on \"change\", @chosenTicket\n  - each @tickets, ->\n    %option= @name\n\n%button Clear\n  - on \"click\", @resetTicket\n\n- with @chosenTicket, ->\n  %p\n    - if @price\n      You have chosen\n      %b= @name\n      %span\n        $\#{@price}\n    - else\n      No ticket chosen");
      __push(__element);
      __pop();
      __pop();
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
