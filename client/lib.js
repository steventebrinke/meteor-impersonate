'use strict';
Impersonate = {
  _from: [],
  _active: new ReactiveVar(false),
};

Impersonate.do = function(impersonateUser, cb) {
  if (!cb) cb = function() {};
  const from = {
    user: Meteor.userId(),
    token: Accounts._storedLoginToken(),
  }
  Accounts.callLoginMethod({
    methodArguments: [{
      impersonateUser
    }],
    userCallback: function(err) {
      if (err) console.error("Could not impersonate.", err);
      if (!err) {
        Impersonate._from.push(from);
        Impersonate._active.set(true);
      }
      cb.apply(this, [err, impersonateUser]);
    }
  });
}

Impersonate.undo = function(cb) {
  if (!cb) cb = function() {};
  const to = Impersonate._from.pop();
  Accounts.logout(function() {
    Accounts.loginWithToken(to.token, function(err) {
      if (!err) Impersonate._active.set(false);
      cb.apply(this, [err, to.user]);
    });
  });
}

// Reset data on logout
Meteor.autorun(function() {
  if (Meteor.userId()) return;
  Impersonate._active.set(false);
  Impersonate._from = [];
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
  return Impersonate._active.get();
});
