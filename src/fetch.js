import { utils } from "./utils";

function ApiError(message, data, status) {
  let response = null;
  let isObject = false;

  try { // We are trying to parse response
    response = JSON.parse(data);
    isObject = true;
  } catch (e) {
    response = data;
  }

  this.response = response;
  this.message = message;
  this.status = status;
  this.toString = function () {
    return `${this.message}\nResponse:\n${
      isObject ? JSON.stringify(this.response, null, 2) : this.response
    }`;
  };
}

export default class ApiService {
  constructor({ prefix = "", responseBuilder = (res) => res } = {}) {
    this.prefix = prefix;
    this.responseBuilder = responseBuilder;
  }

  get = (url, data, options) =>
    this.request({ url, method: "get", data, options });

  post = (url, data, options) =>
    this.request({ url, method: "post", data, options });

  delete = (url, data, options) =>
    this.request({ url, method: "delete", data, options });

  postFormData = (url, data, options) => {
    data = utils.params(data);
    return this.post(url, data, {
      ...options,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...options.headers,
      },
    });
  };

  request = async ({ url, method, data, options = {} }) => {
    url = this.getUrl({ url, options });
    let { url: _url, ...rest } = this.getArgs({ url, method, data, options });
    let response = null;
    return (
      fetch(_url, rest)
        .then((responseObject) => {
          response = responseObject; // Saving response for later use in lower scopes
          if (response.status === 401) { // HTTP unauthorized
            // Handle unauthorized requests
            // Logout & redirect to login page?
          }
          if (response.status < 200 || response.status >= 300) { // Check for error HTTP error codes
            return response.text(); // Get response as text
          }
          return response.json(); // Get response as json
        })
        // "parsedResponse" will be either text or javascript object depending if "response.text()" or "response.json()" got called in the upper scope
        .then((parsedResponse) => {
          if (response.status < 200 || response.status >= 300) { // Check for HTTP error codes
            throw parsedResponse; // Throw error
          }
          return parsedResponse; // Request succeeded
        })
        .catch((error) => {
          // Throw custom API error
          if (response) { // If response exists it means HTTP error occured
            throw new ApiError(
              `Request failed with status ${response.status}.`,
              error,
              response.status
            );
          } else {
            throw new ApiError(error.toString(), null, "REQUEST_FAILED");
          }
        })
    );
  };

  getUrl = ({ url, options = {} }) => {
    let result = "";
    let urlType =
      options && options.urlType && typeof options.urlType === "string"
        ? options.urlType.toLowerCase()
        : ""
        // : "absolute"; // custom config. make it dynamic. should be "" otherwise.
    switch (urlType) {
      case "absolute":
        result = url;
        break;
      case "relative":
        result = this.prefix + url;
        break;
      default:
        result = this.prefix + url;
    }
    return result;
  };

  getArgs = ({ url, method, data = {}, options = {} }) => {
    let _options = {
      ...options,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    };
    let args = {
      url,
      method,
      headers: _options.headers,
    };
    const isFile = data instanceof File;
    switch (method) {
      case "get":
        args = {
          ...args,
          url: url + utils.params(data),
        };
        break;
      case "post":
        args = {
          ...args,
          body: !isFile ? JSON.stringify(data) : data,
          url: url + utils.params(_options.params),
        };
        break;
      default:
        break;
    }
    return args;
  };
}

/*
File example:

// Post request, with file data and custom headers
function uploadAvatar(userId, file) {
  return ApiService.post(`users/${ userId }/avatar/`, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
}
*/
