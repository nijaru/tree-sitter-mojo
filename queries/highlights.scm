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
  "as"
  "return"
  "pass"
  "break"
  "continue"
  "raise"
  "if"
  "elif"
  "else"
  "for"
  "in"
  "while"
  "and"
  "or"
  "not"
  "is"
  "raises"
] @keyword

; Modern Mojo argument conventions
[
  "mut"
  "owned"
  "ref"
  "out"
  "read"
  "inout"
] @keyword.modifier

; Storage/declaration keywords
[
  "var"
  "alias"
] @keyword.storage

; Control flow
[
  "if"
  "elif"
  "else"
  "for"
  "while"
  "break"
  "continue"
  "return"
] @keyword.control

; Import keywords
[
  "import"
  "from"
  "as"
] @keyword.import

; Function/method definitions
(function_definition
  name: (identifier) @function)

(call
  function: (identifier) @function.call)

(call
  function: (attribute
    attribute: (identifier) @function.method))

; Struct and trait definitions
(struct_definition
  name: (identifier) @type)

(trait_definition
  name: (identifier) @type)

; Type annotations
(type (identifier) @type)
(generic_type (identifier) @type)

; Parameters
(parameter (identifier) @variable.parameter)
(typed_parameter name: (identifier) @variable.parameter)
(typed_default_parameter name: (identifier) @variable.parameter)

; Variables
(assignment_statement left: (identifier) @variable)
(alias_statement (identifier) @constant)

; Attributes
(attribute
  object: (identifier) @variable
  attribute: (identifier) @property)

; Decorators
(decorator "@" @operator)
(decorator (identifier) @function.decorator)

; Operators
[
  "+"
  "-"
  "*"
  "/"
  "//"
  "%"
  "**"
  "="
  "+="
  "-="
  "*="
  "/="
  "//="
  "%="
  "**="
  "&="
  "|="
  "^="
  ">>="
  "<<="
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "<<"
  ">>"
  "&"
  "|"
  "^"
  "~"
  ":="
] @operator

; Transfer operator (Mojo-specific)
"^" @operator.transfer

; Punctuation
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  ":"
  ";"
  ","
  "."
  "/"
  "//"
] @punctuation.delimiter

; Literals
(integer) @number
(float) @number.float
(string) @string
(boolean) @boolean
(none) @constant.builtin

; Comments
(comment) @comment

; Identifiers
(identifier) @variable

; Special highlighting for self
((identifier) @variable.builtin
  (#eq? @variable.builtin "self"))

; Type parameters
(type_parameter (identifier) @type.parameter)

; Keywords in specific contexts
(argument_convention) @keyword.modifier