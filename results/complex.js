(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["complex"] = function(data) {
    return (function() {
      var radicalMessage, __attribute, __each, __element, __on, __pop, __push, __render, __text, __with, _ref;
      _ref = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
      __push(document.createDocumentFragment());
      __element = document.createElement("select");
      __push(__element);
      radicalMessage = "Yolo";
      this.tickets.forEach(function(ticket, i) {
        if (i === 0) {
          __element = document.createTextNode('');
          __text(__element, radicalMessage);
          __push(__element);
          __pop();
        }
        __element = document.createElement("option");
        __push(__element);
        __element = document.createTextNode('');
        __text(__element, ticket.name);
        __push(__element);
        __pop();
        return __pop();
      });
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
