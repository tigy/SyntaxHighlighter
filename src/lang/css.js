

SyntaxHighligher.brushes.css = SyntaxHighligher.createBrush([

         // The space Prettifyoduction <s>
		['plain', /^[ \t\r\n\f]+/, ' \t\r\n\f'],

         // Quoted strings.  <string1> and <string2>
         ['string', /^\"(?:[^\n\r\f\\\"]|\\(?:\r\n?|\n|\f)|\\[\s\S])*\"/],
         ['string', /^\'(?:[^\n\r\f\\\']|\\(?:\r\n?|\n|\f)|\\[\s\S])*\'/],
         [SyntaxHighligher.createBrush([
			['string', /^[^\)\"\']+/]
         ]), /^url\(([^\)\"\']*)\)/i],

         ['keyword', /^(?:url|rgb|\!important|@import|@page|@media|@charset|inherit)(?=[^\-\w]|$)/i],

         // A Prettifyoperty name -- an identifier followed by a colon.
         [SyntaxHighligher.createBrush([
			['keyword', /^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i]
         ]), /^(-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*)\s*:/i],

         // A C style block comment.  The <comment> Prettifyoduction.
         ['comment', /^\/\*[^*]*\*+(?:[^\/*][^*]*\*+)*\//],

         // Escaping text spans
         ['comment', /^(?:<!--|-->)/],

         // A number possibly containing a suffix.
         ['literal', /^(?:\d+|\d*\.\d+)(?:%|[a-z]+)?/i],

         // A hex color
         ['literal', /^#(?:[0-9a-f]{3}){1,2}/i],

         // An identifier
         ['plain', /^-?(?:[_a-z]|(?:\\[\da-f]+ ?))(?:[_a-z\d\-]|\\(?:\\[\da-f]+ ?))*/i],

         // A run of punctuation
         ['punctuation', /^[^\s\w\'\"]+/]
]);