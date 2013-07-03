(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["test"] = function(data) {
    return (function() {
      var radicalMessage, __buffer;
      __buffer = [];
      __buffer.push("<select>");
      radicalMessage = "Yolo";
      this.tickets.forEach(function(ticket, i) {
        if (i === 0) {
          __buffer.push("" + radicalMessage);
        }
        __buffer.push("<option>");
        __buffer.push("" + ticket.name);
        return __buffer.push("<option />");
      });
      __buffer.push("<select />");
      return __buffer.join("");
    }).call(data);
  };

}).call(this);
