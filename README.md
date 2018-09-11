Currently, this repository contains a parser for the popular corpus query language, CQP.

CQP grammar is parsed by the [Lark Python module](https://github.com/lark-parser/lark) which parses context-free grammars in [eBNF notation](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) into its abstract syntax tree.

The details of the implemented CQP dialect can be found in [the corresponding document](./docs/cqp_dialect.md).

Here's a simple example of parsing and saving a simple CQP query as a PNG:

```python
import lark
from lark.tree import pydot__tree_to_png

with open('cqp.ebnf') as inp_file:
    parser = lark.Lark(inp_file, debug=True)
pydot__tree_to_png(parser.parse("a:[lemma='է' & !pos='V']"), 'cqp_example.png')
```

It generates this nice diagram:

![CQP diagram](https://github.com/acoli-repo/cqp4rdf/blob/master/docs/img/cqp_example.png)