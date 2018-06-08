'use strict';
Impersonate = {
  admins: ["admin"],
  adminGroups:[], // { role: "admin", group: "organization" }
};

/**
 * Returns whether impersonation is allowed from fromUser to toUser.
 * Note that toUser is not guaranteed to exist, since that will only be verified when this method returns true.
 */
Impersonate.allowImpersonation = function(fromUser, toUser) {
  let roleAllow = false;

  // if there is any role, use that
  if (Impersonate.admins && Impersonate.admins.length) {
    roleAllow = Roles.userIsInRole(fromUser, Impersonate.admins);
  }

  if (Impersonate.adminGroups && !roleAllow) {
    // check for permissions using roles and groups
    for (let i = 0; i < Impersonate.adminGroups.length; i++) {
      var roleGroup = Impersonate.adminGroups[i];
      roleAllow = Roles.userIsInRole(fromUser, roleGroup.role, roleGroup.group);
      if (roleAllow) break; // found an allowable role, no need to check further, proceed
    }
  }

  return roleAllow;
}

Accounts.registerLoginHandler("impersonate", function ({impersonateUser}) {
  if (!impersonateUser) return undefined; // don't handle

  check(this.userId, String);
  check(impersonateUser, String);

  if (impersonateUser === this.userId) {
    return {error: Meteor.Error(400, "Bad request. You already are yourself.")};
  }

  // Impersonating with no token
  if (!Impersonate.allowImpersonation(this.userId, impersonateUser)) {
    return {error: Meteor.Error(403, "Permission denied. You need to be an admin to impersonate users.")};
  }

  if (!Meteor.users.findOne({_id: impersonateUser})) {
    return {error: Meteor.Error(404, "User not found. Can't impersonate it.")};
  }

  return {
    userId: impersonateUser,
  };
});
