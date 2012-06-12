// Contributed by ribrdb @ code.google.com

/**
 * @fileoverview
 * Registers a language handler for YAML.
 *
 * @author ribrdb
 */

Prettify['registerLangHandler'](
  Prettify['createSimpleLexer'](
    [
      [Prettify['PR_PUNCTUATION'], /^[:|>?]+/, null, ':|>?'],
      [Prettify['PR_DECLARATION'],  /^%(?:YAML|TAG)[^#\r\n]+/, null, '%'],
      [Prettify['PR_TYPE'], /^[&]\S+/, null, '&'],
      [Prettify['PR_TYPE'], /^!\S*/, null, '!'],
      [Prettify['PR_STRING'], /^"(?:[^\\"]|\\.)*(?:"|$)/, null, '"'],
      [Prettify['PR_STRING'], /^'(?:[^']|'')*(?:'|$)/, null, "'"],
      [Prettify['PR_COMMENT'], /^#[^\r\n]*/, null, '#'],
      [Prettify['PR_PLAIN'], /^\s+/, null, ' \t\r\n']
    ],
    [
      [Prettify['PR_DECLARATION'], /^(?:---|\.\.\.)(?:[\r\n]|$)/],
      [Prettify['PR_PUNCTUATION'], /^-/],
      [Prettify['PR_KEYWORD'], /^\w+:[ \r\n]/],
      [Prettify['PR_PLAIN'], /^\w+/]
    ]), ['yaml', 'yml']);
