
SyntaxHighligher.register('coffee', SyntaxHighligher.simpleLexer({
	'keywords': "all and by catch class else extends false finally " + "for if in is isnt loop new no not null of off on or return super then " + "true try unless until when while yes",
	'hashComments': 3,
	// ### style block comments
	'cStyleComments': true,
	'multilineStrings': true,
	'tripleQuotedStrings': true,
	'regexLiterals': true
}));