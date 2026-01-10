---
layout: post
title: Wasmrun Plugin Architecture
excerpt: "In the [last article](https://blog.anirudha.dev/rust-plugin-system), I covered all different types of rust plugin architecture and approaches we could have done. Now, lets dive into the plugin architecture used in [wasmrun](https://github.com/anistark/wasmrun), an open-source WebAssembly runtime that supports multiple programming languages through a hybrid plugin system."
date: 2025-09-05
updatedDate: 2025-09-05
featuredImage: /images/posts/6fee9dc3-7f7b-4afd-abec-65415a69b829.png
tags:
  - post
  - development
  - webassembly
  - plugins
  - architecture
  - rust
  - wasm
  - wasmrun
---

In the [last article](https://blog.anirudha.dev/rust-plugin-system), I covered all different types of rust plugin architecture and approaches we could have done. Now, lets dive into the plugin architecture used in [wasmrun](https://github.com/anistark/wasmrun), an open-source WebAssembly runtime that supports multiple programming languages through a hybrid plugin system.

## Why Plugins in Wasmrun

Wasmrun intends to support multiple programming languages like Rust, Go, C/C++, AssemblyScript, Python and each language has its own:

* **Compilation toolchain** (rustc, tinygo, emcc, asc, py2wasm)
    
* **Project structure conventions** (Cargo.toml, go.mod, Makefile, package.json)
    
* **Optimization strategies** and output formats
    
* **Development workflow** requirements
    

Initially, we had all language support built directly into the binary:

```rust
// This was getting unwieldy fast
match language {
    "c" => compile_c_project(path),
    "cpp" => compile_cpp_project(path),
    "assemblyscript" => compile_as_project(path),
    "python" => compile_python_project(path),
    // External plugins would require subprocess calls
    "rust" => subprocess_plugin("wasmrust", path),
    "go" => subprocess_plugin("wasmgo", path),
    // ... and growing
}
```

The issues became clear:

* **Monolithic binary** - Every user had to download support for all languages
    
* **Tight coupling** - Adding new language support required core changes
    
* **Testing complexity** - Each language change could break others
    
* **Community contributions** - External developers couldn't easily add language support
    

## `wasmrun` Implementation: Hybrid Built-in + External

Initially I started with trying to extend usage with same Traits to external as built-in plugins which would have made creating external plugins easy and also the migration process. However, it soon became an ant hill of issues. A good approach in this would have been to create a common `wasmrun_core` crate and import for both. However, I want to keep things at minimal changes and not introduce a new dependency so as to increase `wasmrun` maintainability before testing the concept. Another easy option was to run the external plugins as binary directly. However, this would have reduced the customisations that you’d be able to do on the runtime itself. A version of me would argue that this should have been the safest first step, but who cares about playing safe.

After evaluating different approaches, I settled on a hybrid system that combines the benefits of multiple strategies:

* **Built-in plugins** using trait objects for core language support
    
* **External plugins** using FFI for extensibility
    
* **Fallback subprocess execution** when FFI loading fails. We’ll remove this in future as we move to more tested approach.
    

This gives us type safety and performance for core functionality, while still allowing runtime extensibility.

## The Trait Foundation

The key insight was to design traits that work identically for both built-in and external plugins:

```rust
// src/plugin/mod.rs
pub trait Plugin: Send + Sync {
    fn info(&self) -> &PluginInfo;
    fn can_handle_project(&self, project_path: &str) -> bool;
    fn get_builder(&self) -> Box<dyn WasmBuilder>;
}

// src/compiler/builder.rs
pub trait WasmBuilder: Send + Sync {
    fn language_name(&self) -> &str;
    fn entry_file_candidates(&self) -> &[&str];
    fn supported_extensions(&self) -> &[&str];
    fn check_dependencies(&self) -> Vec<String>;
    fn build(&self, config: &BuildConfig) -> CompilationResult<BuildResult>;
    fn validate_project(&self, project_path: &str) -> CompilationResult<()>;
    fn can_handle_project(&self, project_path: &str) -> bool;
    fn clean(&self, project_path: &str) -> Result<()>;
    fn clone_box(&self) -> Box<dyn WasmBuilder>;
}
```

## Plugin Information Structure

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub name: String,
    pub version: String,
    pub description: String,
    pub author: String,
    pub extensions: Vec<String>,
    pub entry_files: Vec<String>,
    pub plugin_type: PluginType,
    pub source: Option<PluginSource>,
    pub dependencies: Vec<String>,
    pub capabilities: PluginCapabilities,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginCapabilities {
    pub compile_wasm: bool,
    pub compile_webapp: bool,
    pub live_reload: bool,
    pub optimization: bool,
    pub custom_targets: Vec<String>,
    pub supported_languages: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PluginSource {
    CratesIo { name: String, version: String },
    Git { url: String, branch: Option<String> },
    Local { path: PathBuf },
}
```

## Built-in Plugins: The Foundation

Built-in plugins are straightforward. They're just structs implementing the traits, compiled directly into the binary. The current built-in plugins are C/C++, AssemblyScript, and Python. Earlier rust and go were also built-in but have successfully migrated them external. Soon the plan is to move all language built-in plugins to external.

```rust
// src/plugin/languages/c_plugin.rs
#[derive(Clone)]
pub struct CPlugin {
    info: PluginInfo,
}

impl CPlugin {
    pub fn new() -> Self {
        let info = PluginInfo {
            name: "c".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            description: "C WebAssembly compiler using Emscripten".to_string(),
            author: "Wasmrun Team".to_string(),
            extensions: vec!["c".to_string(), "h".to_string()],
            entry_files: vec!["main.c".to_string(), "Makefile".to_string()],
            plugin_type: PluginType::Builtin,
            source: None,
            dependencies: vec![],
            capabilities: PluginCapabilities {
                compile_wasm: true,
                compile_webapp: true,
                live_reload: true,
                optimization: true,
                custom_targets: vec!["wasm".to_string(), "web".to_string()],
                supported_languages: Some(vec!["c".to_string(), "cpp".to_string()]),
            },
        };
        Self { info }
    }
}

impl Plugin for CPlugin {
    fn info(&self) -> &PluginInfo {
        &self.info
    }

    fn can_handle_project(&self, project_path: &str) -> bool {
        let path = Path::new(project_path);
        // Check for Makefile or main.c files
        path.join("Makefile").exists() || path.join("main.c").exists()
    }

    fn get_builder(&self) -> Box<dyn WasmBuilder> {
        Box::new(CWasmBuilder::new())
    }
}
```

## Built-in Plugin Loading

All built-in plugins are loaded through a centralized system:

```rust
// src/plugin/builtin.rs
pub fn load_all_builtin_plugins(plugins: &mut Vec<Box<dyn Plugin>>) -> Result<()> {
    // C plugin
    let c_plugin = Arc::new(CPlugin::new());
    plugins.push(Box::new(BuiltinPlugin::new(c_plugin)));

    // AssemblyScript plugin
    let asc_plugin = Arc::new(AscPlugin::new());
    plugins.push(Box::new(BuiltinPlugin::new(asc_plugin)));

    // Python plugin
    let python_plugin = Arc::new(PythonPlugin::new());
    plugins.push(Box::new(BuiltinPlugin::new(python_plugin)));

    Ok(())
}
```

## External Plugins: The Interesting Part

External plugins are where things get interesting. The challenge was making them feel identical to built-in plugins while being loaded dynamically.

### The `cargo install` approach

I wanted plugin installation to feel familiar to Rust developers:

1. **Download**: Uses `cargo install` to build the plugin
    
2. **Storage**: Installs to `~/.wasmrun/plugins/{plugin_name}/`
    
3. **Registration**: Updates wasmrun config with plugin capabilities as mentioned in the plugin `Cargo.toml`
    
4. **Ready**: Plugin automatically handles supported projects
    

```rust
// src/plugin/installer.rs
pub fn install_plugin(plugin_name: &str) -> Result<InstallationResult> {
    // Validate plugin exists on crates.io
    if !PluginRegistry::validate_plugin(plugin_name)? {
        return Err(WasmrunError::from(format!("Plugin '{plugin_name}' not found")));
    }

    let wasmrun_root = dirs::home_dir()
        .ok_or("Could not determine home directory")?
        .join(".wasmrun");

    // Install using cargo to ~/.wasmrun/
    let output = std::process::Command::new("cargo")
        .args([
            "install", 
            plugin_name, 
            "--root", 
            &wasmrun_root.to_string_lossy()
        ])
        .output()?;

    if !output.status.success() {
        return Err(WasmrunError::from("Plugin installation failed"));
    }

    // Create plugin directory and metadata
    let plugin_dir = wasmrun_root.join("plugins").join(plugin_name);
    std::fs::create_dir_all(&plugin_dir)?;

    // Extract metadata from Cargo.toml
    let metadata = extract_plugin_metadata(plugin_name)?;
    save_plugin_metadata(&plugin_dir, &metadata)?;

    // Update wasmrun config
    update_plugin_config(plugin_name, &metadata)?;

    Ok(InstallationResult::Success)
}
```

### Plugin Directory Structure

```bash
~/.wasmrun/
├── bin/                    # Plugin binaries installed via cargo
│   ├── wasmrust           # Plugin executable
│   └── wasmgo             # Plugin executable
├── plugins/               # Plugin metadata and dynamic libraries
│   ├── wasmrust/
│   │   ├── .wasmrun_metadata
│   │   ├── libwasmrust.dylib  # Dynamic library (optional)
│   │   └── target/
│   │       └── release/
│   │           └── libwasmrust.dylib
│   └── wasmgo/
│       ├── .wasmrun_metadata
│       └── libwasmgo.dylib
└── config.toml           # Plugin registry and configuration
```

## FFI and Dynamic Loading

External plugins are loaded as dynamic libraries using Rust's Foreign Function Interface (FFI). This approach provides several advantages:

* **Performance**: Direct function calls instead of subprocess execution
    
* **Integration**: Same trait interface as built-in plugins
    
* **Efficiency**: Shared memory space and reduced overhead
    

### FFI Interface

```rust
// src/plugin/external.rs
use libloading::Library;

/// Generic wrapper for all external plugins
pub struct ExternalPluginWrapper {
    info: PluginInfo,
    plugin_name: String,
    metadata: PluginMetadata,
    #[cfg(not(target_os = "windows"))]
    library: Option<Arc<Library>>,
}

impl ExternalPluginWrapper {
    pub fn new(plugin_path: PathBuf, entry: ExternalPluginEntry) -> Result<Self> {
        let plugin_name = entry.info.name.clone();

        if !PluginUtils::is_plugin_available(&plugin_name) {
            return Err(WasmrunError::from(format!(
                "Plugin '{plugin_name}' not available"
            )));
        }

        // Load metadata for ALL plugins
        let metadata = PluginMetadata::from_installed_plugin(&plugin_path)
            .or_else(|_| PluginMetadata::from_crates_io(&plugin_name))?;

        metadata.validate()?;

        #[cfg(not(target_os = "windows"))]
        let library = Self::try_load_library(&plugin_name, &plugin_path)?;

        Ok(Self {
            info: entry.info,
            plugin_name,
            metadata,
            #[cfg(not(target_os = "windows"))]
            library,
        })
    }
}

impl Plugin for ExternalPluginWrapper {
    fn info(&self) -> &PluginInfo {
        &self.info
    }

    fn can_handle_project(&self, path: &str) -> bool {
        // Try FFI first if library is available
        #[cfg(not(target_os = "windows"))]
        {
            if let Some(library) = &self.library {
                if let Some(exports) = &self.metadata.exports {
                    // Use FFI to call plugin's can_handle_project function
                    // ... FFI implementation details ...
                }
            }
        }

        // Fallback to metadata-based checking
        self.check_project_via_metadata(path)
    }

    fn get_builder(&self) -> Box<dyn WasmBuilder> {
        Box::new(ExternalWasmBuilder::new(
            self.plugin_name.clone(),
            self.metadata.clone(),
            #[cfg(not(target_os = "windows"))]
            self.library.clone(),
        ))
    }
}
```

### External Builder Implementation

The external builder uses a hybrid approach - FFI when available, command execution as fallback:

```rust
pub struct ExternalWasmBuilder {
    plugin_name: String,
    metadata: PluginMetadata,
    #[cfg(not(target_os = "windows"))]
    library: Option<Arc<Library>>,
}

impl WasmBuilder for ExternalWasmBuilder {
    fn build(&self, config: &BuildConfig) -> CompilationResult<BuildResult> {
        // Try FFI first if available
        #[cfg(not(target_os = "windows"))]
        {
            if let Some(library) = &self.library {
                if let Some(exports) = &self.metadata.exports {
                    // Use FFI to call plugin's build function
                    // ... FFI implementation details ...
                    // Return structured BuildResult
                }
            }
        }

        // Fallback to command execution
        self.build_via_command(config)
    }

    fn build_via_command(&self, config: &BuildConfig) -> CompilationResult<BuildResult> {
        // Find plugin binary in ~/.wasmrun/bin or system PATH
        let wasmrun_bin_path = dirs::home_dir()
            .map(|home| home.join(".wasmrun").join("bin").join(&self.plugin_name))
            .unwrap_or_else(|| PathBuf::from(&self.plugin_name));
            
        let plugin_binary = if wasmrun_bin_path.exists() {
            wasmrun_bin_path.to_string_lossy().to_string()
        } else {
            self.plugin_name.clone()
        };

        let output = std::process::Command::new(&plugin_binary)
            .args(["compile", "-p", &config.project_path])
            .args(["-o", &config.output_dir])
            .output();

        // Process result and return BuildResult struct
        // ... result processing ...
    }
}
```

## Plugin Manager Integration

The plugin system is managed through a central `PluginManager` that handles both built-in and external plugins:

```rust
pub struct PluginManager {
    builtin_plugins: Vec<Box<dyn Plugin>>,
    external_plugins: HashMap<String, Box<dyn Plugin>>,
    config: WasmrunConfig,
    plugin_stats: PluginStats,
}

impl PluginManager {
    pub fn new() -> Result<Self> {
        let config = WasmrunConfig::load().unwrap_or_default();
        let mut manager = Self {
            builtin_plugins: vec![],
            external_plugins: HashMap::new(),
            config,
            plugin_stats: PluginStats::default(),
        };

        manager.load_all_plugins()?;
        manager.update_stats();
        Ok(manager)
    }

    fn load_all_plugins(&mut self) -> Result<()> {
        // Load built-in plugins
        load_all_builtin_plugins(&mut self.builtin_plugins)?;

        // Load enabled external plugins
        for (name, entry) in &self.config.external_plugins {
            if entry.enabled {
                match ExternalPluginLoader::load(entry) {
                    Ok(plugin) => {
                        println!("✅ Loaded external plugin: {name}");
                        self.external_plugins.insert(name.clone(), plugin);
                    }
                    Err(e) => {
                        eprintln!("⚠️  Failed to load external plugin '{name}': {e}");
                    }
                }
            }
        }

        Ok(())
    }

    pub fn find_plugin_for_project(&self, project_path: &str) -> Option<&dyn Plugin> {
        // External plugins have priority
        for plugin in self.external_plugins.values() {
            if plugin.can_handle_project(project_path) {
                return Some(plugin.as_ref());
            }
        }

        // Fallback to built-in plugins
        for plugin in &self.builtin_plugins {
            if plugin.can_handle_project(project_path) {
                return Some(plugin.as_ref());
            }
        }

        None
    }

    // Plugin management methods
    pub fn install_plugin(&mut self, plugin_name: &str) -> Result<()> { /* ... */ }
    pub fn update_plugin(&mut self, plugin_name: &str) -> Result<()> { /* ... */ }
    pub fn enable_plugin(&mut self, plugin_name: &str) -> Result<()> { /* ... */ }
    pub fn disable_plugin(&mut self, plugin_name: &str) -> Result<()> { /* ... */ }
}
```

This hybrid architecture gives us the best of both worlds: type-safe, performant built-in plugins for core languages, and the flexibility to extend the system with external plugins for specialized use cases.

## Advanced Features

### Plugin Health Monitoring

The plugin system includes comprehensive health checking. Don’t have much support for it, but playing around it, so should have full support for health check soon.

```rust
pub enum PluginHealthStatus {
    Healthy,
    MissingDependencies(Vec<String>),
    NotFound,
    LoadError(String),
}

impl PluginManager {
    pub fn check_plugin_health(&self, plugin_name: &str) -> Result<PluginHealthStatus> {
        if !self.is_plugin_installed(plugin_name) {
            return Ok(PluginHealthStatus::NotFound);
        }

        let missing_deps = PluginRegistry::check_plugin_dependencies(plugin_name);
        if !missing_deps.is_empty() {
            return Ok(PluginHealthStatus::MissingDependencies(missing_deps));
        }

        // Try to load the plugin to ensure it's functional
        if let Some(entry) = self.config.external_plugins.get(plugin_name) {
            match ExternalPluginLoader::load(entry) {
                Ok(_) => Ok(PluginHealthStatus::Healthy),
                Err(e) => Ok(PluginHealthStatus::LoadError(e.to_string())),
            }
        } else {
            Ok(PluginHealthStatus::Healthy)
        }
    }
}
```

### Plugin Updates and Version Management

The system supports automatic plugin updates:

```rust
impl PluginManager {
    pub fn update_plugin(&mut self, plugin_name: &str) -> Result<()> {
        let current_version = self.get_current_plugin_version(plugin_name);
        let latest_version = self.get_latest_plugin_version(plugin_name)?;

        if current_version == latest_version {
            println!("✅ Plugin '{plugin_name}' is already up to date");
            return Ok(());
        }

        println!("⬆️  Updating from v{current_version} to v{latest_version}");
        self.reinstall_external_plugin(plugin_name, &latest_version)?;
        println!("✅ Plugin updated successfully");
        Ok(())
    }
}
```

### Enhanced Build Configuration

Modern build configuration uses structured data instead of simple string parameters:

```rust
pub struct BuildConfig {
    pub project_path: String,
    pub output_dir: String,
    pub optimization_level: OptimizationLevel,
    pub target_format: TargetFormat,
    pub enable_debug: bool,
    pub custom_args: Vec<String>,
}

pub struct BuildResult {
    pub wasm_path: String,
    pub js_path: Option<String>,
    pub additional_files: Vec<String>,
    pub is_wasm_bindgen: bool,
}
```

### Plugin Capabilities System

Rich capability detection allows for better plugin selection:

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginCapabilities {
    pub compile_wasm: bool,
    pub compile_webapp: bool,
    pub live_reload: bool,
    pub optimization: bool,
    pub custom_targets: Vec<String>,
    pub supported_languages: Option<Vec<String>>,
}

impl PluginManager {
    pub fn get_plugins_by_capability(&self, capability: PluginCapabilityFilter) -> Vec<&PluginInfo> {
        // Filter plugins based on specific capabilities
        self.builtin_plugins.iter()
            .chain(self.external_plugins.values())
            .filter_map(|p| {
                if self.matches_capability_filter(p.info(), &capability) {
                    Some(p.info())
                } else {
                    None
                }
            })
            .collect()
    }
}
```

## Current Built-in Languages

The system currently ships with these built-in plugins:

* **C/C++**: Using Emscripten for compilation
    
* **AssemblyScript**: TypeScript-like syntax for WebAssembly
    
* **Python**: Using py2wasm or similar tools
    

## External Plugin Ecosystem

Popular external plugins available through `cargo install`:

* [**wasmrust**](https://github.com/anistark/wasmrust): Rust to WebAssembly compilation
    
* [**wasmgo**](https://github.com/anistark/wasmgo): Go to WebAssembly compilation
    

Installation is as simple as:

```bash
wasmrun plugin install wasmrust
wasmrun plugin enable wasmrust # Optional
```

This architecture has proven robust and extensible, allowing the wasmrun ecosystem to grow organically while maintaining excellent performance and reliability.

![](/images/posts/69dd0e7d-110c-4b58-9fe7-3b91d1b12eed.png)

> So, if you want to make your version of rust plugin and use it with wasmrun, you can. For instance, there can be various tools for compiling rust project through wasm target, and you’ve a special plugin which fits your use-case.

Current stable version of wasmrun is [v0.11.3](https://crates.io/crates/wasmrun). 🚀 Try out our plugin system. 🙌
