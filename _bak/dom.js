﻿// Copyright (C) 2012 xuld
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
	 * @param {String} [language] 语言本身。
	 * @param {Number} lineNumberStyle=0 行号风格。
	 *
	 * - 0: (默认)不显示行号
	 * - 1: 显示外部行号
	 * - 2: 显示内部行号
	 * - 10: 显示外部行号, 每 5 行标号
	 * - 20: 显示内部行号, 每 5 行标号
	 *
	 *
	 *
	 * @param {Number} lineNumberStart=1 第一行的计数。
	 */
	SH.one = function (elem, language, lineNumberStyle, lineNumberStart) {

		var className = elem.className.replace(/\bsh[-\w]*\b/g, "");

		// 自动决定 language 和 lineNumbers
		if (!language) {
			language = (elem.className.match(/\bsh-(\w+)(?!\S)/i) || [0, null])[1];
		}

		if (!lineNumberStyle) {
			var match = /\bsh-line(-inside|-outside)?\b/i.exec(elem.className);
			lineNumberStyle = match ? match[1] === '-inside' ? 2 : 1 : 0;
		}

		//if (lineNumbers == undefined) {
		//	lineNumbers = ;
		//}

		//if (indent == undefined) {
		//	indent = /\bsh-indent\b/i.test(elem.className);
		//}

		// Extract tags, and convert the source code to plain text.
		var sourceAndSpans = extractSourceSpans(elem);

		if (!language) {
			language = SH.guessLanguage(sourceAndSpans.sourceCode);
		}

		// Apply the appropriate language handler
		// Integrate the decorations and tags back into the source code,
		// modifying the sourceNode in place.
		recombineTagsAndDecorations(sourceAndSpans, SH.findBrush(language)(sourceAndSpans.sourceCode, 0));

		switch (lineNumberStyle) {
			case 1:
				className += ' sh-line-outside';
				createLineNumbers(elem, sourceAndSpans.sourceCode, lineNumberStart);
				break;
			case 2:
				className += ' sh-line-inside';
				numberLines(elem, lineNumberStart);
				break;
		}

		elem.className = (className + " sh sh-" + language);
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

		setTimeout(doWork, 0);
	};

	function createLineNumbers(elem, sourceCode, lineNumberStart) {
		var r = ['<li class="sh-line0"></li>'],
			i = -1,
			line = 1,
			ol;
		while ((i = sourceCode.indexOf('\n', i + 1)) >= 0) {
			r.push('<li class="sh-line' + (line++ % 10) + '"></li>');
		}

		ol = document.createElement('pre');
		//  ol.className = 'sh-linenumbers-outside';
		ol.innerHTML = '<ol class="sh-linenumbers-outside">' + r.join('') + '</ol>';

		if(lineNumberStart != undefined)
			ol.start = lineNumberStart;
		elem.parentNode.insertBefore(ol, elem);
	}

	/**
   * Given a DOM subtree, wraps it in a list, and puts each line into its own
   * list item.
   *
   * @param {Node} node modified in place.  Its content is pulled into an
   *     HTMLOListElement, and each line is moved into a separate list item.
   *     This requires cloning elements, so the input might not have unique
   *     IDs after numbering.
   */
	function numberLines(node, opt_startLineNum) {
		var lineBreak = /\r\n?|\n/;

		var document = node.ownerDocument;

		var whitespace;
		if (node.currentStyle) {
			whitespace = node.currentStyle.whiteSpace;
		} else if (window.getComputedStyle) {
			whitespace = document.defaultView.getComputedStyle(node, null)
          .getPropertyValue('white-space');
		}
		// If it's preformatted, then we need to split lines on line breaks
		// in addition to <BR>s.
		var isPreformatted = whitespace && 'pre' === whitespace.substring(0, 3);

		var li = document.createElement('LI');
		while (node.firstChild) {
			li.appendChild(node.firstChild);
		}
		// An array of lines.  We split below, so this is initialized to one
		// un-split line.
		var listItems = [li];

		function walk(node) {
			switch (node.nodeType) {
				case 1:  // Element
					if ('BR' === node.nodeName) {
						breakAfter(node);
						// Discard the <BR> since it is now flush against a </LI>.
						if (node.parentNode) {
							node.parentNode.removeChild(node);
						}
					} else {
						for (var child = node.firstChild; child; child = child.nextSibling) {
							walk(child);
						}
					}
					break;
				case 3: case 4:  // Text
					if (isPreformatted) {
						var text = node.nodeValue;
						var match = text.match(lineBreak);
						if (match) {
							var firstLine = text.substring(0, match.index);
							node.nodeValue = firstLine;
							var tail = text.substring(match.index + match[0].length);
							if (tail) {
								var parent = node.parentNode;
								parent.insertBefore(
                    document.createTextNode(tail), node.nextSibling);
							}
							breakAfter(node);
							if (!firstLine) {
								// Don't leave blank text nodes in the DOM.
								node.parentNode.removeChild(node);
							}
						}
					}
					break;
			}
		}

		// Split a line after the given node.
		function breakAfter(lineEndNode) {
			// If there's nothing to the right, then we can skip ending the line
			// here, and move root-wards since splitting just before an end-tag
			// would require us to create a bunch of empty copies.
			while (!lineEndNode.nextSibling) {
				lineEndNode = lineEndNode.parentNode;
				if (!lineEndNode) { return; }
			}

			function breakLeftOf(limit, copy) {
				// Clone shallowly if this node needs to be on both sides of the break.
				var rightSide = copy ? limit.cloneNode(false) : limit;
				var parent = limit.parentNode;
				if (parent) {
					// We clone the parent chain.
					// This helps us resurrect important styling elements that cross lines.
					// E.g. in <i>Foo<br>Bar</i>
					// should be rewritten to <li><i>Foo</i></li><li><i>Bar</i></li>.
					var parentClone = breakLeftOf(parent, 1);
					// Move the clone and everything to the right of the original
					// onto the cloned parent.
					var next = limit.nextSibling;
					parentClone.appendChild(rightSide);
					for (var sibling = next; sibling; sibling = next) {
						next = sibling.nextSibling;
						parentClone.appendChild(sibling);
					}
				}
				return rightSide;
			}

			var copiedListItem = breakLeftOf(lineEndNode.nextSibling, 0);

			// Walk the parent chain until we reach an unattached LI.
			for (var parent;
				// Check nodeType since IE invents document fragments.
           (parent = copiedListItem.parentNode) && parent.nodeType === 1;) {
           	copiedListItem = parent;
           }
			// Put it on the list of lines for later processing.
			listItems.push(copiedListItem);
		}

		// Split lines while there are lines left to split.
		for (var i = 0;  // Number of lines that have been split so far.
         i < listItems.length;  // length updated by breakAfter calls.
         ++i) {
         	walk(listItems[i]);
         }

		// Make sure numeric indices show correctly.
		if (opt_startLineNum === (opt_startLineNum | 0)) {
			listItems[0].setAttribute('value', opt_startLineNum);
		}

		var ol = document.createElement('OL');
		ol.className = 'sh-linenumbers-inside';
		var offset = Math.max(0, ((opt_startLineNum - 1 /* zero index */)) | 0) || 0;
		for (var i = 0, n = listItems.length; i < n; ++i) {
			li = listItems[i];
			// Stick a class on the LIs so that stylesheets can
			// color odd/even rows, or any other row pattern that
			// is co-prime with 10.
			li.className = 'sh-line' + ((i + offset) % 10);
			if (!li.firstChild) {
				li.appendChild(document.createTextNode('\xA0'));
			}
			ol.appendChild(li);
		}

		node.appendChild(ol);
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