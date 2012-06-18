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

(function (SH) {

	/**
	 * 高亮单一的节点。
	 * @param {Element} elem 要高亮的节点。
	 * @param {String} [language] 语言本身。系统会自动根据源码猜测语言。
	 * @param {Number} lineNumberStart=null 第一行的计数，如果是null，则不显示行号。
	 */
	SH.one = function (elem, language, lineNumberStart) {

		var className = elem.className,
			sourceAndSpans;

		// 补齐 sh
		if (!/\bsh\b/.test(className)) {
			elem.className += ' sh';
		}

		// 确保是 <pre><code></code><pre> 结构。
		if (elem.tagName === 'PRE') {

			// 找到 <code>
			var child = elem.lastChild;
			while (child && child.nodeType !== 1)
				child = child.previousSibling;

			if (!child || child.tagName !== 'CODE') {
				child = document.createElement('code');
				while (elem.firstChild) {
					child.appendChild(elem.firstChild);
				}
				elem.appendChild(child);
			}
			elem = child;
		}
		
		// Extract tags, and convert the source code to plain text.
		sourceAndSpans = extractSourceSpans(elem);

		// 自动决定 language 和 lineNumbers
		if (!language) {
			language = (className.replace(/\bsh-line\b/, "").match(/\bsh-(\w+)(?!\S)/i) || [0, null])[1] || SH.guessLanguage(sourceAndSpans.sourceCode);
		}

		// Apply the appropriate language handler
		// Integrate the decorations and tags back into the source code,
		// modifying the sourceNode in place.
		recombineTagsAndDecorations(sourceAndSpans, SH.findBrush(language)(sourceAndSpans.sourceCode, 0));

		if (lineNumberStart != undefined ? lineNumberStart !== false : +/\bsh-line?\b/i.test(className)) {
			createLineNumbers(elem, sourceAndSpans.sourceCode, +lineNumberStart);
		}

		elem.className = 'sh-sourcecode sh-' + language;
		elem.ondblclick = handlerDblclick;
	};

	SH.all = function (callback, parentNode) {
		var elements = [],
			pres = (parentNode || document).getElementsByTagName('pre'),
			i = 0;

		for (; pres[i]; i++) {
			if (/\bsh(-|\b)/.test(pres[i].className))
				elements.push(pres[i]);
		}

		pres = null;

		function doWork() {
			if (elements.length) {
				SH.one(elements.shift());
				setTimeout(doWork, 50);
			} else if (callback) {
				callback();
			}
		}

		doWork();
	};

	function createLineNumbers(elem, sourceCode, lineNumberStart) {
		var space = document.constructor ? '' : '&nbsp;',
			r = ['<li class="demo-sh-linenumber0">' + space + '</li>'],
			i = -1,
			line = 1,
			ol;
		while ((i = sourceCode.indexOf('\n', i + 1)) >= 0) {
			r.push('<li class="demo-sh-linenumber' + (line++ % 10) + '">' + space + '</li>');
		}

		ol = document.createElement('ol');
		ol.className = 'demo-sh-linenumbers';
		ol.innerHTML = r.join('');

		if (!isNaN(lineNumberStart)) ol.start = lineNumberStart;
		elem.parentNode.insertBefore(ol, elem);
	}

	function handlerDblclick() {
		var elem = this,
			textarea = document.createElement('textarea');

		textarea.className = 'sh-textarea';
		textarea.value = elem.textContent || elem.innerText;
		textarea.readOnly = true;
		textarea.style.width = elem.offsetWidth - 10 + 'px';
		textarea.style.height = elem.offsetHeight - 10 + 'px';

		textarea.onblur = function () {
			textarea.parentNode.replaceChild(elem, textarea);
		};
		elem.parentNode.replaceChild(textarea, elem);

		// preselect all text
		textarea.focus();
		textarea.select();
	}

	/**
	 * Split markup into a string of source code and an array mapping ranges in
	 * that string to the text nodes in which they appear.
	 *
	 * <p>
	 * The HTML DOM structure:</p>
	 * <pre>
	 * (Element   "p"
	 *   (Element "b"
	 *     (Text  "print "))       ; #1
	 *   (Text    "'Hello '")      ; #2
	 *   (Element "br")            ; #3
	 *   (Text    "  + 'World';")) ; #4
	 * </pre>
	 * <p>
	 * corresponds to the HTML
	 * {@code <p><b>print </b>'Hello '<br>  + 'World';</p>}.</p>
	 *
	 * <p>
	 * It will produce the output:</p>
	 * <pre>
	 * {
	 *   sourceCode: "print 'Hello '\n  + 'World';",
	 *   //                 1         2
	 *   //       012345678901234 5678901234567
	 *   spans: [0, #1, 6, #2, 14, #3, 15, #4]
	 * }
	 * </pre>
	 * <p>
	 * where #1 is a reference to the {@code "print "} text node above, and so
	 * on for the other text nodes.
	 * </p>
	 *
	 * <p>
	 * The {@code} spans array is an array of pairs.  Even elements are the start
	 * indices of substrings, and odd elements are the text nodes (or BR elements)
	 * that contain the text for those substrings.
	 * Substrings continue until the next index or the end of the source.
	 * </p>
	 *
	 * @param {Node} node an HTML DOM subtree containing source-code.
	 * @return {Object} source code and the text nodes in which they occur.
	 */
	function extractSourceSpans(node) {

		var chunks = [];
		var length = 0;
		var spans = [];
		var k = 0;

		var whitespace;
		if (node.currentStyle) {
			whitespace = node.currentStyle.whiteSpace;
		} else if (window.getComputedStyle) {
			whitespace = document.defaultView.getComputedStyle(node, null).getPropertyValue('white-space');
		}
		var isPreformatted = whitespace && 'pre' === whitespace.substring(0, 3);

		function walk(node) {
			switch (node.nodeType) {
				case 1:
					// Element
					for (var child = node.firstChild; child; child = child.nextSibling) {
						walk(child);
					}
					var nodeName = node.nodeName;
					if ('BR' === nodeName || 'LI' === nodeName) {
						chunks[k] = '\n';
						spans[k << 1] = length++;
						spans[(k++ << 1) | 1] = node;
					}
					break;
				case 3:
				case 4:
					// Text
					var text = node.nodeValue;
					if (text.length) {
						if (isPreformatted) {
							text = text.replace(/\r\n?/g, '\n'); // Normalize newlines.
						} else {
							text = text.replace(/[ \t\r\n]+/g, ' ');
						}
						// TODO: handle tabs here?
						chunks[k] = text;
						spans[k << 1] = length;
						length += text.length;
						spans[(k++ << 1) | 1] = node;
					}
					break;
			}
		}

		walk(node);

		return {
			sourceCode: chunks.join('').replace(/\n$/, ''),
			spans: spans
		};
	}

	/**
	 * Breaks {@code job.sourceCode} around style boundaries in
	 * {@code job.decorations} and modifies {@code job.sourceNode} in place.
	 * @param {Object} job like <pre>{
	 *    sourceCode: {string} source as plain text,
	 *    spans: {Array.<number|Node>} alternating span start indices into source
	 *       and the text node or element (e.g. {@code <BR>}) corresponding to that
	 *       span.
	 *    decorations: {Array.<number|string} an array of style classes preceded
	 *       by the position at which they start in job.sourceCode in order
	 * }</pre>
	 * @private
	 */
	function recombineTagsAndDecorations(sourceAndSpans, decorations) {
		var isIE = /\bMSIE\b/.test(navigator.userAgent);
		var newlineRe = /\n/g;

		var source = sourceAndSpans.sourceCode;
		var sourceLength = source.length;
		// Index into source after the last code-unit recombined.
		var sourceIndex = 0;

		var spans = sourceAndSpans.spans;
		var nSpans = spans.length;
		// Index into spans after the last span which ends at or before sourceIndex.
		var spanIndex = 0;

		var decorations = decorations;
		var nDecorations = decorations.length;
		var decorationIndex = 0;

		var decoration = null;
		while (spanIndex < nSpans) {
			var spanStart = spans[spanIndex];
			var spanEnd = spans[spanIndex + 2] || sourceLength;

			var decStart = decorations[decorationIndex];
			var decEnd = decorations[decorationIndex + 2] || sourceLength;

			var end = Math.min(spanEnd, decEnd);

			var textNode = spans[spanIndex + 1];
			var styledText;
			if (textNode.nodeType !== 1 // Don't muck with <BR>s or <LI>s
				// Don't introduce spans around empty text nodes.
			&&
			(styledText = source.substring(sourceIndex, end))) {
				// This may seem bizarre, and it is.  Emitting LF on IE causes the
				// code to display with spaces instead of line breaks.
				// Emitting Windows standard issue linebreaks (CRLF) causes a blank
				// space to appear at the beginning of every line but the first.
				// Emitting an old Mac OS 9 line separator makes everything spiffy.
				if (isIE) {
					styledText = styledText.replace(newlineRe, '\r');
				}
				textNode.nodeValue = styledText;
				var document = textNode.ownerDocument;
				var span = document.createElement('SPAN');
				span.className = 'sh-' + decorations[decorationIndex + 1];
				var parentNode = textNode.parentNode;
				parentNode.replaceChild(span, textNode);
				span.appendChild(textNode);
				if (sourceIndex < spanEnd) { // Split off a text node.
					spans[spanIndex + 1] = textNode
					// TODO: Possibly optimize by using '' if there's no flicker.
					=
					document.createTextNode(source.substring(end, spanEnd));
					parentNode.insertBefore(textNode, span.nextSibling);
				}
			}

			sourceIndex = end;

			if (sourceIndex >= spanEnd) {
				spanIndex += 2;
			}
			if (sourceIndex >= decEnd) {
				decorationIndex += 2;
			}
		}
	}

})(SyntaxHighligher);