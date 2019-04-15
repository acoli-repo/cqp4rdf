CQP2SPARQL Web
==============

As an example of a service that queries a CoNLL-RDF corpus using CQP, we built a simple web interface using Python module Flask.

Taking a CQP query as an input, it converts it to a SPARQL query and then run it against a graph database, showing the results in a table.

The current config (./config.yaml) is for queriyng EANC corpus converted to CoNLL-RDF stored locally in a triple store. It is preconfigured for the default installation of Blazegraph.