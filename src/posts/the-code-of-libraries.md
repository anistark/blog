---
layout: post
title: The Code of Libraries
excerpt: How many times have you found yourself in the middle of your project, had to stop and switch to a different library, all because it didn't support a simple feature. How many of those times you wondered if you knew which library to use to get going.
date: 2020-08-04
updatedDate: 2020-08-04
featuredImage: /images/posts/tgk2nf_Y6.jpeg
tags:
  - post
  - guide
  - libraries
  - product
---

How many times have you found yourself in the middle of your project, had to stop and switch to a different library, all because it didn't support a simple feature? How many of those times you wondered if you knew which library to use to get going? You did nothing wrong. You chose the first result that came up on google or your package manager's recommended website. It obviously showed a very download rate and popular usage. But even so, more times than less, we tend to miss a key factor or two which can lead us to go back and check out a different package. Sometimes it leads you to lose interest in the working project, or find yourself trying to fix the library which might increase your development time.

It really is frustrating at times, isn't it? Considering being in a similar situation more times than I would care to admit, I tried to devise a few guidelines to follow while selecting the right library to use, which let's call as *The Code of Libraries*.

## Source Code
This should be pretty obvious. Find that source code of your library and go through the code. No need to get overwhelmed and no need to obviously go through the entire source code. Just enough to make to sure that there's at least some code written on it. It might just be a fully updated package every few months and has no code whatsoever written inside. Even better if the library has tests written which you can run preferably in interactive or verbose mode to go through the output as it happens.

## Stars/Forks/Watchers
![Github Watchers, Stars, Forks](https://i.imgur.com/pgEFiOz.png "Github Watchers, Stars, Forks")

A quick look at the stars any project has got can provide a good idea of the popularity and validation for the project. Forks would showcase of how many people are interested in contributing or working on the project, which would also mean it'll be that easier to get support for the project.

## Version
Trust in experience. Always take into consideration going for libraries with releases before their own v1.0.0. They're probably still testing it out themselves. Obviously, they would put up a flag on their readme file as to Under Development or something similar, but they also might not have. So, it's obviously upto you to cross-check. Make sure to also check previous versions. It might so happen that someone's first release is starting from v1.0.0. On the other hand check the versions previous to it. A very good possibility that on every spelling fix, the maintainers were pushing a separate release and now the poor library is left with v24.12.142 and really it's just printing Hello World on the console.

## Downloads
![Downloads](https://i.imgur.com/OVniMSO.png "Downloads")
Pretty obvious when you think about it. Always check the number of downloads the library is getting on a weekly or monthly basis. Often times than more, the libraries get downloaded by thousands of mirroring bots to private data centres for analysis and storage. So, although most of those numbers might be way higher than actual users downloading that particular library. But also the mirroring bots are active more frequent on the more user downloaded libraries.
![Download count](https://i.imgur.com/gge1ydG.png "Download count")

## Used By
![Used By](https://i.imgur.com/KPomAcb.png "Used By")

This is one of the best features Github rolled up recently. Touchdown Github! This particular feature provides a pretty comprehensive list on how many people are using the project. Check out the dependants of python flask project. If the codebase is on GitHub, definitely this adds more credibility to the project than anything else. To be sure, just browse through randomly some of those projects to get an idea what they are being used for and how's their work going along. It might so happen that the library was popular before and used a lot by a lot of projects but now not so much, due to either a better updated library available or the technology itself being outdated.

## Last Updated
Find the repo link. Check for when the last push to the codebase was. It's a statistically safe bet if the library had code pushes in anywhere within last 2–4 months. Anything more than 6 months is not to be trusted. Specially for languages like nodejs and gaoling where the language releases are very often within months. For languages which doesn't have that fast releases like python or ruby, upto 6 months still is okay. We've used packages from 3 years ago and still works great. And also packages that went on update last month is still some vulnerable dependencies.
![Contributions Graph](https://i.imgur.com/gnrQN7Q.png "Contributions Graph")

## Release Cycle
Alongside last updated, release cycles are very important. You might find this a vague criteria, but for packages which are being released every week, if they suddenly stop releases, it's either the maintainers have dumped this project or have some issues that they can't fix yet. An instance might be when last updated date is 3 months ago but it used to have steady releases every week. By their own timeline, they would have missed close to 14 cycles. That never looks good. Trust us.

## Issue/Bug List
![Issue Page](https://i.imgur.com/49fKg3S.png "Issue Page")
A very important criteria to meet is to check for open issues on the repo. And if any of those issues are very old pending. Look more closely as to when were last updated in comments as such. Also, if there's any critical bug pending in open issues. Sometimes this might be a make or break moment. A package might be not maintained as much but the maintainers might still be answering questions on issues raised and closing them or redirecting to another working library. While you're at it, take a quick peek on closed issues as well to make sure the project maintainers aren't just closing issues so they won't stay on the open issues and make themselves look bad.

## Dependencies
![Dependencies](https://i.imgur.com/VYboD2e.png "Dependencies")
Check the codebase and go through it thoroughly for all dependency that your desired package is facing up. Even better if the project has integrated code coverage, dependency checker or other such tools. They're free to use and you should definitely use them to your advantage. Your library might be very well maintained but some dependency that it's relying on might have been outdated and not-maintained anymore. It's a big disaster in that case. Switch to some other library immediately.

## Community Response
Finally, check for the official communitcation channel or q/a forums used by the respective community. It might be on irc, gitter, slack, discord, rocketchat or some equivalent communication channel but this will give a great idea of the typeof discussions happening at the project level and if the project is inherently active.
![Community Support](https://i.imgur.com/vcbWuIG.jpg "Community Support")

So, there you have it. Now, repeat: _I solemly swear to abide by **The Code of Libraries** for my all future projects._

## Some Popular Tools
The Ruby community came up with an online tool to compare projects called [Ruby Toolbox](https://www.ruby-toolbox.com/). It's brilliant and provides a pretty comprehensive comparision to make your job easier.
![Ruby Toolbox](https://i.imgur.com/3cG2Z03.png "Ruby Toolbox")

[Libraries.io](https://libraries.io/) helps you find new open source packages, modules and frameworks and keep track of ones you depend upon.
![Libraries.io](https://i.imgur.com/Ssgf2Q1.png "Libraries.io")

Now, sometimes even after following Polyglot's Code of the Libraries, you might get stuck into such scenarios where you need to take care of a dependency of a dependency of your project. You might imagine yourself spending too much time fixing up the library. Polyglot is a community of developers driving an open source software agency to help you get out of such a mess. Get in touch with Polyglot Network at [team@polyglot.network](mailto:team@polyglot.network) and let them take care of that open source library for you.
