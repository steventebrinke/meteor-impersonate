'use strict';
Impersonate = {
  FROM_USER_KEY: 'Impersonate.' + Accounts.USER_ID_KEY,
  FROM_TOKEN_KEY: 'Impersonate.' + Accounts.LOGIN_TOKEN_KEY,
  isImpersonating: function() { return Meteor._localStorage.getItem(Impersonate.FROM_USER_KEY) != null; },
  userId: function() { return Meteor._localStorage.getItem(Impersonate.FROM_USER_KEY) || Meteor.userId(); },
};

Impersonate.do = function(impersonateUser, cb) {
  if (!cb) cb = function() {};
  var fromUser = Meteor.userId();
  if (!fromUser) throw new Error("Permission denied. You need to be logged in to impersonate users.");
  var fromToken = Accounts._storedLoginToken();
  Accounts.callLoginMethod({
    methodArguments: [{
      impersonateUser: impersonateUser,
    }],
    userCallback: function(err) {
      if (err) console.error("Could not impersonate.", err);
      if (!err && Meteor._localStorage.getItem(Impersonate.FROM_USER_KEY) == null) {
        // Store initial user in local storage allowing us to return to this user
        Meteor._localStorage.setItem(Impersonate.FROM_USER_KEY, fromUser);
        Meteor._localStorage.setItem(Impersonate.FROM_TOKEN_KEY, fromToken);
      }
      cb.apply(this, [err, impersonateUser]);
    }
  });
}

Impersonate.undo = function(cb) {
  if (!cb) cb = function() {};
  var toUser = Meteor._localStorage.getItem(Impersonate.FROM_USER_KEY);
  if (!toUser) throw new Error("Permission denied. You are not impersonating anyone.");
  var toToken = Meteor._localStorage.getItem(Impersonate.FROM_TOKEN_KEY);
  Accounts.logout(function() {
    Meteor._localStorage.removeItem(Impersonate.FROM_USER_KEY);
    Meteor._localStorage.removeItem(Impersonate.FROM_TOKEN_KEY);
    Accounts.loginWithToken(toToken, function(err) {
      cb.apply(this, [err, toUser]);
    });
  });
}

// Reset data on logout
Meteor.autorun(function() {
  if (Meteor.userId()) return;
  Meteor._localStorage.removeItem(Impersonate.FROM_USER_KEY);
  Meteor._localStorage.removeItem(Impersonate.FROM_TOKEN_KEY);
});

Template.body.events({
  "click [data-impersonate]": function(e, data) {
    var userId = $(e.currentTarget).attr("data-impersonate");
    Impersonate.do(userId);
  },
  "click [data-unimpersonate]": function(e, data) {
    Impersonate.undo();
  }
});

Template.registerHelper("isImpersonating", function () {
  return Impersonate.isImpersonating();
});
