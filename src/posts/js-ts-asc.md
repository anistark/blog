---
layout: post
title: Typed, Transpiled, Compiled
excerpt: If you've ever coded for the web, chances are you've touched **JavaScript**. But as apps get more complex, you might run into its quirks.
date: 2025-05-14
updatedDate: 2025-05-14
featuredImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1747072597639/6a85697e-d0bd-4a2d-bd0e-9c2fc988f5db.png
tags:
  - post
  - javascript
  - web-development
  - webassembly
  - typescript
  - wasm
  - assemblyscript
---

If you've ever coded for the web, chances are you've touched **JavaScript**. But as apps get more complex, you might run into its quirks. That’s where **TypeScript** and **AssemblyScript** come into play.

It all began in the wild early days of the internet, back in **1995**, when web pages were mostly just static documents. Plain text, maybe some images, and a lot of reloading. Netscape, one of the first web browsers, wanted to make the web more dynamic, so they asked a guy named **Brendan Eich** to come up with a scripting language for browsers.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1747073243964/cccb751a-e5c6-4d96-adb5-b1d041e3c8c6.jpeg align="center")

Brendan, in what now sounds like a myth, wrote the first version of **JavaScript** in just **10 days**. It was a scrappy little language, originally called *Mocha*, then *LiveScript*, and finally *JavaScript*. Not because it had much to do with Java, but because marketing thought the name sounded cool and can probably piggy back the popularity of Java. Brendan later founded **Mozilla** and now **Brave** browser.

Despite its rushed beginnings and quirks, JavaScript exploded in popularity. It let developers add interactivity to websites. Things like pop-ups, form validation, dropdown menus, and animations. Over time, it evolved. In **1996**, it got standardized as **ECMAScript**. In **2009**, it broke free from the browser thanks to **Node.js**, which let JavaScript to run on servers too.

By the early 2010s, JavaScript was everywhere. But as applications got bigger, teams started to struggle. It was just too easy to make mistakes. Misspell a variable, call a method on `undefined`, or forget what type something was supposed to be. That’s where **TypeScript** enters the picture.

In **2012**, **Microsoft** added types to JavaScript. That’s how **TypeScript** was born. A superset of JavaScript that brought optional static typing, interfaces, and better tooling. It was spearheaded by **Anders Hejlsberg**, the same guy who created **C#**, so it had some serious engineering power behind it.

At first, the JS community was skeptical. Why add types to a language that prides itself on being dynamic? But as apps and teams grew, so did the headaches, and TypeScript’s value became clear. Big frameworks like **Angular** adopted it, and eventually even the JavaScript purists warmed up to it. Today, TypeScript is used in everything from small web apps to massive enterprise systems.

But the story doesn’t stop there.

By **2018**, a new frontier was opening up: **WebAssembly (WASM)**. WASM let developers run near-native code in the browser. Fast, efficient, and portable. Languages like C, C++, and Rust were already compiling to WASM, but they weren’t easy for JavaScript devs to pick up.

That’s when **AssemblyScript** came into the picture. It was a community-driven project started by **Daniel Wirtz**, with one goal: make it easy for JavaScript and TypeScript developers to write code that could compile to WASM. AssemblyScript used TypeScript-like syntax but was stripped down to only the features that could compile safely and efficiently to WebAssembly.

Suddenly, JS devs could write **high-performance math functions**, **image processors**, or even **game engines** in a language they already knew, without touching C or Rust.

Of course, AssemblyScript isn’t a full replacement for JS or TS. It can’t talk to the DOM or fetch data directly. But it fits beautifully into apps that need a speed boost in specific parts.

So now, in 2025, we live in a world where:

* **JavaScript** is the old reliable: still easy, still everywhere.
    
* **TypeScript** is the modern favorite: safer, smarter, and beloved by teams.
    
* **AssemblyScript** is the performance geek’s sidekick: fast, focused, and built for the WebAssembly era.
    

![](https://www.tutorialrepublic.com/lib/images/javascript-illustration.png align="center")

**JavaScript (JS)** is a **dynamic**, **loosely-typed** scripting language. It’s the backbone of most front-end (and even some back-end) apps. It runs everywhere (browsers, Node.js, Bun, Deno, etc. It’s super easy to learn. Has a huge ecosystem. It’s flexible and forgiving. However, it lacks type safety, has more runtime bugs than any other project. Large projects can get messy and extremely hard to debug due to lack of structure.

```javascript
function square(n) {
  return n * n;
}

console.log(square(5)); // 25
```

JavaScript has the richest tooling because it's been around forever.

### Frameworks & Libraries

* **React**, **Vue**, **Svelte**, **AngularJS**
    
* **Express.js** – server-side apps
    
* **jQuery** – (still around, but fading)
    
* **Three.js** – 3D graphics
    

### Build Tools

* **Webpack**
    
* **Vite**
    
* **Parcel**
    
* **Rollup**
    

### Testing Tools

* **Jest**
    
* **Mocha**
    
* **Cypress** (E2E)
    

### Dev Tools

* **Chrome DevTools**
    
* **ESLint**
    
* **Prettier**
    
* **Babel** – transpile newer JS for older browsers
    

### Use JavaScript when:

* You want **zero setup**
    
* You’re working on **legacy apps**
    
* You need **runtime scripting**, e.g., eval or REPL
    
* You want **maximum browser compatibility**
    

![](https://www.orientsoftware.com/Themes/Content/Images/blog/2023-11-13/typescript-introduction.jpg align="center")

**TypeScript (TS)** is a **typed superset** of JavaScript. It adds **static typing**, interfaces, enums, and more. All compiled down to JavaScript.

It catches errors at **compile time.** Helps with **auto-complete**, **refactoring**, and **documentation.** Works with existing JS code and it’s great for large projects. There’s a slight learning curve if you're new to typing. It requires a build step (using `tsc`) and is slower iteration for quick scripts.

```typescript
function square(n: number): number {
  return n * n;
}

console.log(square(5)); // 25
// console.log(square("5")); // ❌ Compile-time error
```

TypeScript is super popular in modern frontend and backend development.

### Frameworks (TS-first or TS-friendly)

* **Next.js** – full-stack React
    
* **Remix** – modern web app framework
    
* **NestJS** – backend framework (like Angular for backend)
    
* **tRPC** – type-safe APIs
    
* **TypeORM** / **Prisma** – typed database ORM
    

### Build Tools

* **tsc** – official TypeScript compiler
    
* **Vite** – works great with TS
    
* **esbuild** – super fast bundler
    
* **SWC** – Rust-based compiler used in Next.js
    

### Testing Tools

* Same as JS, but with type support:
    
    * **Jest** (with TS config)
        
    * **Vitest** (Vite-native testing)
        
    * **ts-node** (run TypeScript directly)
        

### Dev Tools

* **TypeScript Language Server (TSLS)** – for autocomplete
    
* **tsconfig.json** – config your compiler
    
* **Typedoc** – generate docs from types
    

### Use TypeScript when:

* You're building **large projects**
    
* You want **safe refactoring**
    
* You work in a **team**
    
* You love **autocomplete and IDE help**
    

![](https://gitlab.com/uploads/-/system/project/avatar/37766828/assemblyscript-logo.png align="center")

**AssemblyScript (AS)** looks like TypeScript but compiles to **WebAssembly (WASM)**, which runs at near-native speed in the browser or other WASM environments. It’s **super fast** performance for CPU-heavy tasks. Easy to learn for JS/TS devs. Compiles to `.wasm` easily. However, it’s not a full TS/JS replacement (limited standard lib). No DOM access (must be called from JS) and has some tooling quirks.

```typescript
// assembly/index.ts
export function square(n: i32): i32 {
  return n * n;
}
```

```javascript
const wasm = await WebAssembly.instantiateStreaming(fetch("build/optimized.wasm"));
console.log(wasm.instance.exports.square(5)); // 25
```

AssemblyScript is younger and more niche, but growing for performance-focused devs.

### Core Tools

* **AssemblyScript Compiler (**`asc`) – compile `.ts` to `.wasm`
    
* **asbuild** – build script tool
    
* **loader** – JS loader for WASM output
    
* **wasm-bindgen / as-bind** – simplify JS ↔ WASM communication
    

### Use with:

* **Web projects** that require native speed
    
* **Game engines** (e.g., integrate into Unity, Bevy, etc.)
    
* **Blockchain smart contracts** (e.g., NEAR Protocol uses AssemblyScript)
    
* **Scientific simulations** or **image/video/audio processing**
    

### Testing

* **as-pect** – testing framework for AssemblyScript
    

### Dev Tools

* **WABT (WebAssembly Binary Toolkit)** – inspect `.wasm` files
    
* **WasmExplorer**, **WasmFiddle** – online WASM playgrounds
    
* **VSCode AssemblyScript Extension**
    

### Use AssemblyScript when:

* You need **WASM performance** with **JavaScript-like syntax**
    
* You're optimizing a **hot loop or math-heavy function**
    
* You're building to **target WebAssembly** for portability
    

While, it seems like a natural progression with AssemblyScript being the natural step. But, we’re not quite there yet. Let’s look into a few use-cases:

Suppose we want to **fetch user data from an API**.

### ✅ TypeScript Version (works fine)

```typescript
async function getUser() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users/1");
  const user = await res.json();
  console.log(user);
}

getUser();
```

### ❌ AssemblyScript Version (won’t work)

```typescript
// assembly/index.ts
// ❌ No 'fetch' API available
export function getUser(): void {
  // This will not compile or work
}
```

> 🛠 Workaround: You’d have to call `fetch` from JS, then pass the result to WASM. That’s extra work and complexity.

So, you might think that typescript is all powerful then? It’s close. But javascript still has it’s value. Say, you’re building a **plugin system** or a browser-based REPL where users write code at runtime.

### ✅ JavaScript Version (works fine)

```javascript
const userCode = "console.log('Hello from user!')";
eval(userCode); // ✅ Works out of the box
```

### ❌ TypeScript Version (won’t work directly)

```typescript
const userCode: string = "console.log('Hello from user!')";
// eval(userCode); ❌ This only works at runtime after TS has compiled the code to JS
```

> 🛠 You’d need to compile the user’s TypeScript code to JavaScript **on the fly** (using Babel or TypeScript compiler API), which is overkill for simple tasks.

So, a combination is still required to get the optimal performance and scale.

Imagine you’re building a browser-based photo editor:

* UI: **React + TypeScript** (Next.js)
    
* Filters and image processing: **AssemblyScript → WASM**
    
* Tiny plugins or runtime scripts: **Plain JavaScript** with `eval`
    

You’re mixing all three to get:  
✅ Scalability + ✅ Performance + ✅ Flexibility

### A quick comparison:

| Feature | JavaScript | TypeScript | AssemblyScript |
| --- | --- | --- | --- |
| Type safety | ❌ | ✅ | ✅ (limited) |
| Browser support | ✅ | ✅ (compiled) | ✅ (compiled to WASM) |
| Speed | ⚠️ (interpreter) | ⚠️ (same as JS) | ✅✅✅ (near native) |
| Use case | Web, backend | Large apps | Performance-critical code |
| Learning curve | Easy | Medium | Medium (WASM specifics) |
| Access to DOM | ✅ | ✅ | ❌ |

So, there’s a time to type, transpile and compile afterall.

* **Use JavaScript** if you're building a quick prototype, small scripts, or prefer minimal setup.
    
* **Use TypeScript** for any medium to large project where code quality and developer experience matter.
    
* **Use AssemblyScript** if you need performance (e.g. image/video processing, simulations) and want to stay in JS-like syntax land.
    

As we look into the future of web development, one thing is becoming crystal clear: **WebAssembly isn’t just a cool experiment anymore, it’s a movement.** And it’s reshaping how we think about building applications for the browser, desktop, and beyond.

![](https://uno-website-assets.s3.amazonaws.com/wp-content/uploads/2019/10/01091008/webassembly-pic.png align="center")

### WebAssembly: The Portable Runtime of the Future

Originally designed to make **browser-based games and apps faster**, WebAssembly is now evolving into something much bigger, something **universal**. It’s not just about the web anymore. WASM is showing up in:

* **Edge computing** (like Cloudflare Workers)
    
* **Serverless runtimes** (like Wasmtime and Wasmer)
    
* **Smart contracts** (in chains like NEAR, Polkadot, and Internet Computer)
    
* **Plugins systems** for IDEs, databases, and even game engines
    

The dream? **Code that runs *anywhere*, securely and fast, no matter the host system.** And AssemblyScript is well-positioned to be the “JavaScript dev’s entry point” into that world.

![](https://sapphireventures.com/wp-content/uploads/2022/10/Final5_WebAssemblyMarketMap.Oct_.2022.png align="center")

WebAssembly is becoming:

* The **universal runtime** for sandboxed, fast code
    
* The **next VM target** for many languages (Python, Go, Ruby are all working on WASM support)
    
* A way to **escape the browser** while still using browser-native tech
    

And as WASM matures (with support for garbage collection, threads, and better debugging), **AssemblyScript will mature alongside it**. Maybe we can have a better runtime for typescript which helps push WASM beyond AssemblyScript too.
