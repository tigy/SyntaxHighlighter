

(function () {

	var SH = SyntaxHighligher;

	// Keyword lists for various languages.
	// We use things that coerce to strings to make them compact when minified
	// and to defeat aggressive optimizers that fold large string constants.
	var FLOW_CONTROL_KEYWORDS = ["break continue do else for if return while"];
	var C_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "auto case char const default double enum extern float goto int long register short signed sizeof " + "static struct switch typedef union unsigned void volatile"];
	var COMMON_KEYWORDS = [C_KEYWORDS, "catch class delete false import new operator private protected public this throw true try typeof"];
	var CPP_KEYWORDS = [COMMON_KEYWORDS, "alignof align_union asm axiom bool concept concept_map const_cast constexpr decltype dynamic_cast explicit export friend inline late_check mutable namespace nullptr reinterpret_cast static_assert static_cast " + "template typeid typename using virtual where"];
	var JAVA_KEYWORDS = [COMMON_KEYWORDS, "abstract boolean byte extends final finally implements import instanceof null native package strictfp super synchronized throws transient"];
	var CSHARP_KEYWORDS = [JAVA_KEYWORDS, "as base by checked decimal delegate descending dynamic event " + "fixed foreach from group implicit in interface internal into is lock object out override orderby params partial readonly ref sbyte sealed " + "stackalloc string select uint ulong unchecked unsafe ushort var"];
	var JSCRIPT_KEYWORDS = [COMMON_KEYWORDS, "debugger eval export function get null set undefined var with " + "Infinity NaN"];
	var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for goto if import last local my next no our print package redo require " + "sub undef unless until use wantarray while BEGIN END";
	var PYTHON_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "and as assert class def del elif except exec finally from global import in is lambda " + "nonlocal not or pass print raise try with yield " + "False True None"];
	var RUBY_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "alias and begin case class def defined elsif end ensure false in module next nil not or redo " + "rescue retry self super then true undef unless until when yield BEGIN END"];
	var SH_KEYWORDS = [FLOW_CONTROL_KEYWORDS, "case done elif esac eval fi function in local set then until"];
	var ALL_KEYWORDS = [CPP_KEYWORDS, CSHARP_KEYWORDS, JSCRIPT_KEYWORDS, PERL_KEYWORDS + PYTHON_KEYWORDS, RUBY_KEYWORDS, SH_KEYWORDS];
	var C_TYPES = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/;

	/**
	 * A set of tokens that can precede a regular expression literal in
	 * javascript
	 * http://web.archive.org/web/20070717142515/http://www.mozilla.org/js/language/js20/rationale/syntax.html
	 * has the full list, but I've removed ones that might be problematic when
	 * seen in languages that don't support regular expression literals.
	 *
	 * <p>Specifically, I've removed any keywords that can't precede a regexp
	 * literal in a syntactically legal javascript program, and I've removed the
	 * "in" keyword since it's not a keyword in many languages, and might be used
	 * as a count of inches.
	 *
	 * <p>The link a above does not accurately describe EcmaScript rules since
	 * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works
	 * very well in practice.
	 *
	 * @private
	 * @const
	 */
	var REGEXP_PRECEDER_PATTERN = '(?:^^\\.?|[+-]|\\!|\\!=|\\!==|\\#|\\%|\\%=|&|&&|&&=|&=|\\(|\\*|\\*=|\\+=|\\,|\\-=|\\->|\\/|\\/=|:|::|\\;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\@|\\[|\\^|\\^=|\\^\\^|\\^\\^=|\\{|\\||\\|=|\\|\\||\\|\\|=|\\~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*';
	// token style names.  correspond to css classes
	/**
	 * token style for a string literal
	 * @const
	 */
	var STRING = 'string';
	/**
	 * token style for a keyword
	 * @const
	 */
	var KEYWORD = 'keyword';
	/**
	 * token style for a comment
	 * @const
	 */
	var COMMENT = 'comment';
	/**
	 * token style for a type
	 * @const
	 */
	var TYPE = 'type';
	/**
	 * token style for a literal value.  e.g. 1, null, true.
	 * @const
	 */
	var LITERAL = 'literal';
	/**
	 * token style for a punctuation string.
	 * @const
	 */
	var PUNCTUATION = 'punctuation';
	/**
	 * token style for a punctuation string.
	 * @const
	 */
	var PLAIN = 'plain';

	/**
	 * token style for an sgml tag.
	 * @const
	 */
	var TAG = 'tag';
	/**
	 * token style for a markup declaration such as a DOCTYPE.
	 * @const
	 */
	var DECLARATION = 'declaration';
	/**
	 * token style for embedded source.
	 * @const
	 */
	var SOURCE = 'source';
	/**
	 * token style for an sgml attribute name.
	 * @const
	 */
	var ATTRIB_NAME = 'attrname';
	/**
	 * token style for an sgml attribute value.
	 * @const
	 */
	var ATTRIB_VALUE = 'attrvalue';

	var register = SH.register = function (lang, brush) {
		lang = lang.split(' ');
		brush = SH.createBrush(brush);
		for (var i = 0; i < lang.length; i++) {
			SH.brushes[lang[i]] = brush;
		}
	};

	/** returns a function that produces a list of decorations from source text.
	 *
	 * This code treats ", ', and ` as string delimiters, and \ as a string
	 * escape.  It does not recognize perl's qq() style strings.
	 * It has no special handling for double delimiter escapes as in basic, or
	 * the tripled delimiters used in python, but should work on those regardless
	 * although in those cases a single string literal may be broken up into
	 * multiple adjacent string literals.
	 *
	 * It recognizes C, C++, and shell style comments.
	 *
	 * @param {Object} options a set of optional parameters.
	 * @return {function (Object)} a function that examines the source code
	 *     in the input job and builds the decoration list.
	 */
	var simpleLexer = SH.simpleLexer = function (options) {

		var shortcutStylePatterns = [], fallthroughStylePatterns = [];
		if (options.tripleQuotedStrings) {
			// '''multi-line-string''', 'single-line-string', and double-quoted
			shortcutStylePatterns.push(['string', /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/, '\'"']);
		} else if (options.multiLineStrings) {
			// 'multi-line-string', "multi-line-string"
			shortcutStylePatterns.push(['string', /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/, '\'"`']);
		} else {
			// 'single-line-string', "single-line-string"
			shortcutStylePatterns.push(['string', /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/, '"\'']);
		}
		if (options.verbatimStrings) {
			// verbatim-string-literal production from the C# grammar.  See issue 93.
			fallthroughStylePatterns.push(['string', /^@\"(?:[^\"]|\"\")*(?:\"|$)/]);
		}
		var hc = options.hashComments;
		if (hc) {
			if (options.cStyleComments) {
				if (hc > 1) {  // multiline hash comments
					shortcutStylePatterns.push(['comment', /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, '#']);
				} else {
					// Stop C preprocessor declarations at an unclosed open comment
					shortcutStylePatterns.push(['comment', /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/, '#']);
				}
				fallthroughStylePatterns.push(['string', /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/]);
			} else {
				shortcutStylePatterns.push(['comment', /^#[^\r\n]*/, '#']);
			}
		}
		if (options.cStyleComments) {
			fallthroughStylePatterns.push(['comment', /^\/\/[^\r\n]*/]);
			fallthroughStylePatterns.push(['comment', /^\/\*[\s\S]*?(?:\*\/|$)/]);
		}
		if (options.regexLiterals) {
			fallthroughStylePatterns.push(['regex', new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + // A regular expression literal starts with a slash that is
			// not followed by * or / so that it is not confused with
			// comments.
			'/(?=[^/*])'
			// and then contains any number of raw characters,
			+
			'(?:[^/\\x5B\\x5C]'
			// escape sequences (\x5C),
			+
			'|\\x5C[\\s\\S]'
			// or non-nesting character sets (\x5B\x5D);
			+
			'|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
			// finally closed by a /.
			+
			'/' + ')')]);
		}

		var types = options.types;
		if (types) {
			fallthroughStylePatterns.push(['type', types]);
		}

		var keywords = ("" + options.keywords).replace(/^ | $/g, '');
		if (keywords.length) {
			fallthroughStylePatterns.push(['keyword', new RegExp('^(?:' + keywords.replace(/[\s,]+/g, '|') + ')\\b')]);
		}

		shortcutStylePatterns.push(['plain', /^\s+/, ' \r\n\t\xA0']);
		fallthroughStylePatterns.push(
        // TODO(mikesamuel): recognize non-latin letters and numerals in idents
        ['literal', /^@[a-z_$][a-z_$@0-9]*/i],
        ['type', /^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\w+_t\b)/],
        ['plain', /^[a-z_$][a-z_$@0-9]*/i],
        ['literal', new RegExp(
             '^(?:'
             // A hex number
             + '0x[a-f0-9]+'
             // or an octal or decimal number,
             + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
             // possibly in scientific notation
             + '(?:e[+\\-]?\\d+)?'
             + ')'
             // with an optional modifier like UL for unsigned long
             + '[a-z]*', 'i'), '0123456789'],
        // Don't treat escaped quotes in bash as starting strings.  See issue 144.
        ['plain', /^\\[\s\S]?/],
        ['punctuation', /^.[^\s\w\.$@\'\"\`\/\#\\]*/]);

		return shortcutStylePatterns.concat(fallthroughStylePatterns);





	}

	register('default', simpleLexer({
		'keywords': ALL_KEYWORDS,
		'hashComments': true,
		'cStyleComments': true,
		'multiLineStrings': true,
		'regexLiterals': true
	}));
	register('regex', [
		[STRING, /^[\s\S]+/]
	]);
	register('js', simpleLexer({
		'keywords': JSCRIPT_KEYWORDS,
		'cStyleComments': true,
		'regexLiterals': true
	}));
	register('in.tag',
	[
		[PLAIN, /^[\s]+/, ' \t\r\n'],
		[ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, '\"\''],
		[TAG, /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
		[ATTRIB_NAME, /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
		['uq.val', /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
		[PUNCTUATION, /^[=<>\/]+/],
		['js', /^on\w+\s*=\s*\"([^\"]+)\"/i],
		['js', /^on\w+\s*=\s*\'([^\']+)\'/i],
		['js', /^on\w+\s*=\s*([^\"\'>\s]+)/i],
		['css', /^style\s*=\s*\"([^\"]+)\"/i],
		['css', /^style\s*=\s*\'([^\']+)\'/i],
		['css', /^style\s*=\s*([^\"\'>\s]+)/i]
	]);

	register('htm html mxml xhtml xml xsl', [
		['plain', /^[^<?]+/],
		['declaration', /^<!\w[^>]*(?:>|$)/],
		['comment', /^<\!--[\s\S]*?(?:-\->|$)/],
		// Unescaped content in an unknown language
		['in.php', /^<\?([\s\S]+?)(?:\?>|$)/],
		['in.asp', /^<%([\s\S]+?)(?:%>|$)/],
		['punctuation', /^(?:<[%?]|[%?]>)/],
		['plain', /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
		// Unescaped content in javascript.  (Or possibly vbscript).
		['js', /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
		// Contains unescaped stylesheet content
		['css', /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
		['in.tag', /^(<\/?[a-z][^<>]*>)/i]
	]);
	register('uq.val', [[ATTRIB_VALUE, /^[\s\S]+/]]);

	register('c cc cpp cxx cyc m', simpleLexer({
		'keywords': CPP_KEYWORDS,
		'hashComments': true,
		'cStyleComments': true,
		'types': C_TYPES
	}));

	register('json', simpleLexer({
		'keywords': 'null,true,false'
	}));

	register('cs', simpleLexer({
		'keywords': CSHARP_KEYWORDS,
		'hashComments': true,
		'cStyleComments': true,
		'verbatimStrings': true,
		'types': C_TYPES
	}));
	register('java', simpleLexer({
		'keywords': JAVA_KEYWORDS,
		'cStyleComments': true
	}));
	register('bsh csh sh', simpleLexer({
		'keywords': SH_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true
	}));
	register('cv py', simpleLexer({
		'keywords': PYTHON_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true,
		'tripleQuotedStrings': true
	}));
	register('perl pl pm', simpleLexer({
		'keywords': PERL_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true,
		'regexLiterals': true
	}));
	register('rb', simpleLexer({
		'keywords': RUBY_KEYWORDS,
		'hashComments': true,
		'multiLineStrings': true,
		'regexLiterals': true
	}));

})();