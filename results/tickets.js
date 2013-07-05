(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["tickets"] = function(data) {
    return (function() {
      var observing, __element, __observeAttribute, __observeText, __on, __pop, __push, _ref;
      _ref = Runtime(), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, observing = _ref.observing;
      __push(document.createDocumentFragment());
      __element = document.createTextNode("Choose a ticket class:");
      __observeText(__element, "Choose a ticket class:");
      __push(__element);
      __pop();
      __element = document.createElement("select");
      __push(__element);
      __on("change", this.chosenTicket);
      this.tickets.each(function(ticket) {
        __element = document.createElement("option");
        __push(__element);
        observing(ticket, function() {
          __element = document.createTextNode(this.name);
          __observeText(__element, this.name);
          __push(__element);
          return __pop();
        });
        return __pop();
      });
      __pop();
      __element = document.createElement("button");
      __push(__element);
      __element = document.createTextNode("Clear");
      __observeText(__element, "Clear");
      __push(__element);
      __pop();
      __on("click", this.resetTicket);
      __pop();
      __element = document.createElement("p");
      __push(__element);
      observing(this.chosenTicket, function() {
        __element = document.createTextNode("You have chosen");
        __observeText(__element, "You have chosen");
        __push(__element);
        __pop();
        __element = document.createElement("b");
        __push(__element);
        __element = document.createTextNode(this.name);
        __observeText(__element, this.name);
        __push(__element);
        __pop();
        __pop();
        __element = document.createElement("span");
        __push(__element);
        __element = document.createTextNode("$");
        __observeText(__element, "$");
        __push(__element);
        __pop();
        __element = document.createTextNode(this.price);
        __observeText(__element, this.price);
        __push(__element);
        __pop();
        return __pop();
      });
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
