/**
 *  variab;es injected into environment via rollup start with '__'
 */

export const CONFIG = {
  LIB_NAME: __name,
  LIB_VERSION: __version,
  DEV: __dev,
};

export const APP_CONSTANTS = {
  HOST: "https://apib-kwt.almullaexchange.com",
  SERVLET_CONTEXT: "/xms/api/v1",
};

export const EVENT_NAME_CONSTANTS = {
  PAGE_VISITED: "EVENT_PAGE_VISITED"
};

export const EVENT_URL_CONSTANTS = {
  HEARTBEAT: "/client/heartbeat",
  TRACK_EVENT: "/client/track/event",
};

export const PERSISTENCE_CONSTANTS = {
  STORED_ANONYMOUS_ID: "anonymous_id",
};

export const HTTP_PROTOCOL =
  "http:" === (document && document.location.protocol) ? "http://" : "https://";
