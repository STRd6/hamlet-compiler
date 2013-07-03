(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["test"] = function(data) {
    return (function() {
      var __buffer;
      __buffer = [];
      __buffer.push("<section id=\"" + main + "\" class=\"container\">");
      __buffer.push("<section />");
      __buffer.push("<h1>");
      __buffer.push("" + post.title);
      __buffer.push("<h1 />");
      __buffer.push("<h2>");
      __buffer.push("" + post.subtitle);
      __buffer.push("<h2 />");
      __buffer.push("<div class=\"content\">");
      __buffer.push("" + post.content);
      __buffer.push("<div />");
      return __buffer.join("");
    }).call(data);
  };

}).call(this);
