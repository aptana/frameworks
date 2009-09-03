/*
 * Menu: References > Create YUI 2.4 Reference
 * Kudos: Ingo Muschenetz
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 */
 
function main() {

	loadBundle("com.aptana.ide.editors");
    var profileObject = Packages.com.aptana.ide.editors.profiles.Profile;
    var profile = new profileObject("YUI 2.4.0", "yui", true);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://com.yahoo.yui.2.5/libraries/lib/YahooUI/yahoo/yahoo-debug.js");
    temp[1] = bundles.resolveInternalUrl("bundleentry://com.yahoo.yui.2.5/libraries/lib/YahooUI/event/event-debug.js");
    temp[2] = bundles.resolveInternalUrl("bundleentry://com.yahoo.yui.2.5/libraries/lib/YahooUI/dom/dom-debug.js");
    temp[3] = bundles.resolveInternalUrl("bundleentry://com.yahoo.yui.2.5/libraries/lib/YahooUI/animation/animation-debug.js");
	profile.addURIs(temp);
    profiles.addProfile(profile);
}
