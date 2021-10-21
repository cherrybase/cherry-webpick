requirejs(["./web_sdk.amd"], function (web_sdk) {
  web_sdk.init({
    applicationId: "Your Application ID",
  });

  web_sdk.start();
});
