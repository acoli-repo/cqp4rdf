CQP2SPARQL Conversion
=====================

1 Motivation
------------

In our experiments with SPARQL for corpora queriyng, we stumbled upon a problem: writing complex SPARQL queries is hard. Especially for people without enough expertise in the field. To make the process easier, it makes sense to use a widely-known corpus query language, use it and then translate queries to SPARQL queries which are then run against our data.

A good candidate for the query language is CQP — a language developed for the IMS Corpus Workbench.
It is used in corpus management systems like SketchEngine, NoSketchEngine, Corpus Tool and others.
Many linguists have experience with it, and even for those who have never worked with it, it is relatively easy to get started.

Here is an example, a query that looks for sentences that contain exactly two verbs: one with a lemma է (to be), and another one which is either a perfective converb or an imperfective converb:

```
(    v1:[conll:LEM='է' and rdfs:type='olia:Verb'] 
     v2:[a='eanc:ImperfectiveConverb' or rdfs:type='eanc:PerfectiveConverb']) 
     within 
         (<powla:sentence/> !containing v3:[rdfs:type='olia:Verb'])
) & v1.ID != v3.ID and v2.ID != v3.ID
```

Although it is a bit complicated, it is easier to write and to understand than its SPARQL counterpart with all the UNIONs and FILTERs.


2 Implementation
----------------

CQP grammar is parsed by the [Lark Python module](https://github.com/lark-parser/lark) which parses context-free grammars in [eBNF notation](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) into its abstract syntax tree. AST is then been transformed into SPARQL.

The details of the CQP dialect can be found in [the corresponding document](./docs/cqp_dialect.md).

Currently, there is a simple web interface for searching with CQP in EANC (or any other POWLA-annotated corpus) written in Python. Its description can be found in [the corresponding document](./docs/web_interface.md).