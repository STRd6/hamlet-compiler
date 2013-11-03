(function(data) {
  return (function() {
    var radicalMessage, __attribute, __each, __filter, __on, __pop, __push, __render, __runtime, __text, __with, _ref;
    _ref = __runtime = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __filter = _ref.__filter, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
    __push(document.createDocumentFragment());
    __push(document.createElement("select"));
    radicalMessage = "Yolo";
    this.tickets.forEach(function(ticket, i) {
      if (i === 0) {
        __push(document.createTextNode(''));
        __text(radicalMessage);
        __pop();
      }
      __push(document.createElement("option"));
      __push(document.createTextNode(''));
      __text(ticket.name);
      __pop();
      return __pop();
    });
    __pop();
    return __pop();
  }).call(data);
});
