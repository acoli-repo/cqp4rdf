# Instructions to use the GUI for CQP4RDF
**![](https://lh5.googleusercontent.com/x_LZiMP8vqXjrh6I_PpnkXCbIwK9rfHjmIZEcYCExXxkKOvyQdPBAlaBVsZAsiefTIMeP9tfCIlA2y8MYADaNHP_0UC-7mguwA__dc6gVR4HekqzhJ8opvOHPwhLDuveoJFnRqmU)**
In the GUI, we have 2 buttons, ADD WORD and ADD DEPENDENCY, and they are used to do the work as named. ADD WORD adds a new word and ADD DEPENDENCY adds a new dependency between 2 words. Our GUI is divided into 2 sections vertically, one on Left Side is for Words and the one on Right Side is for Dependencies.
**![](https://lh4.googleusercontent.com/aAmSs99KqkPaX0i9WEPn84FcSmDF6X2bXBVP66SRS0wOjtgEQSLG33WPvwV8voU2eABbSdP62-r51OWBFjwyTiDKRHFXGNNH5Nal9xUYLPGK37qek4xr7ze1WMTVaMwdCYyqT50H)**
Here `w1` and `w2` represent the variable names given to the words. These would be used to represent that word and all the conditions which we specify for the word. By default, considering only the words, they are not constrained to be in the order specified. For maintaining the words to be in the linear order, a dependency is needed. (This is not in accordance with the CQP norms, according to CQP this query means that `w1` must be preceded by `w2`, due to some reasons we do not consider this norm and assume that `w1` and `w2` will not be any specific order by default. If we want them to be in order then a `nif:nextWord` dependency has to be added between the words.)

For the ease of the user, we add this `nif:nextWord` dependency query by default as new words are added. As more words are added, the `nif:nextWord` dependency is added by default between the words.

If you want to get the get rid of the dependency between the words, the corresponding dependency can be easily deleted.

### WORD SECTION
**![](https://lh6.googleusercontent.com/JCVyLpPG0uCrIMo76Ai_S4w5dqUtCXyq1JCmnW00vTd4kV6QXr4Eb3gEnj-87SjyTzRhOzKyIEQ-xewwz2qUOezB1s-zCdK0_sJjP8GahAPb8FlfThiz5WbfQgDNr_VSwYNKcBKg)**
On clicking on the word, we can see a box representing a word, this box can be used to specify the various conditions for that word. This can be used to specify various conditions.

1.  Delete Word deletes that specific word completely and the word is also the word is deleted from the query. The word is removed from all the dropdowns which we have for the dependencies section. All the dependencies which had that particular word selected as the Left word or the Right word in the dropdown are shifted to None.
    
2.  Input Box with `w1` represents the word variable name, this is the default variable name which is given to the word. This would be used to represent the word and the dependencies for the word. This variable name should be unique and should not match with the variable name of any other word. If the variable name is updated, it would also be updated in the query generated.
    

    -   If by mistake, on updating the variable name becomes the same for 2 words, the query won’t be updated and you would be alerted with an error message for the same.
    
    -   Also, some of the variable names are reserved for the dummy words which could be included when we would be needing the range queries.
    

3.  The slider which you see below them is the slider which refers to the range of a word. Its default value is set to {1,1}. The FROM and TO slider can be moved to and fro to specify the range for a word. The query would be updated as soon as the slide is moved and the value would be updated everywhere i.e. in the query, at the top bar for the word and in all the dropdowns for the dependencies.
    

![](https://lh4.googleusercontent.com/LhFZBTfsfqVvkHdyKlT5CGzjjBnyquq_vl71XhdtQHYiWuegHtKwAmbAN-36AzYR55S17IXBW_X0WYm_fEtqwpbBaBVKkVJf4Hm_JvsXfktlmKDvoIY9r8S0ZlI86EnIS90se-s6)

  

4.  Add Property button is used to add annotation properties for a word. More conditions and properties of a word can be added using the ADD PROPERTY button. As these properties are added, they all are in AND with each other. The properties which we want to be attached to a word can be provided by selecting the annotation type from the dropdown for which we want to add the annotation and then provide the value for the same. The method of entering the value can vary from the annotation type which is being specified in the configurations, it can be either an integer input box or a dropdown with only some specified values. Also, if we want the value to be not equal to a value we can click on the equals to sign and it would become not-equals-to and the same would be updated in the query also. The query would be updated only when you select an annotation from the dropdown and specify the value in the input box and leave the input box after specifying the property value.
    

5.  The property can also be deleted by clicking on the Delete button of the property.
    
6.  If we want to add more properties to a property in OR, then this can be done by pressing the OR button and more properties can be added in OR with the current property.

### DEPENDENCY SECTION

  

![](https://lh4.googleusercontent.com/TyD3p594ZMpji0MNqIvhS6EAxHLTnN3GhCX9xb5fo_xn689EbadlRUjodB1kvbF51eatnr1JtNQV3s1EQi0q2iNhLKEAvdbJxoEzPapqBPI8Dht2vWf5YJGDKQkHQSLENPt-iS1S)

Dependencies can be added by pressing the ADD DEPENDENCY button on the right. This would add dependencies, and they can be expanded by clicking on them. A dependency could be deleted by pressing the DELETE DEPENDENCY button. The d1,d2,... which you see is the default dependency name given by us in the background. This won’t be used in the query and has no significant meaning.

  

The LEFT VARIABLE is a dropdown refers to the variable which we want to refer in the left side of the dependency. This dropdown would contain all the variable names and the query for that particular word. They are updated dynamically as more words are added. Also, similarly we have RIGHT VARIABLE which refers to the variable on the right. This would be updated as the words are added or the the query for a particular word is updated.

  

Then the next is a DEPENDENCY dropdown, which is used to specify which dependency we want to add. It has the following properties:-

1.  LINEAR
    1.  BEFORE
        -   Refers that LEFT-VARIABLE comes before the RIGHT-VARIABLE.
    2.  AFTER
        -   Refers that LEFT-VARIABLE comes after the RIGHT-VARIABLE.
    3.  BEFORE / AFTER
        -   Refers that LEFT-VARIABLE comes either before or after the RIGHT-VARIABLE.
2.  SYNTACTIC
	1.  HEAD
        -   Refers that the HEAD of the LEFT-VARIABLE is the RIGHT-VARIABLE.
	2.  CHILD
		-   Refers that the CHILD of the LEFT-VARIABLE is the RIGHT-VARIABLE. That means that the HEAD of the RIGHT-VARIABLE is the LEFT-VARIABLE.
	3.  HEAD / CHILD
		-   Refers that the 2 words are linked syntactically, and might have a syntactic relation, but are not sure who is the head and who is the child.
   
Then we have the PROXIMITY Dropdown, that is used to specify the distance between the LEFT-VARIABLE and the RIGHT-VARIABLE. By proximity, we mean to specify the distance. We have 3 options in proximity:-

  

1.  ADJOINING DEPENDENCY
	-   Adjoining refers that the 2 words i.e. LEFT-VARIABLE and the RIGHT-VARIABLE are adjoining and have no words in between them both Linearly and Syntactically.
	-   In LINEAR RELATION, we mean that the 2 words do not have any words in between them and are adjoining in the sentence as we read them.
	-   In SYNTACTIC RELATION, we mean that the 2 words are in a direct dependency.
	
2.  RANGE DEPENDENCY
	-   RANGE refers that the 2 words i.e. LEFT-VARIABLE and the RIGHT-VARIABLE are linked and might have any number in the range which we specify in between them, both Linearly and Syntactically.
	-   By Linearly, we mean that LEFT-VARIABLE and RIGHT-VARIABLE might be separated by a number of words which we specify in the range words in the linear order in the order in which they appear in a sentence.
	-   By Syntactically, we mean that LEFT-VARIABLE and RIGHT-VARIABLE might be linked by a range of words, by HEAD dependency in the syntactic tree.
	-   The RANGE can be selected from the slider which we have, which can be used to specify the starting value and the ending value in the range.
    

3.  ANY DEPENDENCY
	-   ANY refers that the 2 words i.e. LEFT-VARIABLE and the RIGHT-VARIABLE are linked and might have any number of words in between them, both Linearly or Syntactically.
    
	-   In this, by Linearly we mean that LEFT-VARIABLE and RIGHT-VARIABLE might be separated by any number of words in the linear order in the order in which they appear in a sentence.
    
	-   By Syntactically it might refer that LEFT-VARIABLE might be linked to RIGHT-VARIABLE by any number of the HEAD relations.

## FAQ’s

#### What do we mean by a word in a query?
    

By a word, we mean to refer to a word in the sentence. The properties specified here for the word might be used to match the words in the sentence. For eg:- w1:[ ], here w1 refers to all the words in a sentence since we have not specified any constraints/properties for it. Now if we do w1:[conll:UPOSTAG = ”NOUN”], then it would refer to all the words that are NOUN in a sentence since we have specified a constraint here.

####  What do we mean by dependency in a query?
    

In a query, the dependencies are specified separately after `::`. Dependency refers to how the 2 words in a query are linked. We currently have 2 types of dependencies, the `nextWord` Dependency and the `HEAD` dependency. The `nextWord` dependency means that the second word is the next word to the first word. The `HEAD` dependency means that the second word is the parent of the first word in the semantic tree.

#### Are the words in a linear dependency by default?
    

In a CQP query, like `w1:[] w2:[]`, by default it means that the words are in a linear dependency. But we have removed this constraint and now this can refer to any 2 words in a sentence. If we want to maintain the linearity between the 2 words then, we have to add a `nextWord` dependency between the 2 words. In order, for the convenience of the users, as more words are added, a `nextWord` dependency is added between them by default.

####  What do we need a variable name for words?
    

The variable name of a word is needed, and it is very important in our case. A variable name is very necessary to have for the words. It helps is specifying the dependencies for that particular word. Also, since we are not following the rule of CQP that the words by default are in Linear Order, then we have to specify the `nextWord` dependency, in order to maintain the linearity b/w the words and for specifying the dependencies we need to give every word a variable name.

####   Does a word added really represents a single word or can they be used to specify more than 1 word?
    

A word added, does not necessarily represent a single word, it can be used to represent a set of words in a range. For eg: consider the query=>`w1:[conll:UPOSTAG=”NOUN”]` means a single word. But we can also specify the range for a word like `w1:[conll:UPOSTAG=”NOUN”]{2,5}` means 2 to 5 words that are NOUN and continuous.

####   How to add various conditions and properties related to a word?
    

We can add various properties to a word using the GUI, by adding `ADD PROPERTY` button. This will add all the properties and they all would be in AND with each other. Also, more properties can be added in OR by pressing the OR button for a specific property.

-   How are the properties of a word linked? Are they all in OR or in AND?
    

The properties of a word can be linked in both OR as well as in AND. When we add new properties, they are added in AND, by default and when we want to add more properties in OR, it can be added using the OR button which we have.

#### Can we delete a word or a dependency?
    

Yes, we can delete both Word as well as a Dependency. We have a delete button for both.  Deleting a Word would delete it from the query as well. Also, all the dependencies that have that particular word in it would not be a part of the query.

#### Can we delete conditions?
    

Yes, we have a DELETE button, which will delete the properties/conditions which we specify for a word. If we delete, it would delete all the conditions that are present in OR with this condition. Also, another way, so that a property is not considered is that, to leave it blank. All the properties where the value is blank are not considered.

#### Are 2 words linked by any dependency by default?
    

By default, as we add more words, the words get linked by a `nextWord` dependency by default in order that the new word follows the previous word. This is just to make sure that the words are linear. If we want to remove this constraint, we can delete the dependency box.