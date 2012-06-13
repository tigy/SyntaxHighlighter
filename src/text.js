// Copyright (C) 2012 xuld
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


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