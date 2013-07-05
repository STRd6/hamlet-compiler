(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["complex"] = function(data) {
    return (function() {
      var observing, radicalMessage, __each, __element, __observeAttribute, __observeText, __on, __pop, __push, _ref;
      _ref = Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, __each = _ref.__each, observing = _ref.observing;
      __push(document.createDocumentFragment());
      __element = document.createElement("select");
      __push(__element);
      radicalMessage = "Yolo";
      this.tickets.forEach(function(ticket, i) {
        if (i === 0) {
          __element = document.createTextNode(radicalMessage);
          __observeText(__element, radicalMessage);
          __push(__element);
          __pop();
        }
        __element = document.createElement("option");
        __push(__element);
        __element = document.createTextNode(ticket.name);
        __observeText(__element, ticket.name);
        __push(__element);
        __pop();
        return __pop();
      });
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
