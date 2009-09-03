/*
 * Menu: References > Ext : Create File Reference
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 */
 
function main() {

	loadBundle("com.aptana.ide.editors");
    var profileObject = Packages.com.aptana.ide.editors.profiles.Profile;
    var profile = new profileObject("Ext 1.1", "ext", true);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://com.extjs.ext.1.1/libraries/lib/ext/ext-all.js");
	profile.addURIs(temp);
    profiles.addProfile(profile);
}