"use strict";

var Q = require('q');

var store = {};
var patterns = [];
var regex_page_level = new RegExp('_PAGE_LEVEL_', 'g');
var regex_page_path = new RegExp('_PAGE_PATH_', 'g');
var regex_index = new RegExp('_INDEX_', 'g');
var chars = {quot: 34, amp: 38, lt: 60, gt: 62, nbsp: 160, 'xA9': 169, copy: 169, reg: 174, deg: 176, frasl: 47, trade: 8482, euro: 8364, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, permil: 8240, lsaquo: 8249, rsaquo: 8250, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830, oline: 8254, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, hellip: 133, ndash: 150, mdash: 151, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, brkbar: 166, sect: 167, uml: 168, die: 168, ordf: 170, laquo: 171, not: 172, shy: 173, macr: 175, hibar: 175, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Alpha: 913, alpha: 945, Beta: 914, beta: 946, Gamma: 915, gamma: 947, Delta: 916, delta: 948, Epsilon: 917, epsilon: 949, Zeta: 918, zeta: 950, Eta: 919, eta: 951, Theta: 920, theta: 952, Iota: 921, iota: 953, Kappa: 922, kappa: 954, Lambda: 923, lambda: 955, Mu: 924, mu: 956, Nu: 925, nu: 957, Xi: 926, xi: 958, Omicron: 927, omicron: 959, Pi: 928, pi: 960, Rho: 929, rho: 961, Sigma: 931, sigma: 963, Tau: 932, tau: 964, Upsilon: 933, upsilon: 965, Phi: 934, phi: 966, Chi: 935, chi: 967, Psi: 936, psi: 968, Omega: 937, omega: 969}
var vars = 'variables';
var removeFirstPartsInSectionNumber;

var decodeHtmlEntities = function(str) {
  // https://mathiasbynens.be/notes/javascript-escapes
  return str.replace(/\&\#?(\w+);/g, function(match, dec) {
    if (isNaN(dec)) {
        return chars[dec] !== undefined ? String.fromCharCode(chars[dec]) : match;
    }
    return String.fromCharCode(dec);
  });
};

var collectStore = function(page, that, pageHook) {
  var content = page.content;
  var path = page.path;
  var level = page.level;
  if (removeFirstPartsInSectionNumber) {
    level = level.replace(/^1./, '');
  }
  // iterate regular expression patterns
  patterns.forEach(function (pattern) {

      var variables = that.config.get(vars);
      if (pattern.store && pattern.store.variable_name && !pattern.store.key && !variables[pattern.store.variable_name])
        variables[pattern.store.variable_name] = [];
      if (pattern.store && pattern.store.variable_name && pattern.store.key && !variables[pattern.store.variable_name])
        variables[pattern.store.variable_name] = {};

      var match;
      var i = 0;
      var regex = pattern.re;

      // get matches from content
      while (match = regex.exec(content)) {
          i += 1;
          var sub, sub2, subkey;
          // use temporary storage if configured so
          if (!pageHook && pattern.store && pattern.store.substitute) {
            sub2 = pattern.store.substitute.replace(regex_index, i);
            sub2 = sub2.replace(regex_page_level, level);
            sub2 = sub2.replace(regex_page_path, path);
          }
          // prepare the storage key if configured so
          if (!pageHook && pattern.store && pattern.store.key) {
            subkey = pattern.store.key.replace(regex_index, i);
            subkey = subkey.replace(regex_page_level, level);
            subkey = subkey.replace(regex_page_path, path);
          }
          // set _INDEX_, _PAGE_LEVEL_ and _PAGE_PATH_ templates
          sub = pattern.sub.replace(regex_index, i);
          sub = sub.replace(regex_page_level, level);
          sub = sub.replace(regex_page_path, path);
          // find $n replacement parts from substitute string, on all substitutions
          for (var c = 1; c < match.length; c++) {
            var $ = '\$'+c;
            var count = sub.split($).length;
            for (var d = 0; d < count; d++) {
              sub = sub.replace($, match[c]);
            }
            if (!pageHook && sub2) {
              count = sub2.split($).length;
              for (d = 0; d < count; d++) {
                sub2 = sub2.replace($, match[c]);
              }
            }
            if (!pageHook && subkey) {
              count = subkey.split($).length;
              for (d = 0; d < count; d++) {
                subkey = subkey.replace($, match[c]);
              }
            }
          }
          // if storage is used
          if (!pageHook && sub2) {
            if (pattern.decode) sub2 = decodeHtmlEntities(sub2);
            if (pattern.store.lower) sub2 = sub2.toLowerCase();
            // Storage can be map-based with a key or array-based
            if(pattern.store.key) {
              if (!pattern.store.unique || !variables[pattern.store.variable_name][subkey]) {
                variables[pattern.store.variable_name][subkey] = sub2;
              }
            } else {
              if (!pattern.store.unique || variables[pattern.store.variable_name].indexOf(sub2) < 0) {
                variables[pattern.store.variable_name].push(sub2);
              }
            }
          }
          // repeatingly replace content
          content = match.input.replace(match[0], (pattern.decode ? decodeHtmlEntities(sub) : sub), match.index);
          if (!pattern.unreset) regex.lastIndex = 0;
      }
  });
  // finally replace section content with processed content
  if (pageHook) page.content = content;
};

function processPages(that) {
  var promises = [];
  that.summary.walk(function (page) {
    var pageText = that.readFileAsString(page.ref);
    promises.push(pageText.then(function (pageContent) {
      page.content = pageContent;
      return [collectStore(page, that)];
    }));
  }, Q());
  return Q.all(promises);
}

module.exports =
{
  hooks: {
    "init": function() {
      var options = this.config.get('pluginsConfig')['regexplace'] || {};
      removeFirstPartsInSectionNumber = options.removeFirstPartsInSectionNumber;
      options.substitutes = options.substitutes || {};
      // collects text replacement queries from plugin configuration
      options.substitutes.forEach(function (option) {
        patterns.push({re: new RegExp(option.pattern, option.flags || ''), 
                       sub: option.substitute,
                       decode: option.decode || false,
                       store: option.store || null,
                       unreset: option.unreset || false});
      });
      this.config.set(vars, this.config.get(vars) || {});
      return processPages(this);
    },
    "page": function(page) {
      // modifies page content
      collectStore(page, this, true);
      return page;
    }
  }
};
