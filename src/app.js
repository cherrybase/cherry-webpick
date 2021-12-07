import {
  CONFIG,
  APP_CONSTANTS,
  EVENT_NAME_CONSTANTS,
  EVENT_URL_CONSTANTS,
} from "./config";
import { utils, _ } from "./utils";
import LoggerService from "./logger";
import ApiService from "./fetch";
import { getPersistence } from "./persistence";
import { getClientFp, getUaDerivedProperties } from "./clientInfo";

export default function () {
  // properties uplifted instead of binding to context.
  var _options = {};
  var _persist = {};
  var _logger = {};
  var _api = {};
  var globalInstance = {
    init: async function (options) {
      ensureValidOptions(options);

      _options["consumerKey"] = options["consumerKey"];
      _options["appVersion"] = options["appVersion"];
      _options["trackAppRoutes"] = options["trackAppRoutes"];
      if (
        !["AUTO", "MANUAL"].includes(
          (options["trackAppRoutes"] || "").toUpperCase()
        )
      )
        _options["trackAppRoutes"] = "MANUAL";
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
        options["logPrefix"] || `${CONFIG.LIB_NAME}__v${CONFIG.LIB_VERSION}`;

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
      if (_options["trackAppRoutes"] === "AUTO") {
        addRouteListeners();
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
            ...(options.eventMeta ? { eventMeta: options.eventMeta } : {}),
          },
          {
            headers: {
              consumerKey: _options.consumerKey,
              clientId: _options.clientId,
            },
          }
        );
      } catch (error) {
        _logger.debug("error while tracking : ", {eventName, eventData, options});
        throw new Error(error);
      }
    },
    pageVisited: function (eventData = {}, options = {}) {
      let { meta = {}, ...rest } = eventData;
      let {
        pageLoad = false,
        pageTitle,
        pageReferrer,
        pageReferrerDomain,
        pageOrigin,
        pagePathname,
        pageSearch,
        pageHash,
      } = meta;
      let _meta = {
        pageLoad,
        pageTitle: pageTitle || window.document.title,
        pageReferrer: pageReferrer || window.document.referrer,
        pageReferrerDomain: pageReferrerDomain || utils.info.referringDomain(window.document.referrer),
        pageOrigin: pageOrigin || window.document.location.origin,
        pagePathname: pagePathname || window.document.location.pathname,
        pageSearch: pageSearch || window.document.location.search,
        pageHash: pageHash || window.document.location.hash,
      };
      return this.trackEvent(
        EVENT_NAME_CONSTANTS.PAGE_VISITED,
        {
          ...rest,
          meta: { ..._meta },
        },
        options
      );
    },
  };

  function ensureValidOptions(options) {
    if (!options) throw new Error("options are required by sdk");
    if (!options["consumerKey"])
      throw new Error(
        "Consumer key is required. Please obtain it through your settings at www.cherrybase.com"
      );
  }

  function addRouteListeners() {
    function onListen({ pageLoad = false } = {}) {
      globalInstance.pageVisited({
        meta: {
          pageLoad,
        },
      });
    }

    /**
     * Note that just calling history.pushState() or history.replaceState() won't trigger a popstate event.
     * The popstate event will be triggered by doing a browser action such as a
     * click on the back or forward button (or calling history.back() or history.forward() in JavaScript).
     */
    addEventListener("popstate", function (event) {
      console.log("popstate listener", event);
      onListen();
    });
    addEventListener("hashchange", function (event) {
      console.log("hashchange listener", event);
      onListen();
    });
    history.pushState = ((f) =>
      function pushState() {
        var ret = f.apply(this, arguments);
        dispatchEvent(
          new CustomEvent("pushstate", {
            detail: { pushStateArgs: [...arguments] },
          })
        );
        return ret;
      })(history.pushState);
    addEventListener("pushstate", function (event) {
      console.log("pushstate listener", event);
      onListen();
    });
    history.replaceState = ((f) =>
      function replaceState() {
        var ret = f.apply(this, arguments);
        dispatchEvent(
          new CustomEvent("replacestate", {
            detail: { replaceStateArgs: [...arguments] },
          })
        );
        return ret;
      })(history.replaceState);
    addEventListener("replacestate", function (event) {
      console.log("replacestate listener", event);
      onListen();
    });
    // window.onload = function (event) {
    addEventListener("load", function (event) {
      console.log("onload listener", event);
      onListen({ pageLoad: true });
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
            ...clientProperties,
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
