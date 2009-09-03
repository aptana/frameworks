/*
 * Menu: References > Create Mootools Reference
 * Kudos: Ingo Muschenetz
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 */
 
function main() {

	loadBundle("com.aptana.ide.editors");
    var profileObject = Packages.com.aptana.ide.editors.profiles.Profile;
    var profile = new profileObject("Mootools 83", "mootools", true);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://net.mootools.1.1/libraries/lib/mootools/mootools.js");
	profile.addURIs(temp);
    profiles.addProfile(profile);
}