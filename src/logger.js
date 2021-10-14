/**
TRACE – the most fine-grained information only used in rare cases where you need the full visibility of what is happening in your application and inside the third-party libraries that you use. You can expect the TRACE logging level to be very verbose. You can use it for example to annotate each step in the algorithm or each individual query with parameters in your code.

DEBUG – less granular compared to the TRACE level, but it is more than you will need in everyday use. The DEBUG log level should be used for information that may be needed for diagnosing issues and troubleshooting or when running application in the test environment for the purpose of making sure everything is running correctly

INFO – the standard log level indicating that something happened, the application entered a certain state, etc. For example, a controller of your authorization API may include an INFO log level with information on which user requested authorization if the authorization was successful or not. The information logged using the INFO log level should be purely informative and not looking into them on a regular basis shouldn’t result in missing any important information.

WARN – the log level that indicates that something unexpected happened in the application, a problem, or a situation that might disturb one of the processes. But that doesn’t mean that the application failed. The WARN level should be used in situations that are unexpected, but the code can continue the work. For example, a parsing error occurred that resulted in a certain document not being processed.

ERROR – the log level that should be used when the application hits an issue preventing one or more functionalities from properly functioning. The ERROR log level can be used when one of the payment systems is not available, but there is still the option to check out the basket in the e-commerce application or when your social media logging option is not working for some reason.

CRITICAL – the log level that tells that the application encountered an event or entered a state in which one of the crucial business functionality is no longer working. A CRITICAL log level may be used when the application is not able to connect to a crucial data store like a database or all the payment systems are not available and users can’t checkout their baskets in your e-commerce.
 */

export default class LoggerService{
  static get TRACE() {
    return 6;
  }
  static get DEBUG() {
    return 5;
  }
  static get INFO() {
    return 4;
  }
  static get WARN() {
    return 3;
  }
  static get ERROR() {
    return 2;
  }
  static get CRITICAL() {
    return 1;
  }
  static get NONE() {
    return 0;
  }
  static LEVEL_METHOD(level) {
    switch (level) {
      case LoggerService.TRACE:
        return "trace";
      case LoggerService.DEBUG:
        return "log";
      case LoggerService.INFO:
        return "info";
      case LoggerService.WARN:
        return "warn";
      case LoggerService.ERROR:
        return "error";
      case LoggerService.CRITICAL:
        return "log";
      default:
        return "log";
    }
  }
  static LEVEL_NAME(level) {
    switch (level) {
      case LoggerService.TRACE:
        return "TRACE";
      case LoggerService.DEBUG:
        return "DEBUG";
      case LoggerService.INFO:
        return "INFO";
      case LoggerService.WARN:
        return "WARN";
      case LoggerService.ERROR:
        return "ERROR";
      case LoggerService.CRITICAL:
        return "CRITICAL";
      default:
        return "UNKNOWN";
    }
  }

  constructor(options) {
    if (!options || typeof options !== "object") {
      throw new Error("options are required, and must be an object");
    }

    if (options.enableLogBatching && !options.logUrl) {
      throw new Error("options must include a logUrl property");
    }

    this.level = options.logLevel;
    this.prefix = options.logPrefix;
    this.style = {};
    this.enableBatching = options.enableLogBatching;
    this.batchSize = options.logBatchSize || 10;
    this.url = options.logUrl;
    this.headers = options.logHeaders || [
      { "Content-Type": "application/json" },
    ];
    this.messages = [];
  }

  setStyle({ level, color, size }) {
    if (color !== undefined) this.style[level].color = color;
    if (size !== undefined) this.style[level].size = size;
  }

  getStyle(level) {
    return this.style[level] || {};
  }

  dateFormat() {
    return new Date(Date.now()).toUTCString();
  }

  getFormattedMessage = ({ level, message, data }) => {
    message = `${this.prefix} | ${LoggerService.LEVEL_NAME(level)} | ${this.dateFormat()} | ${
      message || "-"
    } |`;
    message = data ? message + ` data:${JSON.stringify(data)}` : message;
    return message;
  }

  send(messages) {
    return; // TODO in next phase.
    var xhr = new XMLHttpRequest();
    xhr.open("POST", this.url, true);
    this.headers.forEach(function (header) {
      xhr.setRequestHeader(
        Object.keys(header)[0],
        header[Object.keys(header)[0]]
      );
    });
    var data = JSON.stringify({
      context: navigator.userAgent,
      messages: messages,
    });
    xhr.send(data);
  }

  log(level, message, data) {
    if (level <= this.level) {
      console[LoggerService.LEVEL_METHOD(level)](
        `%c${this.getFormattedMessage({ level, message })}`,
        `color: ${this.style[level]?.color}; font-weight: bold; font-size: ${this.style[level]?.size}; text-shadow: 0 0 5px rgba(0,0,0,0.2);`,
        data || '-'
      );
      this.messages.push({
        level: level,
        message: this.getFormattedMessage({ level, message, data }),
      });
      if (this.enableBatching && this.messages.length >= this.batchSize) {
        this.send(this.messages.splice(0, this.batchSize));
      }
    }
  }

  trace(message, data) {
    this.log(LoggerService.TRACE, message, data);
  }

  debug(message, data) {
    this.log(LoggerService.DEBUG, message, data);
  }

  info(message, data) {
    this.log(LoggerService.INFO, message, data);
  }

  warn(message, data) {
    this.log(LoggerService.WARN, message, data);
  }

  error(message, data) {
    this.log(LoggerService.ERROR, message, data);
  }

  critical(message, data) {
    this.log(LoggerService.CRITICAL, message, data);
  }
}
