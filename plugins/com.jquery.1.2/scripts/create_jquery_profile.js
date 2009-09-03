/*
 * Menu: References > Create jQuery Reference
 * Kudos: Ingo Muschenetz
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 */
 
function main() {

	loadBundle("com.aptana.ide.editors");
    var profileObject = Packages.com.aptana.ide.editors.profiles.Profile;
    var profile = new profileObject("jQuery 1.2", "jquery", true);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://com.jquery.1.2/libraries/lib/jquery/jquery.js");
    temp[1] = bundles.resolveInternalUrl("bundleentry://com.jquery.1.2/libraries/lib/jquery/jquery.sdoc");
	profile.addURIs(temp);
    profiles.addProfile(profile);
}