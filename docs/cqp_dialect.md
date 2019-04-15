CQP Dialect used for CQP2SPARQL
===============================

The CQP dialect for this project is mostly based on the SketchEngine CQP dialect, which is described here: https://www.sketchengine.eu/documentation/corpus-querying/

Key differences from various standards
--------------------------------------

1. Logical operators can be both words and symbols:
  * Conjunction: `and`, `&`
  * Disjunction: `or`, `|`
  * Negation is currently only `!`
2. Tokens can have symbolic labels, not only numerical
3. Global constraints can be separated by any AND variant, or `::`
4. Comments are allowed after the global constraints after the symbol `#`
5. Quantifying regular expressions can be applied to bracketed groups of tokens: `([] [])*`

Names and conventions
---------------------

1. Attributes are represented as <namespace>:<attr_name>, where namespaces are predefined in config files of a specific tool: conll, rdfs, powla, etc.
2. Segments names are represented as <namespace>:<type_name>, where namespaces are predefined in config files, and type_name corresponds to a specific type of which should be the enclosing segments.

Examples
--------

1. Sentences that contain exactly two verbs: one with a lemma է (to be), and another one which is either a perfective converb or an imperfective converb:
```
(    v1:[conll:LEM='է' and rdfs:type='olia:Verb'] 
     v2:[a='eanc:ImperfectiveConverb' or rdfs:type='eanc:PerfectiveConverb']) 
     within 
         (<powla:sentence/> !containing v3:[rdfs:type='olia:Verb'])
) & v1.ID != v3.ID and v2.ID != v3.ID
```

2. Sentences that contain more than one recursive clauses with _that_.
```
(
	[conll:WORD='that']
	[]+
){2,}
within <powla:sentence/>
```
