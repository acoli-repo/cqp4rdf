CQP Dialect used for cqp4rdf
============================

The CQP dialect for this project is mostly based on the SketchEngine CQP dialect, which is described here: https://www.sketchengine.eu/documentation/corpus-querying/

Key differences from various standards
--------------------------------------

1. Logical operators can be both words and symbols:
  * Conjunction: `and`, `&`
  * Disjunction: `or`, `|`
  * Negation is currently only `!`
2. Tokens can have symbolic labels, not only numerical
3. Names of properties inside conditions can contain colons and digits
4. Global constraints can be separated by any AND variant, or `::`
5. Comments are allowed after the global constraints after the symbol `#`
6. Quantifying regular expressions can be applied to bracketed groups of tokens: `([] [])*`
