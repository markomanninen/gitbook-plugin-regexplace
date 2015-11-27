"use strict";

var patterns = [];

module.exports =
{
  hooks: {
    "init": function() {
      var options = this.options.pluginsConfig['regexplace'] || {};
      // collects text replacements from plugin configuration
      options.substitutes.forEach(function (option) {
        patterns.push({re: new RegExp(option.pattern, option.flags || ''), sub: option.substitute});
      });
    },
    "page": function(page) {
      page.sections.filter(function(section) {
        return section.type == 'normal';
      })
      .forEach(function (section) {
        patterns.forEach(function (pattern) {
          // replace page section content with substitutes
          section.content = section.content.replace(pattern.re, pattern.sub);
        });
      });
      return page;
    }
  }
};
