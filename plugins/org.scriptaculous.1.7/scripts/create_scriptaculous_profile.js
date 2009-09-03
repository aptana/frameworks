/*
 * Menu: References > Create Scriptaculous Reference
 * Kudos: Ingo Muschenetz
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 */
 
function main() {

	loadBundle("com.aptana.ide.editors");
    var profileObject = Packages.com.aptana.ide.editors.profiles.Profile;
    var profile = new profileObject("Scriptaculous 1.6.5", "scriptaculous", true);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://org.scriptaculous.1.7/libraries/lib/prototype/prototype.js");
    temp[1] = bundles.resolveInternalUrl("bundleentry://org.scriptaculous.1.7/libraries/lib/scriptaculous/scriptaculous.js");
	profile.addURIs(temp);
    profiles.addProfile(profile);
}