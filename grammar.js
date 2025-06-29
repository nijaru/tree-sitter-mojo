/**
 * @file Mojo grammar for tree-sitter
 * @author nijaru
 * @license MIT
 * @see {@link https://docs.modular.com/mojo/manual/|Mojo Language Manual}
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  conditional: -1,
  or: 10,
  and: 11,
  not: 12,
  compare: 13,
  bitwise_or: 14,
  bitwise_and: 15,
  xor: 16,
  shift: 17,
  plus: 18,
  times: 19,
  unary: 20,
  power: 21,
  call: 22,
  transfer: 23,
};

module.exports = grammar({
  name: "mojo",

  extras: ($) => [
    $.comment,
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
  ],

  conflicts: ($) => [
    [$.parameter_list, $.type_parameter_list],
    [$.argument_list, $.type_parameter_list],
  ],

  supertypes: ($) => [
    $._statement,
    $._simple_statement,
    $._compound_statement,
    $.expression,
    $.primary_expression,
    $.pattern,
  ],

  externals: ($) => [
    $._newline,
    $._indent,
    $._dedent,
    $.comment,
  ],

  word: ($) => $.identifier,

  rules: {
    // Module structure
    module: ($) => repeat($._statement),

    _statement: ($) => choice(
      $._simple_statements,
      $._compound_statement,
    ),

    _simple_statements: ($) => 
      seq(
        sep1($._simple_statement, ";"),
        optional(";"),
        $._newline,
      ),

    _simple_statement: ($) => choice(
      $.import_statement,
      $.import_from_statement,
      $.expression_statement,
      $.assignment_statement,
      $.alias_statement,
      $.return_statement,
      $.pass_statement,
      $.break_statement,
      $.continue_statement,
      $.raise_statement,
    ),

    // Import statements (Python-like)
    import_statement: ($) => 
      seq("import", commaSep1($.dotted_name)),

    import_from_statement: ($) => 
      seq(
        "from", 
        $.dotted_name, 
        "import", 
        choice("*", commaSep1(choice($.identifier, $.aliased_import))),
      ),

    aliased_import: ($) => 
      seq($.identifier, "as", $.identifier),

    // Statements
    expression_statement: ($) => $.expression,

    assignment_statement: ($) => 
      seq(
        optional("var"),
        $.pattern,
        optional(seq(":", $.type)),
        "=",
        $.expression,
      ),

    alias_statement: ($) => 
      seq(
        "alias",
        $.identifier,
        optional($.type_parameter_list),
        "=",
        choice($.type, $.expression),
      ),

    return_statement: ($) => 
      seq("return", optional($.expression)),

    pass_statement: (_) => "pass",
    break_statement: (_) => "break", 
    continue_statement: (_) => "continue",

    raise_statement: ($) => 
      seq("raise", optional($.expression)),

    // Compound statements
    _compound_statement: ($) => choice(
      $.function_definition,
      $.struct_definition,
      $.trait_definition,
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.decorated_definition,
    ),

    // Function definition with modern Mojo syntax
    function_definition: ($) => 
      seq(
        choice("def", "fn"),
        $.identifier,
        optional($.type_parameter_list),
        $.parameter_list,
        optional(seq(
          "->", 
          optional($.argument_convention),
          $.type,
        )),
        optional("raises"),
        ":",
        $._suite,
      ),

    // Parameters with argument conventions
    parameter_list: ($) => 
      seq(
        "(",
        optional(commaSep1($.parameter)),
        optional(","),
        ")",
      ),

    parameter: ($) => choice(
      $.simple_parameter,
      $.typed_parameter,
      $.default_parameter,
      $.typed_default_parameter,
      $.variadic_parameter,
    ),

    simple_parameter: ($) => 
      seq(
        optional($.argument_convention),
        $.identifier,
      ),

    typed_parameter: ($) => 
      seq(
        optional($.argument_convention),
        $.identifier,
        ":",
        $.type,
      ),

    default_parameter: ($) => 
      seq(
        optional($.argument_convention),
        $.identifier,
        "=",
        $.expression,
      ),

    typed_default_parameter: ($) => 
      seq(
        optional($.argument_convention),
        $.identifier,
        ":",
        $.type,
        "=",
        $.expression,
      ),

    variadic_parameter: ($) => 
      seq("*", $.identifier),

    // Modern Mojo argument conventions
    argument_convention: ($) => choice(
      "mut",
      "owned", 
      "ref",
      "out",
      "read",
      "inout", // Legacy support
    ),

    // Type parameter lists [T: Constraint]
    type_parameter_list: ($) => 
      seq(
        "[",
        commaSep1($.type_parameter),
        optional(","),
        "]",
      ),

    type_parameter: ($) => choice(
      $.identifier,
      seq($.identifier, ":", $.type),
      seq("/", "/"), // positional-only separator
    ),

    // Struct definition
    struct_definition: ($) => 
      seq(
        repeat($.decorator),
        "struct",
        $.identifier,
        optional($.type_parameter_list),
        optional(seq("(", commaSep1($.type), ")")), // trait inheritance
        ":",
        $._suite,
      ),

    // Trait definition  
    trait_definition: ($) => 
      seq(
        "trait",
        $.identifier,
        optional($.type_parameter_list),
        optional(seq("(", commaSep1($.type), ")")), // trait inheritance
        ":",
        $._suite,
      ),

    // Control flow
    if_statement: ($) => 
      seq(
        "if",
        $.expression,
        ":",
        $._suite,
        repeat(seq("elif", $.expression, ":", $._suite)),
        optional(seq("else", ":", $._suite)),
      ),

    for_statement: ($) => 
      seq(
        "for",
        $.pattern,
        "in",
        $.expression,
        ":",
        $._suite,
      ),

    while_statement: ($) => 
      seq(
        "while",
        $.expression,
        ":",
        $._suite,
      ),

    // Decorators
    decorated_definition: ($) => 
      seq(
        repeat1($.decorator),
        choice(
          $.function_definition,
          $.struct_definition,
          $.trait_definition,
        ),
      ),

    decorator: ($) => 
      seq(
        "@",
        $.dotted_name,
        optional($.argument_list),
      ),

    // Suite and blocks
    _suite: ($) => choice(
      alias($._simple_statements, $.block),
      seq($._indent, $.block),
    ),

    block: ($) => 
      seq(repeat($._statement), $._dedent),

    // Expressions
    expression: ($) => choice(
      $.conditional_expression,
      $.or_expression,
      $.and_expression,
      $.not_expression,
      $.comparison,
      $.bitwise_or,
      $.bitwise_xor,
      $.bitwise_and,
      $.shift_expression,
      $.additive_expression,
      $.multiplicative_expression,
      $.unary_expression,
      $.power_expression,
      $.transfer_expression,
      $.primary_expression,
    ),

    conditional_expression: ($) => 
      prec(PREC.conditional, 
        seq($.expression, "if", $.expression, "else", $.expression)),

    or_expression: ($) => 
      prec.left(PREC.or, seq($.expression, "or", $.expression)),

    and_expression: ($) => 
      prec.left(PREC.and, seq($.expression, "and", $.expression)),

    not_expression: ($) => 
      prec(PREC.not, seq("not", $.expression)),

    comparison: ($) => 
      prec.left(PREC.compare, 
        seq(
          $.expression, 
          repeat1(seq(
            choice("==", "!=", "<", "<=", ">", ">=", "is", "in"), 
            $.expression,
          )),
        )),

    bitwise_or: ($) => 
      prec.left(PREC.bitwise_or, seq($.expression, "|", $.expression)),

    bitwise_xor: ($) => 
      prec.left(PREC.xor, seq($.expression, "^", $.expression)),

    bitwise_and: ($) => 
      prec.left(PREC.bitwise_and, seq($.expression, "&", $.expression)),

    shift_expression: ($) => 
      prec.left(PREC.shift, 
        seq($.expression, choice("<<", ">>"), $.expression)),

    additive_expression: ($) => 
      prec.left(PREC.plus, 
        seq($.expression, choice("+", "-"), $.expression)),

    multiplicative_expression: ($) => 
      prec.left(PREC.times, 
        seq($.expression, choice("*", "/", "//", "%"), $.expression)),

    unary_expression: ($) => 
      prec(PREC.unary, 
        seq(choice("+", "-", "~"), $.expression)),

    power_expression: ($) => 
      prec.right(PREC.power, seq($.expression, "**", $.expression)),

    // Transfer expression (ownership transfer with ^)
    transfer_expression: ($) => 
      prec(PREC.transfer, seq($.expression, "^")),

    // Primary expressions
    primary_expression: ($) => choice(
      $.identifier,
      $.integer,
      $.float,
      $.string,
      $.boolean,
      $.none,
      $.call,
      $.attribute,
      $.subscript,
      $.list,
      $.tuple,
      $.dictionary,
      $.parenthesized_expression,
    ),

    // Function/method calls with bracket parameters
    call: ($) => 
      prec(PREC.call, 
        seq(
          $.primary_expression,
          optional($.type_parameter_list), // [param=value] syntax
          $.argument_list,
        )),

    argument_list: ($) => 
      seq(
        "(",
        optional(commaSep1(choice(
          $.expression,
          $.keyword_argument,
        ))),
        optional(","),
        ")",
      ),

    keyword_argument: ($) => 
      seq($.identifier, "=", $.expression),

    attribute: ($) => 
      prec(PREC.call, seq($.primary_expression, ".", $.identifier)),

    subscript: ($) => 
      prec(PREC.call, 
        seq($.primary_expression, "[", commaSep1($.expression), "]")),

    // Collections
    list: ($) => 
      seq("[", optional(commaSep1($.expression)), "]"),

    tuple: ($) => 
      seq(
        "(",
        optional(choice(
          seq($.expression, ","),
          seq($.expression, repeat1(seq(",", $.expression)), optional(",")),
        )),
        ")",
      ),

    dictionary: ($) => 
      seq(
        "{", 
        optional(commaSep1(seq($.expression, ":", $.expression))),
        "}",
      ),

    parenthesized_expression: ($) => 
      seq("(", $.expression, ")"),

    // Types
    type: ($) => choice(
      $.identifier,
      $.generic_type,
      $.attribute,
    ),

    generic_type: ($) => 
      seq(
        $.identifier,
        "[",
        commaSep1(choice($.type, $.expression)),
        "]",
      ),

    // Patterns
    pattern: ($) => choice(
      $.identifier,
      $.tuple_pattern,
      $.list_pattern,
    ),

    tuple_pattern: ($) => 
      seq(
        "(",
        optional(commaSep1($.pattern)),
        optional(","),
        ")",
      ),

    list_pattern: ($) => 
      seq(
        "[",
        optional(commaSep1($.pattern)),
        "]",
      ),

    // Literals
    integer: (_) => /\d+/,
    
    float: (_) => /\d+\.\d+/,
    
    string: (_) => choice(
      /"([^"\\]|\\.)*"/,
      /'([^'\\]|\\.)*'/,
    ),
    
    boolean: (_) => choice("True", "False"),
    
    none: (_) => "None",

    // Identifiers and names
    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    dotted_name: ($) => sep1($.identifier, "."),

    // Comments  
    comment: (_) => /#.*/,

    // Newlines (handled by external scanner)
    _newline: (_) => "\n",
  },
});

// Helper functions
function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function commaSep1(rule) {
  return sep1(rule, ",");
}

function commaSep(rule) {
  return optional(commaSep1(rule));
}