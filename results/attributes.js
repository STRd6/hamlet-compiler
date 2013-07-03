(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["test"] = function(data) {
    return (function() {
      var __buffer;
      __buffer = [];
      __buffer.push("<div id=\"" + this.id + "\" class=\"yolo cool cat\" data-test=\"test\" dude=\"" + this.test + "\">");
      __buffer.push("<div />");
      __buffer.push("<div id=\"" + test + "\" class=\"yolo2 " + this.duder + "\">");
      __buffer.push("<div />");
      return __buffer.join("");
    }).call(data);
  };

}).call(this);
