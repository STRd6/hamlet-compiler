(function(data) {
  return (function() {
    var __attribute, __each, __filter, __on, __pop, __push, __render, __runtime, __text, __with, _ref;
    _ref = __runtime = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __filter = _ref.__filter, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
    __push(document.createDocumentFragment());
    __push(document.createTextNode(''));
    __text("!!!\n");
    __pop();
    __push(document.createElement("html"));
    __push(document.createElement("head"));
    __push(document.createElement("title"));
    __push(document.createTextNode(''));
    __text("Ravel | " + this.name + "'s photo tagged " + this.tag + "\n");
    __pop();
    __pop();
    this.props.each(function(key, value) {
      __push(document.createElement("meta"));
      __attribute("property", key);
      __attribute("content", value);
      return __pop();
    });
    __push(document.createElement("link"));
    __attribute("href", "/images/favicon.ico");
    __attribute("rel", "icon");
    __attribute("type", "image/x-icon");
    __pop();
    __push(document.createElement("link"));
    __attribute("rel", "stylesheet");
    __attribute("href", "/stylesheets/normalize.css");
    __pop();
    __push(document.createElement("link"));
    __attribute("rel", "stylesheet");
    __attribute("href", "/stylesheets/bootstrap.min.css");
    __pop();
    __push(document.createElement("link"));
    __attribute("rel", "stylesheet");
    __attribute("href", "/stylesheets/main.css");
    __pop();
    __push(document.createElement("script"));
    __attribute("src", "//use.typekit.net/ghp4eka.js");
    __pop();
    
      try{Typekit.load();}catch(e){}
      
      
    ;
    __pop();
    __push(document.createElement("body"));
    __push(document.createElement("div"));
    __runtime.classes("facebook");
    __push(document.createElement("header"));
    __push(document.createElement("h1"));
    __runtime.classes("hide-text");
    __push(document.createTextNode(''));
    __text("Ravel\n");
    __pop();
    __pop();
    __pop();
    __push(document.createElement("div"));
    __runtime.classes("content");
    __push(document.createElement("div"));
    __runtime.classes("container");
    __push(document.createElement("div"));
    __runtime.classes("individual");
    __push(document.createElement("div"));
    __runtime.classes("user-container", "clearfix");
    __push(document.createElement("div"));
    __runtime.classes("left");
    __push(document.createElement("div"));
    __runtime.classes("user-image");
    __push(document.createElement("img"));
    __attribute("src", this.profile_picture_url);
    __pop();
    __pop();
    __push(document.createElement("div"));
    __runtime.classes("user-info");
    __push(document.createElement("span"));
    __runtime.classes("name");
    __push(document.createTextNode(''));
    __text(this.name);
    __pop();
    __pop();
    __push(document.createElement("span"));
    __runtime.classes("info");
    __push(document.createTextNode(''));
    __text(this.gender_and_age);
    __pop();
    __pop();
    __push(document.createElement("span"));
    __runtime.classes("location", "info");
    __push(document.createTextNode(''));
    __text(this.location);
    __pop();
    __pop();
    __push(document.createElement("span"));
    __runtime.classes("tag");
    __push(document.createTextNode(''));
    __text(this.tag);
    __pop();
    __pop();
    __pop();
    __pop();
    __push(document.createElement("div"));
    __runtime.classes("right");
    __push(document.createElement("span"));
    __runtime.classes("pins");
    __push(document.createElement("img"));
    __attribute("src", "/images/pins@2x.png");
    __pop();
    __push(document.createTextNode(''));
    __text(this.pins);
    __pop();
    __pop();
    __push(document.createElement("span"));
    __runtime.classes("likes");
    __push(document.createElement("img"));
    __attribute("src", "/images/likes@2x.png");
    __pop();
    __push(document.createTextNode(''));
    __text(this.likes);
    __pop();
    __pop();
    __pop();
    __pop();
    __push(document.createElement("div"));
    __runtime.classes("photo-container");
    __push(document.createElement("img"));
    __attribute("src", this.photo_url);
    __pop();
    __pop();
    __pop();
    __push(document.createElement("div"));
    __runtime.classes("download-button");
    __push(document.createElement("a"));
    __runtime.classes("button", "appstore");
    __attribute("href", "http://itunes.apple.com/us/app/ravel!/id610859881?ls=1&mt=8");
    __pop();
    __pop();
    __pop();
    __pop();
    __pop();
    __pop();
    __pop();
    return __pop();
  }).call(data);
});
