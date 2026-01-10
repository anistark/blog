---
layout: post
title: To Go with Golang
excerpt: At least that's how the website describes itself.
date: 2021-01-26
updatedDate: 2021-01-26
featuredImage: /blog/images/posts/VC5kdoK_s.jpeg
tags:
  - post
  - introduction
  - go
  - webdev
  - programming-languages
---

> Go is an open source programming language that makes it easy to build simple, reliable, and efficient software.

At least that's how the website describes itself.
The first time I tried golang was about 3 years ago as a hobby project. However lack of an implementation need and a busy work schedule made my side project obsolete. Of course, you would know what that feels like. Familiar territory. So, when the opportunity rose to write a new service in golang, I absolutely jumped at it.

I'm supposed to build a small web service accepting http connection and storing some data on mongodb. Returns a certain set of result, and so on. Basic CRUD stuff. If you're not interested in #webdev, I believe this is your stop. If you're interested however, read on to know about what I used and why. The entire dev cycle from dev to deploy phase.

First of all, why I opted for golang anyway? The service I'm supposed to write needs a highly concurrent persistent api service. It needs to be fast and also easily scalable. We could have gone with python fastapi, but at this stage I just wanted to learn golang.


### Setting up Golang
If you've finally decided to go ahead with this, let's do this.
Easiest way probably is to just [download from the official website](https://golang.org/doc/install) and get going.
[Here](https://medium.com/golang-learn/quick-go-setup-guide-on-mac-os-x-956b327222b8)'s another article which very nicely explains the setup process. This is ideally for mac OS. In case you're looking for other OSes, please follow respective guides.

Be sure to setup your GOPATH very properly as this will remain as your common ground for any defined packages installed in your system.

Once done, make sure your console recognises the GOPATH.
`echo $GOPATH`

### HTTP Service
I went with [fasthttp](https://github.com/valyala/fasthttp), which provides high performance, zero memory allocations in hot paths and Up to 10x faster than net/http for a large throughput service. Go provides out of the box http support but for a beginner, it felt much easier to go with a framework, thereby ended up using fiber.

### API
[Fiber](https://github.com/gofiber/fiber) is an Express inspired web framework built on top of Fasthttp, the fastest HTTP engine for Go.
Make sure to use Fiber v2. Fiber V2 has a lot of breaking changes to Fiber v1. I had to spend an extra hour just upgrading these [breaking changes](https://github.com/gofiber/fiber/issues/736) cause I started with v1.

A simple fiber service can be started using just this:
```go
package main

import "github.com/gofiber/fiber/v2"

func main() {
    app := fiber.New()

    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Hello, World 👋!")
    })

    app.Listen(":3000")
}
```

You now have a live server running at your http://localhost:3000.

### Connect to a DataBase
Next, we need our web service to talk to our web-service. There are quite a few ODM(Object Document Mapper) out there. But given my initial requirement was pretty straightforward, I went the default [mongodb golang driver](https://github.com/mongodb/mongo-go-driver).
It's pretty straightforward to connect an mongodb client:
```go
client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
```

So, now we got an active db connection going.
Ideally, that's all we would need to create the smallest possible POC(Proof Of Concept) of any web-service you can think of.
Obviously, do go through the proper documentation as there are many pitfalls at every stage. Might as well address a few of those on a separate post.

However, to make a production level POC, we need a few more stuff. So, let's discover a few add-ons to our service:

### Logging
Logging is one of the most important aspects in any programming. To see what's working and where has been the crux of any development really. We sometimes debug using our logs. Specially in production.
The easiest and in-built way of printing/logging can be done using [fmt](https://golang.org/pkg/fmt/) or [log](https://golang.org/pkg/log/) packages.
A small example:
```go
fmt.Print("Printing with fmt")

buf    bytes.Buffer
logger = log.New(&buf, "logger: ", log.Lshortfile)
logger.Printf("Logging with log")
```

The use log is highly encouraged as compared to fmt. Log is thread safe where as fmt is not. A Logger can be used simultaneously from multiple goroutines; it guarantees to serialize access to the Writer.

```go
log.Fatalf("Fatal err happened:", err)
```
You can also add fatal logs if in case you would want to flag certain types of logs which might be critical to the application.

Some added advantages of using Fiber is it's logging module. If you're on v1, you would need to install the [logger package](https://github.com/gofiber/logger) separately, but in v2 it has been made available within v2 itself: `"github.com/gofiber/fiber/v2/middleware/logger"`.

If you need to log each request as and when it comes in, you can add something like this:
```go
app.Use(requestid.New())

​app​.​Use​(​logger​.​New​(logger.​Config​{
	// For more options, see the Config section
  Format​: "${pid} ${locals:requestid} ${status} - ${method} ${path}​\n​"​,
}))
```
Now, each route visited will come up on your console.

### Hot Reloading
Golang is a compiled language, which means unlike Python or NodeJS which are interpreted languages, we need to build it everytime we would want to run it.
Ideally we build the project as such: `go build .`
And then we run it like: `./app-name`.

However, we can still run the dev version as: `go run main.go`
Or if there's more than one file: `go run *.go`

But while development process, we often make changes and would want to check the output without having to restart the go server manually.
You can obviously write your own small shell script to detect any file changes on the entire directory and restart `go run` everytime.
If you're using docker, you can also write the entire `go build .` and `./app-name` process inside the container.

Needed a more robust way, which is provided by this package called fresh.
[Fresh](https://github.com/gravityblast/fresh) is a command line tool that builds and (re)starts your web application everytime you save a Go or template file.
You can also customise the log color that comes with the default fresh setup. It requires a default `runner.conf` file. If you want to go with the default options, you don't even need this file on your project root.
```sh
root:              .
tmp_path:          ./tmp
build_name:        runner-build
build_log:         runner-build-errors.log
valid_ext:         .go, .tpl, .tmpl, .html
no_rebuild_ext:    .tpl, .tmpl, .html
ignored:           assets, tmp
build_delay:       600
colors:            1
log_color_main:    cyan
log_color_build:   yellow
log_color_runner:  green
log_color_watcher: magenta
log_color_app:     blue
```
Now we've a complete dev setup done and dusted.


### Routing
I'm obsessed with structured code. Everything can be written in a single file and ran but a structured codebase, makes it all the more easier to document, read and later manage it.
Thereby, routing is a crucial part of adopting a new framework.
Fiber comes with inbuilt route grouping

```go
func main() {
    app := fiber.New()

    api := app.Group("/api", middleware) // /api

    v1 := api.Group("/v1", middleware)   // /api/v1
    v1.Get("/list", handler)             // /api/v1/list
    v1.Get("/user", handler)             // /api/v1/user

    v2 := api.Group("/v2", middleware)   // /api/v2
    v2.Get("/list", handler)             // /api/v2/list
    v2.Get("/user", handler)             // /api/v2/user

    app.Listen(":3000")
}
```
This can help you in writing a more structured app as such you might need to authenticate only a particular group or log a particular route and so on.

### Deployment
Probably best to go with a containerised deployment. We have deployed on [Kubernetes - Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine) which only needs an additional `Dockerfile`.

It's better to go with a multi-stage docker setup:

```dockerfile
FROM golang:1.12-alpine AS build_base

RUN apk add --no-cache git

# Set the Current Working Directory inside the container
WORKDIR /tmp/go-sample-app

# We want to populate the module cache based on the go.{mod,sum} files.
COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

# Unit tests
RUN CGO_ENABLED=0 go test -v

# Build the Go app
RUN go build -o ./out/go-sample-app .

# Start fresh from a smaller image
FROM alpine:3.9
RUN apk add ca-certificates

COPY --from=build_base /tmp/go-sample-app/out/go-sample-app /app/go-sample-app

# This container exposes port 8080 to the outside world
EXPOSE 8080

# Run the binary program produced by `go install`
CMD ["/app/go-sample-app"]
```
A complete guide on dockerising your golang app can be found [here](https://codefresh.io/docs/docs/learn-by-example/golang/golang-hello-world/) and [here](https://www.docker.com/blog/containerize-your-go-developer-environment-part-1/).


With this we've now a deployed version of our golang app. Connect that gke ip to your preferred DNS provider and share the link. Feel free to leave a link of you first golang app in the comments. Would love to see what everyone is working on.

If you have a different view on some of the stack used or talked here, feel free to add your thoughts. We're all learning and would love to see the more popular frameworks and best practices in use.

Cheers and until next time...
