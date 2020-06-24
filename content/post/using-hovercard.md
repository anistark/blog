---
title:  "Using Hovercard!"
subtitle: "A small demo on hovercard"
date:   2014-09-05
categories: ["coding", "demo"]
tags: ["js", "hovercard", "hover", "demo"]
image: "hovercard.jpg"

---
Many of you would have looked into that fancy hovering box that appears in facebook or twitter and wondered how to use in that your site. :) Well, today I'm going to explain using a demo using hovercard. :D


First you will need the [js][hovercardjs] file of course.

Then HTML part:

{% codeblock lang:html %}
<div class="codeblock">Hover over my name.</div>
This demo was prepared by <label id="profile">Kumar Anirudha</label>.<br />
For Demo purposes. Blah blah. Fill up anything you like.<br /><br />Open Source Enthusiast.
{% endcodeblock %}

Of course you are free to change the content. :)

The CSS file:

{% codeblock lang:css %}
body
{
    font-family:Sans-serif;
    font-size:13px;
    padding:20px;    
}
.hc-name, a{ color: #1de2d1}
.codeblock{padding:5px; background:#aaddaa;margin-bottom:10px;font-weight:bold;}
{% endcodeblock %}

You can change the color and everything. But better don't change the attributes. Or make to change the attributes in the js file too.

The JS part:

{% codeblock lang:js %}
var aboutMe = {
    name: "Kumar Anirudha",
    link: "http://anistark.github.io/blog/",
    bio: "Kumar Anirudha is a freelance Web-developer and blogger. This is only for demo purpose only. You are free to Fork it and use and your own risk.",
    image: "http://www.gravatar.com/avatar/956e7358fe55faf73f6a8864745334e2.png",
    website: "http://anistark.github.io/",
    email: "anirudhastark@yahoo.com"
};

$('#profile').hovercard({
    showCustomCard: true,
    customCardJSON: aboutMe
});
{% endcodeblock %}

This contains the box content. So, Put in here whatever you wish to put in and it'll be showed on hover.

A small [demo][demohovercard] has been shown.
You can also use it with Facebook API and twitter API.

Here is the full code:

{% gist anistark/288da63467817f8dbbe4 %}

You will however need to add jquery file since it is a jquery based application. :) In case of any problem, please comment below.



[hovercardjs]: https://raw.githubusercontent.com/anistark/demo/master/hovercard/jquery.hovercard.min.js
[demohovercard]: http://anistark.github.io/demo/hovercard/
