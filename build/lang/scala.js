// Copyright (C) 2010 Google Inc.
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
 * Registers a language handler for Scala.
 *
 * Derived from http://lampsvn.epfl.ch/svn-repos/scala/scala-documentation/trunk/src/reference/SyntaxSummary.tex
 *
 * @author mikesamuel@gmail.com
 */

SyntaxHighligher.register('scala', [
	// Whitespace
	['plain',       /^[\t\n\r \xA0]+/, '\t\n\r \xA0'],
	// A double or single quoted string 
	// or a triple double-quoted multi-line string.
	['string', /^(?:"(?:(?:""(?:""?(?!")|[^\\"]|\\.)*"{0,3})|(?:[^"\r\n\\]|\\.)*"?))/, '"'],
	['literal',     /^`(?:[^\r\n\\`]|\\.)*`?/,'`'],
	['punctuation', /^[!#%&()*+,\-:;<=>?@\[\\\]^{|}~]+/, '!#%&()*+,-:;<=>?@[\\]^{|}~'],
	// A symbol literal is a single quote followed by an identifier with no
	// single quote following
	// A character literal has single quotes on either side
	['string',      /^'(?:[^\r\n\\']|\\(?:'|[^\r\n']+))'/],
	['literal',     /^'[a-zA-Z_$][\w$]*(?!['$\w])/],
	['keyword',     /^(?:abstract|case|catch|class|def|do|else|extends|final|finally|for|forSome|if|implicit|import|lazy|match|new|object|override|package|private|protected|requires|return|sealed|super|throw|trait|try|type|val|var|while|with|yield)\b/],
	['literal',     /^(?:true|false|null|this)\b/],
	['literal',     /^(?:(?:0(?:[0-7]+|X[0-9A-F]+))L?|(?:(?:0|[1-9][0-9]*)(?:(?:\.[0-9]+)?(?:E[+\-]?[0-9]+)?F?|L?))|\\.[0-9]+(?:E[+\-]?[0-9]+)?F?)/i],
	// Treat upper camel case identifiers as types.
	['type',        /^[$_]*[A-Z][_$A-Z0-9]*[a-z][\w$]*/],
	['plain',       /^[$a-zA-Z_][\w$]*/],
	['comment',     /^\/(?:\/.*|\*(?:\/|\**[^*/])*(?:\*+\/?)?)/],
	['punctuation', /^(?:\.+|\/)/]
]);
