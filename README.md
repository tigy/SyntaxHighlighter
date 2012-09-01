# SyntaxHighligherPlus 概述

SyntaxHighligherPlus 是一个 JavaScript 的语法高亮框架。它支持大部分编程语言。且支持自定义行号、主题、语言。

# 示例

## Hello world

	<body onload="SyntaxHighligher.all();">
		
		<pre class="sh">class Animal
		  constructor: (@name) -></pre>
	
	</body>

使用 <script>SyntaxHighligher.all()</script> 可以自动处理所以标记有sh的标签。

## 指定语言

使用 sh-语言名 类名可强制使用特定语言的高亮。

	<body onload="SyntaxHighligher.all();">
		
		<pre class="sh-coffee">class Animal
		  constructor: (@name) -></pre>
	
	</body>
	
# API

框架提供了一个 SyntaxHighligher 对象，通过该对象可以实现特定的高亮需求。具体可参考文档和源码。