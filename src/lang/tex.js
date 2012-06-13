// Copyright (C) 2011 Martin S.
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

/**
 * @fileoverview
 * Support for tex highlighting as discussed on
 * <a href="http://meta.tex.stackexchange.com/questions/872/text-immediate-following-double-backslashes-is-highlighted-as-macro-inside-a-code/876#876">meta.tex.stackexchange.com</a>.
 *
 * @author Martin S.
 */

SyntaxHighligher.register('latex tex', [
	// whitespace
	['plain', /^[\t\n\r \xA0]+/, '\t\n\r \xA0'],
	// all comments begin with '%'
	['comment', /^%[^\r\n]*/, '%'],
	//[Prettify.PR_DECLARATION, /^\\([egx]?def|(new|renew|provide)(command|environment))\b/],
	// any command starting with a \ and contains
	// either only letters (a-z,A-Z), '@' (internal macros)
	['keyword', /^\\[a-zA-Z@]+/],
	// or contains only one character
	['keyword', /^\\./],
	// Highlight dollar for math mode and ampersam for tabular
	['type', /^[$&]/],
	// numeric measurement values with attached units
	['literal',
	/[+-]?(?:\.\d+|\d+(?:\.\d*)?)(cm|em|ex|in|pc|pt|bp|mm)/i],
	// punctuation usually occurring within commands
	['punctuation', /^[{}()\[\]=]+/]
]);
