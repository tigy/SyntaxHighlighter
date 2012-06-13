// Contributed by ribrdb @ code.google.com

/**
 * @fileoverview
 * Registers a language handler for YAML.
 *
 * @author ribrdb
 */

SyntaxHighligher.register('yaml yml', [
	['punctuation', /^[:|>?]+/, ':|>?'],
	['declaration', /^%(?:YAML|TAG)[^#\r\n]+/, '%'],
	['type', /^[&]\S+/, '&'],
	['type', /^!\S*/, '!'],
	['string', /^"(?:[^\\"]|\\.)*(?:"|$)/, '"'],
	['string', /^'(?:[^']|'')*(?:'|$)/, "'"],
	['comment', /^#[^\r\n]*/, '#'],
	['plain', /^\s+/, ' \t\r\n'],
	['declaration', /^(?:---|\.\.\.)(?:[\r\n]|$)/],
	['punctuation', /^-/],
	['keyword', /^\w+:[ \r\n]/],
	['plain', /^\w+/]
]);
