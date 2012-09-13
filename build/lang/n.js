// Copyright (C) 2011 Zimin A.V.
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
 * Registers a language handler for the Nemerle language.
 * http://nemerle.org
 * @author Zimin A.V.
 */


SyntaxHighligher.register('n nemerle', [
	['string', /^(?:\'(?:[^\\\'\r\n]|\\.)*\'|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/, '"'],
	['comment', /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/, '#'],
	['plain', /^\s+/, ' \r\n\t\xA0'],
	['string', /^@\"(?:[^\"]|\"\")*(?:\"|$)/],
	['string', /^<#(?:[^#>])*(?:#>|$)/],
	['string', /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/],
	['comment', /^\/\/[^\r\n]*/],
	['comment', /^\/\*[\s\S]*?(?:\*\/|$)/],
	['keyword', /^(?:abstract|and|as|base|catch|class|def|delegate|enum|event|extern|false|finally|fun|implements|interface|internal|is|macro|match|matches|module|mutable|namespace|new|null|out|override|params|partial|private|protected|public|ref|sealed|static|struct|syntax|this|throw|true|try|type|typeof|using|variant|virtual|volatile|when|where|with|assert|assert2|async|break|checked|continue|do|else|ensures|for|foreach|if|late|lock|new|nolate|otherwise|regexp|repeat|requires|return|surroundwith|unchecked|unless|using|while|yield)\b/],
	['type', /^(?:array|bool|byte|char|decimal|double|float|int|list|long|object|sbyte|short|string|ulong|uint|ufloat|ulong|ushort|void)\b/],
	['literal', /^@[a-z_$][a-z_$@0-9]*/i],
	['type', /^@[A-Z]+[a-z][A-Za-z_$@0-9]*/],
	['plain', /^'?[A-Za-z_$][a-z_$@0-9]*/i],
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

	['punctuation', /^.[^\s\w\.$@\'\"\`\/\#]*/]
]);