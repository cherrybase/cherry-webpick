import { utils } from "./utils";

export function getPersistence(opt) {
  var storageType = opt["persistence"] || "localStorage";
  if (
    storageType !== "cookie" &&
    storageType !== "localStorage" &&
    storageType !== "none"
  ) {
    console.critical("Unknown persistence type " + storageType);
  }
  var prefix = opt["persistence_key_prefix"];
  var resolvedKey = key => prefix + key;

  var set = function (key, value) {
    key = resolvedKey(key);
    utils.localStorage.set(key, value);
    // if localStorage is by default, we'll try to set the cookie too.
    utils.cookie.set(
      key,
      value,
      opt["cookie_expiration"],
      opt["cross_subdomain_cookie"],
      opt["secure_cookie"],
      opt["cross_site_cookie"],
      opt["cookie_domain"]
    );
  };
  var get = function (key) {
    key = resolvedKey(key);
    // this tries to get from either cookie or localStorage whichever has data.
    var localValue = utils.localStorage.get(key);
    var cookieValue = utils.cookie.get(key);
    // if there is value in cookie but not in localStorage
    // but persistence type is localStorage, try to re-save in localStorage.
    //   if (!localValue && cookieValue && storageType === 'localStorage') {
    //     utils.localStorage.set(key, cookieValue);
    //   }
    return localValue || cookieValue;
  };
  var clear = function (key) {
    key = resolvedKey(key);
    if (key) {
      utils.localStorage.remove(key);
      utils.cookie.remove(key);
    } else {
      utils.localStorage.clear();
      utils.cookie.clear();
    }
  };
  if (storageType === "cookie" || !utils.localStorage.is_supported()) {
    set = function (key, value) {
      utils.cookie.set(
        resolvedKey(key),
        value,
        opt["cookie_expiration"],
        opt["cross_subdomain_cookie"],
        opt["secure_cookie"],
        opt["cross_site_cookie"],
        opt["cookie_domain"]
      );
    };
    get = function (key) {
      return utils.cookie.get(resolvedKey(key));
    };
    clear = function (key) {
      utils.cookie.remove(
        resolvedKey(key),
        opt["cross_subdomain_cookie"],
        opt["cookie_domain"]
      );
    };
  }
  if (storageType === "none") {
    set = function () {};
    get = function () {};
    clear = function () {};
  }

  return {
    set,
    get,
    clear,
  };
}
