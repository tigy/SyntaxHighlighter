# SyntaxHighligherPlus 概述

SyntaxHighligher 是一个 JavaScript 的语法高亮框架。它支持大部分编程语言。

# 示例

## Hello world

<body onload="SyntaxHighligher.all();">
	
	<pre class="sh">class Animal
	  constructor: (@name) -></pre>

</body>

使用 SyntaxHighligher.all() 可以自动处理所以标记有sh的标签。

## 指定语言

使用 sh-语言名 类名可强制使用特定语言的高亮。

<body onload="SyntaxHighligher.all();">
	
	<pre class="sh-coffee">class Animal
	  constructor: (@name) -></pre>

</body>