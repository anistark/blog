---
layout: post
title: Feluda
excerpt: Imagine you’re deep into building something exciting. A groundbreaking app, a sleek dev tool, or even just a weekend side project that scratches a creative itch.
date: 2025-02-26
updatedDate: 2025-02-26
featuredImage: /blog/images/posts/1db4d619-341b-4e26-878c-235755eba025.png
tags:
  - post
  - go
  - python
  - nodejs
  - cli
  - rust
  - license
  - dependency-management
  - feluda
---

Imagine you’re deep into building something exciting. A groundbreaking app, a sleek dev tool, or even just a weekend side project that scratches a creative itch. You’re focused, in the zone, writing code and adding dependencies to move faster. After all, why reinvent the wheel when you can leverage existing libraries?

But, here’s where things get tricky. Every package you install comes with a license, and those licenses aren’t always as straightforward as you’d hope. Some are as chill as a summer breeze, letting you do whatever you want. Others, however, sneak in clauses like:

* **“No commercial use!”** – meaning you can’t monetize your project without legal consequences.
    
* **“Your whole project must be open-source!”** – suddenly, your proprietary work isn’t so proprietary anymore.
    
* **“You need to give attribution in a specific way!”** – and failing to do so could cause legal trouble down the line.
    

Most of us don’t read licenses in detail. Who has the time? But ignoring them can lead to a nasty surprise, like a cease-and-desist letter, a forced code rewrite, or even legal trouble.

That’s why we created [**Feluda**](https://github.com/anistark/feluda), your personal detective for project dependencies.

![](/blog/images/posts/f0c146aa-e85f-4486-a596-23c6a5003646.png)

Feluda is a command-line tool that scans your project's dependencies, analyzes their licenses, and flags any restrictive or risky ones before they become a problem. Instead of spending hours manually digging through legal jargon, Feluda does the detective work for you.

Here’s how it helps:

✅ **Instant License Check** – Get a clear breakdown of what each dependency allows and restricts.  
✅ **Early Warnings** – Catch licensing issues *before* they turn into serious problems.  
✅ **Automated Reports** – Get an easy-to-read summary without manually searching license terms.  
✅ **Dependency Transparency** – Understand what you’re using and where it’s coming from.

All of this happens with a simple CLI command. Run Feluda, and it will analyze your `cargo.toml`, `package.json`, `go.mod`, or other dependency files. Within seconds, you get a comprehensive report on whether your dependencies are safe to use commercially or if you need to make adjustments. In the lastest release, Feluda even supports python, weather its via `pyproject.toml` or `requirements.txt`.

In modern development, package managers make it easier than ever to install third-party libraries. But with great convenience comes great complexity. A single package might depend on ten others, which in turn depend on fifty more. Before you realize it, your project has **hundreds of hidden dependencies**, each with its own license terms. A small oversight could mean that your app is suddenly violating multiple agreements. Large companies have legal teams to handle this, but indie developers, startups, and open-source maintainers often don’t have that luxury. That’s where Feluda steps in, making sure that whether you’re an individual dev or part of a team, you stay informed and legally safe.

## Features

Feluda is designed to make license compliance easy and transparent for developers. We’re constantly evolving and taking in requests to go to the next level, making it easier and smoother and more accurate to provide licensing guidelines for your convenience.

### 🔎 **Multi-Language Support**

Feluda can analyze dependencies across multiple programming languages, including:

* **Rust** (`Cargo.toml`)
    
* **Node.js** (`package.json`)
    
* **Go** (`go.mod`)
    
* **Python** (`requirements.txt`, `pyproject.toml`)
    

You can also filter the analysis to a specific language using the `--language` flag.

```sh
feluda --language rust
```

### 🚦 **License Classification & Restriction Flagging**

Feluda automatically identifies and classifies licenses into:

* **Permissive** – Free to use with minimal restrictions (e.g., MIT, Apache-2.0, BSD).
    
* **Restrictive** – Might impose conditions like open-sourcing your code (e.g., GPL-3.0, AGPL-3.0).
    
* **Unknown** – Not recognized or missing a standard license identifier.
    

It flags dependencies that **might restrict personal or commercial use**, so you can address them early. Some of it is still open as an issue, and we’re working on it. Hopefully, by the time you’re reading this article, we might have tackled them already! :)

### 📊 **Multiple Output Formats**

Feluda provides output in different formats to suit various needs:

* **Plain text** (default) – Readable report summary in the terminal.
    
* **JSON** (`--json`) – For programmatic use or automation.
    
* **TUI (Graphical Mode)** (`--gui`) – Browse dependencies in a visual, interactive interface.
    
* **Strict Mode** (`--strict`) – Outputs only dependencies with restrictive licenses.
    
* **Gist Format** – Available in strict mode to output a single-line summary.
    

### 📍 **Customizable License Policies**

Define your own restrictive licenses through:

* `.feluda.toml` configuration file
    
* Environment variables `export FELUDA_LICENSES_RESTRICTIVE='["GPL-3.0","AGPL-3.0","Custom-1.0"]'`
    
* Default restrictive licenses list
    

This ensures flexibility, allowing you to tailor Feluda to your project’s compliance needs.

### 🚀 **Fast & Lightweight**

Feluda is built in Rust, ensuring a **blazing-fast** execution with minimal resource usage. It can scan and classify hundreds of dependencies in seconds. We are working on improving performance to make everything run more smoothly and quickly while using fewer resources.

### 🔄 **CI/CD Integration** (Planned)

Future versions will support integration into CI/CD pipelines, helping teams automate license checks before deployment.

With these features, Feluda simplifies dependency management and lets you build with confidence. 🚀 As an open-source tool, Feluda is a community-driven project. We welcome contributions, feedback, and ideas to make it even better.

If you're a developer, and interested in contributing, checkout the repository, open issues and discussions. We'd be more than happy to work together in building a better tool for licensing while keeping it performant compliant. Currently, Farhaan and myself are the only maintainers, but seeing the rise in contribution from the open source community, I can only hope for more amazing folks to get involved. 🙌

[View Feluda on GitHub](https://github.com/anistark/feluda)

Latest version at the time of writing this article is [v1.5.0](https://crates.io/crates/feluda). 🥂

At the end of the day, Feluda isn’t just about compliance, it’s about peace of mind. When you use Feluda, you can focus on what really matters: **building something awesome** without worrying about hidden legal traps.

*So go ahead, write code, ship products, and let Feluda handle the detective work.*
