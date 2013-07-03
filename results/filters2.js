(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["test"] = function(data) {
    return (function() {
      var __buffer;
      __buffer = [];
      __buffer.push("<script>\n  alert('yolo');\n  \n</script>");
      alert("yolo");
      __buffer.push("<div class=\"duder\">");
      __buffer.push("col");
      __buffer.push("sweets\n");
      __buffer.push("<div />");
      __buffer.push("<div class=\"duder2\">");
      __buffer.push("cool");
      __buffer.push("<div />");
      return __buffer.join("");
    }).call(data);
  };

}).call(this);
