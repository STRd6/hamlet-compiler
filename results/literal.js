(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["literal"] = function(data) {
    return (function() {
      var __each, __element, __observeAttribute, __observeText, __on, __pop, __push, __with, _ref;
      _ref = Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with;
      __push(document.createDocumentFragment());
      __element = document.createTextNode('');
      __observeText(__element, "<literal>");
      __push(__element);
      __pop();
      __element = document.createTextNode('');
      __observeText(__element, "<wat>");
      __push(__element);
      __pop();
      __element = document.createTextNode('');
      __observeText(__element, "</wat>");
      __push(__element);
      __pop();
      __element = document.createTextNode('');
      __observeText(__element, "</literal>");
      __push(__element);
      __pop();
      __element = document.createTextNode('');
      __observeText(__element, "<yolo></yolo>");
      __push(__element);
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
