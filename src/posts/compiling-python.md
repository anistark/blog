---
layout: post
title: Compiling Python
excerpt: CPython is the **official and most widely used implementation of Python**, written in **C**. When people talk about "Python," they are usually referring to CPython.
date: 2025-04-04
updatedDate: 2025-04-04
featuredImage: /blog/images/posts/ba13c6dd-7c14-4cfa-87a3-967361a61093.png
tags:
  - post
  - python
  - python3
  - cpython
  - build-from-source
---

[Python](https://www.python.org/) is one of the most widely used programming languages, but have you ever wondered how it works under the hood? CPython is the official implementation of Python written in C, and modifying it allows you to change Python’s behavior.

CPython is the **official and most widely used implementation of Python**, written in **C**. When people talk about "Python," they are usually referring to CPython. It is the reference implementation maintained by the Python Software Foundation (PSF) and serves as the **gold standard** for how Python should behave.

The name **CPython** came about because it is implemented in the **C programming language**. It is different from other implementations of Python, such as:

* **PyPy** → A Python implementation written in Python, optimized with Just-In-Time (JIT) compilation.
    
* **Jython** → A Python implementation for the Java Virtual Machine (JVM).
    
* **IronPython** → A Python implementation for the .NET framework.
    

CPython is the **most widely used** and the **official** Python interpreter.

When you run a Python script using CPython, the execution happens in several steps:

1. **Parsing & Compilation:**
    
    * CPython first **parses** the Python code into an Abstract Syntax Tree (AST).
        
    * It then **compiles** the AST into **bytecode** (`.pyc` files in `__pycache__`).
        
2. **Interpreting Bytecode:**
    
    * The **CPython Virtual Machine (VM)** executes the bytecode line by line.
        
    * This is why Python is often called an **interpreted language**, even though it has a compilation step.
        
3. **Memory Management & C Extensions:**
    
    * CPython manages memory using **reference counting** and **garbage collection**.
        
    * It supports C extensions, allowing Python to call C libraries (e.g., `numpy`, `pandas`).
        

If you want to truly **understand Python internals**, modifying CPython is one of the best ways to do it! 🚀

## **Cloning the CPython Source Code**

First, clone the official CPython repository:

```bash
git clone https://github.com/python/cpython.git
cd cpython
```

You can check out a specific version of Python by using:

```bash
git checkout tags/v3.12.0 -b my-python
```

This creates a new branch (`my-python`) based on Python 3.12.

Stable versions of Python are maintained in `3.x` branches, where `x` represents the minor version. For example:

* `3.13` (Latest stable release branch)
    
* `3.12` (Older stable release)
    
* `3.11` (Older LTS release)
    

To check out a specific stable branch:

```bash
git checkout 3.13
```

[Checkout all the versions and latest updates](https://devguide.python.org/versions/#versions). If you want to experiment with **upcoming features**, use `main`.

## **Setting Up Dependencies**

Before compiling, install the required dependencies:

### **On Ubuntu/Debian**

```bash
sudo apt update
sudo apt install -y build-essential libffi-dev libssl-dev zlib1g-dev \
    libncurses5-dev libncursesw5-dev libreadline-dev libsqlite3-dev \
    libgdbm-dev libdb5.3-dev libbz2-dev libexpat1-dev liblzma-dev tk-dev
```

### **On macOS**

```bash
brew install pkg-config openssl readline sqlite3 xz zlib tcl-tk autoconf automake libtool autoconf-archive
```

> Not all these packages might be relevant for you. Or maybe your system needs more so.
> 
> Make sure to have openssl 1.1.1 or above.

For Windows, it’s recommended to use **Windows Subsystem for Linux (WSL)** or **MSYS2**.

## **Compiling CPython**

Now, configure the build:

```bash
./configure --prefix=$HOME/python-build
```

> Most Linux/macOS distributions come with a pre-installed version of Python. Installing your custom build in `/usr/local` or `/usr/bin` could break system utilities that depend on the default Python version.
> 
> By using `--prefix=$HOME/python-build`, you install Python in your home directory, ensuring that it doesn’t interfere with the system Python.
> 
> Keeping your custom Python in `~/python-build` allows you to easily test your modifications without affecting anything else. If something goes wrong, you can just delete the directory:
> 
> ```bash
> rm -rf ~/python-build
> ```
> 
> and start fresh.

Then, compile CPython:

```bash
make -j$(nproc)
```

Finally, install it:

```bash
make install
```

This installs your custom Python build in `~/python-build/bin/python3`.

Check the Python version:

```bash
~/python-build/bin/python3 --version
```

## **Modifying CPython: A Simple Example**

Let's modify CPython to change the default Python prompt (`>>>`).

### **Step 1: Locate the Prompt Code**

Open the `Python/prompt.c` file in the CPython source directory.

Find this section (in `prompt.c`):

```bash
const char *Py_GetPrompt(void) {
    return ">>> ";
}
```

Change it to:

```bash
const char *Py_GetPrompt(void) {
    return "python-vibe> ";
}
```

### **Step 2: Recompile CPython**

Rebuild the source:

```bash
make -j$(nproc)
make install
```

Now, when you run your custom Python:

```bash
~/python-build/bin/python3
```

You’ll see:

```bash
python-vibe>
```

instead of:

```python
>>>
```

> Imagination is your limit!

If you make further changes, you can run Python’s built-in test suite:

```bash
make test
```

For debugging, use `gdb`:

```bash
gdb --args ~/python-build/bin/python3
```

Or enable debug symbols:

```bash
./configure --with-pydebug
make -j$(nproc)
```

It's exciting, isn’t it? So, what all can we do with this? Maybe build a custom Python runtime? Optimize Python for a specific use case? Experiment with new language features before they’re even proposed?

The source code is open, and the only limit is our imagination. What will you modify next? 🤔🔥
