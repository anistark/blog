---
layout: post
title: Why I'm Switching SOT to uv
excerpt: "I've migrated the [SOT](https://github.com/anistark/sot/) (System Observation Tool) project from traditional pip/venv workflows to [uv](https://github.com/astral-sh/uv), Astral's blazing-fast Python package manager. This is gonna be a game-changer for both contributors and users."
date: 2025-08-24
updatedDate: 2025-08-24
featuredImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1756036594525/9723d4d1-24b4-4ee6-a6f7-d48005ccf754.png
tags:
  - post
  - python
  - devtools
  - python3
  - cli
  - uv
  - system-observation-tool
---

I've migrated the [SOT](https://github.com/anistark/sot/) (System Observation Tool) project from traditional pip/venv workflows to [uv](https://github.com/astral-sh/uv), Astral's blazing-fast Python package manager. This is gonna be a game-changer for both contributors and users.

> Maybe I was just finding an excuse to use something from F1 movie fever. But speed is about performance as much as it’s about being quick.

10-100x faster dependency resolution and installation

* `pip install` for our dev dependencies: **~45** seconds
    
* `uv sync` --dev: **~3** seconds
    
* Cold cache package installation improved by 15x on average
    

Lockfile generation performance:

* `pip-tools pip-compile`: ~12 seconds
    
* `uv lock`: ~800ms
    

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1756034735819/83b37323-c78a-4cf7-b2cf-b2c7b74f04f0.jpeg align="center")

This isn't just benchmark flaunting, these improvements compound during development, CI/CD, and Docker builds. In addition to an actually reliable dependency resolution.

Which then brings us to an universal resolution across platforms. `uv` resolves dependencies for all target platforms simultaneously. No more *"works on my Linux but breaks on macOS"* surprises Single `uv.lock` replaces platform-specific requirements files. Most importantly, better conflict detection. Someone told me once fail loudly always. I kinda took it to heart, and so did `uv`. All for improving developer experience. A single command covers most of them,which we handled via justfile earlier.

```bash
uv sync --dev
```

Workspace management without the pain:

* No more source venv/bin/activate dance
    
* `uv run python script.py` works from any directory
    
* Built-in tool isolation: `uv tool install sot`
    

### Technical Architecture Benefits

This tool is **Rust-native**.  
It’s written in Rust, not Python, which means there’s no Python bootstrap overhead. Installs and downloads run in parallel, and dependency resolution is memory-efficient.

It’s also **pip/PyPI compatible**.  
So it’s a drop-in replacement for pip workflows. It uses the existing PyPI infrastructure and supports all pip-compatible packages. No ecosystem fragmentation.

Finally, it has **advanced caching**.  
There’s a global package cache with deduplication, network-aware caching strategies, incremental lockfile updates, and cross-project dependency sharing.

### Project-Specific Improvements

**CI/CD is simpler.**  
Before: multiple cache keys, complex setup with `actions/setup-python` and `actions/cache`.  
After: one command `uv sync --dev` handles caching and installs automatically.

**Development is smoother.**

* `uv add package` for instant dependency addition
    
* `uv tree` for dependency visualization
    
* `uv lock --upgrade` for controlled updates
    
* Hot-swappable dev dependencies
    

### For Contributors

* **Faster feedback loops**: quicker setup, faster CI, smoother PR iterations
    
* **Fewer environment issues**: deterministic builds, no dependency hell, consistent tool versions
    
* **Better dependency management**: clear upgrades, easy dev testing, safe removals
    

## Getting Started

For end users:

```bash
uv tool install sot
```

For contributors:

```bash
git clone https://github.com/anistark/sot.git
cd sot
uv sync --dev
# You're ready to code
```

The migration maintains full backward compatibility. Existing `pip` workflows still work, but `uv` offers a superior developer experience with tangible performance benefits.

> `uv` isn't just faster. It's fundamentally more reliable, making our development process more predictable and our contributors more productive.

Migration completed in [\[PR #18\]](https://github.com/anistark/sot/pull/18) and available on [sot v4.4.0](https://pypi.org/project/sot/4.4.0/) onwards. Questions or issues? Open an [issue](https://github.com/anistark/sot/issues) or [discussion](https://github.com/anistark/sot/discussions).
