(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["filters2"] = function(data) {
    return (function() {
      var observing, __each, __element, __observeAttribute, __observeText, __on, __pop, __push, _ref;
      _ref = Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, __each = _ref.__each, observing = _ref.observing;
      __push(document.createDocumentFragment());
      
      alert('yolo');
      
    ;
      alert("yolo");
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "class", "duder");
      __element.setAttribute("class", "duder");
      __element = document.createTextNode("col");
      __observeText(__element, "col");
      __push(__element);
      __pop();
      __element = document.createTextNode("sweets\n");
      __observeText(__element, "sweets\n");
      __push(__element);
      __pop();
      __pop();
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "class", "duder2");
      __element.setAttribute("class", "duder2");
      __element = document.createTextNode("cool");
      __observeText(__element, "cool");
      __push(__element);
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
