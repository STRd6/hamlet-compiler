(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["tickets"] = function(data) {
    return (function() {
      var __each, __element, __observeAttribute, __observeText, __on, __pop, __push, __with, _ref;
      _ref = Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with;
      __push(document.createDocumentFragment());
      __element = document.createTextNode('');
      __observeText(__element, "Choose a ticket class:\n");
      __push(__element);
      __pop();
      __element = document.createElement("select");
      __push(__element);
      __on("change", this.chosenTicket);
      __each(this.tickets, function() {
        __element = document.createElement("option");
        __push(__element);
        __element = document.createTextNode('');
        __observeText(__element, this.name);
        __push(__element);
        __pop();
        return __pop();
      });
      __pop();
      __element = document.createElement("button");
      __push(__element);
      __element = document.createTextNode('');
      __observeText(__element, "Clear\n");
      __push(__element);
      __pop();
      __on("click", this.resetTicket);
      __pop();
      __with(this.chosenTicket, function() {
        __element = document.createElement("p");
        __push(__element);
        if (this.price) {
          __element = document.createTextNode('');
          __observeText(__element, "You have chosen\n");
          __push(__element);
          __pop();
          __element = document.createElement("b");
          __push(__element);
          __element = document.createTextNode('');
          __observeText(__element, this.name);
          __push(__element);
          __pop();
          __pop();
          __element = document.createElement("span");
          __push(__element);
          __element = document.createTextNode('');
          __observeText(__element, "$" + this.price + "\n");
          __push(__element);
          __pop();
          __pop();
        } else {
          __element = document.createTextNode('');
          __observeText(__element, "No ticket chosen\n");
          __push(__element);
          __pop();
        }
        return __pop();
      });
      return __pop();
    }).call(data);
  };

}).call(this);
