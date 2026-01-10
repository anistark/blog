---
layout: post
title: Understanding the CPython Compiler
excerpt: CPython is the reference implementation of Python written in C. When you run a `.py` file, it goes through several internal steps before your code is actually executed.
date: 2025-04-28
updatedDate: 2025-04-28
featuredImage: /blog/images/posts/0552a276-1dfa-4f0b-88b3-07a2ed5ea302.png
tags:
  - post
  - python
  - learn
  - interpreter
  - cpython
  - ast
  - compiler
  - bytecode
  - python-virtual-machine
  - pvm
---

CPython is the reference implementation of Python written in C. When you run a `.py` file, it goes through several internal steps before your code is actually executed.

## Overview of the Compilation Process

Here’s a simplified overview of what happens when you run a Python script:

1. **Lexical Analysis (Tokenizer)**
    
2. **Parsing (AST generation)**
    
3. **Abstract Syntax Tree to Bytecode Compilation**
    
4. **Execution by Python Virtual Machine**
    

## Lexical Analysis (Tokenizer)

The tokenizer splits the raw source code into *tokens*. This is like identifying words and punctuation in a sentence.

```python
source_code = "x = 42"
```

CPython uses a [tokenizer](https://docs.python.org/3/library/tokenize.html) from the `tokenize` module. You can inspect how Python breaks it down:

```python
import tokenize
from io import BytesIO

code = b"x = 42"
tokens = list(tokenize.tokenize(BytesIO(code).readline))
for token in tokens:
    print(token)
```

**Output:**

```python
TokenInfo(type=1 (NAME), string='x', start=(1, 0), end=(1, 1), line='x = 42')
TokenInfo(type=54 (OP), string='=', ...)
TokenInfo(type=2 (NUMBER), string='42', ...)
```

## Parsing (AST Generation)

Next, Python turns those tokens into an **Abstract Syntax Tree (AST)**. This is a tree structure representing the grammar of your code.

```python
import ast

tree = ast.parse("x = 42")
print(ast.dump(tree, indent=4))
```

**Output:**

```python
Module(
    body=[
        Assign(
            targets=[Name(id='x', ctx=Store())],
            value=Constant(value=42)
        )
    ]
)
```

This tree shows an assignment of the constant `42` to variable `x`.

Here’s a visual of another tree for a simple function of `x = y + 3`:

![](/blog/images/posts/63b3d188-ae93-480a-ac9a-e7bb03259a4c.webp)

## AST to Bytecode Compilation

Now, the AST is compiled into **bytecode**, the low-level instructions that Python's virtual machine can understand.

You can do this using `compile()`:

```python
code = compile("x = 42", "<string>", "exec")
print(code.co_code)  # raw bytecode
```

To disassemble it into human-readable instructions:

```python
import dis

dis.dis(code)
```

**Output:**

```python
  1           0 LOAD_CONST               0 (42)
              2 STORE_NAME               0 (x)
              4 LOAD_CONST               1 (None)
              6 RETURN_VALUE
```

Each instruction here corresponds to an operation in the **Python Virtual Machine**.

Of course, do try these commands in your terminal. I’ve made a small web tool for you to checkout AST and bytecode for any python program. [https://anistark.github.io/python-bytecode-inspector/](https://anistark.github.io/python-bytecode-inspector/)

## Python Virtual Machine

Finally, the bytecode is interpreted by the **PVM**, a stack-based virtual machine that executes instructions like `LOAD_CONST`, `STORE_NAME`, etc.

You can think of the interpreter as a loop that fetches, decodes, and executes each instruction in the bytecode. A simplified C-style pseudo code for it might look like:

```c
while (1) {
    opcode = *ip++;  // instruction pointer
    switch(opcode) {
        case LOAD_CONST:
            push(consts[arg]);
            break;
        case STORE_NAME:
            names[arg] = pop();
            break;
        ...
    }
}
```

## Compiling and Running Custom Code

Here’s how you can compile and execute custom Python code dynamically:

```python
code = "for i in range(3): print(i)"
compiled = compile(code, "<string>", "exec")
exec(compiled)
```

**Output:**

```python
0
1
2
```

You can inspect and understand how Python internally handles this by analyzing the AST and bytecode.

![](https://mathspp.com/blog/building-a-python-compiler-and-interpreter/_structure.webp)

The CPython compiler is elegant and modular, allowing dynamic features like `exec()` and `eval()` because Python code is always just one `compile()` away from being bytecode. Understanding this pipeline gives you deeper insight into debugging, performance optimization, and even writing your own language features.
