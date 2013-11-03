(function(data) {
  return (function() {
    var __attribute, __each, __filter, __on, __pop, __push, __render, __runtime, __text, __with, _ref;
    _ref = __runtime = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __filter = _ref.__filter, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
    __push(document.createDocumentFragment());
    __push(document.createTextNode(''));
    __text("Choose a ticket class:\n");
    __pop();
    __push(document.createElement("select"));
    __on("change", this.chosenTicket);
    __each(this.tickets, function() {
      __push(document.createElement("option"));
      __push(document.createTextNode(''));
      __text(this.name);
      __pop();
      return __pop();
    });
    __pop();
    __push(document.createElement("button"));
    __push(document.createTextNode(''));
    __text("Clear\n");
    __pop();
    __on("click", this.resetTicket);
    __pop();
    __with(this.chosenTicket, function() {
      __push(document.createElement("p"));
      if (this.price) {
        __push(document.createTextNode(''));
        __text("You have chosen\n");
        __pop();
        __push(document.createElement("b"));
        __push(document.createTextNode(''));
        __text(this.name);
        __pop();
        __pop();
        __push(document.createElement("span"));
        __push(document.createTextNode(''));
        __text("$" + this.price + "\n");
        __pop();
        __pop();
      } else {
        __push(document.createTextNode(''));
        __text("No ticket chosen\n");
        __pop();
      }
      return __pop();
    });
    return __pop();
  }).call(data);
});
