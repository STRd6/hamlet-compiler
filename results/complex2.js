(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["test"] = function(data) {
    return (function() {
      var __buffer;
      __buffer = [];
      __buffer.push("<html>");
      __buffer.push("<head>");
      __buffer.push("<title>");
      __buffer.push("Ravel | " + this.name + "'s photo tagged " + this.tag);
      __buffer.push("<title />");
      this.props.each(function(key, value) {
        return __buffer.push("<meta property=\"" + key + "\" content=\"" + value + "\" />");
      });
      __buffer.push("<link href=\"/images/favicon.ico\" rel=\"icon\" type=\"image/x-icon\" />");
      __buffer.push("<link rel=\"stylesheet\" href=\"/stylesheets/normalize.css\" />");
      __buffer.push("<link rel=\"stylesheet\" href=\"/stylesheets/bootstrap.min.css\" />");
      __buffer.push("<link rel=\"stylesheet\" href=\"/stylesheets/main.css\" />");
      __buffer.push("<script src=\"//use.typekit.net/ghp4eka.js\">");
      __buffer.push("<script />");
      __buffer.push("<script>\n  try{Typekit.load();}catch(e){}\n  \n</script>");
      __buffer.push("<head />");
      __buffer.push("<body>");
      __buffer.push("<div class=\"facebook\">");
      __buffer.push("<header>");
      __buffer.push("<h1 class=\"hide-text\">");
      __buffer.push("Ravel");
      __buffer.push("<h1 />");
      __buffer.push("<header />");
      __buffer.push("<div class=\"content\">");
      __buffer.push("<div class=\"container\">");
      __buffer.push("<div class=\"individual\">");
      __buffer.push("<div class=\"user-container clearfix\">");
      __buffer.push("<div class=\"left\">");
      __buffer.push("<div class=\"user-image\">");
      __buffer.push("<img src=\"" + this.profile_picture_url + "\" />");
      __buffer.push("<div />");
      __buffer.push("<div class=\"user-info\">");
      __buffer.push("<span class=\"name\">");
      __buffer.push("" + this.name);
      __buffer.push("<span />");
      __buffer.push("<span class=\"info\">");
      __buffer.push("" + this.gender_and_age);
      __buffer.push("<span />");
      __buffer.push("<span class=\"location info\">");
      __buffer.push("" + this.location);
      __buffer.push("<span />");
      __buffer.push("<span class=\"tag\">");
      __buffer.push("" + this.tag);
      __buffer.push("<span />");
      __buffer.push("<div />");
      __buffer.push("<div />");
      __buffer.push("<div class=\"right\">");
      __buffer.push("<span class=\"pins\">");
      __buffer.push("<img src=\"/images/pins@2x.png\" />");
      __buffer.push("" + this.pins);
      __buffer.push("<span />");
      __buffer.push("<span class=\"likes\">");
      __buffer.push("<img src=\"/images/likes@2x.png\" />");
      __buffer.push("" + this.likes);
      __buffer.push("<span />");
      __buffer.push("<div />");
      __buffer.push("<div />");
      __buffer.push("<div class=\"photo-container\">");
      __buffer.push("<img src=\"" + this.photo_url + "\" />");
      __buffer.push("<div />");
      __buffer.push("<div />");
      __buffer.push("<div class=\"download-button\">");
      __buffer.push("<a class=\"button appstore\" href=\"http://itunes.apple.com/us/app/ravel!/id610859881?ls=1&mt=8\">");
      __buffer.push("<a />");
      __buffer.push("<div />");
      __buffer.push("<div />");
      __buffer.push("<div />");
      __buffer.push("<div />");
      __buffer.push("<body />");
      __buffer.push("<html />");
      return __buffer.join("");
    }).call(data);
  };

}).call(this);
