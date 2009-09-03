// Facebook.js
// Copyright by Facebook Inc.


Type.createNamespace('FB');

////////////////////////////////////////////////////////////////////////////////
// FB.ApiErrorResult

FB.$create_ApiErrorResult = function FB_ApiErrorResult() { return {}; }


////////////////////////////////////////////////////////////////////////////////
// FB.ApiErrorRequestArg

FB.$create_ApiErrorRequestArg = function FB_ApiErrorRequestArg() { return {}; }


////////////////////////////////////////////////////////////////////////////////
// FB.ApiErrorCode

FB.ApiErrorCode = function() { };
FB.ApiErrorCode.prototype = {
    unknown: 1,
    service_not_available: 2,
    max_requests_reached: 4,
    remote_address_not_allowed: 5,
    invalid_parameter: 100,
    invalid_api_key: 101,
    invalid_session_key: 102,
    invalid_call_id: 103,
    invalid_signature: 104,
    permission_denied: 200,
    internal_error: 800,
    invalid_operation: 801,
    quota_exceeded: 802,
    object_already_exists: 804,
    temporary_Database_failure: 805
}
FB.ApiErrorCode.createEnum('FB.ApiErrorCode', false);


////////////////////////////////////////////////////////////////////////////////
// FB._stepInfo

FB.$create__stepInfo = function FB__stepInfo(jsonRequest, pendingResult) {
    var $o = { };
    $o.jsonRequest = jsonRequest;
    $o.result = pendingResult;
    return $o;
}


////////////////////////////////////////////////////////////////////////////////
// FB.ApiClientBase

FB.ApiClientBase = function FB_ApiClientBase(apiKey, xd_receiver_url, serverAddress) {
    if (xd_receiver_url) {
        FB.XdComm.Server.singleton.set_receiverUrl(xd_receiver_url);
    }
    this.apiKey = apiKey;
    var server_root = FBIntern.Utility.getFacebookUrl('api');
    if (!String.isNullOrEmpty(serverAddress)) {
        this.serverAddress = serverAddress;
    }
    else {
        this.serverAddress = server_root + '/restserver.php';
    }
    var xdClientServerUrl = server_root + '/static/client_restserver.htm';
    var xdClientServerReceiverUrl = server_root + '/static/xd_receiver.htm';
    this.xdHttpClient = new FB.XdHttpRequestClient(xdClientServerUrl, xdClientServerReceiverUrl, 'fb_api_server');
}
FB.ApiClientBase.prototype = {

    get_apiKey: function() {
        return this.apiKey;
    },

    get_session: function() {
        return this.session;
    },

    _convertDictkeysToList: function(dictionary) {
        var keyList = [];
        var $dict1 = dictionary;
        for (var $key2 in $dict1) {
            var entry = { key: $key2, value: $dict1[$key2] };
            keyList.add(entry.key);
        }
        return keyList;
    },

/**
 * 
 * @param {Object} parameters
 */
    generateSignature: function(parameters) {
        var signatureBuilder = new StringBuilder();
        var keyList = this._convertDictkeysToList(parameters);
        keyList.sort();
        var $enum1 = keyList.getEnumerator();
        while ($enum1.moveNext()) {
            var key = $enum1.get_current();
            signatureBuilder.append(key + '=' + parameters[key]);
        }
        signatureBuilder.append(this.secret);
        var hashString = FBIntern.Md5.computeHashToString(signatureBuilder.toString().trim());
        return hashString;
    },

    apiKey: null,
    secret: null,
    session: null,
    serverAddress: null,
    lastCallId: 0,
    xdHttpClient: null
}


////////////////////////////////////////////////////////////////////////////////
// FB.ApiClient

FB.ApiClient = function FB_ApiClient(apiKey, xd_receiver_url, serverAddress) {
    FB.ApiClient.constructBase(this, [ apiKey, xd_receiver_url, serverAddress ]);
}
FB.ApiClient.prototype = {

/**
 * 
 * @param {Object} callback
 */
    requireLogin: function(callback) {
        if (!this._verifyLogin$1(callback, document.URL)) {
            window.navigate(this._createLoginUrl$1());
        }
    },

    _createLoginUrl$1: function() {
        return FBIntern.Utility.getFacebookUrl('www') + '/login.php?return_session=1&api_key=' + this.apiKey + '&v=' + FB.ApiClientBase.version + '&next=' + encodeURIComponent(window.location.href);
    },

    _verifyLogin$1: function(callback, url) {
        var sessionTokenString = 'session';
        var documentUri = new FB.Uri(url);
        if (Object.keyExists(documentUri.get_queryParameters(), sessionTokenString)) {
            var sessionToken = documentUri.get_queryParameters()[sessionTokenString];
            this.session = FB.JSON.deserialize(sessionToken);
            this.secret = this.session.secret;
            if (callback) {
                callback.invoke(null);
            }
            return true;
        }
        else {
            return false;
        }
    },

	/**
	 * Returns all visible events according to the filters specified.
	 * @param {Number} uid The user's ID
	 * @param {String[]} eids Filter by this list of event IDs
	 * @param {Number} startTime Filter with this UTC as lower bound. A missing or zero parameter indicates no lower bound.
	 * @param {Number} endTime Filter with this UTC as upper bound. A missing or zero parameter indicates no upper bound.
	 * @param {String} rsvpStatus Filter by this RSVP status. The RSVP status should be one of the following strings: attending, unsure, declined, not_replied 
	 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
	 */
    events_get: function(uid, eids, startTime, endTime, rsvpStatus, sequencer) {
        var parameters = {};
        if (uid) {
            parameters['uid'] = uid;
        }
        if (eids) {
            parameters['eids'] = eids;
        }
        parameters['start_time'] = startTime;
        parameters['end_time'] = endTime;
        if (rsvpStatus) {
            parameters['rsvp_status'] = rsvpStatus;
        }
        return this._callMethod$1('events.get', parameters, sequencer);
    },

	/**
	 * 
	 * @param {Object} eid
	 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
	 */
    events_getMembers: function(eid, sequencer) {
        var parameters = {};
        parameters['eid'] = eid;
        return this._callMethod$1('events.getMembers', parameters, sequencer);
    },

/**
 * 
 * @param {Object} url
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    fbml_refreshImgSrc: function(url, sequencer) {
        var parameters = {};
        parameters['url'] = url;
        return this._callMethod$1('fbml.refreshImgSrc', parameters, sequencer);
    },

/**
 * 
 * @param {Object} url
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    fbml_refreshRefUrl: function(url, sequencer) {
        var parameters = {};
        parameters['url'] = url;
        return this._callMethod$1('fbml.refreshRefUrl', parameters, sequencer);
    },

/**
 * 
 * @param {Object} handle
 * @param {Object} fbml
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    fbml_setRefHandle: function(handle, fbml, sequencer) {
        var parameters = {};
        parameters['handle'] = handle;
        parameters['fbml'] = fbml;
        return this._callMethod$1('fbml.setRefHandle', parameters, sequencer);
    },

/**
 * 
 * @param {Object} title
 * @param {Object} body
 * @param {Object} image_1
 * @param {Object} image_1_link
 * @param {Object} image_2
 * @param {Object} image_2_link
 * @param {Object} image_3
 * @param {Object} image_3_link
 * @param {Object} image_4
 * @param {Object} image_4_link
 * @param {Object} priority
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    feed_publishStoryToUser: function(title, body, image_1, image_1_link, image_2, image_2_link, image_3, image_3_link, image_4, image_4_link, priority, sequencer) {
        var parameters = {};
        parameters['title'] = title;
        if (body) {
            parameters['body'] = body;
        }
        if (image_1) {
            parameters['image_1'] = image_1;
        }
        if (image_1_link) {
            parameters['image_1_link'] = image_1_link;
        }
        if (image_2) {
            parameters['image_2'] = image_2;
        }
        if (image_2_link) {
            parameters['image_2_link'] = image_2_link;
        }
        if (image_3) {
            parameters['image_3'] = image_3;
        }
        if (image_3_link) {
            parameters['image_3_link'] = image_3_link;
        }
        if (image_4) {
            parameters['image_4'] = image_4;
        }
        if (image_4_link) {
            parameters['image_4_link'] = image_4_link;
        }
        if (priority) {
            parameters['priority'] = priority;
        }
        return this._callMethod$1('feed.publishStoryToUser', parameters, sequencer);
    },

/**
 * 
 * @param {Object} title
 * @param {Object} body
 * @param {Object} image_1
 * @param {Object} image_1_link
 * @param {Object} image_2
 * @param {Object} image_2_link
 * @param {Object} image_3
 * @param {Object} image_3_link
 * @param {Object} image_4
 * @param {Object} image_4_link
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    feed_publishActionOfUser: function(title, body, image_1, image_1_link, image_2, image_2_link, image_3, image_3_link, image_4, image_4_link, sequencer) {
        var parameters = {};
        parameters['title'] = title;
        if (body) {
            parameters['body'] = body;
        }
        if (image_1) {
            parameters['image_1'] = image_1;
        }
        if (image_1_link) {
            parameters['image_1_link'] = image_1_link;
        }
        if (image_2) {
            parameters['image_2'] = image_2;
        }
        if (image_2_link) {
            parameters['image_2_link'] = image_2_link;
        }
        if (image_3) {
            parameters['image_3'] = image_3;
        }
        if (image_3_link) {
            parameters['image_3_link'] = image_3_link;
        }
        if (image_4) {
            parameters['image_4'] = image_4;
        }
        if (image_4_link) {
            parameters['image_4_link'] = image_4_link;
        }
        return this._callMethod$1('feed.publishActionOfUser', parameters, sequencer);
    },

/**
 * Publishes a Mini-Feed story to the user or Page corresponding to the page_actor_id parameter
 * @param {Object} title_template
 * @param {Object} title_data
 * @param {Object} body_template
 * @param {Object} body_data
 * @param {Object} body_general
 * @param {Object} page_actor_id
 * @param {Object} image_1
 * @param {Object} image_1_link
 * @param {Object} image_2
 * @param {Object} image_2_link
 * @param {Object} image_3
 * @param {Object} image_3_link
 * @param {Object} image_4
 * @param {Object} image_4_link
 * @param {Object} target_ids
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    feed_publishTemplatizedAction: function(title_template, title_data, body_template, body_data, body_general, page_actor_id, image_1, image_1_link, image_2, image_2_link, image_3, image_3_link, image_4, image_4_link, target_ids, sequencer) {
        var parameters = {};
        parameters['title_template'] = title_template;
        if (page_actor_id) {
            parameters['page_actor_id'] = page_actor_id;
        }
        if (title_data) {
            parameters['title_data'] = title_data;
        }
        if (body_template) {
            parameters['body_template'] = body_template;
        }
        if (body_data) {
            parameters['body_data'] = body_data;
        }
        if (body_general) {
            parameters['body_general'] = body_general;
        }
        if (image_1) {
            parameters['image_1'] = image_1;
        }
        if (image_1_link) {
            parameters['image_1_link'] = image_1_link;
        }
        if (image_2) {
            parameters['image_2'] = image_2;
        }
        if (image_2_link) {
            parameters['image_2_link'] = image_2_link;
        }
        if (image_3) {
            parameters['image_3'] = image_3;
        }
        if (image_3_link) {
            parameters['image_3_link'] = image_3_link;
        }
        if (image_4) {
            parameters['image_4'] = image_4;
        }
        if (image_4_link) {
            parameters['image_4_link'] = image_4_link;
        }
        if (target_ids) {
            parameters['target_ids'] = target_ids.toString();
        }
        return this._callMethod$1('feed.publishTemplatizedAction', parameters, sequencer);
    },

/**
 * 
 * @param {Object} flid
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    friends_get: function(flid, sequencer) {
        var parameters = {};
        if (flid) {
            parameters['flid'] = flid;
        }
        return this._callMethod$1('friends.get', parameters, sequencer);
    },

/**
 * 
 * @param {String[]} uids1 A list of user IDs matched with uids2
 * @param {String[]} uids2 A list of user IDs matched with uids1
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    friends_areFriends: function(uids1, uids2, sequencer) {
        var parameters = {};
        parameters['uids1'] = uids1.toString();
        parameters['uids2'] = uids2.toString();
        return this._callMethod$1('friends.areFriends', parameters, sequencer);
    },

/**
 * 
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    friends_getAppUsers: function(sequencer) {
        return this._callMethod$1('friends.getAppUsers', null, sequencer);
    },

/**
 * 
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    friends_getLists: function(sequencer) {
        return this._callMethod$1('friends.getLists', null, sequencer);
    },

/**
 * 
 * @param {Number} uid The user's ID
 * @param {Object} gids
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    groups_get: function(uid, gids, sequencer) {
        var parameters = {};
        if (uid) {
            parameters['uid'] = uid;
        }
        if (gids) {
            parameters['gids'] = gids.toString();
        }
        return this._callMethod$1('groups.get', parameters, sequencer);
    },

/**
 * 
 * @param {Object} gid
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    groups_getMembers: function(gid, sequencer) {
        var parameters = {};
        parameters['gid'] = gid;
        return this._callMethod$1('groups.getMembers', parameters, sequencer);
    },

/**
 * 
 * @param {Object} listing_id
 * @param {Object} show_on_profile
 * @param {Object} listing_attrs
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    marketplace_createListing: function(listing_id, show_on_profile, listing_attrs, sequencer) {
        var parameters = {};
        parameters['listing_id'] = listing_id;
        parameters['show_on_profile'] = show_on_profile;
        parameters['listing_attrs'] = listing_attrs;
        return this._callMethod$1('marketplace.createListing', parameters, sequencer);
    },

/**
 * 
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    marketplace_getCategories: function(sequencer) {
        var parameters = {};
        return this._callMethod$1('marketplace.getCategories', parameters, sequencer);
    },

/**
 * 
 * @param {Object} listing_ids
 * @param {String[]} uids Filter by a list of users
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    marketplace_getListings: function(listing_ids, uids, sequencer) {
        var parameters = {};
        if (listing_ids) {
            parameters['listing_ids'] = listing_ids.toString();
        }
        if (uids) {
            parameters['uids'] = uids.toString();
        }
        return this._callMethod$1('marketplace.getListings', parameters, sequencer);
    },

/**
 * 
 * @param {Object} category
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    marketplace_getSubCategories: function(category, sequencer) {
        var parameters = {};
        parameters['category'] = category;
        return this._callMethod$1('marketplace.getSubCategories', parameters, sequencer);
    },

/**
 * 
 * @param {Object} listing_id
 * @param {Object} status
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    marketplace_RemoveListing: function(listing_id, status, sequencer) {
        var parameters = {};
        parameters['listing_id'] = listing_id;
        parameters['status'] = status;
        return this._callMethod$1('marketplace.removeListing', parameters, sequencer);
    },

/**
 * 
 * @param {Object} category
 * @param {Object} subcategory
 * @param {Object} query
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    marketplace_Search: function(category, subcategory, query, sequencer) {
        var parameters = {};
        if (category) {
            parameters['category'] = category;
            if (subcategory) {
                parameters['subcategory'] = subcategory;
            }
        }
        parameters['query'] = query;
        return this._callMethod$1('marketplace.search', parameters, sequencer);
    },

/**
 * 
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    notifications_get: function(sequencer) {
        var parameters = {};
        return this._callMethod$1('notifications.get', parameters, sequencer);
    },

/**
 * 
 * @param {Object} to_ids
 * @param {Object} notification
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    notifications_send: function(to_ids, notification, sequencer) {
        var parameters = {};
        parameters['to_ids'] = to_ids.toString();
        parameters['notification'] = notification;
        return this._callMethod$1('notifications.send', parameters, sequencer);
    },

/**
 * 
 * @param {Object} recipients
 * @param {Object} subject
 * @param {Object} text
 * @param {Object} fbml
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    notifications_sendEmail: function(recipients, subject, text, fbml, sequencer) {
        var parameters = {};
        parameters['recipients'] = recipients.toString();
        parameters['subject'] = subject;
        if (text) {
            parameters['text'] = text;
        }
        if (fbml) {
            parameters['fbml'] = fbml;
        }
        return this._callMethod$1('notifications.sendEmail', parameters, sequencer);
    },

/**
 * 
 * @param {Object} fields
 * @param {Object} page_ids
 * @param {Number} uid The user's ID
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    pages_getInfo: function(fields, page_ids, uid, sequencer) {
        var parameters = {};
        parameters['fields'] = fields.toString();
        parameters['page_ids'] = page_ids.toString();
        if (uid) {
            parameters['uid'] = uid;
        }
        return this._callMethod$1('pages.getInfo', parameters, sequencer);
    },

/**
 * 
 * @param {Object} page_id
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    pages_isAdmin: function(page_id, sequencer) {
        var parameters = {};
        parameters['page_id'] = page_id;
        return this._callMethod$1('pages.isAdmin', parameters, sequencer);
    },

/**
 * 
 * @param {Object} page_id
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    pages_isAppAdded: function(page_id, sequencer) {
        var parameters = {};
        parameters['page_id'] = page_id;
        return this._callMethod$1('pages.isAppAdded', parameters, sequencer);
    },

/**
 * 
 * @param {Object} page_id
 * @param {Number} uid The user's ID
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    pages_isFan: function(page_id, uid, sequencer) {
        var parameters = {};
        parameters['page_id'] = page_id;
        parameters['uid'] = uid;
        return this._callMethod$1('pages.isFan', parameters, sequencer);
    },

/**
 * 
 * @param {Object} pid
 * @param {Object} tag_uid
 * @param {Object} tag_text
 * @param {Object} x
 * @param {Object} y
 * @param {Object} tags
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    photos_addTag: function(pid, tag_uid, tag_text, x, y, tags, sequencer) {
        var parameters = {};
        parameters['pid'] = pid;
        if (tags) {
            parameters['tags'] = tags;
        }
        else {
            if (tag_uid) {
                parameters['tag_uid'] = tag_uid;
            }
            else if (tag_text) {
                parameters['tag_text'] = tag_text;
            }
            else {
                FB.FBDebug.assert(false, 'Either tag_uid or tag_text must specified');
            }
            parameters['x'] = x;
            parameters['y'] = y;
        }
        return this._callMethod$1('photos.addTag', parameters, sequencer);
    },

/**
 * 
 * @param {Object} name
 * @param {Object} location
 * @param {Object} description
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    photos_createAlbum: function(name, location, description, sequencer) {
        var parameters = {};
        parameters['name'] = name;
        parameters['location'] = location;
        parameters['description'] = description;
        return this._callMethod$1('photos.createAlbum', parameters, sequencer);
    },

/**
 * 
 * @param {Object} subj_id
 * @param {Object} aid
 * @param {Object} pids
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    photos_get: function(subj_id, aid, pids, sequencer) {
        var parameters = {};
        if (subj_id) {
            parameters['subj_id'] = subj_id;
        }
        if (aid) {
            parameters['aid'] = aid;
        }
        if (pids) {
            parameters['pids'] = pids.toString();
        }
        return this._callMethod$1('photos.get', parameters, sequencer);
    },

/**
 * 
 * @param {Number} uid The user's ID
 * @param {Object} aids
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    photos_getAlbums: function(uid, aids, sequencer) {
        var parameters = {};
        if (uid) {
            parameters['uid'] = uid;
        }
        if (aids) {
            parameters['aids'] = aids.toString();
        }
        return this._callMethod$1('photos.getAlbums', parameters, sequencer);
    },

/**
 * 
 * @param {Object} pids
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    photos_getTags: function(pids, sequencer) {
        var parameters = {};
        parameters['pids'] = pids.toString();
        return this._callMethod$1('photos.getTags', parameters, sequencer);
    },

/**
 * 
 * @param {String[]} uids Filter by a list of users
 * @param {Object} fields
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    users_getInfo: function(uids, fields, sequencer) {
        var parameters = {};
        parameters['uids'] = uids.toString();
        parameters['fields'] = fields.toString();
        return this._callMethod$1('users.getInfo', parameters, sequencer);
    },

/**
 * 
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    users_getLoggedInUser: function(sequencer) {
        var parameters = {};
        return this._callMethod$1('users.getLoggedInUser', parameters, sequencer);
    },

/**
 * 
 * @param {Object} ext_perm
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    users_hasAppPermission: function(ext_perm, sequencer) {
        var parameters = {};
        parameters['ext_perm'] = ext_perm;
        return this._callMethod$1('users.hasAppPermission', parameters, sequencer);
    },

/**
 * 
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    users_isAppAdded: function(sequencer) {
        var parameters = {};
        return this._callMethod$1('users.isAppAdded', parameters, sequencer);
    },

/**
 * 
 * @param {Object} status
 * @param {Object} clear
 * @param {Object} status_includes_verb
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    users_setStatus: function(status, clear, status_includes_verb, sequencer) {
        var parameters = {};
        parameters['status'] = status;
        parameters['clear'] = clear;
        parameters['status_includes_verb'] = status_includes_verb;
        return this._callMethod$1('users.setStatus', parameters, sequencer);
    },

/**
 * 
 * @param {Object} query
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    fql_query: function(query, sequencer) {
        var parameters = {};
        parameters['query'] = query;
        return this._callMethod$1('fql.query', parameters, sequencer);
    },

/**
 * 
 * @param {Number} uid The user's ID
 * @param {Object} profile
 * @param {Object} profile_action
 * @param {Object} mobile_profile
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    profile_setFBML: function(uid, profile, profile_action, mobile_profile, sequencer) {
        var parameters = {};
        if (uid) {
            parameters['uid'] = uid;
        }
        parameters['profile'] = profile;
        parameters['profile_action'] = profile_action;
        parameters['mobile_profile'] = mobile_profile;
        return this._callMethod$1('profile.setFBML', parameters, sequencer);
    },

/**
 * 
 * @param {Number} uid The user's ID
 * @param {FB.BatchSequencer} sequencer A sequencer object to schedule batch operations
 */
    profile_getFBML: function(uid, sequencer) {
        var parameters = {};
        parameters['uid'] = uid;
        return this._callMethod$1('profile.getFBML', parameters, sequencer);
    },

    _callMethod$1: function(method, parameters, executeUnit) {
        var jsonRequest = this._generateJsonRequest(method, parameters);
        if (typeof(executeUnit) !== 'function') {
            var pendingResult = new FB.PendingResult();
            executeUnit._api = this;
            executeUnit._addStep(jsonRequest, pendingResult);
            return pendingResult;
        }
        else {
            var callback = (executeUnit);
            jsonRequest.callback = Delegate.create(this, function(result, exception) {
                var apiError = result;
                if (!exception && !isUndefined(apiError.error_code)) {
                    FB.FBDebug.assert(false, 'API error');
                    exception = Error.create(apiError.error_msg, apiError);
                    result = null;
                }
                callback.invoke(result, exception);
            });
            jsonRequest.sendRequest();
            return null;
        }
    },

    _generateJsonRequest: function(method, parameters) {
        if (!parameters) {
            parameters = {};
        }
        var $dict1 = parameters;
        for (var $key2 in $dict1) {
            var entry = { key: $key2, value: $dict1[$key2] };
            var scriptType = typeof(entry.value);
            if (scriptType === 'boolean') {
                parameters[entry.key] = (parameters[entry.key]) ? 1 : 0;
            }
            else if (scriptType === 'object') {
                parameters[entry.key] = FB.JSON.serialize(entry.value);
            }
        }
        parameters['method'] = method;
        if (this.session) {
            parameters['session_key'] = this.session.session_key;
        }
        parameters['api_key'] = this.apiKey;
        parameters['format'] = 'JSON';
        var callId = Date.get_now().getMilliseconds();
        if (callId === this.lastCallId) {
            callId = this.lastCallId + 1;
        }
        this.lastCallId = callId;
        parameters['call_id'] = callId;
        if (!parameters['v']) {
            parameters['v'] = FB.ApiClientBase.version;
        }
        parameters['ss'] = 1;
        parameters['sig'] = this.generateSignature(parameters);
        var queryBuilder = new StringBuilder();
        var $dict3 = parameters;
        for (var $key4 in $dict3) {
            var entry = { key: $key4, value: $dict3[$key4] };
            if (!queryBuilder.get_isEmpty()) {
                queryBuilder.append('&');
            }
            queryBuilder.append(entry.key + '=' + escape(entry.value.toString()));
        }
        var requestUrl = this.serverAddress;
        requestUrl += ('?method=' + parameters['method']);
        var requestBody = queryBuilder.toString();
        var headers = {};
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        var jsonRequest = new FB.XdJsonRequest(this.xdHttpClient, 'POST', requestUrl, requestBody, headers);
        return jsonRequest;
    }
}


////////////////////////////////////////////////////////////////////////////////
// FB.XdHttpRequestClient

FB.XdHttpRequestClient = function FB_XdHttpRequestClient(requestServerUrl, receiverUrl, server_iframe_name) {
    var divDom = document.createElement('div');
    divDom = FB.XdComm.Server.singleton.get_hiddenIFrameContainer().appendChild(divDom);
    var iframe_markup = '<iframe name=\"' + server_iframe_name + '\" src=\"' + requestServerUrl + '\" class=\"FB_SERVER_IFRAME\"></iframe>';
    divDom.innerHTML = iframe_markup;
    this._receiverUrl = receiverUrl;
    this._serverIframeName = server_iframe_name;
}
FB.XdHttpRequestClient._ensureListenerStarted = function FB_XdHttpRequestClient$_ensureListenerStarted() {
    if (!FB.XdHttpRequestClient._handlerRegistered) {
        FB.XdComm.Server.singleton.registerDataHandler('http_client', Delegate.create(null, FB.XdHttpRequestClient._onDataReceived));
        FB.XdHttpRequestClient._handlerRegistered = true;
    }
}
FB.XdHttpRequestClient._onDataReceived = function FB_XdHttpRequestClient$_onDataReceived(senderReceiverUrl, senderIframeName, data) {
    var result = data;
    var callback = FB.XdHttpRequestClient._requestQueue[result.id];
    callback.invoke(result);
}
FB.XdHttpRequestClient.prototype = {

    send: function(method, url, requestBody, extraHeaders, callback) {
        var uri = new FB.Uri(url);
        var rootedUrl = uri.get_pathAndQuery();
        FB.XdHttpRequestClient._ensureListenerStarted();
        var requestId = FB.XdHttpRequestClient._idCount++;
        var request_data = [ requestId, method, rootedUrl, requestBody, extraHeaders ];
        FB.XdHttpRequestClient._requestQueue[requestId.toString()] = callback;
        FB.XdComm.Server.singleton.send(this._receiverUrl, this._serverIframeName, 'http_server', request_data, null);
    },

    _receiverUrl: null,
    _serverIframeName: null
}


////////////////////////////////////////////////////////////////////////////////
// FB.PendingResult

/**
 * 
 */
FB.PendingResult = function FB_PendingResult() {
}
FB.PendingResult.prototype = {
    result: null,
    exception: null,

/**
 * 
 */
    get_isReady: function() {
        return !(!this.result && !this.exception);
    },

/**
 * 
 * @param {Object} value
 */
    add_onReady: function(value) {
        this.__onReady = Delegate.combine(this.__onReady, value);
    },
	/**
	 * 
	 * @param {Object} value
	 */
    remove_onReady: function(value) {
        this.__onReady = Delegate.remove(this.__onReady, value);
    },

    __onReady: null,

/**
 * 
 * @param {Object} result
 * @param {Object} exception
 */
    setPendingResult: function(result, exception) {
        var apiError = result;
        if (!exception && apiError && !isUndefined(apiError.error_code)) {
            exception = Error.create(apiError.error_msg, apiError);
            FB.FBDebug.assert(false, 'API error');
            result = null;
        }
        this.result = result;
        this.exception = exception;
        if (this.__onReady) {
            this.__onReady.invoke(this);
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// FB.SequencerBase

/**
 * 
 */
FB.SequencerBase = function FB_SequencerBase() {
}
FB.SequencerBase.prototype = {
    _completedCallback: null,
    isParallel: true,
    _api: null
}


////////////////////////////////////////////////////////////////////////////////
// FB.BatchSequencer

/**
 * 
 */
FB.BatchSequencer = function FB_BatchSequencer() {
    this.stepsList = [];
    FB.BatchSequencer.constructBase(this);
}
FB.BatchSequencer.prototype = {

/**
 * 
 * @param {Object} completedCallback
 */
    execute: function(completedCallback) {
        this._completedCallback = completedCallback;
        var stepsCount = this.stepsList.length;
        if (stepsCount > 1) {
            var parameters = {};
            var methodFeed = [];
            var $enum1 = this.stepsList.getEnumerator();
            while ($enum1.moveNext()) {
                var stepInfo = $enum1.get_current();
                methodFeed.add(stepInfo.jsonRequest._requestBody);
            }
            parameters['method_feed'] = methodFeed;
            parameters['serial_only'] = !this.isParallel;
            var batchRequest = this._api._generateJsonRequest('batch.run', parameters);
            batchRequest.callback = Delegate.create(this, function(result, exception) {
                var apiError = result;
                if (!exception && !isUndefined(apiError.error_code)) {
                    exception = Error.create(apiError.error_msg, apiError);
                    FB.FBDebug.assert(false, 'API error');
                    result = null;
                }
                this._setStepResults$1(result, exception);
                this.onAllCompleted();
            });
            batchRequest.sendRequest();
        }
        else if (stepsCount === 1) {
            var stepInfo = this.stepsList[0];
            stepInfo.jsonRequest.callback = Delegate.create(this, function(result, exception) {
                stepInfo.result.setPendingResult(result, exception);
                this.onAllCompleted();
            });
            stepInfo.jsonRequest.sendRequest();
        }
        else {
            this.onAllCompleted();
        }
    },

    _setStepResults$1: function(batchResult, exception) {
        var batchResultList = batchResult;
        FB.FBDebug.assert(!batchResultList || batchResultList.length === this.stepsList.length, '');
        var stepsCount = this.stepsList.length;
        for (var i = 0; i < stepsCount; i++) {
            var pendingResult = (this.stepsList[i]).result;
            if (exception) {
                pendingResult.exception = exception;
                pendingResult.result = null;
            }
            else if (batchResultList) {
                var individualResultString = batchResultList[i];
                var individualResult = FB.JSON.deserialize(individualResultString, true);
                pendingResult.setPendingResult(individualResult, null);
            }
        }
    },

/**
 * 
 */
    onAllCompleted: function() {
        this.stepsList.clear();
        if (this._completedCallback) {
            var callback = this._completedCallback;
            this._completedCallback = null;
            callback.invoke();
        }
    },

    _addStep: function(jsonRequest, pendingResult) {
        var stepInfo = FB.$create__stepInfo(jsonRequest, pendingResult);
        this.stepsList.add(stepInfo);
    }
}


////////////////////////////////////////////////////////////////////////////////
// FB.ImmediateSequencer

/**
 * 
 * @param {Object} callback
 */
FB.ImmediateSequencer = function FB_ImmediateSequencer(callback) {
    FB.ImmediateSequencer.constructBase(this);
    this.isParallel = false;
    this._callback$2 = callback;
}
FB.ImmediateSequencer.prototype = {

    _addStep: function(jsonRequest, pendingResult) {
        this.pendingResult = pendingResult;
        FB.ImmediateSequencer.callBase(this, '_addStep', [ jsonRequest, pendingResult ]);
        this.execute(null);
    },

/**
 * 
 */
    onAllCompleted: function() {
        this.stepsList.clear();
        if (this._callback$2) {
            this._callback$2.invoke(this.pendingResult.result, this.pendingResult.exception);
        }
    },

    pendingResult: null,
    _callback$2: null
}


////////////////////////////////////////////////////////////////////////////////
// FB.XdJsonRequest

/**
 * 
 * @param {Object} xdHttpClient
 * @param {Object} method
 * @param {Object} url
 * @param {Object} requestBody
 * @param {Object} extraHeaders
 */
FB.XdJsonRequest = function FB_XdJsonRequest(xdHttpClient, method, url, requestBody, extraHeaders) {
    this._method = method;
    this._url = url;
    this._requestBody = requestBody;
    this._extraHeaders = extraHeaders;
    this._xdHttpClient = xdHttpClient;
}
FB.XdJsonRequest.prototype = {

/**
 * 
 */
    sendRequest: function() {
        this._xdHttpClient.send(this._method, this._url, this._requestBody, this._extraHeaders, Delegate.create(this, function(xd_result) {
            if (xd_result.status < 400) {
                var responseText = xd_result.responseText;
                var result;
                try {
                    result = FB.JSON.deserialize(responseText, true);
                }
                catch (exception) {
                    var jsonException = Error.create('Json exception', responseText, exception);
                    this.callback.invoke(null, exception);
                    return;
                }
                this.callback.invoke(result, null);
            }
            else {
                var exception = new Error(String.format('HTTP request failure status code=\'{0}\', text=\'{1}\'', xd_result.status, xd_result.statusText));
                this.callback.invoke(null, exception);
            }
        }));
    },

    callback: null,
    _method: null,
    _url: null,
    _requestBody: null,
    _extraHeaders: null,
    _xdHttpClient: null
}


FB.ApiClientBase.createClass('FB.ApiClientBase');
FB.ApiClient.createClass('FB.ApiClient', FB.ApiClientBase);
FB.XdHttpRequestClient.createClass('FB.XdHttpRequestClient');
FB.PendingResult.createClass('FB.PendingResult');
FB.SequencerBase.createClass('FB.SequencerBase');
FB.BatchSequencer.createClass('FB.BatchSequencer', FB.SequencerBase);
FB.ImmediateSequencer.createClass('FB.ImmediateSequencer', FB.BatchSequencer);
FB.XdJsonRequest.createClass('FB.XdJsonRequest');
FB.ApiClientBase.version = '1.0';
FB.XdHttpRequestClient._requestQueue = {};
FB.XdHttpRequestClient._handlerRegistered = false;
FB.XdHttpRequestClient._idCount = 0;

// ---- Do not remove this footer ----
// Generated using Script# v0.4.5.0 (http://projects.nikhilk.net)
// -----------------------------------
// XdHttpRequestServer.js
//


Type.createNamespace('FB');

////////////////////////////////////////////////////////////////////////////////
// FB.XdHttpRequestServer

FB.XdHttpRequestServer = function FB_XdHttpRequestServer() {
}
FB.XdHttpRequestServer.main = function FB_XdHttpRequestServer$main(args) {
    var receiverUrl = args['receiver'];
    if (Object.keyExists(args, 'allowed_url_filter')) {
        FB.XdHttpRequestServer._allowedUrlFilter = new RegExp(args['allowed_url_filter']);
    }
    if (Object.keyExists(args, 'allowed_urls')) {
        FB.XdHttpRequestServer._allowedUrls = args['allowed_urls'];
    }
    var rootUri = new FB.Uri(window.location.href);
    FB.XdHttpRequestServer._rootUrl = rootUri.get_schemeAndDomain();
    FB.XdComm.Server.singleton.set_receiverUrl(receiverUrl);
    FB.XdComm.Server.singleton.registerDataHandler('http_server', Delegate.create(null, FB.XdHttpRequestServer._onDataReceived));
}
FB.XdHttpRequestServer._isUrlAllowed = function FB_XdHttpRequestServer$_isUrlAllowed(url) {
    if (FB.XdHttpRequestServer._allowedUrlFilter && FB.XdHttpRequestServer._allowedUrlFilter.test(url)) {
        return true;
    }
    if (FB.XdHttpRequestServer._allowedUrls) {
        var $enum1 = FB.XdHttpRequestServer._allowedUrls.getEnumerator();
        while ($enum1.moveNext()) {
            var allowed_url = $enum1.get_current();
            if (allowed_url === url) {
                return true;
            }
        }
    }
    return false;
}
FB.XdHttpRequestServer._onDataReceived = function FB_XdHttpRequestServer$_onDataReceived(senderReceiverUrl, senderIframeName, data) {
    var request_data = data;
    var request = new XMLHttpRequest();
    var url = request_data[2];
    if (!FB.XdHttpRequestServer._isUrlAllowed(url)) {
        FB.FBDebug.assert(false, 'Url ' + url + ' is not allowed');
        return;
    }
    url = FB.XdHttpRequestServer._rootUrl + url;
    request.onreadystatechange = Delegate.create(null, function() {
        if (request.readyState === 4) {
            var result = FB.$create_XdHttpRequestResult(request_data[0], request.status, request.statusText, request.responseText);
            FB.XdComm.Server.singleton.send(senderReceiverUrl, senderIframeName, 'http_client', result, null);
        }
    });
    request.open(request_data[1], request_data[2], true);
    var extraHeaders = request_data[4];
    if (extraHeaders) {
        var $dict1 = extraHeaders;
        for (var $key2 in $dict1) {
            var headerItem = { key: $key2, value: $dict1[$key2] };
            request.setRequestHeader(headerItem.key, headerItem.value.toString());
        }
    }
    request.send(request_data[3]);
}


FB.XdHttpRequestServer.createClass('FB.XdHttpRequestServer');
FB.XdHttpRequestServer._rootUrl = null;
FB.XdHttpRequestServer._allowedUrlFilter = null;
FB.XdHttpRequestServer._allowedUrls = null;

// ---- Do not remove this footer ----
// Generated using Script# v0.4.5.0 (http://projects.nikhilk.net)
// -----------------------------------
FB.FeatureLoader.singleton.onScriptLoaded(['Api']);
