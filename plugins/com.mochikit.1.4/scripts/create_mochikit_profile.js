/*
 * Menu: References > Create MochiKit Reference
 * Kudos: Ingo Muschenetz
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 */
 
function main() {

 	loadBundle("com.aptana.ide.editors");
    var profileObject = Packages.com.aptana.ide.editors.profiles.Profile;
    var profile = new profileObject("MochiKit 1.4", "mochikit", true);
    var temp = new Array();
    var base = "bundleentry://com.mochikit.1.4/libraries/lib/MochiKit/";
    var i = 0;
    temp[i] = bundles.resolveInternalUrl(base + "MochiKit.js");
    temp[i++] = bundles.resolveInternalUrl(base + "MochiKit.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Base.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Base.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Iter.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Iter.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Logging.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Logging.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "DateTime.js");
    temp[i++] = bundles.resolveInternalUrl(base + "DateTime.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Format.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Format.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Async.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Async.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "DOM.js");
    temp[i++] = bundles.resolveInternalUrl(base + "DOM.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Style.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Style.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "LoggingPane.js");
    temp[i++] = bundles.resolveInternalUrl(base + "LoggingPane.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Color.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Color.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Signal.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Signal.sdoc");
    temp[i++] = bundles.resolveInternalUrl(base + "Visual.js");
    temp[i++] = bundles.resolveInternalUrl(base + "Visual.sdoc");
	profile.addURIs(temp);
    profiles.addProfile(profile);
}