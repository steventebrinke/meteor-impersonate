'use strict';
Package.describe({
  name: "stb:impersonate",
  summary: "Impersonate users in Meteor",
  version: "0.1.0",
  git: "https://github.com/steventebrinke/meteor-impersonate.git",
});

Package.onUse(function (api, where) {

  api.use([
    "reactive-var@1.0.11",
    "templating@1.3.2",
    "gwendall:body-events@0.1.6",
    "check@1.2.5"
  ], "client");

  api.use([
    "accounts-base@1.4.0",
    "alanning:roles@1.2.16"
  ]);

  api.addFiles([
    "server/lib.js"
  ], "server");

  api.addFiles([
    "client/lib.js"
  ], "client");

  api.export("Impersonate");
});
