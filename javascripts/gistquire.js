(function() {
  module.exports = {
    accessToken: null,
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
