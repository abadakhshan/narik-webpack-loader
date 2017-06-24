
var loaderUtils = require("loader-utils");

// using: regex, capture groups, and capture group variables.
var baseTemplateUrlRegex = /baseTemplateUrl\s*:(\s*['"`](.*?)['"`]\s*([,}]))/gm;
var stringRegex = /(['`"])((?:[^\\]\\\1|.)*?)\1/g;

function replaceStringsWithRequires(string) {
  return string.replace(stringRegex, function (match, quote, url) {
    if (url.charAt(0) !== ".") {
      url = "./" + url;
    }
    return "require('" + url + "')";
  });
}

module.exports = function(source, sourcemap) {

  var config = {};
  var query = loaderUtils.parseQuery(this.query);
  var baseTemplateProperty = 'baseTemplate';

  if (this.options != null) {
    Object.assign(config, this.options['narikWebpackLoader']);
  }

  Object.assign(config, query);

  if (config.keepUrl === true) {
      baseTemplateProperty = 'baseTemplateUrl';
  }

    // Not cacheable during unit tests;
  this.cacheable && this.cacheable();

  var newSource = source.replace(templateUrlRegex, function (match, url) {
                 // replace: templateUrl: './path/to/template.html'
                 // with: template: require('./path/to/template.html')
                 // or: templateUrl: require('./path/to/template.html')
                 // if `keepUrl` query parameter is set to true.
                 return baseTemplateProperty + ":" + replaceStringsWithRequires(url);
               });

  // Support for tests
  if (this.callback) {
    this.callback(null, newSource, sourcemap)
  } else {
    return newSource;
  }
};
