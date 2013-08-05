(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["tickets"] = function(data) {
    return (function() {
      var __attribute, __each, __element, __on, __pop, __push, __render, __text, __with, _ref;
      _ref = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
      __push(document.createDocumentFragment());
      __element = document.createTextNode('');
      __text(__element, "Choose a ticket class:\n");
      __push(__element);
      __pop();
      __element = document.createElement("select");
      __push(__element);
      __on("change", this.chosenTicket);
      __each(this.tickets, function() {
        __element = document.createElement("option");
        __push(__element);
        __element = document.createTextNode('');
        __text(__element, this.name);
        __push(__element);
        __pop();
        return __pop();
      });
      __pop();
      __element = document.createElement("button");
      __push(__element);
      __element = document.createTextNode('');
      __text(__element, "Clear\n");
      __push(__element);
      __pop();
      __on("click", this.resetTicket);
      __pop();
      __with(this.chosenTicket, function() {
        __element = document.createElement("p");
        __push(__element);
        if (this.price) {
          __element = document.createTextNode('');
          __text(__element, "You have chosen\n");
          __push(__element);
          __pop();
          __element = document.createElement("b");
          __push(__element);
          __element = document.createTextNode('');
          __text(__element, this.name);
          __push(__element);
          __pop();
          __pop();
          __element = document.createElement("span");
          __push(__element);
          __element = document.createTextNode('');
          __text(__element, "$" + this.price + "\n");
          __push(__element);
          __pop();
          __pop();
        } else {
          __element = document.createTextNode('');
          __text(__element, "No ticket chosen\n");
          __push(__element);
          __pop();
        }
        return __pop();
      });
      return __pop();
    }).call(data);
  };

}).call(this);
