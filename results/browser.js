(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["browser"] = function(data) {
    return (function() {
      var __each, __element, __observeAttribute, __observeText, __on, __pop, __push, __with, _ref;
      _ref = Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with;
      __push(document.createDocumentFragment());
      __element = document.createElement("html");
      __push(__element);
      __element = document.createElement("head");
      __push(__element);
      __element = document.createElement("script");
      __push(__element);
      __observeAttribute(__element, "src", "lib/cornerstone.js");
      __element.setAttribute("src", "lib/cornerstone.js");
      __pop();
      __element = document.createElement("script");
      __push(__element);
      __observeAttribute(__element, "src", "lib/coffee-script.js");
      __element.setAttribute("src", "lib/coffee-script.js");
      __pop();
      __element = document.createElement("script");
      __push(__element);
      __observeAttribute(__element, "src", "lib/jquery-1.10.2.min.js");
      __element.setAttribute("src", "lib/jquery-1.10.2.min.js");
      __pop();
      __element = document.createElement("script");
      __push(__element);
      __observeAttribute(__element, "src", "build/web.js");
      __element.setAttribute("src", "build/web.js");
      __pop();
      __pop();
      __element = document.createElement("body");
      __push(__element);
      __element = document.createElement("textarea");
      __push(__element);
      __element = document.createTextNode("Choose a ticket class:\n%select\n  - on \"change\", @chosenTicket\n  - each @tickets, ->\n    %option= @name\n\n%button Clear\n  - on \"click\", @resetTicket\n\n- with @chosenTicket, ->\n  %p\n    - if @price\n      You have chosen\n      %b= @name\n      %span\n        $\#{@price}\n    - else\n      No ticket chosen");
      __observeText(__element, "Choose a ticket class:\n%select\n  - on \"change\", @chosenTicket\n  - each @tickets, ->\n    %option= @name\n\n%button Clear\n  - on \"click\", @resetTicket\n\n- with @chosenTicket, ->\n  %p\n    - if @price\n      You have chosen\n      %b= @name\n      %span\n        $\#{@price}\n    - else\n      No ticket chosen");
      __push(__element);
      __pop();
      __pop();
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
