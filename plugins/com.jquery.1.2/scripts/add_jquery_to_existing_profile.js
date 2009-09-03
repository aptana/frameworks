/*
 * Menu: References > Add jQuery To Existing Reference
 * Kudos: Ingo Muschenetz
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 * Key: M1+M2+M3+A
 */
 
function main() {
	
    var profile = profiles.getCurrentProfile();
    profile = profiles.makeProfileStatic(profile);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://com.jquery.1.2/libraries/lib/jquery/jquery.js");
    temp[1] = bundles.resolveInternalUrl("bundleentry://com.jquery.1.2/libraries/lib/jquery/jquery.sdoc");
	profile.addURIs(temp);
	
}