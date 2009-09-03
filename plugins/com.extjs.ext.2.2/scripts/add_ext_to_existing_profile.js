/*
 * Menu: Profiles > Ext : Add to Existing Profile
 * License: EPL 1.0
 * DOM: http://localhost/com.aptana.ide.scripting
 * Key: M1+M2+M3+A
 */
 
function main() {
	
    var profile = profiles.getCurrentProfile();
    profile = profiles.makeProfileStatic(profile);
    var temp = new Array();
    temp[0] = bundles.resolveInternalUrl("bundleentry://com.extjs.ext.2.0/libraries/lib/ext/ext-all.js");
	profile.addURIs(temp);
	
}
