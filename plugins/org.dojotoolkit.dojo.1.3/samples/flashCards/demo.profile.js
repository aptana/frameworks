dependencies = {
	layers: [
		{
			name: "../../src.js",
			resourceName: "flashCards.src",
			dependencies: [
				"flashCards.src"
			]
		}
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ],
		[ "demos", "../demos" ]
	]
}
