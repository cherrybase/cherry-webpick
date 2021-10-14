import { CONFIG, APP_CONSTANTS, EVENT_NAME_CONSTANTS, EVENT_URL_CONSTANTS } from "./config";
import { utils, _ } from "./utils";
import LoggerService from "./logger";
import ApiService from "./fetch";
import { getPersistence } from "./persistence";
import { getClientFp, getUaDerivedProperties } from "./clientInfo";

export var _logger = {}; // initiated only when app is initiated. Had to pull out to global context.

export default function () {
  // properties uplifted instead of binding to context
  var _options = {};
  var _persist = {};
  var _api = {};
  var globalInstance = {
    init: async function (options) {
      ensureValidOptions(options);

      _options["consumerKey"] = options["consumerKey"];
      _options["appVersion"] = options["appVersion"];
      _options["enableSPA"] = options["enableSPA"];
      _options["host"] =
        options["host"] || APP_CONSTANTS.HOST + APP_CONSTANTS.SERVLET_CONTEXT;
      _options["disableReferrer"] = options["disableReferrer"];
      _options["callback"] = options["callback"];

      // storage persistence based options. [cookie, localStorage, none]
      _options["persistence"] = options["persistence"] || "localStorage";
      _options["persistence_key_prefix"] =
        options["persistenceKeyPrefix"] || ``;

      // below persistence options only applies to cookie.
      _options["cross_site_cookie"] = options["crossSiteCookie"] || false;
      _options["cross_subdomain_cookie"] =
        options["crossSubdomainCookie"] === false ? false : true; // the default value for this is true.
      _options["cookie_expiration"] = options["cookieExpiration"] || 365;
      _options["secure_cookie"] = options["secureCookie"] || false;
      _options["cookie_domain"] = options["cookieDomain"] || "";

      _options["logLevel"] = options["logLevel"] || LoggerService.NONE;
      _options["logPrefix"] =
        options["logPrefix"] ||
        `${CONFIG.LIB_NAME}__v${CONFIG.LIB_VERSION}`;

      _logger = new LoggerService(_options);
      _api = new ApiService({
        prefix: _options["host"],
      });
      _persist = getPersistence(_options);

      if (!window) {
        _logger.critical(
          "This library need to be initiated on the client side"
        );
      }
      if (_options["enableSPA"]) {
        loadRouteListeners();
      }

      try {
        _options.uuid = _persist.get("uuId"); //TODO-V need to remove
        _options.signature = _persist.get("signature");
      } catch (err) {
        _logger.info("error loading saved data from local storage");
      }

      try {
        _options.clientFp = await getClientFp();
      } catch (err) {
        _logger.error("error loading fingerprint");
      }

      try {
        await heartBeat();
        _logger.info("app initiation successful");
      } catch (error) {
        _logger.critical("app initiation unsuccessful");
      }
    },
    trackEvent: async function (eventName, eventData = {}, options = {}) {
      if (!eventName)
        throw new Error("Event name is required to track an event");
      try {
        await _api.post(
          `${EVENT_URL_CONSTANTS.TRACK_EVENT}`,
          {
            eventName,
            eventData,
          },
          {
            headers: {
              consumerKey: _options.consumerKey,
              clientId: _options.clientId,
            },
          }
        );
      } catch (error) {
        throw new Error(error);
      }
    },
    pageVisited: function (eventData = {}, options = {}) {
      this.trackEvent(EVENT_NAME_CONSTANTS.PAGE_VISITED, eventData, options);
    },
  };

  function ensureValidOptions(options) {
    if (!options) throw new Error("options are required by sdk");
    if (!options["consumerKey"])
      throw new Error(
        "Consumer key is required. Please obtain it through your settings at www.cherrybase.com"
      );
  }

  function loadRouteListeners() {
    /**
     * Note that just calling history.pushState() or history.replaceState() won't trigger a popstate event.
     * The popstate event will be triggered by doing a browser action such as a
     * click on the back or forward button (or calling history.back() or history.forward() in JavaScript).
     */
    addEventListener("popstate", function () {
      console.log("popstate listener", arguments);
    });
    addEventListener("hashchange", function () {
      console.log("hashchange listener", arguments);
    });
    history.pushState = ((f) =>
      function pushState() {
        var ret = f.apply(this, arguments);
        console.log("custom pushState", arguments);
        dispatchEvent(new Event("pushstate", {__arguments: arguments}));
        return ret;
      })(history.pushState);
    addEventListener("pushstate", function () {
      console.log("pushstate listener", arguments);
    });
    history.replaceState = ((f) =>
      function replaceState() {
        var ret = f.apply(this, arguments);
        console.log("custom replacestate", arguments);
        dispatchEvent(new Event("replacestate", {__arguments: arguments}));
        return ret;
      })(history.replaceState);
    addEventListener("replacestate", function () {
      console.log("replacestate listener", arguments);
    });
  }

  async function heartBeat() {
    try {
      let clientProperties = getUaDerivedProperties();
      let response = await _api.post(
        `${EVENT_URL_CONSTANTS.HEARTBEAT}`,
        {
          sdkVersion: CONFIG.LIB_VERSION,
          clientFp: _options.clientFp,
          signature: _options.signature,
          clientProperties: {
            appVersion: _options.appVersion,
            ...clientProperties
          },
          uuId: _options.uuid || {
            //TODO-V need to remove
            value: null,
          },
        },
        {
          headers: {
            consumerKey: _options.consumerKey,
          },
        }
      );
      let { clientId, signature, uuId } = response.results[0];
      _options.clientId = clientId;
      _persist.set("signature", signature || "");
      _persist.set("uuId", uuId) || ""; //TODO-V need to remove
      _options.signature = signature;
      _options.uuid = uuId; //TODO-V need to remove
      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  return globalInstance;
}

/**
 * Rollup will bundle out an AMD (IIFE) format file
 * that will expose a global variable on client which will contain properties returned from this (entry / app.js) file's default function.
 */
