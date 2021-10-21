/*
 *  @author Anonymous (anonymous.com)
 */

/**
 * Sample SDK
 * v1.0.0
 */
(function (global) {
  "use strict";
  /**
   * Contains all SampleSDK API classes and functions.
   * @name SampleSDK
   * @namespace
   */
  global.SampleSDK = global.SampleSDK || {};
  global.SampleSDK.VERSION = "v1.0.0";

  /**
   * Call this method first to set your authentication key.
   * @param {String} API Token
   */
  SampleSDK.Initialize = function (apiToken) {
    SampleSDK._initialize(apiToken);
  };

  /**
   * This method is for SampleSDK's own private use.
   * @param {String} API Token
   */
  SampleSDK._initialize = function (apiToken) {
    SampleSDK.apiToken = apiToken;
  };
})(window);
