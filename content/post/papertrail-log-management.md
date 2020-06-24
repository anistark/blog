---
title:  "The Papertrail App"
subtitle: "Managing Logs has never been so easy"
date:   2014-12-17
categories: ["coding", "logging", "laravel"]
tags: ["logging", "papertrail", "coding", "ubuntu", "php", "laravel"]
image: "papertrail.jpg"

---
### Managing Logs has never been so easy

PaperTrail lets you track changes to your models' data. It's good for auditing or versioning. You can see how a model looked at any stage in its lifecycle, revert it to any version, and even undelete it after it's been destroyed.


#### Steps to Activate Papertrail For your project

  * Signup an  account credentials with [papertrail website][papertrailsite].

  * Next you will be directed to you profile page where you will find an option stating you to Add your First System.
Enable it and you will be redirect you to next page.

  * Once you are redirected to this page papertrail will give you an individual port to view you Logs which will be similar to this.

    Your systems will log to
    {% codeblock %}
    logs2.papertrailapp.com:port_number
    {% endcodeblock %}

  * By default check the Logger your system has by executing this syntax
    {% codeblock lang:bash %}
    ls -d /etc/*syslog*
    {% endcodeblock %}

  * In terminal run:
    {% codeblock lang:bash %}
    vi /etc/rsyslog.conf
    {% endcodeblock %}
    Add the line:
    {% codeblock %}
    logs2.papertrailapp.com:port_number
    {% endcodeblock %}

  * Restart you syslog using:
    {% codeblock lang:bash %}
    sudo service rsyslog restart
    {% endcodeblock %}

  * Once the syslog is rebooted your logs can be seen at
    {% codeblock %}
    logs2.papertrailapp.com:port_number
    {% endcodeblock %}

  * Visit your Events from paper trail account to view all the logs.


Now, it logs all the logs that your system is logging.

---

For logging laravel logs(which we will be doing here) or similar external log files, you will need to transfer the files to syslog.

For setting up Laravel logs, you can one of many services to transfer the laravel logs to syslog. We will be using Monolog to serve our purpose.

#### Steps to setup laravel logs in papertrail:

  + Install Monolog using composer:
{% codeblock %}
composer require monolog/monolog
{% endcodeblock %}

  + Replace the code in app/start/global.php :
{% codeblock %}
$monolog = Log::getMonolog();
$monolog->pushHandler(new Monolog\Handler\SyslogHandler('keyword'));
{% endcodeblock %}

Keyword can be set to whatever we want. And in the papertrail log system it will show up as a program of such name.

And we are all set to go.

---

Now, suppose you want to setup email notifications too. Who has time to go through all the logs and then view all the boring 404 errors on the papertrail events. Event though it is simple. Pun intended ;) So, papertrail knows how lazy a programmer can get. You set up a search alert. And configure to deliver mails on all the logs at a regular interval of time. Generally, it's better to put up as a 24 hour notice, hence pointing out the clear distribution time to check the logs just before sleep.

#### Now, to set-up alerts,

1. Go to your Events page, where all the logs are being shown. Search something. Probably by some keyword or some program name or anything random you wish for.
2. Click on Save your search and then choose to configure it.
3. You will be redirected to a new page where you can set your alert via various services. Choose any one of them and you are set.
4. If you want email notifications, click on Email and enter the email addresses you want the logs to go to. You can feed in multiple emails also by separating with a comma(,).
5. Choose what interval you wish for and start your alert system.

To test if the alarm works, just Click on Test mode button, which send mail to the email ids provided of the saved search.

Ta da! A full setup of papertrail is now complete.

---


You can do plenty more with papertrail.. Keep digging.. Happy Coding!! :)

For further reading, you can go through the [official documentation][doc].








[papertrailsite]: https://papertrailapp.com/
[doc]: http://help.papertrailapp.com/
