# Mojo Extension Development Guide

This document explains how to create a proper Zed extension for Mojo with modern v25.4+ language support.

## Current Situation

We've been working on updating the Mojo grammar for modern syntax, but the current repository structure doesn't follow Zed extension best practices. This guide shows how to create a proper setup.

## Repository Structure Issues

**Current Problem:**
- Grammar files are in `grammars/mojo/` subdirectory
- Zed expects grammar repositories to have files at the root level
- Extension points to main repository instead of dedicated grammar repo

**Best Practice Solution:**
- Create separate `nijaru/zed-mojo` extension repository 
- Create separate `nijaru/tree-sitter-mojo` grammar repository
- Use git submodules for the modular platform

## Grammar Updates Made

We've successfully updated the Mojo grammar with these modern features:

### Language Features Added:
- **`ref` patterns**: `ref r = your_list[i]` local reference binding
- **Modern argument conventions**: `out`, `mut`, `owned`, `read`
- **Removed legacy syntax**: No more `inout`, `borrowed`

### Technical Changes:
1. **Line 902**: Added `'ref'` to assignment declaration keywords
2. **Line 724**: Updated argument conventions from legacy to modern
3. **Tests updated**: All test cases use modern syntax (`mut self` vs `inout self`)
4. **Parse trees fixed**: Expected outputs match grammar structure

### Test Status:
- ✅ Trait definition tests pass
- ✅ `ref` patterns work correctly  
- ✅ Modern argument conventions supported
- ⚠️ 2 unrelated failures (string literals, list splats) - pre-existing

## Recommended Repository Setup

### 1. Create Main Extension Repository: `nijaru/zed-mojo`

```bash
# Create the main extension repository
mkdir zed-mojo
cd zed-mojo
git init

# Add submodules
git submodule add https://github.com/nijaru/tree-sitter-mojo.git grammars/mojo
git submodule add https://github.com/modular/modular.git external/modular

# Copy extension files from current repo
cp /path/to/current/src/lib.rs src/
cp /path/to/current/Cargo.toml .
cp /path/to/current/extension.toml .
cp /path/to/current/languages/ . -r
```

### 2. Create Grammar Repository: `nijaru/tree-sitter-mojo`

```bash
# Clone original as template
git clone https://github.com/freespirit/tree-sitter-mojo.git
cd tree-sitter-mojo

# Update with our modern grammar
cp /Users/nick/github/mz/grammars/mojo/grammar.js .
cp -r /Users/nick/github/mz/grammars/mojo/src .
cp -r /Users/nick/github/mz/grammars/mojo/test .

# Update package info
# Edit package.json to reflect nijaru ownership
# Edit README.md with modern features

# Commit modern changes
git add .
git commit -m "Update for modern Mojo v25.4+ syntax

- Add ref pattern support: ref r = list[i]
- Use modern argument conventions: mut/out/owned/read
- Remove legacy inout/borrowed syntax  
- Update all tests for modern syntax
- Grammar now targets Mojo v25.4+ exclusively"

# Set new remote and push
git remote set-url origin https://github.com/nijaru/tree-sitter-mojo.git
git push -u origin main
```

### 3. Update Extension Configuration

**extension.toml:**
```toml
id = "mojo"
name = "Mojo"  
description = "Modern Mojo language support with v25.4+ syntax"
version = "1.0.0"
schema_version = 1
authors = ["nijaru"]
repository = "https://github.com/nijaru/zed-mojo"

[grammars.mojo]
repository = "https://github.com/nijaru/tree-sitter-mojo"
commit = "abc123..."  # Use actual commit hash

[language_servers.mojo-lsp]
name = "mojo-lsp"
language = "Mojo"
```

## File Copying Guide

### Files to Copy to Grammar Repo (`nijaru/tree-sitter-mojo`):

**Root level files:**
```bash
# Core grammar files
cp grammars/mojo/grammar.js .
cp grammars/mojo/package.json .
cp grammars/mojo/package-lock.json .

# Generated parser files  
cp -r grammars/mojo/src .
cp -r grammars/mojo/bindings .

# Tests with modern syntax
cp -r grammars/mojo/test .
cp -r grammars/mojo/queries .

# Build configuration
cp grammars/mojo/Cargo.toml .
cp grammars/mojo/binding.gyp .
cp grammars/mojo/Makefile .
```

### Files to Copy to Extension Repo (`nijaru/zed-mojo`):

**Extension structure:**
```bash
# Rust extension
cp src/lib.rs src/
cp Cargo.toml .
cp Cargo.lock .

# Extension metadata
cp extension.toml .
cp LICENSE .
cp README.md .

# Language configuration  
cp -r languages .

# Documentation
cp CLAUDE.md .
```

## Modern Syntax Examples

**Test file to verify installation:**
```mojo
# Modern ref patterns
ref r = some_list[0]
ref s = other_list[1:5]

# Modern traits with argument conventions
trait MyTrait:
    fn process(mut self, out result: Int):
        pass
        
    fn cleanup(owned self):
        pass
        
    fn readonly_op(read self) -> Int:
        return 42

# Modern struct definitions
struct MyStruct:
    var data: Int
    
    fn __init__(mut self, owned value: Int):
        self.data = value^
        
    fn modify(mut self, out new_value: Int):
        new_value = self.data * 2
```

## Installation Instructions

### For Users:

1. **Install via Zed Extensions panel** (once published)
2. **Or install dev version:**
   ```bash
   git clone https://github.com/nijaru/zed-mojo.git
   cd zed-mojo
   cargo build --release
   # Install in Zed: Extensions → Install Dev Extension
   ```

### For Development:

1. **Clone with submodules:**
   ```bash
   git clone --recursive https://github.com/nijaru/zed-mojo.git
   cd zed-mojo
   ```

2. **Update submodules:**
   ```bash
   git submodule update --remote
   ```

3. **Build and test:**
   ```bash
   cargo build --release
   
   # Test grammar
   cd grammars/mojo
   npm install
   npm test
   ```

## Benefits of This Structure

**✅ Separation of Concerns:**
- Extension logic separate from grammar
- Grammar can be reused by other editors
- Modular platform isolated in submodule

**✅ Standard Practices:**
- Follows Zed extension conventions
- Grammar repository has proper structure
- Version pinning with commit hashes

**✅ Maintainability:**
- Easy to update grammar independently
- Clear dependency management
- Proper submodule handling

**✅ Modern Mojo Support:**
- Targets v25.4+ syntax exclusively
- No legacy syntax confusion
- Up-to-date with language evolution

## Next Steps

1. **Create `nijaru/tree-sitter-mojo` repository** with updated grammar
2. **Create `nijaru/zed-mojo` repository** with proper structure  
3. **Test installation** to ensure grammar compiles
4. **Document modern features** for users
5. **Consider publishing** to Zed extension marketplace

This setup provides a solid foundation for maintaining a modern Mojo extension that stays current with language evolution.