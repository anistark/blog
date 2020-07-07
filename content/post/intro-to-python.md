---
title:  "Intro to Python!"
description: "The Zen of Python"
date:   2014-08-29
categories: ["coding", "python", "intro"]
tags: ["python", "intro", "zen"]
image: "python-intro.jpg"

---

![Intro to Python](https://i.imgur.com/lcwFbRx.png "Intro to Python")
Python is a widely used general-purpose, high-level programming language. Its design philosophy emphasizes code readability, and its syntax allows programmers to express concepts in fewer lines of code than would be possible in languages such as C. The language provides constructs intended to enable clear programs on both a small and large scale. Python supports multiple programming paradigms, including object-oriented, imperative and functional programming or procedural styles. It features a dynamic type system and automatic memory management and has a large and comprehensive standard library.

Lets start by viewing a small program in python console for swapping two numbers:

```python
>> a=3
>> b=4
>> print a,b
>> 3 4
>> a,b=b,a
>> print a,b
>> 4 3
```

It's as easy as that. Interested yet? Read on..

Python is free and works on Linux, Mac and Windows, go to the official [python site][python-home] and download the version specific to your OS and processor(32 or 64) For windows when you run the msi file ensure you select, add python exe to path, it is not installed by default. For most Unix systems, python comes as pre-installed.

Python comes in two versions as if now and has always been a centre of discussion as to which one to prefer to. You can decide for yourself by viewing [Python Official Wiki][py2v3]. Though personally I use Python 2.7 because currently not all frameworks has extended support for python 3.x and so does most users worldwide. It's simply not a version change with python. It's an overall syntax chage-over too. Go through details of the syntax and make sure by the respective [documentations][pydoc].

Next what you will need is an editor. Personally, I like Sublime Text but you can have your pick from a vast ever-increasing [editor collection][editors]. Though editors is what I use, sometimes people like to stick to IDEs or Integrated Development Environments. So, in-case you are looking for a good [IDE for python][ides]. Arguably, IDE is a bad beginner habit. Anyway, choice is yours. So, get started with coding now.
Here are a few [code samples][codes] to get you started. Also in case you wanna follow a book, here's a few [top book picks][books]. There are plenty of free online tutorials and books freely available. You can also just go to [Learn Python the Hard Way][hardway] and start, Zed Shaw’s tutorial is laid out in exercise format. Another good one is a [Byte of Python][bytes]. You can always take an online course via [coursera.org][coursera], or [edx.org][edx], actual university run courses that are graded/scored. People say [codeacademy] but I think that's entirely upto perception.
Two self paced courses, no official grading:
MIT open courseware, [Introduction to Computer Science and Programming][mitintro] MIT 6.00x. This course has a very active online community, many people do it.
University of Michigan, [Programming for Everybody][michigan].

Get started a traditional way:

```
>> import this
>> The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than _right_ now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```

Just kidding. That's no traditional way. But I love the poem nevertheless.

So, now you are ready to pop your hood in the [Cheese Shop][pypi]. You can view the list of packages available for use in here.
Finally, if you are already a developer, you can look into the [dev section][pydev]. For any more queries, go throught the [Frequently Asked Questions][pyfaq].

Get social and ask your questions on [Facebook Python Group][fbpy], [IRC][pyirc] or Join the [Python Mailing list][pymail].

Happy Coding!! :)

[python-home]: https://www.python.org/
[py2v3]: https://wiki.python.org/moin/Python2orPython3
[pydoc]: https://www.python.org/doc/
[editors]: https://wiki.python.org/moin/PythonEditors
[ides]: https://wiki.python.org/moin/IntegratedDevelopmentEnvironments
[codes]: https://wiki.python.org/moin/BeginnersGuide/Examples
[books]: https://wiki.python.org/moin/IntroductoryBooks
[pypi]: https://pypi.python.org/pypi?%3Aaction=index
[bytes]: https://www.swaroopch.com/notes/python/
[hardway]: https://learnpythonthehardway.org/book/
[coursera]: https://www.coursera.org/
[edx]: https://www.edx.org/
[mitintro]: https://tinyurl.com/7tlsnjb
[michigan]: https://tinyurl.com/kcx22w6
[pydev]: https://www.python.org/dev/
[pyfaq]: https://docs.python.org/3/faq/
[fbpy]: https://www.facebook.com/groups/pythonears/
[pymail]: https://mail.python.org/mailman/listinfo
[pyirc]: https://www.python.org/community/irc/
