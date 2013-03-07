# SyntaxHighligherPlus 概述

SyntaxHighligherPlus 是一个 JavaScript 的语法高亮框架。

# 特性

- 支持大部分编程语言。（如Html，Javascript 等常见语言都内置）
- 支持自定义行号、主题、语言。
- 支持 Nodejs 等非浏览器坏境。
- 支持自动识别语言。

# 用法

## 1. 引入 SyntaxHighligherPlus

引入 build 文件夹下的 syntaxhighlighter.css 和 syntaxhighlighter.js 。

	<link href="https://raw.github.com/jplusui/SyntaxHighligherPlus/master/build/syntaxhighlighter.css" rel="stylesheet" type="text/css">
	<script src="https://raw.github.com/jplusui/SyntaxHighligherPlus/master/build/syntaxhighlighter.js" type="text/javascript"></script>

## 2. 高亮标签

使用 <script>SyntaxHighligher.all()</script> 可以自动处理所以标记有sh的标签。

	<body onload="SyntaxHighligher.all();">
		
		<pre class="sh">class Animal
		  constructor: (@name) -></pre>
	
	</body>

## 指定语言

使用 sh-语言名 类名可强制使用特定语言的高亮。

	<body onload="SyntaxHighligher.all();">
		
		<pre class="sh-coffee">class Animal
		  constructor: (@name) -></pre>
	
	</body>
	
# API

框架提供了一个 SyntaxHighligher 对象，通过该对象可以实现特定的高亮需求。具体可参考文档和源码。

常用的API有：

- SyntaxHighligher.all(): 高亮页面内全部 pre.sh 标签。
- SyntaxHighligher.one(pre, language, startLineNumber): 高亮页面内指定的 pre 标签。
- SyntaxHighligher.quickOne(pre): 仅高亮指定的 pre 标签, 不额外处理DOM标签。（如不支持双击复制代码）
- SyntaxHighligher.highlight(sourceCode): 输入代码片段，返回高亮后的 HTML 代码。