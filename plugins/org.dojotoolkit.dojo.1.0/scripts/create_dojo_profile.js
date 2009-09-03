/*
 * Menu: References > Create Dojo Reference
 * Kudos: Ingo Muschenetz
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 */
 
function main() {

	loadBundle("com.aptana.ide.editors");
    var profileObject = Packages.com.aptana.ide.editors.profiles.Profile;
    var profile = new profileObject("Dojo 0.4.1", "dojo", true);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://org.dojotoolkit.dojo.0.4/libraries/lib/dojo/dojo.js");
	profile.addURIs(temp);
    profiles.addProfile(profile);
}