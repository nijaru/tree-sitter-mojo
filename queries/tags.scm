(function_definition
  name: (identifier) @name) @definition.function

(struct_definition
  name: (identifier) @name) @definition.class

(trait_definition
  name: (identifier) @name) @definition.interface

(alias_statement
  (identifier) @name) @definition.constant

(call
  function: (identifier) @name) @reference.call

(call
  function: (attribute
    attribute: (identifier) @name)) @reference.call