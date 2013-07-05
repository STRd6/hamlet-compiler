(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["literal"] = function(data) {
    return (function() {
      var __element, __observeAttribute, __observeText, __pop, __push, _ref;
      _ref = Runtime(), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText;
      __push(document.createDocumentFragment());
      __element = document.createTextNode("<literal>");
      __observeText(__element, "<literal>");
      __push(__element);
      __pop();
      __element = document.createTextNode("</literal>");
      __observeText(__element, "</literal>");
      __push(__element);
      __pop();
      __element = document.createTextNode("<yolo></yolo>");
      __observeText(__element, "<yolo></yolo>");
      __push(__element);
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
