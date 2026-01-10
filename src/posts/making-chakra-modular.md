---
layout: post
title: Making Chakra Modular
excerpt: "For the past few weeks since the first public release of [Chakra](https://github.com/anistark/chakra), I've been really thinking about what the next right step for it is. I felt like driving myself into an overthinking well of right and wrong directions, I eneded up doing random stuff and going back and forth on updates."
date: 2025-06-22
updatedDate: 2025-06-22
featuredImage: /blog/images/posts/4efa716c-5bf6-48e2-b380-0d83f403bd2c.png
tags:
  - post
  - webassembly
  - modules
  - plugins
  - cli
  - chakra
  - wasm
  - runtime
---

For the past few weeks since the first public release of [Chakra](https://github.com/anistark/chakra), I’ve been really thinking about what the next right step for it is. I felt like driving myself into an overthinking well of right and wrong directions, I eneded up doing random stuff and going back and forth on updates. Also, not coding as consistently.

The wasm ecosystem has really taken into the browser side of stuff while the server side is ignored. The client side wasm vm is an ideal playground, but it lacks heavy firepower. I can only hope a server side runtime can bring in that firepower. From a developer’s standpoint, I’d see Chakra as a runtime that we can use to build, test, debug and iterate fast. While compiled languages are great and perfect for wasm, it’s a nightmare for developments. I think some of it has been already done with some amazing projects. I personally love wasmtime, wasmer, wazero and trunk. All of them are great runtimes and perform best in their own arena. Wasmer I feel is more aligned to my thought process, while I can’t relate to how the architecture of wasmer has been like. That was a major reason to build Chakra.

This article isn’t to cover the shortcomings of other tools or frameworks but figure out a direction for Chakra. so, bear with me…

The compiler part of it, can be better done by other languages, and shouldn’t be a part of chakra at all. It anyway wasn’t meant to stay inside Chakra at all. So, I’m making plugins and moving all compiler languages to built-in plugins to begin with. Slowly, each of them would be made into external plugins. *Use what you want, not what’s shipped!*

Next, I want to push for more modular architecture. WASI is great and needs to be integrated. But I tried to run a server side web app and serve it wasm vm. The approach needs further work in a way, that the i/o for dev tool and production build are separated out. We definetly don’t need the same stuff as long as the compiled wasm runs for both. At the moment, we need to load the entire wasi implementation, which is quite a huge file. Pyodide, py2wasm and all other tools that currently support WASI work in similar way. This is extrememly inefficient cause of the huge number of exports we’ve to deal with. For now, Chakra avoids it by loading a custom wasi implementation, so the exports can be avoided. But the entire wasi implementation still needs to be put up. So, we need to take another look at packaging before we come back to client side building. Something perhaps that while AOT is running, adds implementation alongside of it, like a true rust plugin. Perhaps we can build a dynamic implementation system. Might need more than a pipe dream.

Finally, serving web apps. Trunk does an amazing job with serving web apps for yew, leptos, dioxus, etc rust frameworks. But it’s still far behind node, webpack or even air in go from a dev experience perspective. Of course the web app frameworks also need to get updated. Chakra web apps are currently served in a similar way. We do server side rendering (SSR) and open up a port for the browser to load the webapp on. Of course, there was a few issues in the initial version of it with not loading css. But in the new version, it’s not working at all. Will need to rethink the SSR approach more. But for the time being, I believe, it can be done by simply creating a trunk wrapper plugin for chakra.

So, these are my thoughts at the moment for future of WASM and Chakra. There’s more to come. Keep an eye out on the github repo. Will keep it open under MIT license and will be more discussions in the future.

Our next upcoming release [v0.9.6](https://github.com/anistark/chakra/releases/tag/v0.9.6) will showcase the first modular plug-in architecture for Chakra. ✨

Also, should we’ve a chat forum or mailing list for wasm and chakra updates? IRC is dead I guess.
