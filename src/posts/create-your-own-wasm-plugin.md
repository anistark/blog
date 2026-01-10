---
layout: post
title: Create your own wasm plugin
excerpt: Creating wasm plugins, is not limited to wasmrun plugins alone, they can be quite useful in distributing as independent modules as well. What’s currently lacking today is an open ecosystem, which is surprising given all the developement is quite open.
date: 2025-09-10
updatedDate: 2025-09-10
featuredImage: /images/posts/24381ddc-6564-485c-8ef6-df48c93e8362.png
tags:
  - post
  - webassembly
  - plugins
  - rust
  - wasm
  - build-in-public
  - wasmrun
---

> In this [first article](https://blog.anirudha.dev/rust-plugin-system) in this series, we went through all different rust plugins, [the previous one](https://blog.anirudha.dev/wasmrun-plugin-architecture), we understood the wasmrun plugin architecture. Here’s we’ll learn how to create your own wasm plugin which you can run using [wasmrun](https://github.com/anistark/wasmrun).

Creating wasm plugins, is not limited to wasmrun plugins alone, they can be quite useful in distributing as independent modules as well. What’s currently lacking today is an open ecosystem, which is surprising given all the developement is quite open. Limited is a better word for it rather. So, consider this more of a guide to building your next wasm project, and to get it to work in the larger wasm ecosystem. Making it open or close is upto you. Currently, I’ve only made it work with published crates, however was testing local plugins as well. So, in case you’re also interested in contrubuting, feel free to work on it.

> Plugins were introduced in wasmrun [v0.8.2](https://github.com/anistark/wasmrun/releases/tag/v0.8.2) for first time. However, the structural final changes before making it stable only achieved by [v0.11.3](https://github.com/anistark/wasmrun/releases/tag/v0.11.3). So, make sure you’ve the right [crate](https://crates.io/crates/wasmrun) version installed.

## Creating Your Own Plugin

Creating a wasmrun plugin involves implementing the required traits and exposing them through FFI for external plugins.

### Create a New Rust Project

```bash
# Create a new library crate
cargo new --lib wasmcustomlang
cd wasmcustomlang

# Add wasmrun as a dependency
cargo add wasmrun
```

### Configure Cargo.toml

```toml
[package]
name = "wasmcustomlang"
version = "0.1.0"
edition = "2021"
description = "Custom language plugin for wasmrun"
license = "MIT"
keywords = ["wasm", "webassembly", "plugin", "wasmrun"]

[lib]
name = "wasmcustomlang"
crate-type = ["cdylib", "rlib"]  # Both dynamic and static library

[dependencies]
wasmrun = "0.10"
libc = "0.2"

[[bin]]
name = "wasmrun-wasmcustomlang"  # Fallback binary
path = "src/main.rs"
```

### Implement the Plugin Traits

```rust
use wasmrun::plugin::{Plugin, WasmBuilder, PluginInfo, Dependencies};
use wasmrun::error::Result;
use std::path::Path;

pub struct CustomLangPlugin;

impl Plugin for CustomLangPlugin {
    fn name(&self) -> &str {
        "customlang"
    }

    fn supported_extensions(&self) -> Vec<String> {
        vec!["custom".to_string(), "cl".to_string()]
    }

    fn can_handle_project(&self, project_path: &str) -> bool {
        let path = Path::new(project_path);
        path.join("main.custom").exists() || 
        path.join("customlang.toml").exists()
    }

    fn get_builder(&self, _project_path: &str) -> Result<Box<dyn WasmBuilder>> {
        Ok(Box::new(CustomLangWasmBuilder::new()))
    }

    fn get_info(&self) -> PluginInfo {
        PluginInfo {
            name: "customlang".to_string(),
            version: "0.1.0".to_string(),
            description: "Custom language WebAssembly compiler".to_string(),
            author: "Your Name <email@example.com>".to_string(),
            extensions: vec!["custom".to_string(), "cl".to_string()],
            capabilities: vec![
                "compile".to_string(), 
                "watch".to_string(),
                "web".to_string()
            ],
            dependencies: Dependencies {
                tools: vec!["customlang-compiler".to_string()],
                optional_tools: vec!["customlang-optimizer".to_string()],
            },
        }
    }
}

pub struct CustomLangWasmBuilder {
    plugin_info: PluginInfo,
}

impl CustomLangWasmBuilder {
    pub fn new() -> Self {
        Self {
            plugin_info: CustomLangPlugin.get_info(),
        }
    }
}

impl WasmBuilder for CustomLangWasmBuilder {
    fn build(&self, project_path: &str, output_path: &str) -> Result<String> {
        // Your custom compilation logic here
        let main_file = Path::new(project_path).join("main.custom");
        let output_file = Path::new(output_path).join("output.wasm");

        // Example: Call your custom compiler
        let output = std::process::Command::new("customlang-compiler")
            .args([
                "--input", &main_file.to_string_lossy(),
                "--output", &output_file.to_string_lossy(),
                "--target", "wasm32"
            ])
            .output()?;

        if output.status.success() {
            Ok(output_file.to_string_lossy().to_string())
        } else {
            Err(wasmrun::error::WasmrunError::from("Custom lang compilation failed"))
        }
    }

    fn build_for_web(&self, project_path: &str, output_path: &str) -> Result<String> {
        // Web-specific build logic
        self.build(project_path, output_path)
    }

    fn clean(&self, project_path: &str) -> Result<()> {
        // Clean build artifacts
        let build_dir = Path::new(project_path).join("build");
        if build_dir.exists() {
            std::fs::remove_dir_all(build_dir)?;
        }
        Ok(())
    }

    fn get_wasm_file(&self, project_path: &str) -> Result<String> {
        // Return the main WASM file path
        let wasm_file = Path::new(project_path).join("build").join("output.wasm");
        Ok(wasm_file.to_string_lossy().to_string())
    }
}
```

### Implement FFI Interface

```rust
use std::ffi::{CString, CStr, c_char, c_void};
use std::ptr;

static mut GLOBAL_PLUGIN: Option<CustomLangPlugin> = None;
static mut GLOBAL_BUILDER: Option<CustomLangWasmBuilder> = None;

// FFI exports for dynamic loading
#[no_mangle]
pub extern "C" fn create_wasm_builder() -> *mut c_void {
    unsafe {
        GLOBAL_BUILDER = Some(CustomLangWasmBuilder::new());
        GLOBAL_BUILDER.as_mut().unwrap() as *mut _ as *mut c_void
    }
}

#[no_mangle]
pub extern "C" fn can_handle_project(builder: *mut c_void, path: *const c_char) -> bool {
    if builder.is_null() || path.is_null() {
        return false;
    }

    unsafe {
        let plugin = CustomLangPlugin;
        let c_str = CStr::from_ptr(path);
        if let Ok(path_str) = c_str.to_str() {
            plugin.can_handle_project(path_str)
        } else {
            false
        }
    }
}

#[no_mangle]
pub extern "C" fn build_project(
    builder: *mut c_void, 
    project_path: *const c_char, 
    output_path: *const c_char
) -> *const c_char {
    if builder.is_null() || project_path.is_null() || output_path.is_null() {
        return ptr::null();
    }

    unsafe {
        let c_project = CStr::from_ptr(project_path);
        let c_output = CStr::from_ptr(output_path);

        if let (Ok(project_str), Ok(output_str)) = (c_project.to_str(), c_output.to_str()) {
            let builder_ref = &*(builder as *mut CustomLangWasmBuilder);
            if let Ok(result) = builder_ref.build(project_str, output_str) {
                let c_result = CString::new(result).unwrap();
                return c_result.into_raw();
            }
        }
        ptr::null()
    }
}

#[no_mangle]
pub extern "C" fn get_plugin_info() -> *const c_char {
    let plugin = CustomLangPlugin;
    let info = plugin.get_info();
    
    if let Ok(json) = serde_json::to_string(&info) {
        let c_string = CString::new(json).unwrap();
        c_string.into_raw()
    } else {
        ptr::null()
    }
}

// Cleanup function.
#[no_mangle]
pub extern "C" fn cleanup_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(ptr);
        }
    }
}
```

### (Optional) Create Binary

Another easier approach for plugin extensions was to create and distribute the binary. Binaries could have ran independently with no compatibility issues. I prefer binary is secondary, not primary. However, binary are great to test and develop with.

```rust
// src/main.rs
use wasmcustomlang::CustomLangPlugin;
use wasmrun::plugin::Plugin;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: {} <command> [args...]", args[0]);
        std::process::exit(1);
    }

    let plugin = CustomLangPlugin;
    
    match args[1].as_str() {
        "can-handle" => {
            if args.len() < 3 {
                eprintln!("Usage: {} can-handle <project-path>", args[0]);
                std::process::exit(1);
            }
            let can_handle = plugin.can_handle_project(&args[2]);
            println!("{}", can_handle);
        }
        "build" => {
            if args.len() < 4 {
                eprintln!("Usage: {} build <project-path> <output-path>", args[0]);
                std::process::exit(1);
            }
            let builder = plugin.get_builder(&args[2])?;
            let result = builder.build(&args[2], &args[3])?;
            println!("{}", result);
        }
        "info" => {
            let info = plugin.get_info();
            let json = serde_json::to_string_pretty(&info)?;
            println!("{}", json);
        }
        _ => {
            eprintln!("Unknown command: {}", args[1]);
            std::process::exit(1);
        }
    }

    Ok(())
}
```

### Build and Test Locally

```bash
# Build the plugin
cargo build --release

# Test that it builds correctly
cargo test

# Create a test project
mkdir test-project
echo 'fn main() { println!("Hello from CustomLang!"); }' > test-project/main.custom

# Test the plugin locally
cargo run -- can-handle test-project
cargo run -- build test-project ./output
cargo run -- info
```

## Plugin Distribution

### Publish to [crates](https://crates.io)[.io](http://Crates.io)

```bash
# Login to crates.io
cargo login

# Publish the plugin
cargo publish
```

### Plugin Metadata in Cargo.toml

For better wasmrun integration, you can add wasmrun-specific metadata to your Cargo.toml:

```toml
[package.metadata.wasm_plugin]
name = "customlang"
version = "0.1.0"
description = "Custom language WebAssembly compiler"
author = "Your Name <email@example.com>"
extensions = ["custom", "cl"]
entry_files = ["main.custom", "customlang.toml"]

[package.metadata.wasm_plugin.capabilities]
compile_wasm = true
compile_webapp = true
live_reload = true
optimization = true
custom_targets = ["wasm32-unknown-unknown"]
supported_languages = ["customlang"]  # Explicit language support declaration
# For multi-language plugins: supported_languages = ["rust", "zig"]
# If there's variations in same language, better to add each as separate langugage.

[package.metadata.wasm_plugin.dependencies]
tools = ["customlang-compiler"]
optional_tools = ["customlang-optimizer"]

[package.metadata.wasm_plugin.exports]
create_wasm_builder = "create_wasm_builder"
can_handle_project = "customlang_can_handle_project"
build = "customlang_build"
clean = "customlang_clean"
clone_box = "customlang_clone_box"
drop = "customlang_drop"
plugin_create = "wasmrun_plugin_create"

[package.metadata.wasm_plugin.frameworks]
supported = ["custom-framework"]
auto_detect = true
```

## Plugin Management

### Install and Use with Wasmrun

```bash
# Install your plugin
wasmrun plugin install wasmcustomlang

# Use it with a project
wasmrun ./my-custom-project
wasmrun compile ./my-custom-project --language customlang
```

### Plugin Metadata Management

Plugin metadata is stored in several places:

* `~/.wasmrun/plugins/{name}/.wasmrun_metadata` - Plugin information
    
* `~/.wasmrun/config.toml` - Global plugin registry
    
* Plugin's `Cargo.toml` - Source metadata
    

Example metadata file:

```json
{
  "name": "customlang",
  "version": "0.1.0", 
  "description": "Custom language WebAssembly compiler",
  "author": "Your Name <email@example.com>",
  "extensions": ["custom", "cl"],
  "entry_files": ["main.custom", "customlang.toml"],
  "capabilities": {
    "compile_wasm": true,
    "compile_webapp": true,
    "live_reload": true,
    "optimization": true,
    "custom_targets": ["wasm32-unknown-unknown"],
    "supported_languages": ["customlang"]
  },
  "dependencies": {
    "tools": ["customlang-compiler"],
    "optional_tools": ["customlang-optimizer"]
  }
}
```

## Plugin Management Commands

```bash
# List installed plugins
wasmrun plugin list

# Install a plugin
wasmrun plugin install wasmrust

# Uninstall a plugin  
wasmrun plugin uninstall wasmrust

# Update a plugin
wasmrun plugin update wasmrust

# Show plugin info
wasmrun plugin info wasmrust
```

## Best Practices for Plugin Development

### Error Handling

Always provide clear error messages and handle edge cases:

```rust
impl WasmBuilder for CustomLangWasmBuilder {
    fn build(&self, project_path: &str, output_path: &str) -> Result<String> {
        // Validate inputs
        if !Path::new(project_path).exists() {
            return Err(WasmrunError::from("Project path does not exist"));
        }

        // Check for required tools
        if !which::which("customlang-compiler").is_ok() {
            return Err(WasmrunError::from(
                "customlang-compiler not found. Please install CustomLang toolchain."
            ));
        }

        // Your build logic...
    }
}
```

### Project Detection

Make project detection robust and specific:

```rust
fn can_handle_project(&self, project_path: &str) -> bool {
    let path = Path::new(project_path);
    
    // Check for specific files
    if path.join("customlang.toml").exists() {
        return true;
    }
    
    // Check for file patterns
    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            if let Some(ext) = entry.path().extension() {
                if ext == "custom" {
                    return true;
                }
            }
        }
    }
    
    false
}
```

### Dependency Management

Check for dependencies and provide helpful error messages:

```rust
fn check_dependencies() -> Vec<String> {
    let mut missing = Vec::new();
    
    if !which::which("customlang-compiler").is_ok() {
        missing.push("customlang-compiler".to_string());
    }
    
    missing
}
```

### Testing

Write comprehensive tests for your plugin. Try to increase coverage and also check all cases:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tempdir::TempDir;

    #[test]
    fn test_can_handle_project() {
        let tmp_dir = TempDir::new("test").unwrap();
        let project_path = tmp_dir.path();
        
        // Create test file
        std::fs::write(project_path.join("main.custom"), "test content").unwrap();
        
        let plugin = CustomLangPlugin;
        assert!(plugin.can_handle_project(project_path.to_str().unwrap()));
    }

    #[test]
    fn test_plugin_info() {
        let plugin = CustomLangPlugin;
        let info = plugin.get_info();
        
        assert_eq!(info.name, "customlang");
        assert!(info.extensions.contains(&"custom".to_string()));
    }
}
```

## Common Issues and Solutions

### Dynamic Library Loading Issues

When you try to load the plugin, you might encounter an error message saying that the library cannot be found. This issue is quite common and can be frustrating, especially if you're not sure where things are going wrong. The error typically occurs because the system is unable to locate the necessary library files that the plugin depends on. This can happen if the library paths are not set correctly or if the library files are not named properly. To resolve this issue, you should first double-check that the library search paths are correctly configured. This involves ensuring that the directories where the libraries are stored are included in the system's library path environment variables. Additionally, make sure that the library files are named correctly according to the system's conventions. Sometimes, simply renaming a library file to match the expected naming pattern can solve the problem. By taking these steps, you can help the system locate the necessary libraries and successfully load the plugin without any errors.

```rust
// In your plugin loading code
let lib_paths = vec![
    format!("lib{}.dylib", plugin_name),      // macOS
    format!("lib{}.so", plugin_name),         // Linux  
    format!("{}.dll", plugin_name),           // Windows
];
```

### ABI Compatibility

When a plugin crashes due to an ABI mismatch, it can be quite a headache to deal with. ABI, or Application Binary Interface, refers to the way different program modules communicate at the binary level. If there's a mismatch, it means that the plugin and the host application are not able to communicate properly, leading to crashes or unexpected behavior. This often happens when the plugin and the application are built with different compiler versions or settings, or when there have been changes in the data structures or function signatures that they use to interact. It's important to use stable ABI-compatible interfaces. This means designing your plugin and application interfaces in a way that remains consistent across different versions and compiler settings. One effective strategy is to implement version checking. By including version information in your interfaces, you can ensure that the plugin only loads if it matches the expected version of the application. This helps prevent crashes by ensuring that both the plugin and the application are using compatible interfaces. Additionally, it's a good practice to document any changes in the ABI and communicate these changes to developers who might be using your plugin, so they can make the necessary adjustments on their end.

```rust
#[no_mangle]
pub extern "C" fn plugin_abi_version() -> u32 {
    1 // Increment when ABI changes
}
```

### Memory Management

When dealing with memory leaks or crashes at the FFI boundary, it can be quite challenging to pinpoint the exact cause. These issues often arise because of improper handling of memory allocation and deallocation, which can lead to resources not being freed correctly or being accessed after they have been freed. This can cause unexpected behavior or crashes, especially when different languages with different memory management models are involved. It's crucial to ensure proper memory cleanup and ownership management. This means clearly defining who is responsible for allocating and freeing memory, and sticking to these rules consistently. For example, if your plugin allocates memory, it should also be responsible for freeing it, unless there is a clear agreement that the host application will take over this responsibility. Additionally, using smart pointers or reference counting can help manage ownership and prevent memory leaks. It's also beneficial to implement thorough testing and debugging practices to catch any memory-related issues early in the development process. By doing so, you can maintain a stable and reliable interface between your plugin and the host application, minimizing the risk of memory leaks or crashes.

```rust
#[no_mangle]
pub extern "C" fn cleanup_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        unsafe {
            let _ = CString::from_raw(ptr);
        }
    }
}
```

Now, you know how to create your very own wasm plugin. Would love to have more community plugins. 🙌

![](/images/posts/6e8fe806-2f4f-4316-aba5-884d0390fe83.png)

Even if you’re not building one, if you’ve an idea that you’d like to use, feel free to open an [issue](https://github.com/anistark/wasmrun/issues) and let us know about it. 🚀
