# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive **Zed editor extension for the Mojo programming language** that includes:
- **Tree-sitter grammar** for syntax parsing and highlighting
- **Rust-based LSP integration** with the Magic platform  
- **Language configuration** for Zed editor integration
- **Modern Mojo v25.4+ syntax support** exclusively

The project follows the **single repository approach** - all components (extension + grammar) are in one repo for simplified development. The grammar can be extracted to a separate repo later if needed.

## Development Commands

### Grammar Development
```bash
# Generate parser from grammar.js
tree-sitter generate

# Test grammar parsing
tree-sitter parse test.mojo
tree-sitter parse simple.mojo

# Run grammar tests (when test files exist)
tree-sitter test

# Build for web (debugging)
tree-sitter build --wasm
tree-sitter playground
```

### Extension Building
```bash
# Install Node.js dependencies and build native bindings
npm install

# Build Rust extension for Zed
cargo build --release

# Complete build process (both grammar and extension)
tree-sitter generate && npm install && cargo build --release
```

### Testing in Zed
```bash
# Install as development extension in Zed
# 1. Open Zed editor
# 2. Cmd+Shift+P → "Install Dev Extension"  
# 3. Select this directory

# Or copy to extensions directory
cp -r . ~/.config/zed/extensions/mojo/
```

## Architecture Understanding

### Component Relationship
1. **`grammar.js`** → Defines Mojo syntax rules for tree-sitter
2. **`src/scanner.c`** → External scanner for complex tokens (indentation)
3. **`queries/`** → Syntax highlighting and navigation rules  
4. **`languages/mojo/`** → Zed language configuration
5. **`src/lib.rs`** → Rust extension for LSP integration with Magic platform
6. **`extension.toml`** → Zed extension metadata and configuration

### Grammar Strategy
- **Clean Mojo-first approach** - Not based on Python grammar
- **Simplified implementation** - Focus on core features that work reliably
- **Modern syntax target** - Mojo v25.4+ exclusively, no legacy support
- **Conflict management** - Minimal conflicts for better parser performance

### Key Mojo Language Features Implemented
- **Function definitions**: `fn` and `def` with parameter lists
- **Argument conventions**: `mut`, `owned`, `ref`, `out`, `read` 
- **Struct and trait definitions**: Basic structure without complex generics
- **Variable declarations**: `var` with optional type annotations
- **Import statements**: Basic `import` syntax
- **Basic expressions**: Identifiers, literals, function calls

### LSP Integration
- **Magic platform integration** - Uses `magic run mojo-lsp-server`
- **Automatic binary management** - Downloads/manages Magic CLI
- **Standard LSP features** - Diagnostics, completion, navigation
- **Error handling** - Graceful fallback when Magic not available

## File Structure and Purposes

### Core Grammar Files
- **`grammar.js`** - Main tree-sitter grammar definition
- **`src/scanner.c`** - External scanner for indentation handling
- **`src/parser.c`** - Generated parser (auto-generated, don't edit)
- **`tree-sitter.json`** - Tree-sitter configuration metadata

### Zed Integration Files  
- **`extension.toml`** - Extension metadata and grammar reference
- **`languages/mojo/config.toml`** - Language-specific Zed configuration
- **`languages/mojo/brackets.scm`** - Bracket matching rules
- **`Cargo.toml` + `src/lib.rs`** - Rust extension for LSP integration

### Syntax Support Files
- **`queries/highlights.scm`** - Syntax highlighting rules
- **`queries/indents.scm`** - Indentation behavior
- **`queries/tags.scm`** - Symbol navigation and outline

### Build and Package Files
- **`package.json`** - Node.js package config for tree-sitter
- **`binding.gyp`** - Native addon build configuration  
- **`bindings/node/`** - Node.js bindings for grammar

## Grammar Development Workflow

### Making Grammar Changes
1. **Edit `grammar.js`** with new syntax rules
2. **Run `tree-sitter generate`** to rebuild parser
3. **Test with `tree-sitter parse file.mojo`**
4. **Update syntax highlighting** in `queries/highlights.scm` if needed
5. **Test in Zed** by installing dev extension

### Common Grammar Issues
- **Conflicts** - Use `conflicts` section to resolve ambiguities
- **Precedence** - Set appropriate `PREC` values for operators
- **External tokens** - Use `externals` for complex tokenization  
- **Simplification** - Prefer working simple rules over complex broken ones

### Testing Strategy
- **Core syntax first** - Ensure basic `fn`, `struct`, `var` work
- **Real examples** - Test against actual Mojo code from `external/modular/`
- **Edge cases** - Complex type annotations, generics can be refined later
- **Error tolerance** - Parser should handle partial/invalid syntax gracefully

## Reference Materials

### Official Mojo Resources
- **`external/modular/`** - Official Mojo platform (git submodule)
  - Modern syntax examples in `external/modular/examples/mojo/`
  - Standard library patterns in `external/modular/mojo/stdlib/`
  - Documentation in `external/modular/mojo/docs/`

### Key Modern Mojo Patterns (v25.4+)
```mojo
# Modern argument conventions
fn process(mut self, out result: Int, owned data: String, ref config: Config):
    pass

# Struct with ownership
struct Point:
    var x: Int
    var y: Int
    
    fn __init__(out self, x: Int, y: Int):
        self.x = x
        self.y = y

# Transfer ownership  
var tmp = value^
```

## Development Guidelines

### Grammar Philosophy
- **Start simple** - Get basic features working before adding complexity
- **Mojo-first** - Design for Mojo syntax, not Python compatibility
- **Modern focus** - Target v25.4+ syntax exclusively
- **Pragmatic approach** - Working simple grammar > broken complex grammar

### Code Quality
- **No breaking changes** - Ensure `tree-sitter generate` always succeeds
- **Test real code** - Use examples from `external/modular/` for testing
- **Document limitations** - Be clear about what syntax is/isn't supported
- **Incremental improvement** - Build working foundation, then enhance

### Zed Integration
- **Follow Zed conventions** - Use standard extension patterns
- **LSP best practices** - Proper error handling and status reporting
- **Performance considerations** - Grammar should parse efficiently
- **User experience** - Extension should "just work" for basic Mojo files

## Troubleshooting Common Issues

### Grammar Generation Fails
- Check for undefined rules or circular references
- Verify `conflicts` section resolves ambiguities  
- Ensure `externals` match scanner implementation
- Simplify complex rules that cause conflicts

### LSP Not Working
- Verify Magic CLI is installed (`magic --version`)
- Check LSP server path in extension configuration
- Ensure Rust extension builds without errors
- Test LSP command manually: `magic run mojo-lsp-server`

### Syntax Highlighting Issues  
- Update `queries/highlights.scm` after grammar changes
- Verify query syntax matches grammar rule names
- Test highlighting with different Mojo code patterns
- Check Zed console for query parsing errors

This documentation helps maintain the project's technical direction and development practices.