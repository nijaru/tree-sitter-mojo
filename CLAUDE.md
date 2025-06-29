# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tree-sitter grammar development project for the Mojo programming language, targeting modern Mojo v25.4+ syntax. The repository aggregates multiple external components via git submodules to provide a comprehensive foundation for developing proper Tree-sitter grammar and Zed editor integration.

## Repository Structure

The project uses git submodules to organize components:

- **`external/modular/`** - Official Modular platform repository (COMMITTED)
  - Contains MAX framework, Mojo standard library, examples, and official language documentation
  - Source of truth for modern Mojo v25.4+ language features
  
- **`external/mz/`** - Reference Zed extension implementation (LOCAL ONLY)
  - Working but outdated Zed extension for Mojo
  - Provides structural reference for extension development
  
- **`external/tree-sitter-mojo/`** - Reference Tree-sitter grammar (LOCAL ONLY)
  - Forked from tree-sitter-python
  - May not be fully up to date but provides parsing structure reference

**Note**: Only the `external/modular/` submodule is committed to this repository. The other two are local references for development guidance.

## Key Development Commands

### Tree-sitter Grammar Development

**From `external/tree-sitter-mojo/` directory:**

```bash
# Install dependencies
npm install

# Generate parser from grammar.js
tree-sitter generate

# Run grammar tests
tree-sitter test

# Test specific file parsing
tree-sitter parse test.mojo

# Start interactive playground
tree-sitter build --wasm
tree-sitter playground

# Lint grammar definition
npm run lint
```

### Building Language Bindings

**Node.js/JavaScript:**
```bash
npm install              # Install and build native addon
npm test                # Run Node.js binding tests
```

**Rust:**
```bash
cargo build             # Build Rust crate
cargo test              # Run Rust tests
```

**C Library:**
```bash
make                    # Build static/shared libraries
make test               # Run C tests
make install            # Install system-wide
```

## Modern Mojo Language Features

The grammar targets **Mojo v25.4+** with modern syntax conventions:

### Supported Language Features:
- **`ref` patterns**: `ref r = list[i]` for local reference binding
- **Modern argument conventions**: `mut`, `out`, `owned`, `read` (replacing legacy `inout`, `borrowed`)
- **Modern trait definitions** with updated parameter conventions
- **Struct definitions** with ownership semantics
- **Function definitions** with parameter conventions

### File Extensions:
- `.mojo` - Standard Mojo source files
- `.🔥` - Alternative Mojo file extension (fire emoji)

## Grammar Architecture

**Core Files:**
- **`grammar.js`** - Main grammar definition (based on Python grammar)
- **`src/scanner.c`** - Custom lexical scanner for complex tokens (indentation, strings)
- **`queries/highlights.scm`** - Syntax highlighting rules
- **`queries/indents.scm`** - Indentation rules
- **`queries/tags.scm`** - Symbol tagging for navigation

**Testing:**
- **`test/corpus/`** - Grammar test cases in Tree-sitter format
- **`test.mojo`** - Sample Mojo code for testing
- **`test/highlight/`** - Syntax highlighting tests
- **`test/tags/`** - Symbol tagging tests

## Development Workflow

1. **Grammar Updates**: Edit `grammar.js` following Tree-sitter conventions
2. **Parser Generation**: Run `tree-sitter generate` to rebuild parser
3. **Testing**: Add test cases to `test/corpus/` and run `tree-sitter test`
4. **Verification**: Test against real Mojo code samples from `external/modular/`

## Reference Documentation

- **`MOJO_EXTENSION_GUIDE.md`** - Comprehensive guide for creating proper Zed extension structure
- **`external/modular/mojo/docs/`** - Official Mojo language documentation
- **`external/tree-sitter-mojo/README.md`** - Tree-sitter grammar specific documentation

## Language Server Integration

The project includes configuration for Mojo LSP integration:
- **LSP Binary**: `magic run mojo-lsp-server`
- **Scope**: `source.mojo`
- **File Types**: `.mojo`, `.🔥`

## Important Notes

- Grammar is based on tree-sitter-python but extended for Mojo-specific syntax
- External scanner handles complex tokenization (indentation, string literals)
- Grammar targets modern Mojo exclusively - no legacy syntax support
- Multi-language bindings support broad ecosystem integration
- Use `external/modular/` examples for testing modern language features