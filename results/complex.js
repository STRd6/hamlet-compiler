(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["complex"] = function(data) {
    return (function() {
      var radicalMessage, __element, __observeAttribute, __observeText, __pop, __push, _ref;
      _ref = Runtime(), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText;
      __push(document.createDocumentFragment());
      __element = document.createElement("select");
      __push(__element);
      __push(document.createDocumentFragment());
      radicalMessage = "Yolo";
      this.tickets.forEach(function(ticket, i) {
        __push(document.createDocumentFragment());
        if (i === 0) {
          __push(document.createDocumentFragment());
          __element = document.createTextNode(radicalMessage);
          __observeText(__element, radicalMessage);
          __push(__element);
          __pop();
          __pop();
        }
        __element = document.createElement("option");
        __push(__element);
        __push(document.createDocumentFragment());
        __element = document.createTextNode(ticket.name);
        __observeText(__element, ticket.name);
        __push(__element);
        __pop();
        __pop();
        __pop();
        return __pop();
      });
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
