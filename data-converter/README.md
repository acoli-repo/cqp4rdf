# CDLI-CoNLL to RDF data conversion

### 0. Data Refining
Running this command will download the complete `mtaac_gold_corpus` data of CDLI and refine the complete data and form a new folder `./to_dict_refined`.

```
python converter_cdli_conll.py
``` 

If this gives any messages ... then those files with that ID have some error in the way they have been mentioned. In those lines the fields would have been separated with `' '`(spaces) instead of being separated by `'\t'`. You can solve those issues in those files. But if you think that it is not an issue, then the filename and the ID can be added in the `accepted` in `combined_script.py`.

Now the data in `./to_dict_refined/` is in pure CDLI-CoNLL and can be easily converted to CoNLL-U format.

### 1. CDLI-CoNLL to CoNLL conversion
To converte the data from CDLI-CoNLL to CoNLL-U format. Thi can be cone in the following way:-
```
pip install git+https://github.com/cdli-gh/CDLI-CoNLL-to-CoNLLU-Converter.git
```
Then Convert the CDLI-CoNLL files to CoNLL-U format. You can rea more about the tool [here](https://github.com/cdli-gh/CDLI-CoNLL-to-CoNLLU-Converter.git). This can be done in the following way:-
```
cdliconll2conllu -i ./mtaac_gold_corpus/morph/to_dict_refined/
```
`./mtaac_gold_corpus/morph/to_dict_refined/` can be replace by the path where you have your CoNLL-U files.

### 2. Adding ID to the CoNL-U files
The CoNLL-U files do not have any ID field, so it becomes difficult to sort the sentence and bring it in a sequential order. So an additional ID field is introduced by us.
```
python id_resolver.py
```
Here update the `path` variable that you have, with the path where the CoNLL-U files have been placed. 

### 3. CoNLL-U to RDF convrsion
Now since everything is almost ready, we just need to convert the complete CoNLL-U data to  RDF format so that a Graph could be constructed from the data. For this we would be using [CoNLL-RDF](https://github.com/acoli-repo/conll-rdf) tool. 
First clone the conll-rdf repo
```
git clone https://github.com/acoli-repo/conll-rdf 
```
You might me required to add permissions to the compile files lie `comile.sh` and `run.sh`.
```
chmod +777 .conll-rdf/run.sh
chmod +777 .conll-rdf/compile.sh

``` 
Then you can run the CoNLL-U to RDF converter.
```
python converter_conllu_rdf.py
```
In this code make update as follows:-
- `input_path` => The path wher the CoNLL-U files are present.
- `output_path` => The path where you want to store the output data.
- `iri` => The IRI which you want to use. 
- `converter_command_1` => The loaction where you have installed the CoNLL-RDF converter.



At the end you will get the convertd RDF files which can be used to build the graph. They would be in the folder specified by you.
