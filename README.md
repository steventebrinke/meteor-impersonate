Meteor Impersonate
================

Allow admins to impersonate other users.

When you impersonate someone, you will actually login as that person.
This means, all pages in the same browser session will impersonate, which is needed to ensure that all background requests (such as GraphQL queries) run as the correct user.

Installation
------------

``` sh
meteor add steventebrinke:impersonate
```

DOM helpers
-----------

**Impersonate**

Set a [data-impersonate] attribute with the id of the user to impersonate on a DOM element.
``` html
<button data-impersonate="{{someUser._id}}">Click to impersonate</button>
```

**Un-impersonate**

Set a [data-unimpersonate] attribute to a DOM element.
``` html
<button data-unimpersonate>Click to unimpersonate</button>
```

UI helpers
----------

**isImpersonating**
``` html
{{#if isImpersonating}}
  <button data-unimpersonate>Click to unimpersonate</button>
{{else}}
  <button data-impersonate="{{_id}}">Click to impersonate</button>
{{/if}}
```

Client Methods
-------

Should you need to use callbacks, use the JS methods directly.

**Impersonate.do(userId, callback)**
``` javascript
var userId = "...";
Impersonate.do(userId, function(err, userId) {
  if (err) return;
  console.log("You are now impersonating user #" + userId);
});
```

**Impersonate.undo(callback)**
``` javascript
Impersonate.undo(function(err, userId) {
  if (err) return;
  console.log("Impersonating no more, welcome back #" + userId);
})
```

**Impersonate.isImpersonating()**

Returns whether you are currently impersonation anyone.

Note that this method is not safe for permission checks as it runs on the client and therefore can be spoofed.

**Impersonate.userId()**

Returns the user id of the user who initially logged in.
When not impersonating anyone, this equals `Meteor.userId()`, but it keeps that value after calling `Impersonate.do(...)`.

Note that this method is not safe for permission checks as it runs on the client and therefore can be spoofed.

Server Methods
-------

By default, the package will grant users in the "admins" group (through alanning:roles) the possibility to impersonate other users. You can also set any of the two following parameters to define your own impersonation roles.

- User role
``` javascript
Impersonate.admins = ["masters", "bosses"];
```

- User group
``` javascript
Impersonate.adminGroups = [
  { role: "masters", group: "group_A" },
  { role: "bosses", group: "group_B" }
];
```

- Advanced
``` javascript
Impersonate.allowImpersonation = function(fromUser, toUser) {
  return false;
};
```
Permission are checked by `allowImpersonation`, so replacing this methods disabled any checks of `admins` and `adminGroups`.
This way, advanced permissions can be implemented.
By default only the `fromUser` is checked, but this methods receives both the currently logged in `fromUser` and the `toUser` that will be impersonated.
The `toUser` might not exist, in that case returning `false` will result in error 403 as always, but returning `true` gives error 404.

Note that care must be taken when designing advanced permissions, because if Alice has permission to impersonate Bob and Carol has only permission to impersonate Alice, Carol can still impersonate Bob through Alice.

Notes
-----

- Built upon https://github.com/gwendall/meteor-impersonate
