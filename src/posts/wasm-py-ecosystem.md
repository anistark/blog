---
layout: post
title: WebAssembly and Python Ecosystem
excerpt: WebAssembly (WASM) is transforming how we run code in lightweight, secure, and cross-platform environments. Initially designed for browsers, WASM has now expanded into **serverless computing** and **sandboxed environments**.
date: 2025-02-05
updatedDate: 2025-02-05
featuredImage: /blog/images/posts/854fd482-c023-4089-9108-d1226cb12f40.png
tags:
  - post
  - python
  - webassembly
  - python3
  - wasm
  - pyscript
  - pyodide
  - rustpython
---

WebAssembly (WASM) is transforming how we run code in lightweight, secure, and cross-platform environments. Initially designed for browsers, WASM has now expanded into **serverless computing** and **sandboxed environments**. While languages like Rust and Go have robust WASM support, Python’s dynamic nature makes it challenging to run efficiently in WASM today.

## **Why WebAssembly for Serverless Computing?**

* **Near-Instant Startup**: WASM executes with minimal cold-start time, unlike containers.
    
* **Enhanced Security**: WASM runs in a sandboxed environment, preventing unauthorised system access.
    
* **Compact Footprint**: WASM modules are lightweight and easy to distribute.
    
* **Platform Agnostic**: Runs seamlessly in browsers, cloud environments, and edge devices.
    
* **Network Agnostic**: WASM can easily run on private clusters and secondary networks, making it the best choice even in Web3.0 ecosystem.
    

Despite these advantages, running Python efficiently in WASM poses unique challenges. So, let’s explore a few nuances and the current ecosystem looks like. We will then explore how we can work towards improving the current situation taking learnings from rust and go ecosystems.

![](https://hacks.mozilla.org/wp-content/uploads/2019/08/04-01-star-diagram.png)

## **Running Python in WebAssembly**

### **1\. Using Pyodide (CPython in WASM)**

Pyodide compiles CPython to WASM, allowing Python to run in browsers and serverless environments.

#### **Install Pyodide:**

```bash
pip install pyodide
```

#### **Run a Python Script in Pyodide:**

```python
import pyodide

async def run_python_code():
    py = await pyodide.loadPyodide()
    result = py.runPython("print('Hello from Pyodide!')")
    print(result)

await run_python_code()
```

### **2\. Using PyScript (Python in the Browser with WASM)**

PyScript simplifies running Python in the browser via Pyodide.

#### **Run Python in HTML:**

```xml
<!DOCTYPE html>
<html lang="en">
<head>
    <script defer src="https://pyscript.net/latest/pyscript.js"></script>
</head>
<body>
    <py-script>
        print("Hello from PyScript!")
    </py-script>
</body>
</html>
```

### **3\. Using RustPython (A Rust-based Python Interpreter in WASM)**

RustPython, a Python interpreter written in Rust, is optimised for WASM.

#### **Install RustPython:**

```bash
git clone https://github.com/RustPython/RustPython.git
cd RustPython
cargo build --release --target wasm32-wasi
```

#### **Run Python in RustPython (WASM):**

```rust
use rustpython_vm::Interpreter;

fn main() {
    let interpreter = Interpreter::default();
    interpreter.enter(|vm| {
        vm.run_code("print('Hello from RustPython!')", vm.ctx.new_scope()).unwrap();
    });
}
```

![](https://wasmlabs.dev/static/images/opt/wG1A9IWdyv-757.webp)

Run using WASI runtime:

```bash
wasmtime rustpython.wasm
```

## **Deploying a FastAPI Serverless Function in WASM**

### **Install FastAPI and Uvicorn**

```bash
pip install fastapi uvicorn pyodide
```

### **Create a** `main.py`

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello from WASM!"}
```

### **Run in Pyodide (WASM Runtime)**

```python
import pyodide
async def run_wasm():
    py = await pyodide.loadPyodide()
    await py.runPythonAsync("from main import app")
    print("FastAPI running in WebAssembly")
await run_wasm()
```

## **Performance Benchmark: WASM vs. Traditional Containers vs. Rust/Go WASM**

![](https://kodekloud.com/blog/content/images/2023/03/Screenshot-2023-03-16-at-23.46.54.png)

We benchmark **FastAPI deployed in:**

1. **WASM (Pyodide)**
    
2. **Docker (Traditional Serverless Container)**
    
3. **WASM (RustPython)**
    

For fair comparision, we need to also look at wasm ecosystem in rust and go. As the current python wasm ecosystem is lacking, we should also take a look at what’s happening with our neighboring language ecosystems.

### **Benchmarking with** [wrk](https://github.com/wg/wrk):

```solidity
wrk -t4 -c100 -d30s http://localhost:8000/
```

### **Approx Results:**

| Environment | Requests/sec | Avg Latency |
| --- | --- | --- |
| WASM (Pyodide) | ~500 | 10-30ms |
| Docker (FastAPI) | ~2000+ | 3-5ms |
| WASM (RustPython) | ~800 | 7-15ms |
| WASM (Rust) | ~5000+ | &lt;1ms |
| WASM (Go) | ~4000+ | &lt;2ms |

### **So, what can be conclude:**

* **Rust and Go compiled to WASM vastly outperform Python-based WASM implementations.**
    
* **Docker offers the best throughput for Python applications, making it ideal for high-performance APIs.**
    
* **RustPython outperforms Pyodide but remains slower than Rust/Go.**
    
* **Pyodide is more portable but has higher latency, making it ideal for browser-based execution.**
    
* **WASM offers greater security and portability but exhibits slightly higher latency than Docker.**
    

WebAssembly is an exciting technology for **serverless Python computing**, offering:  
✅ **Faster startup times**  
✅ **Enhanced security**  
✅ **Improved portability**

![](https://www.docker.com/wp-content/uploads/2024/04/2400x1260_wasm-vs-docker_diagram-01.png)

However, for high-performance applications, **Rust and Go WASM implementations** significantly outperform Python-based approaches. Python WASM is improving rapidly, and as tools like **Pyodide, PyScript, and RustPython** advance, Python’s role in **serverless WASM environments** will continue to expand. 🚀
