#include "tree_sitter/parser.h"
#include <wctype.h>

enum TokenType {
  NEWLINE,
  INDENT,
  DEDENT,
  COMMENT,
};

typedef struct {
  uint32_t *indents;
  uint32_t indent_length;
  uint32_t indent_capacity;
} Scanner;

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }
static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

bool tree_sitter_mojo_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;

  // Handle comments
  if (valid_symbols[COMMENT] && lexer->lookahead == '#') {
    lexer->result_symbol = COMMENT;
    advance(lexer);
    while (lexer->lookahead != '\n' && lexer->lookahead != 0) {
      advance(lexer);
    }
    return true;
  }

  // Skip whitespace except newlines
  while (iswspace(lexer->lookahead) && lexer->lookahead != '\n' && lexer->lookahead != '\r') {
    skip(lexer);
  }

  // Handle newlines and indentation
  if (lexer->lookahead == '\n' || lexer->lookahead == '\r') {
    if (valid_symbols[NEWLINE]) {
      lexer->result_symbol = NEWLINE;
      if (lexer->lookahead == '\r') {
        advance(lexer);
      }
      if (lexer->lookahead == '\n') {
        advance(lexer);
      }
      return true;
    }
  }

  // Handle indentation after newlines
  if (lexer->lookahead == '\n' || lexer->lookahead == '\r' || lexer->lookahead == 0) {
    return false;
  }

  // Count indentation level
  uint32_t indent_level = 0;
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
    if (lexer->lookahead == ' ') {
      indent_level++;
    } else {
      indent_level += 8; // tab = 8 spaces
    }
    skip(lexer);
  }

  // Skip empty lines and comments
  if (lexer->lookahead == '\n' || lexer->lookahead == '\r' || lexer->lookahead == '#') {
    return false;
  }

  uint32_t current_indent = scanner->indent_length > 0 ? scanner->indents[scanner->indent_length - 1] : 0;

  if (indent_level > current_indent) {
    if (valid_symbols[INDENT]) {
      // Increase indent stack
      if (scanner->indent_length >= scanner->indent_capacity) {
        scanner->indent_capacity = scanner->indent_capacity ? scanner->indent_capacity * 2 : 4;
        scanner->indents = realloc(scanner->indents, scanner->indent_capacity * sizeof(uint32_t));
      }
      scanner->indents[scanner->indent_length] = indent_level;
      scanner->indent_length++;
      lexer->result_symbol = INDENT;
      return true;
    }
  } else if (indent_level < current_indent) {
    if (valid_symbols[DEDENT]) {
      // Decrease indent stack
      while (scanner->indent_length > 0 && scanner->indents[scanner->indent_length - 1] > indent_level) {
        scanner->indent_length--;
      }
      lexer->result_symbol = DEDENT;
      return true;
    }
  }

  return false;
}

unsigned tree_sitter_mojo_external_scanner_serialize(void *payload, char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  size_t size = 0;

  buffer[size++] = (char)scanner->indent_length;
  for (uint32_t i = 0; i < scanner->indent_length; i++) {
    buffer[size++] = (char)scanner->indents[i];
  }
  return size;
}

void tree_sitter_mojo_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
  Scanner *scanner = (Scanner *)payload;
  scanner->indent_length = 0;

  if (length > 0) {
    scanner->indent_length = (uint32_t)buffer[0];
    if (scanner->indent_length > scanner->indent_capacity) {
      scanner->indent_capacity = scanner->indent_length;
      scanner->indents = realloc(scanner->indents, scanner->indent_capacity * sizeof(uint32_t));
    }
    for (uint32_t i = 0; i < scanner->indent_length; i++) {
      scanner->indents[i] = (uint32_t)buffer[1 + i];
    }
  }
}

void *tree_sitter_mojo_external_scanner_create() {
  Scanner *scanner = calloc(1, sizeof(Scanner));
  return scanner;
}

void tree_sitter_mojo_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  if (scanner->indents) {
    free(scanner->indents);
  }
  free(scanner);
}