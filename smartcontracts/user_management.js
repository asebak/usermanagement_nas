"use strict";

var UserProfileItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.location = obj.location;
        this.website = obj.website;
        this.avatar = obj.avatar;
	} else {
		this.name = "";
		this.location = "";
        this.website = "";
        this.avatar = "";
	}
};

UserProfileItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var UserProfile = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new UserProfileItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

UserProfile.prototype = {
    init: function () {
    },

    save: function (name, location, website, avatar) {


        var from = Blockchain.transaction.from;
        var profile = this.repo.get(from);
     


        profile = new UserProfileItem();
        profile.name = name;
		profile.location = location;
        profile.website = website;
        profile.avatar = avatar;

        this.repo.put(from, profile);
        
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = UserProfile;