(function() {
  module.exports = {
    accessToken: null,
    update: function(id, data, callback) {
      var url;
      url = "https://api.github.com/gists/" + id;
      if (this.accessToken) {
        url += "?access_token=" + this.accessToken;
      }
      return $.ajax({
        url: url,
        type: "PATCH",
        dataType: 'json',
        data: data,
        success: callback
      });
    },
    create: function(data, callback) {
      var url;
      url = "https://api.github.com/gists";
      if (this.accessToken) {
        url += "?access_token=" + this.accessToken;
      }
      return $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        data: data,
        success: callback
      });
    },
    get: function(id, callback) {
      var data;
      if (this.accessToken) {
        data = {
          access_token: this.accessToken
        };
      } else {
        data = {};
      }
      return $.getJSON("https://api.github.com/gists/" + id, data, callback);
    },
    load: function(id, _arg) {
      var callback, file;
      file = _arg.file, callback = _arg.callback;
      if (file == null) {
        file = "build.js";
      }
      return this.get(id, function(data) {
        Function(data.files[file])();
        return callback();
      });
    }
  };

}).call(this);
