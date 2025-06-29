/**
 * @file Simplified Mojo grammar for tree-sitter
 * @author nijaru  
 * @license MIT
 */

module.exports = grammar({
  name: "mojo",
  
  precedences: () => [
    [
      'binary_op',
    ]
  ],

  extras: ($) => [
    $.comment,
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
  ],

  externals: ($) => [
    $._newline,
    $._indent,
    $._dedent,
    $.comment,
  ],

  word: ($) => $.identifier,

  rules: {
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
      $.from_import_statement,
      $.expression_statement,
      $.assignment_statement,
      $.variable_declaration,
      $.return_statement,
      $.pass_statement,
      $.alias_statement,
    ),

    import_statement: ($) => 
      seq("import", $.identifier),
      
    from_import_statement: ($) =>
      seq("from", $.identifier, "import", $.identifier),

    alias_statement: ($) =>
      seq("alias", $.identifier, "=", $.expression),

    expression_statement: ($) => $.expression,

    assignment_statement: ($) => 
      seq(
        optional("var"),
        $.identifier,
        optional(seq(":", $.identifier)),
        "=",
        $.expression,
      ),

    variable_declaration: ($) =>
      seq(
        "var",
        $.identifier,
        ":",
        $.identifier,
      ),

    return_statement: ($) => 
      seq("return", optional($.expression)),

    pass_statement: (_) => "pass",

    _compound_statement: ($) => choice(
      $.function_definition,
      $.struct_definition,
      $.trait_definition,
      $.if_statement,
    ),

    function_definition: ($) => 
      seq(
        choice("def", "fn"),
        field("name", $.identifier),
        $.parameter_list,
        optional(seq("->", $.identifier)),
        ":",
        $._suite,
      ),

    parameter_list: ($) => 
      seq(
        "(",
        optional(commaSep1($.parameter)),
        ")",
      ),

    parameter: ($) => 
      seq(
        optional($.argument_convention),
        $.identifier,
        optional(seq(":", $.identifier)),
      ),

    argument_convention: ($) => choice(
      "mut",
      "owned", 
      "ref",
      "out",
      "read",
    ),

    struct_definition: ($) => 
      seq(
        "struct",
        field("name", $.identifier),
        ":",
        $._suite,
      ),

    trait_definition: ($) => 
      seq(
        "trait",
        field("name", $.identifier),
        ":",
        $._suite,
      ),

    if_statement: ($) => 
      seq(
        "if",
        $.expression,
        ":",
        $._suite,
      ),

    _suite: ($) => choice(
      alias($._simple_statements, $.block),
      seq($._indent, $.block),
    ),

    block: ($) => 
      seq(repeat($._statement), $._dedent),

    expression: ($) => choice(
      $.binary_operator,
      $.call,
      $.attribute,
      $.identifier,
      $.integer,
      $.float,
      $.string,
      $.boolean,
      $.parenthesized_expression,
    ),

    binary_operator: ($) => prec.left('binary_op', choice(
      seq($.expression, "+", $.expression),
      seq($.expression, "-", $.expression),
      seq($.expression, "*", $.expression),
      seq($.expression, "**", $.expression),
      seq($.expression, "/", $.expression),
    )),

    parenthesized_expression: ($) =>
      seq("(", $.expression, ")"),

    call: ($) => 
      seq(
        field("function", $.identifier),
        $.argument_list,
      ),

    argument_list: ($) => 
      seq(
        "(",
        optional(commaSep1($.expression)),
        ")",
      ),

    attribute: ($) => 
      seq($.identifier, ".", $.identifier),

    integer: (_) => /\d+/,
    
    float: (_) => /\d+\.\d+/,
    
    string: (_) => choice(
      /"([^"\\]|\\.)*"/,
      /'([^'\\]|\\.)*'/,
    ),
    
    boolean: (_) => choice("True", "False"),

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*|__[a-zA-Z_][a-zA-Z0-9_]*__/,

    comment: (_) => /#.*/,
  },
});

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function commaSep1(rule) {
  return sep1(rule, ",");
}