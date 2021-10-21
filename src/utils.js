var _ = {
  trim: function (str) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  },

  /*
   *  method to determine whether or not the passed variable is a function
   *
   *  @method isFunction
   *  @public
   *  @params {any} f - any variable
   *  @return {boolean} Returns true or false
   */
  isFunction: function (f) {
    return f && f !== null && typeof f === "function";
  },

  /**
   * Check if n is a float.
   */
  isFloat: function (n) {
    return n === +n && n !== (n | 0);
  },

  /**
   * Check if n is an integer.
   */
  isInt: function (n) {
    return n === +n && n === (n | 0);
  },

  includes: function (str, needle) {
    return str.indexOf(needle) !== -1;
  },

  strip_empty_properties: function (p) {
    var ret = {};
    forEach(p, function (v, k) {
      if (_.isString(v) && v.length > 0) {
        ret[k] = v;
      }
    });
    return ret;
  },

  isArray:
    Array.isArray ||
    function (obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    },

  isObject: function (obj) {
    return obj === Object(obj) && !_.isArray(obj);
  },

  isEmptyObject: function (obj) {
    if (_.isObject(obj)) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          return false;
        }
      }
      return true;
    }
    return false;
  },

  isUndefined: function (obj) {
    return obj === void 0;
  },

  isString: function (obj) {
    return Object.prototype.toString.call(obj) == "[object String]";
  },

  isDate: function (obj) {
    return Object.prototype.toString.call(obj) == "[object Date]";
  },

  isNumber: function (obj) {
    return Object.prototype.toString.call(obj) == "[object Number]";
  },

  isElement: function (obj) {
    return !!(obj && obj.nodeType === 1);
  },
};

var utils = {
  _no_op: function () {},

  /**
   * Serialize a JSON object into a key=value pairs
   *
   * @method serializeParams
   * @private
   * @param object JSON object of parameters and their values
   * @return {string} Serialized parameters in the form of a query string
   */
  serializeParams: function (params) {
    var str = "";
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        if (str !== "") str += "&";
        str += key + "=" + params[key];
      }
    }
    return str;
  },

  /*
   *  method to encode the query string parameters
   *
   *  @method encodeParams
   *  @public
   *  @params {object} params - an object of name value pairs that will be urlencoded
   *  @return {string} Returns the encoded string
   */
  encodeParams: function (params) {
    var queryString;
    if (params && Object.keys(params)) {
      queryString = [].slice
        .call(arguments)
        .reduce(function (a, b) {
          return a.concat(b instanceof Array ? b : [b]);
        }, [])
        .filter(function (c) {
          return "object" === typeof c;
        })
        .reduce(function (p, c) {
          !(c instanceof Array)
            ? (p = p.concat(
                Object.keys(c).map(function (key) {
                  return [key, c[key]];
                })
              ))
            : p.push(c);
          return p;
        }, [])
        .reduce(function (p, c) {
          c.length === 2 ? p.push(c) : (p = p.concat(c));
          return p;
        }, [])
        .reduce(function (p, c) {
          c[1] instanceof Array
            ? c[1].forEach(function (v) {
                p.push([c[0], v]);
              })
            : p.push(c);
          return p;
        }, [])
        .map(function (c) {
          c[1] = encodeURIComponent(c[1]);
          return c.join("=");
        })
        .join("&");
    }
    return queryString;
  },

  params: function (obj) {
    let app = {},
      class2type = {},
      toString = class2type.toString,
      r20 = /%20/g,
      rbracket = /\[\]$/;
    function type(obj) {
      if (obj == null) {
        return obj + "";
      }
      // Support: Android < 4.0, iOS < 6 (functionish RegExp)
      return typeof obj === "object" || typeof obj === "function"
        ? class2type[toString.call(obj)] || "object"
        : typeof obj;
    }
    function isFunction(obj) {
      return type(obj) === "function";
    }
    function buildParams(prefix, obj, add) {
      var name, key, value;

      if (Array.isArray(obj)) {
        for (var key in obj) {
          value = obj[key];
          if (rbracket.test(prefix)) add(prefix, value);
          else
            buildParams(
              prefix + "[" + (typeof v === "object" ? i : "") + "]",
              value,
              add
            );
        }
      } else if (type(obj) === "object") {
        for (name in obj)
          buildParams(prefix + "[" + name + "]", obj[name], add);
      } else add(prefix, obj);
    }
    function param(obj) {
      var prefix,
        key,
        value,
        serialized = [],
        add = function (key, value) {
          value = isFunction(value) ? value() : value == null ? "" : value;
          serialized[serialized.length] =
            encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };

      if (Array.isArray(obj)) {
        for (key in obj) {
          value = obj[key];
          add(key, value);
        }
      } else {
        for (prefix in obj) buildParams(prefix, obj[prefix], add);
      }
      return serialized.join("&").replace(r20, "+");
    }
    return param(obj);
  },

  uuid: (function () {
    // Time/ticks information
    // 1*new Date() is a cross browser version of Date.now()
    var T = function () {
      var d = 1 * new Date(),
        i = 0;

      // this while loop figures how many browser ticks go by
      // before 1*new Date() returns a new number, ie the amount
      // of ticks that go by per millisecond
      while (d == 1 * new Date()) {
        i++;
      }

      return d.toString(16) + i.toString(16);
    };

    // Math.Random entropy
    var R = function () {
      return Math.random().toString(16).replace(".", "");
    };

    // User agent entropy
    // This function takes the user agent string, and then xors
    // together each sequence of 8 bytes.  This produces a final
    // sequence of 8 bytes which it returns as hex.
    var UA = function () {
      var ua = window.navigator.userAgent,
        i,
        ch,
        buffer = [],
        ret = 0;

      function xor(result, byte_array) {
        var j,
          tmp = 0;
        for (j = 0; j < byte_array.length; j++) {
          tmp |= buffer[j] << (j * 8);
        }
        return result ^ tmp;
      }

      for (i = 0; i < ua.length; i++) {
        ch = ua.charCodeAt(i);
        buffer.unshift(ch & 0xff);
        if (buffer.length >= 4) {
          ret = xor(ret, buffer);
          buffer = [];
        }
      }

      if (buffer.length > 0) {
        ret = xor(ret, buffer);
      }

      return ret.toString(16);
    };

    return function () {
      var se = (screen.height * screen.width).toString(16);
      return T() + "-" + R() + "-" + UA() + "-" + se;
    };
  })(),

  cheap_guid: function (maxlen) {
    var guid =
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10);
    return maxlen ? guid.substring(0, maxlen) : guid;
  },

  // localStorage
  localStorage: {
    error: function (msg) {
      console.error("localStorage error: " + msg);
    },

    is_supported: function () {
      if (typeof Storage !== "undefined") {
        return true;
      } else {
        utils.localStorage.error("unsupported; falling back to cookie store");
        return false;
      }
    },

    set: function (key, value) {
      try {
        if (!key || !value) {
          return;
        }
        if (typeof value === "object") {
          value = JSON.stringify(value);
        }
        window.localStorage.setItem(key, value);
      } catch (err) {
        utils.localStorage.error(err);
      }
    },

    setObject: function (key, value) {
      utils.localStorage.set(key, JSON.stringify(value));
    },

    get: function (key) {
      try {
        var value = window.localStorage.getItem(key);
        if (!value) {
          return null;
        }
        if (value[0] === "{" || value[0] === "[") {
          // very naive way to determine the value was stringyfied
          value = JSON.parse(value);
        }
        return value;
      } catch (err) {
        utils.localStorage.error(err);
      }
      return null;
    },

    getObject: function (key) {
      var value = utils.localStorage.get(key);
      return value && JSON.parse(value);
    },

    remove: function (key) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        utils.localStorage.error(err);
      }
    },

    clear: function () {
      try {
        window.localStorage.clear();
      } catch (err) {
        utils.localStorage.error(err);
      }
    },
  },

  // cookie
  // Methods partially borrowed from quirksmode.org/js/cookies.html
  cookie: {
    get: function (name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    },

    set: function (
      name,
      value,
      days,
      is_cross_subdomain,
      is_secure,
      is_cross_site,
      domain_override
    ) {
      if(!value) return;
      if (typeof value === "object") {
        // value = JSON.stringify(value);
        return; //avoiding to store objects
      }

      var cdomain = "",
        expires = "",
        secure = "";

      if (domain_override) {
        cdomain = "; domain=" + domain_override;
      } else if (is_cross_subdomain) {
        var domain = extract_domain(document.location.hostname);
        cdomain = domain ? "; domain=." + domain : "";
      }

      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toGMTString();
      }

      if (is_cross_site) {
        is_secure = true;
        secure = "; SameSite=None";
      }
      if (is_secure) {
        secure += "; secure";
      }

      document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        expires +
        "; path=/" +
        cdomain +
        secure;
    },

    set_seconds: function (
      name,
      value,
      seconds,
      is_cross_subdomain,
      is_secure,
      is_cross_site,
      domain_override
    ) {
      if(!value) return;
      if (typeof value === "object") {
        // value = JSON.stringify(value);
        return; //avoiding to store objects
      }

      var cdomain = "",
        expires = "",
        secure = "";

      if (domain_override) {
        cdomain = "; domain=" + domain_override;
      } else if (is_cross_subdomain) {
        var domain = extract_domain(document.location.hostname);
        cdomain = domain ? "; domain=." + domain : "";
      }

      if (seconds) {
        var date = new Date();
        date.setTime(date.getTime() + seconds * 1000);
        expires = "; expires=" + date.toGMTString();
      }

      if (is_cross_site) {
        is_secure = true;
        secure = "; SameSite=None";
      }
      if (is_secure) {
        secure += "; secure";
      }

      document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        expires +
        "; path=/" +
        cdomain +
        secure;
    },

    remove: function (name, is_cross_subdomain, domain_override) {
      utils.cookie.set(
        name,
        "",
        -1,
        is_cross_subdomain,
        false,
        false,
        domain_override
      );
    },

    clear: function () {},
  },

  info: {
    // https://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-details-using-javascript
    /**
     * This function detects which browser is running this script.
     * The order of the checks are important since many user agents
     * include key words used in later checks.
     */
    browser: function (user_agent, vendor, opera) {
      user_agent = user_agent || window.navigator.userAgent;
      vendor = vendor || window.navigator.vendor || ""; // vendor is undefined for at least IE9
      opera = opera || window.opera;

      if (opera || _.includes(user_agent, " OPR/")) {
        if (_.includes(user_agent, "Mini")) {
          return "Opera Mini";
        }
        return "Opera";
      } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
        return "BlackBerry";
      } else if (
        _.includes(user_agent, "IEMobile") ||
        _.includes(user_agent, "WPDesktop")
      ) {
        return "Internet Explorer Mobile";
      } else if (_.includes(user_agent, "Edge")) {
        return "Microsoft Edge";
      } else if (_.includes(user_agent, "FBIOS")) {
        return "Facebook Mobile";
      } else if (_.includes(user_agent, "Chrome")) {
        return "Chrome";
      } else if (_.includes(user_agent, "CriOS")) {
        return "Chrome iOS";
      } else if (
        _.includes(user_agent, "UCWEB") ||
        _.includes(user_agent, "UCBrowser")
      ) {
        return "UC Browser";
      } else if (_.includes(user_agent, "FxiOS")) {
        return "Firefox iOS";
      } else if (_.includes(vendor, "Apple")) {
        if (_.includes(user_agent, "Mobile")) {
          return "Mobile Safari";
        }
        return "Safari";
      } else if (_.includes(user_agent, "Android")) {
        return "Android Mobile";
      } else if (_.includes(user_agent, "Konqueror")) {
        return "Konqueror";
      } else if (_.includes(user_agent, "Firefox")) {
        return "Firefox";
      } else if (
        _.includes(user_agent, "MSIE") ||
        _.includes(user_agent, "Trident/")
      ) {
        return "Internet Explorer";
      } else if (_.includes(user_agent, "Gecko")) {
        return "Mozilla";
      } else {
        return "";
      }
    },

    /**
     * This function detects which browser version is running this script,
     * parsing major and minor version (e.g., 42.1). User agent strings from:
     * http://www.useragentstring.com/pages/useragentstring.php
     */
    browserVersion: function (userAgent, vendor, opera) {
      userAgent = userAgent || window.navigator.userAgent;
      vendor = vendor || window.navigator.vendor || ""; // vendor is undefined for at least IE9
      opera = opera || window.opera;

      var browser = utils.info.browser(userAgent, vendor, opera);

      var versionRegexs = {
        "Internet Explorer Mobile": /rv:(\d+(\.\d+)?)/,
        "Microsoft Edge": /Edge\/(\d+(\.\d+)?)/,
        Chrome: /Chrome\/(\d+(\.\d+)?)/,
        "Chrome iOS": /CriOS\/(\d+(\.\d+)?)/,
        "UC Browser": /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
        Safari: /Version\/(\d+(\.\d+)?)/,
        "Mobile Safari": /Version\/(\d+(\.\d+)?)/,
        Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
        Firefox: /Firefox\/(\d+(\.\d+)?)/,
        "Firefox iOS": /FxiOS\/(\d+(\.\d+)?)/,
        Konqueror: /Konqueror:(\d+(\.\d+)?)/,
        BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
        "Android Mobile": /android\s(\d+(\.\d+)?)/,
        "Internet Explorer": /(rv:|MSIE )(\d+(\.\d+)?)/,
        Mozilla: /rv:(\d+(\.\d+)?)/,
      };
      var regex = versionRegexs[browser];
      if (regex === undefined) {
        return null;
      }
      var matches = userAgent.match(regex);
      if (!matches) {
        return null;
      }
      return parseFloat(matches[matches.length - 2]);
    },

    os: function (userAgent) {
      userAgent = userAgent || window.navigator.userAgent;
      if (/Windows/i.test(userAgent)) {
        if (/Phone/.test(userAgent) || /WPDesktop/.test(userAgent)) {
          return "Windows Phone";
        }
        return "Windows";
      } else if (/(iPhone|iPad|iPod)/.test(userAgent)) {
        return "iOS";
      } else if (/Android/.test(userAgent)) {
        return "Android";
      } else if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
        return "BlackBerry";
      } else if (/Mac/i.test(userAgent)) {
        return "Mac OS X";
      } else if (/Linux/.test(userAgent)) {
        return "Linux";
      } else {
        return "";
      }
    },

    device: function (user_agent) {
      user_agent = user_agent || window.navigator.userAgent;
      if (/Windows Phone/i.test(user_agent) || /WPDesktop/.test(user_agent)) {
        return "Windows Phone";
      } else if (/iPad/.test(user_agent)) {
        return "iPad";
      } else if (/iPod/.test(user_agent)) {
        return "iPod Touch";
      } else if (/iPhone/.test(user_agent)) {
        return "iPhone";
      } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
        return "BlackBerry";
      } else if (/Android/.test(user_agent)) {
        return "Android";
      } else {
        return "";
      }
    },

    deviceType: function (user_agent) {
      user_agent = user_agent || window.navigator.userAgent;
      const isMobi = /Mobi/i.test(user_agent);
      return isMobi ? "MOBILE" : "DESKTOP";
    },

    referringDomain: function (referrer) {
      referrer = referrer || document.referrer;
      var split = referrer.split("/");
      if (split.length >= 3) {
        return split[2];
      }
      return "";
    },

    properties: function () {
      return {
        ua: window.navigator.userAgent,
        os: utils.info.os(),
        browser: utils.info.browser(),
        browser_version: utils.info.browserVersion(),
        // referrer: document.referrer,
        // referring_domain: utils.info.referringDomain(document.referrer),
        device: utils.info.device(),
        deviceType: utils.info.deviceType(),
        screen_height: screen.height,
        screen_width: screen.width,
        current_url: window.location.href,
        channel: "WEB"
      };
    },
  },
};

// naive way to extract domain name (example.com) from full hostname (my.sub.example.com)
var SIMPLE_DOMAIN_MATCH_REGEX = /[a-z0-9][a-z0-9-]*\.[a-z]+$/i;
// this next one attempts to account for some ccSLDs, e.g. extracting oxford.ac.uk from www.oxford.ac.uk
var DOMAIN_MATCH_REGEX = /[a-z0-9][a-z0-9-]+\.[a-z.]{2,6}$/i;
/**
 * Attempts to extract main domain name from full hostname, using a few blunt heuristics. For
 * common TLDs like .com/.org that always have a simple SLD.TLD structure (example.com), we
 * simply extract the last two .-separated parts of the hostname (SIMPLE_DOMAIN_MATCH_REGEX).
 * For others, we attempt to account for short ccSLD+TLD combos (.ac.uk) with the legacy
 * DOMAIN_MATCH_REGEX (kept to maintain backwards compatibility with existing Moesif
 * integrations). The only _reliable_ way to extract domain from hostname is with an up-to-date
 * list like at https://publicsuffix.org/ so for cases that this helper fails at, the SDK
 * offers the 'cookie_domain' config option to set it explicitly.
 * @example
 * extract_domain('my.sub.example.com')
 * // 'example.com'
 */
var extract_domain = function (hostname) {
  var domain_regex = DOMAIN_MATCH_REGEX;
  var parts = hostname.split(".");
  var tld = parts[parts.length - 1];
  if (tld.length > 4 || tld === "com" || tld === "org") {
    domain_regex = SIMPLE_DOMAIN_MATCH_REGEX;
  }
  var matches = hostname.match(domain_regex);
  return matches ? matches[0] : "";
};

/*
 * Tests if the string is a uuid
 *
 * @public
 * @method isUUID
 * @param {string} uuid The string to test
 * @returns {Boolean} true if string is uuid
 */
var uuidValueRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isUUID(uuid) {
  return !uuid ? false : uuidValueRegex.test(uuid);
}

/**
 * Separator splitter.
 */
var separatorSplitter = /[\W_]+(.|$)/g;
/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */
function unseparate(string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? " " + next : "";
  });
}

/**
 * Camelcase splitter.
 */
var camelSplitter = /(.)([A-Z]+)/g;
/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */
function uncamelize(string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + " " + uppers.toLowerCase().split("").join(" ");
  });
}

/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;
/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */
function toNoCase(string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}

function isJsonHeader(headers) {
  if (headers) {
    if (
      headers["content-type"] &&
      headers["content-type"].indexOf("json") >= 0
    ) {
      return true;
    }
    if (
      headers["Content-Type"] &&
      headers["Content-Type"].indexOf("json") >= 0
    ) {
      return true;
    }
  }
  return false;
}

function isStartJson(body) {
  if (body && typeof body === "string") {
    var trimmedBody = _.trim(body);
    if (trimmedBody.indexOf("[") === 0 || trimmedBody.indexOf("{") === 0) {
      return true;
    }
  }
  return false;
}

module.exports = {
  _,
  utils,
};
