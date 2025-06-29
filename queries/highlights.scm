; Keywords
[
  "def"
  "fn"
  "struct"
  "trait"
  "alias"
  "var"
  "import"
  "from"
  "return"
  "if"
] @keyword

(pass_statement) @keyword

; Modern Mojo argument conventions
[
  "mut"
  "owned"
  "ref"
  "out"
  "read"
] @keyword.modifier

; Function/method definitions
(function_definition
  name: (identifier) @function)

(call
  function: (identifier) @function.call)

; Struct and trait definitions
(struct_definition
  name: (identifier) @type)

(trait_definition
  name: (identifier) @type)

; Parameters
(parameter (identifier) @variable.parameter)

; Variables
(alias_statement (identifier) @constant)

; Attributes
(attribute
  (identifier) @variable
  (identifier) @property)

; Operators
[
  "+"
  "-"
  "*"
  "**"
  "/"
  "="
] @operator

; Punctuation
[
  "("
  ")"
  ":"
  ";"
  ","
  "."
] @punctuation.delimiter

; Literals
(integer) @number
(float) @number.float
(string) @string
(boolean) @boolean

; Comments
(comment) @comment

; Identifiers
(identifier) @variable

; Special highlighting for self
((identifier) @variable.builtin
  (#eq? @variable.builtin "self"))

; Keywords in specific contexts
(argument_convention) @keyword.modifier