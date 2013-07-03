(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["test"] = function(data) {
    return (function() {
      var __buffer;
      __buffer = [];
      __buffer.push("<literal>");
      __buffer.push("</literal>");
      __buffer.push("<yolo></yolo>");
      return __buffer.join("");
    }).call(data);
  };

}).call(this);
