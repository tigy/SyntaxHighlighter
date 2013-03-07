
SyntaxHighligher.register('in.php', SyntaxHighligher.simpleLexer({
	'keywords': 'abstract and array as break case catch cfunction class clone const continue declare default die do ' +
						'else elseif enddeclare endfor endforeach endif endswitch endwhile extends final for foreach ' +
						'function include include_once global goto if implements interface instanceof namespace new ' +
						'old_function or private protected public return require require_once static switch ' +
						'throw try use var while xor',
	'cStyleComments': true,
	hashComments: 2,
	'regexLiterals': true
}));