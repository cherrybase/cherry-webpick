import FingerprintJS from "@fingerprintjs/fingerprintjs";
/**
 * Even though this library can run in the browser, it is strongly advised against doing so, unless you are not concerned with performance.
 * Keep in mind that using this library in browser-side code means sending around 432 KB of Regex rules and 144 KB of javascript (uncompressed and unminified), which may result in a poor user experience for people with a slow Internet connection.
 * You may experience inconsistencies when running this library in a browser environment, as some browsers like Safari do not yet support lookbehind syntax.
 */
// import DeviceDetector from "device-detector-js";
import { utils } from "./utils";
import { PERSISTENCE_CONSTANTS } from "./config";

export async function getClientFp() {
  try {
    const fpJsResponseRaw = await FingerprintJS.load();
    const fpJsResponse = await fpJsResponseRaw.get();
    console.log("fp generation successful!", fpJsResponse.visitorId);
    return fpJsResponse.visitorId;
  } catch (error) {
    console.error("fp generation failed! ", error);
    return null;
  }
}

export async function getClientData() {
  let deviceData = null;
  try {
    const deviceDetector = new DeviceDetector();
    deviceData = deviceDetector.parse(window.navigator.userAgent);
    console.log("device data generation successful!", deviceData);
  } catch (error) {
    console.error("device data generation failed!", error);
  }

  let userData = null;
  try {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const connection = window.navigator.connection;
    const memory = window.navigator.deviceMemory;
    const height = window.innerHeight;
    const width = window.innerWidth;
    const angle = window.screen?.orientation?.angle;
    const mode =
      window.screen?.orientation?.type?.indexOf("landscape") > -1
        ? "landscape"
        : "portrait";
    const referrer = window.document.referrer;
    const battery = await window.navigator.getBattery();
    const responseRaw = await fetch("https://ipapi.co/json/");
    const response = await responseRaw.json();
    userData = {
      ...response,
      connection,
      memory,
      height,
      width,
      angle,
      mode,
      darkMode: isDark,
      referrer,
      battery,
    };
    /**
     * Listeners work as expected only with global state managemnent.
     */
    window.addEventListener(
      "deviceorientation",
      function (event) {
        const alpha = Number(event.alpha).toFixed(2);
        const beta = Number(event.beta).toFixed(2);
        const gamma = Number(event.gamma).toFixed(2);
        userData["orientation"] = { alpha, beta, gamma };

        console.info("deviceorientation listener", { alpha, beta, gamma });
      },
      true
    );
    window.addEventListener(
      "orientationchange",
      function () {
        const height = window.innerHeight;
        const width = window.innerWidth;
        const angle = window.screen?.orientation?.angle;
        const mode =
          window.screen?.orientation?.type?.indexOf("landscape") > -1
            ? "landscape"
            : "portrait";
        userData["height"] = height;
        userData["width"] = width;
        userData["angle"] = angle;
        userData["mode"] = mode;

        console.info("orientationchange listener", {
          height,
          width,
          angle,
          mode,
        });
      },
      false
    );
    console.log("User data generation successful!", userData);
  } catch (error) {
    console.error("user data generation failed!", error);
  }

  return {
    deviceData,
    userData,
  };
}

export function getUaDerivedProperties() {
  return utils.info.properties();
}

export function regenerateAnonymousId(persist) {
  var newId = utils.uuid();
  if (persist) {
    persist.set(PERSISTENCE_CONSTANTS.STORED_ANONYMOUS_ID, newId);
  }
  return newId;
}

export function getAnonymousId(persist) {
  var persistedId = persist.get(PERSISTENCE_CONSTANTS.STORED_ANONYMOUS_ID);
  if (persistedId) {
    return persistedId;
  }

  return regenerateAnonymousId(persist);
}
