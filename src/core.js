import { CONFIG } from "./config";
import creator from "./app";

/*
 * Constants
 */
/** @const */ var PRIMARY_INSTANCE_NAME = CONFIG.LIB_NAME;
/** @const */ var INIT_MODULE = 0;
/** @const */ var INIT_SNIPPET = 1;

var init_type; // MODULE or SNIPPET loader

export function init_from_snippet() {
  init_type = INIT_SNIPPET;
  window[PRIMARY_INSTANCE_NAME] = creator();
}

export function init_as_module() {
  init_type = INIT_MODULE;
  return creator();
}
