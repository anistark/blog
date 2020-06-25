---
title: "Ghost Editor"
description: "Creating a web editor"
date: 2014-08-05T19:07:42+05:30
draft: true
author: "Ani"
tags: ["editor", "ghost", "online", "node.js", "mongodb", "ace editor"]
categories: ["project"]
image: "editor.jpg"
---

Recently, a common question was too much noticeable in a few forums across open source world. "Which Editor is best for my Ubuntu / Fedora / Mac Os X/ Windows 8 etc" and so arose the question. Why is it that people find the traditional editors vim(unix/linux/mac), notepad(windows) uncomfy to work with? Maybe cause for a newbie it's too complicated. Then comes gnu/emacs and life ain't any simpler. Well I personally have used Sublime Text and I loved it. A friend suggested to me a year ago, and I'm never getting off it again. But then, what about other users. Why is it that we need to download every time we format our system or buy a new pc. In todays internet era when everything is on cloud. So how about creating an editor which will be online all the while and you can code multiple languages in it. And hence was born the idea for Ghost Editor.

It's still development stage, currently featuring a normal text editor with a save, link, raw view, full-screen features. But I want it to extend it beyond that to let people actually complie in it too. If you interested in working on it, Fork the project on github and get started with it. :) It's actually quite simple. Written in node.js it uses express to support it and mongodb in the backend that helps in the storing the saved file so that link can be generated. Beyond that, [mongojs][mongojs] has been used to facilitate with [mongodb](https://www.mongodb.org/) usage.

Recently, I got introduced to mongojs and it's quite fun actually. I'm loving it. Hope you do too. For instance you can go ahead the view it in working on their official site. They did present an impressive demonstration on it. [Click here][mongojs] to view the mongojs docs. Apart from that, the editor is based on [Ace Editor](https://ace.c9.io/). Why you ask? Partly because it was the only open source hackable editor I could find, and partly because the name caught my eye. ;) Anyways, that said, in case you don't install the rest dependencies, the editor won't even work.

Dependencies can be found in the package.json file. Now, once that is done, run mongo server and then run node command in another terminal. A detailed step by step guide is been provided in the github page. You can refer in there, if you want to work on it. :)
Hope you would like it and hopefully I could work on improving it in due time. :)

--Signing off


[mongojs]: https://www.npmjs.com/package/mongojs
