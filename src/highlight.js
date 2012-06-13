


SyntaxHighligher.highlight = function (sourceCode, language, startPosition) {
	var SH = SyntaxHighligher, brush = SH.findBrush(language || SH.guessLanguage(sourceCode));
	if (brush) {
		var decorations = brush(sourceCode, startPosition || 0),
			r = "",
			i = 0,
			len = decorations.length;
		decorations[len] = sourceCode.length;
		for (; i < len; i += 2) {
			r += '<span class="sh-' + decorations[i + 1] + '">' + sourceCode.substring(decorations[i], decorations[i + 2]) + '</span>';
		}

		return r;
	}

	return sourceCode;
};