/**
 * During commenting the code I have used the word "property" and "annotation" synonymsly
 */

// counter to count the number of words
var counter=0; 

// a list that mantains the ids of all the words
var word_id_list=[];

// a dictionary, that holds the query for corresponding words ids
var word_query_list={};

// a dictionary that mantains the variable names for the corresponding word id 
var word_name_list={};

// a counter to keep tarck of the count of the dependencies
var dependencycounter=0;

// a list that mantains the id of all the dependencies
var dependency_id_list=[];

// a dictionary that keeps the dependency for the corresponding dependency query id
var dependency_query_list={};

// a list that keeps the extra words which are added, when we specify range dependencies 
var word_dependency_id_list=[]

// config which keeps the config whichis loaded from config.yaml file
window.config=null;

function send_config(vars) {
	/**
	 * 	The function is used to get the config from the cqp4rdf.html file 
	 * 	and save them globally in the index.js file
	 */
	
	// It saves the config, in a global varibale, which can be used by other functions  
	window.config=vars;
    return vars
}

function or_property(block, word){
	/**
	 * 	This function adds more conditions in OR with the current condition
	 * 	for that particular word
	 */
	
	// get the element that holds all the properties of a word 
	var prop=block.parentElement.parentElement.parentElement.getElementsByClassName("inside_card")[0];
	
	// loads the order of the annotations in which they would be shown in the dropdown
	order=window.config['corpora'][config['default']]['order'];

	// loads all the annotations along with the fields
	annotations=window.config['corpora'][config['default']]['fields'];
	
	// add the annotations in the dropdown in the order 
	options="";
	for(i=0;i<order.length;i++){
		if(annotations[order[i]]['disabled']!=true){
			options+=`<option value="${annotations[order[i]]['name']}">${annotations[order[i]]['name']}</option>`;	
		}
	}
	
	// complete div that has the complete query generator 
	property_selector=`
	<div style="text-align: center; color: rgb(102, 102, 102);">OR</div>
	<select class="property_name form-control" style="width: 100%;" onchange="update_input_style(this,${word.id});">
        <option value="None" disabled="" selected="">Feature</option>
        ${options}
    </select>
    <i class="property_rel fa fa-equals" onclick="inverse(this,${word.id})" style="margin: 0px 45%;"></i>
    <input type="text" class="form-control property_value" onchange="update_query()" style="width: 100%; margin: 1%;">`;
    
    // append the property selector to the current property 
	$(prop).append(property_selector);	
}

function update_input_style(element,word){
	/**
	 * This function updates the input style, 
	 * for various properties as specified in the config file.
	 */

	// to get the lement to be replaced
	replace_element=element.nextElementSibling.nextElementSibling;
	
	// if the annotation type is LIST 
	if(window.config['corpora'][config['default']]['fields'][element.value]["type"]=="list"){

		// get the list of elements that sould be in the dropdown list
		values=window.config['corpora'][config['default']]['fields'][element.value]["values"];
		
		// making the dropdown options from the values
		values_list="<option value='' disabled selected>Values</option>"
		for(i=0;i<values.length;i++){
			values_list+=`<option value="${values[i]}">${values[i]}</option>`;
		}
		
		// making the dropdown with the options
		input_dropdown=`
		<select class="form-control property_value" onchange="update_query()" style="width: 100%; margin: 1%;">	
			${values_list}		
		</select>
		`;
			
		// replacing the original input box with the new dropdown
		$(replace_element).replaceWith(input_dropdown);
	}

	// if the annotation type is INTEGER
	else if(window.config['corpora'][config['default']]['fields'][element.value]["type"]=="integer"){

		// make an input box which only takes INTEGER as input 
		input_integer=`
			<input type="number" min="1" class="form-control property_value" onchange="update_query(${word.id})" style="width: 100%; margin: 1%;">
		`;

		// replace the original input box with the new integer input box
		$(replace_element).replaceWith(input_integer);
	}

	// if the annotation type is SUGGEST
	else if(window.config['corpora'][config['default']]['fields'][element.value]["type"]=="suggest"){

		// get the values that have to be suggested 
		values=window.config['corpora'][config['default']]['fields'][element.value]["values"];
		
		// making the dropdown options from the values
		values_list=""
		for(i=0;i<values.length;i++){
			values_list+=`<option value="${values[i]}" />`;
		}
		
		// making the auto suggest feature for the input box
		// it also has another dropdown which includes arious featurs like - startswith, endswith, contains 
		// it also has a regex checkbox, if checked out, would add '\' for the special characters 
		input_suggest=`
			<div class="input-group mb-3" style="width: 100%; margin: 1%;">
				<div class="input-group-prepend row" style="width:100%;margin:0%;">
					<select class="form-control property_type" onchange="update_input_box(this)" style="width: 100%;border-radius:5px 5px 0 0;">	
						<option value="None" disabled >Input Style</option>
						<option value="normal" selected> Exact Match </option>
						<option value="start">Starts With</option>
						<option value="end">Ends With</option>
						<option value="contains">Contains</option>
					</select>
				</div>
				 
				<div style="width:100%;margin:0%;" class="input-group">
					<div class="input-group-prepend prefix" style="display:none;">
						<span class="input-group-text" style="border-radius:0 0 0 5px;">.*</span>
					</div>
					<input name="suggest" list="suggest" type="text" style="border-radius:0 0 5px 5px;" class="form-control property_value" onchange="update_query()">		
					<datalist id="suggest">
						<label>
							<select name="suggest">
								${values_list}
							</select>
						</label>
					</datalist>
					<div class="input-group-append suffix" style="display:none;">
						<span class="input-group-text" style="border-radius:0 0 5px 0;">.*</span>
					</div>
				</div>
				<label>
					<input type="checkbox" checked onchange="update_query()">
					Regular Expression
				</label>
			</div>
		`;

		// replace the orignal input form with the new auto suggest box
		$(replace_element).replaceWith(input_suggest);
	}
	
}

function update_input_box(dropdown){	
	/**
	 * 	This function is specifically called from update_input_style(),  
	 * 	when the input style selected by a user is SUGGEST.
	 * 	This function updates the input box border radius as per the user selction.
	 */
	
	//  get the div that contains the input box and the 3 divs
	children=dropdown.parentElement.nextElementSibling.children;
	
	// if the value which we enter must be matched exactly 
	if(dropdown.value=="normal"){
		$(children[0]).hide();
		$(children[3]).hide();
		$(children[1]).css({"border-radius":"0 0 5px 5px"});
	}

	// if the value which we enter must be contained
	else if(dropdown.value=="contains"){
		$(children[0]).show();
		$(children[3]).show();
		$(children[1]).css({"border-radius":"0px"});
	}

	// if the value which we enter must be in the begining
	else if(dropdown.value=="start"){
		$(children[0]).hide();
		$(children[3]).show();
		$(children[1]).css({"border-radius":"0 0 0 5px"});
	}

	// if the value which we enter must be at the end
	else if(dropdown.value=="end"){
		$(children[0]).show();
		$(children[3]).hide();	
		$(children[1]).css({"border-radius":"0 0 5px 0"});
	}

	// call update query, update the query and alsw write the query
	update_query();
}

function add_property(word){
	/**
	 * This function adds a property in AND along with the current conditions for that particular word
	 */
	
	// for the given word, gets the elemnt where the properties are added
	var properties = word.getElementsByClassName("word_property_list")[0];
	
	// gets the order in which the annotations are shown in the dropdown
	order=window.config['corpora'][config['default']]['order'];

	// get the all the annotations along with their properties
	annotations=window.config['corpora'][config['default']]['fields'];
	
	// adds the option for the annotations in the dropdown
	options="";
	for(i=0;i<order.length;i++){
		if(annotations[order[i]]['disabled']!=true){
			options+=`<option value="${annotations[order[i]]['name']}">${annotations[order[i]]['name']}</option>`;	
		}
	}
	
	and=`
	<div class="and" style="color: rgb(102, 102, 102); display: flex; justify-content: center; flex-direction: column; text-align: center;">AND</div>
	`;

	content=`
	<div class="card shadow" style="min-width:200px; width: 200px;">
        <div class="card-header header_card row" style="margin:0%;">
            <div class="col-lg-6" style="padding:1%;">
            	<button type="submit" onclick="or_property(this,${word.id})" class="btn btn-primary" style="width: 100%;">
            		<strong>OR</strong>
            	</button>
            </div>
            <div class="col-lg-6" style="padding:1%;">
            	<button type="submit" onclick="delete_property(this,${word.id})" class="btn btn-danger" style="width: 100%;">
            		<strong>Delete</strong>
            	</button>
            </div>
        </div>
        <div class="inside_card card-body" style="width: 100%; margin: 1%;">
            <select class="property_name form-control" style="width: 100%;" onchange="update_input_style(this,${word.id});">
                <option value="None" disabled="" selected="">Feature</option>
                ${options}
            </select>
            <em class="property_rel fa fa-equals" tabindex=0 onclick="inverse(this,${word.id})" onkeyup="inverse(this,${word.id})" style="margin: 0px 45%;"></em>
            <input type="text" class="form-control property_value" onchange="update_query(${word.id})" style="width: 100%; margin: 1%;">
        </div>
    </div>
	`;

	// if the property is not the first property then AND has to be also added
	if(properties.children.length>0){
		content=and+content;
	}

	// the properties are then appended along with all other properties
	$(properties).append(content);
}

function add_word(){
	/**
	 * This function adds a new word.
	 * Along with the word a `nif:nextWord` dependency is also added between the last 2 words.
	 */
	
	// increments the counter, since a new word has been added. Used to name the variables 
	window.counter+=1;
	
	// gets the section on the web page where we are adding words.
	word_list=document.getElementsByClassName('word_list')[0];

	// on adding a new word all other words are collapsed, and the new one is only shown
	collapse_list=word_list.getElementsByClassName("collapse");
	for(i=0;i<collapse_list.length;i++){
		$(collapse_list[i]).collapse("hide");
	}

	// appends a new word
	$(word_list).append(`
	<div class="card shadow" id=w${window.counter}>
	    <div class="card-header" id="heading${window.counter}" style="padding: 0;">
	        <h5 class="mb-0">
	            <button class="btn" type="button" data-toggle="collapse" data-target="#collapse${window.counter}" aria-expanded="true" aria-controls="collapse${window.counter}" style="margin: 0; width: 100%; height: 100%;">
	                w${window.counter}
	            </button>
	        </h5>
	    </div>
	    <div id="collapse${window.counter}" class="collapse show" aria-labelledby="heading${window.counter}" >
	        <div class="card-body" style="padding: 0;">
	            <div class="word card" style="border-radius: 0%;">
	                <div class="card-header" style="border-radius: 0%;margin: 0%;">
	                    <div class="row" style="margin: 0%;">
	                    <div class="col-md-12 col-lg-4 order-lg-1" style="padding: 0% 1%; margin:2% 0% 0% 0%;">
	                        <button type="submit" onclick="add_property(w${window.counter})" class="btn btn-primary" style="width:100%;">
	                            <strong>Add Property</strong>
	                        </button>
	                    </div>
	                    <div class="col-md-12 col-lg-12 order-lg-4 row" style="margin:8% 0%;text-align: center;padding: 0% 1%;">
	                        <div class="slider col-md-12" style="display:inline;text-align: center;">
	                            <span class="left_value" style="width:10%;"></span>
	                            <span> - </span>
	                            <span class="right_value" style="width:10%;"></span>
	                            <div class="test-slider" id="range_slider_${window.counter}" style="width: 100%;"></div>
	                        </div>
	                        
	                    </div>

	                    <div class="col-md-12 col-lg-4 order-lg-2 row" style="margin:2% 0% 0% 0%;text-align: center;padding: 0% 1%;">
	                        <input type="text" value="w${window.counter}" class="variable_name form-control" onchange="update_query()" style="width: 100%; margin: 0% 1%; text-align: center;">
	                    </div>
	                    <div class="col-md-12 col-lg-4 order-lg-3" style="margin:2% 0% 0% 0%;text-align: center;padding: 0;">
	                        <button type="submit" onclick="delete_word(w${window.counter})" class="btn btn-danger" style="width:100%;">
	                            <strong>Delete Word</strong>
	                        </button>
	                    </div>
	                    </div>
	                </div>
	                <div class="word_property_list card-body" style="display: flex; flex-flow: row nowrap; flex-shrink: 0; overflow-x: auto;padding-left: 0.1%;padding-right: 0.1%;">
	                </div>
	            </div>
	        </div>
	    </div>
	</div>
	`);

	// gets the element where the slider value is shown 
	var left_value= $('.left_value',word_list).eq(-1)[0];
    var right_value=$('.right_value',word_list).eq(-1)[0];

    // gets the slider element
    var slider = $('.test-slider',word_list).eq(-1)[0];

    // creats the scroll bar, and specifies its properties
    noUiSlider.create(slider, {
    	// starting value for left and right slider respectively
        start: [1,1],
        connect: true,
        // will make an increment of 1 value on scrolling
        step: 1,
        // the minimum and the maximum value 
        range: {
            'min': 0,
            'max': 20
        },
        behaviour: 'tap-drag',
        tooltips: true,
        // removed the decimal poiner and only the integer value is shown
        format: wNumb({
            decimals: 0
        })
    });

    var snapValues = [ left_value,right_value ];

    // on sliding the scrollbar, the elements hsowing the slider values are updated
    slider.noUiSlider.on('update', function (values, handle) {
        // updating the elements with the scrolll bar
        snapValues[handle].textContent = parseInt(values[handle]);
        // update the query, with the slider values
		update_query();
    });

    // word query for a given word added for the given word  
	window.word_query_list[`w${window.counter}`]= `w${window.counter}:[]{1}`;
	// the default name for the variable is the name of the word
	window.word_name_list[`w${window.counter}`]= `w${window.counter}`;
	// word_id added in the list of all words
	window.word_id_list.push(`w${window.counter}`);

	// if there are more than 1 words then, by default a `nif:nextWord` dependency is added b/w the last 2 words
	if(window.word_id_list.length>1){
		add_dependency(add_sequence_dependency=true);
	}

	// finally the query is updated and regenerated
	update_query();
}

function update_query_regex_escape(value){
	/**
	 * Update the normal query so that the special characters are treated as normally.
	 */
	
	update_value=""
	
	// for all the characters, `\` is added in front of the special characters so that they are treated as normal characters.
	for(i=0;i<value.length;i++){
		
		if("()[]{}.*+?".includes(value[i])){
			update_value+="\\";
		}
		
		update_value+=value[i];
	}

	return update_value;
}

function get_word_query(word){
	/**
	 * This function gets make the word query for the given word, 
	 * using all the properties specified for it.
	 */
	
	query="";

	// get the word variable name
	varible_name=word.getElementsByClassName("variable_name")[0].value;
	
	// get the range-from and range-to values  
	range_from=word.getElementsByClassName("left_value")[0].textContent;
	range_to=word.getElementsByClassName("right_value")[0].textContent;	
	
	// get the range ... and update it to * and + as the values specified
	range="{"+range_from+", "+range_to+"} ";
	if(range_to.trim()=="inf"){
		if(range_from.trim()=="0"){
			range="*";
		}
		else if(range_from.trim()=="1"){
			range="+";
		}
	}
	
	// if from and to are same, then we don't need 2 values
	if(range_from.trim()==range_to.trim()){
		if(range_from.trim()=="1")
			range="";
		else{
			range="{"+range_from+"} ";	
		}
	}

	query+=varible_name+":[ ";
	
	// combine all the queries from the properties
	inner_card=word.getElementsByClassName("inside_card");
	first_time=true;

	for(j=0;j<inner_card.length;j++){
		query_in=" ( ";
		has_info=false;
		
		// get the property name
		property_name=inner_card[j].getElementsByClassName("property_name");
		
		// get the property relation
		property_rel=inner_card[j].getElementsByClassName("property_rel");
		
		// get the property value
		property_value=inner_card[j].getElementsByClassName("property_value");

		// iterate over all the annotations specified in a since annotation box
		for(k=0;k<property_name.length;k++){

			// get the annotation name, rel and value
			name=property_name[k].value;
			rel=property_rel[k];
			value=property_value[k].value.trim();

			// escamein the ones that are not specified
			if(name!="None" && value!=""){

				//  the annotation type is SUGGEST
				if(window.config['corpora'][config['default']]['fields'][name]['type']=="suggest"){
					
					regex_escape=property_value[k].parentElement.nextElementSibling.children[0];
					
					// if the regex checkbox is checked,then the special characters
					if(regex_escape.checked==false){
						value=update_query_regex_escape(value);
					}				
					regex_constrain=property_value[k].parentElement.previousElementSibling.children[0].value;
					
					// update the regex, so that value starts with given value
					if(regex_constrain=="start"){
						value=value+".*";						
					}
					// update the regex, so that value ends with given value
					else if(regex_constrain=="end"){
						value=".*"+value;
					}
					// update the regex, so that value contains given value
					else if(regex_constrain=="contains"){
						value=".*"+value+".*";
					}
				}

				// if it has more annotations then they are added in OR
				if(has_info==true)
					query_in+=" | ";

				// in the final query specify the exact property name along with the prefix
				query_in+=annotations=window.config['corpora'][config['default']]['fields'][name]['query'];
				
				has_info=true;
				x=true;
				
				// add the corresponging relation name
				if(rel.classList.contains("fa-equals"))
					query_in+=" = ";
				else if(rel.classList.contains("fa-not-equal"))
					query_in+=" != ";
				
				query_in+="\""+value+"\"";
			}
		}
		query_in+=" ) ";
		
		// add more annotations in AND
		if(has_info){
			if(j!=0 && !first_time){
				query+=" & ";
			}
			if(first_time)
				first_time=false;
			query+=query_in;
		}
	}
	query+=" ]"+range;

	return query;
}

function update_word_query(word){
	/**
	 * This function calls the get_word_query() function to calculate the word query
	 * and then it is placed at the top bar. Also, the word query is updated in the 
	 * arrays and dictionaries, which are further used to make a total query.
	 * Also, this function checks for the variable name, which is first checked 
	 * and then updated in the query as well as in the depndencies. It also warns the 
	 * users if the variable name is already used or reserved.
	 */
	
	// get the word id
	id=word.id;

	var_name=$(".variable_name",word)[0].value;
	
	// check if an update has been in the word variable name.
	// This is done by comparing it with the id and the preious name which the word had.
	if(id!=var_name && window.word_name_list[id]!=var_name ){
		
		// check if the new variable name provided to the word, has been assined to any other word
		if(Object.values(window.word_name_list).includes(var_name)){
			alert("2 words have the same variable name. Please correct that to update the query.");
			return;
		}
		
		// check if the new variable name provided to the word, has been used by some dependency for range queries 
		else if(Object.values(window.dependency_id_list).includes(var_name)){
			alert("The variable name is already reserved for including dependencies. Please update the variable name.");
			return;	
		}

		// else the variable name is updated 
		else{
			window.word_name_list[id]=var_name;
		}
	}

	// get the complete word query
	query=get_word_query(word);

	// write the word query on the top collpase bas of the word
	word.getElementsByClassName("btn")[0].textContent=query;

	// update the query in the global variables
	window.word_query_list[word.id]=query;
}

function write_query(){
	/**
	 * This function is used to calculate and rite the final query 
	 * from all the lists and dictionaries which we have mantained.
	 */
	
	query1="";

	// get the query for all the words
	for(i=0;i<window.word_id_list.length;i++){
		if(window.word_query_list[window.word_id_list[i]].trim()!="")
			query1+=window.word_query_list[window.word_id_list[i]]+" ";
	} 
	
	// get the query for all the intermediate words which are added, because of dependency queries 
	for(i=0;i<window.word_dependency_id_list.length;i++){
		if(window.dependency_query_list[window.dependency_id_list[i]]!=undefined && window.word_query_list[window.word_dependency_id_list[i]].trim()!="")
			query1+=window.word_query_list[window.word_dependency_id_list[i]]+" ";
	}
	
	query2="";

	// get the query for all the dependencies
	first=true;
	for(i=0;i<window.dependency_id_list.length;i++){
		if(window.dependency_query_list[window.dependency_id_list[i]]!=undefined && window.dependency_query_list[window.dependency_id_list[i]].trim()!=""){
			
			if(first){
				query2+=" :: ";
				first=false;
			}
			else{
				query2+=" & ";
			}

			query2+=window.dependency_query_list[window.dependency_id_list[i]]+" ";
		}
	} 

	// the final query
	query=query1+query2.trim();
	
	// writing the query
	document.getElementById("cqp").value=query;

	// disable updating of query if using the GUI Query Generator
	if(query.length>0){
		document.getElementById("cqp").disabled=true;
	}
	else{
		document.getElementById("cqp").disabled=false;	
	}
}

function update_query(){
	/**
	 * This function is the core main function which is responsible of complete update. 
	 * Whenever a change is made, this function is being called. 
	 * This function call all other functions and finally the omplete update is made.
	 */
	
	// get the queries for all the words
	for(i=0;i<window.word_id_list.length;i++){
		w=$("#"+window.word_id_list[i])[0];
		update_word_query(w);
	}
	
	// update all the dropdowns in all the dependencies
	update_dropdown();
	
	// get the query for all the dependencies
	for(i=0;i<window.dependency_id_list.length;i++){
		d=$("#"+window.dependency_id_list[i])[0];
		update_dependency_query(d);
	}

	// write the query from the gloable variables
	write_query();	
}

function update_dropdown(add_sequence_dependency=false){
	/**
	 * This function updates the dropdown in add the dependencies.
	 * As soon as an update is made in a word query, this function is used, 
	 * so that the updated query can be shown in the dropdowns.
	 */
	
	// get all the left words in all the dependency
	left=$("select.word_left");

	for(left_word=0;left_word<left.length;left_word++){

		added=false;
		
		// keep in record the original selected option
		selected_option=left[left_word][left[left_word].selectedIndex].value.split(":")[0].trim();
		
		// remove all the options
		left[left_word].options.length=1;
		
		// make the first option selected by default 
		left[left_word].options[0].selected=true;

		// if the depndency is being added on adding a new word, the default nif:nextWord dependency
		if(add_sequence_dependency && left_word==left.length-1)
			selected_option=window.word_id_list[window.word_id_list.length-2];

		// add all the dropdown options
		for(left_word_options=0;left_word_options<window.word_id_list.length;left_word_options++){
			
			selected="";
			// select a word if a word matches a selected option
			if(window.word_id_list[left_word_options].trim()==selected_option.trim()){
				selected="selected";
				added=true;
			}

			// append the option in the dropdown
			$(left[left_word]).append(`<option value="${window.word_id_list[left_word_options]}" ${selected}> ${window.word_query_list[window.word_id_list[left_word_options]]} </option>`);
		}
	}

	// get all the right words in all the dependency
	right=$("select.word_right");
		
	for(right_word=0;right_word<right.length;right_word++){

		added=false;
		
		// keep in record the original selected option
		selected_option=right[right_word][right[right_word].selectedIndex].value.split(":")[0].trim();
		
		// remove all the options
		right[right_word].options.length=1;
		right[right_word].options[0].selected=true;

		// if the depndency is being added on adding a new word, the default nif:nextWord dependency
		if(add_sequence_dependency && right_word==right.length-1)
			selected_option=window.word_id_list[window.word_id_list.length-1];

		// add all the dropdown options
		for(right_word_options=0;right_word_options<window.word_id_list.length;right_word_options++){
			
			selected="";
			// select a word if a word matches a selected option
			if(window.word_id_list[right_word_options].trim()==selected_option.trim()){
				selected="selected";
				added=true;
			}		

			// append the option in the dropdown
			$(right[right_word]).append(`<option value="${window.word_id_list[right_word_options]}" ${selected}> ${window.word_query_list[window.word_id_list[right_word_options]]} </option>`);
		}
	}
}


function add_dependency(add_sequence_dependency=false){
	/**
	 * This function is used to add depenency, and dependency can be added b/w any 2 words.
	 * Also, this function is most of times called by default, 
	 * because we need to add a `nif:nextWord` dependency as we are ina process of adding words.
	 */
	
	// get the element that holds all the dependencies
	dependency_list=document.getElementsByClassName('dependency_list')[0];

	// collapse all old dependency boxes
	collapse_list=dependency_list.getElementsByClassName("collapse");
	for(i=0;i<collapse_list.length;i++){
		$(collapse_list[i]).collapse("hide");
	}

	// will show the new dependency only if it is added separately
	// else it won't be shown
	show_collapse="show";
	if(add_sequence_dependency)
		show_collapse="";

	// incrementing the dpendency counter
	window.dependencycounter+=1;

	dependency_box=`
	<div class="card shadow" id=d${window.dependencycounter}>
	    <div class="card-header" id="dependencyheading${window.dependencycounter}" style="padding: 0;">
	        <h5 class="mb-0">
				<button class="btn" type="button" data-toggle="collapse" data-target="#dependencycollapse${window.dependencycounter}" aria-expanded="true" aria-controls="dependencycollapse1" style="margin: 0; width: 100%; height: 100%;">
					d${window.dependencycounter}
				</button>
			</h5>
	    </div>
	    <div id="dependencycollapse${window.dependencycounter}" class="collapse ${show_collapse}" aria-labelledby="dependencyheading${window.dependencycounter}">
	        <div class="dependency card" style="margin:0%;border-radius:0;">
			    <div class="card-header row" style="border-radius:0;margin: 0%;">
			        <button type="submit" onclick="delete_dependency(d${window.dependencycounter})" class="btn btn-danger col-xs-12" style="width: 100%;">
			        	<strong>Delete Dependency</strong>
			        </button>
			    </div>
			    <div class="card-body row" style="display: flex; align-items: center; justify-content: center; margin: 0%;">
			    	<div class="col-md-12">
				        <select class="word_left form-control" onchange="update_query()" style="flex: 1 1 0%; margin: 1%; width: 100%;">
				            <option value="None" disabled selected>Left Variable</option>
				        </select>
			        </div>
			        <div class="col-md-12">
			        	<select class="dependency_type form-control col-md-12" onchange="update_query()" style="flex: 1 1 0%; margin: 1%; width: 100%; text-align: center;">
				            <option value="None" disabled selected>Dependency</option>
				            <optgroup label="Linear">
				            	<option value="before" selected=${add_sequence_dependency}>Before</option>
				            	<option value="after">After</option>
				            	<option value="before_after">Before/After</option>
				            </optgroup>
				            <optgroup label="Syntactic">
				            	<option value="head">Head</option>
				            	<option value="child">Child</option>
				            	<option value="head_child" disabled>Head/Child</option>
				            </optgroup>
			        	</select>
			        </div>
			        <div class="col-md-12">
				        <select class="proximity form-control col-md-12" onchange="update_query()" style="flex: 1 1 0%; margin: 1%; width: 100%; text-align: center;">
				        	<option value="adjoining" selected=${add_sequence_dependency}>Adjoining</option>
				        	<option value="range">Range</option>
				        	<option value="any">Any</option>
				        </select>
			        </div>
			        <div class="col-md-12">
				        <select class="word_right form-control col-md-12" onchange="update_query()" style="flex: 1 1 0%; margin: 1%; width: 100%;">
				            <option value="None" disabled selected>Right Variable</option>
				        </select>
			        </div>
			        <div class="slider col-md-12" style="margin:8% 0%; display:inline;text-align: center;">
						<span class="left_value" style="width:10%;"></span>
						<span> - </span>
						<span class="right_value" style="width:10%;"></span>
					    <div class="test-slider" id=slider_${window.dependencycounter}></div>
					</div>
			    </div>	

			</div>
	    </div>
	</div>
	`;

	// adding the new dependency
	$(dependency_list).append(dependency_box);

	// get the left and the right element
	var left_value= $('.left_value',dependency_list).eq(-1)[0];
	var right_value=$('.right_value',dependency_list).eq(-1)[0];
	
	// get the slider element
	var slider = $('.test-slider',dependency_list).eq(-1)[0];
	
	// will creat and add the slider
	noUiSlider.create(slider, {
		// the start and the end point will have the default value of 0 and 10 respectively
	    start: [0,10],
	    connect: true,
	    // will increment by 1 each time
	    step: 1,
	    // will specify the range, the min and the max
	    range: {
	        'min': 0,
	        'max': 20
	    },
	    behaviour: 'tap-drag',
        tooltips: true,
        // will show only integer, with no decimal pointer
        format: wNumb({
            decimals: 0
        })
	});

	var snapValues = [ left_value,right_value ];

	// on scrolling, the slider would be updated as following 
	slider.noUiSlider.on('update', function (values, handle) {
    	// update the left-value and right-value slider
    	snapValues[handle].textContent = parseInt(values[handle]);
    	// will update the complete query
    	update_query();
	});

	// add dependency in the global valriable and also in the global dictionary
	window.dependency_id_list.push(`d${window.dependencycounter}`);
	window.dependency_query_list[`d${window.dependencycounter}`]="";

	// update all the dropdown, and if the dependency is being added after next word, 
	// will have to updated so that the last 2 words have a nif:nextWord dependency 
	update_dropdown(add_sequence_dependency);

	// will update the complete query
	update_query();
	
}

function update_dependency_query(dependency){
	/**
	 * This function is used to calculate the dependency query, from a given dependency box.
	 * The caluclated dependency query is updated on the top bar of the dependency 
	 * and also in the global variables.
	 * Also, from the 2 words if any of the 2 words are not choosen and are None, 
	 * or have been deleted, the query would not be genrated 
	 * and would be replaced by the dependency id on the top bar of the dependency. 
	 */
	
	// get the left word in the dependency dropdown element
	left=$(".word_left",dependency)[0];
	
	// get the dependency type dropdown element
	dependency_type=$(".dependency_type",dependency)[0];
	
	// get the proximity type dropdown element
	proximity=$(".proximity",dependency)[0];
	
	// get the right word dropdown element
	right=$(".word_right",dependency)[0];

	// show the slider only if the proximilty is range
	if(proximity.value =="range"){
		$(".slider",dependency).show();
		from=$(".left_value",dependency)[0].textContent;
		to=$(".right_value",dependency)[0].textContent;
	}
	else{
		$(".slider",dependency).hide();
	}

	// only if the left word, right word and the dependency type all are selected 
	if(left.value!="None" && dependency_type.value!="None" && right.value!="None"){

		// get the value for all the 4 dropdowns
		l=window.word_name_list[left.value.split(":")[0].trim()];
		r=window.word_name_list[right.value.split(":")[0].trim()];
		d=dependency_type.value.trim();
		p=proximity.value.trim();
		
		// update the distance, as per the range selceted
		dist="";
		if(p=="range"){
			dist=`{${from},${to}}`;
		}
		else if(p=="any"){
			dist="*";
		}
		
		// if the dependency is linear->before
		if(d=="before"){
			// if the proximity is adjoining, add the nextword dependency => l->r
			if(p=="adjoining")
				query=`(${l}.nif:nextWord=${r})`;
			
			// else, a new dummy word is added and dependencies are added using that 
			else
				query=`(${l}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${r})`;
		}
		// if the dependency is linear->after
		else if(dependency_type.value=="after"){
			// if the proximity is adjoining, add the nextword dependency => r->l
			if(p=="adjoining")
				query=`(${r}.nif:nextWord=${l})`;
			
			// else, a new dummy word is added and dependencies are added using that
			else
				query=`(${r}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nif:nextWord=${l})`;
		}
		// if the dependency is linear-> before/after
		else if(dependency_type.value=="before_after"){
			// if the proximity is adjoining, the nextword.before and nextword.after dependencies are added in OR
			if(p=="adjoining")
				query=`(${l}.nif:nextWord=${r} | ${r}.nif:nextWord=${l})`;
			// else, a new dummy word is added and dependencies are added 
			else
				query=`((${l}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${r}) | (${r}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${l}))`;
		}
		// if the dependency is syntatic-> head
		else if(dependency_type.value=="head"){
			// if the proximity is adjoining, the words are added with conll:HEAD, from l to r
			if(p=="adjoining")
				query=`(${l}.conll:HEAD=${r})`;
			// else, a new dummy word is added and the conll:HEAD dependency is added using the dummy word
			else
				query=`(${l}.conll:HEAD=${dependency.id} & ${dependency.id}.conll:HEAD=${r})`;
		}
		// if the dependency is syntatic-> child
		else if(dependency_type.value=="child"){
			// if the proximity is adjoining, the words are added with conll:HEAD , from r to l
			if(p=="adjoining")
				query=`(${r}.conll:HEAD=${l})`;
			// else, a new dummy word is added and the conll:HEAD dependency is added using the dummy word
			else
				query=`(${r}.conll:HEAD=${dependency.id} & ${dependency.id}.conll:HEAD=${l})`;
		}
		// if the dependency is syntatic-> head_child
		else if(dependency_type.value=="head_child"){
			// if the proximity is adjoining, the words are added with HEAD dependency, the left.HEAD=right and right.HEAD=left are in OR
			if(p=="adjoining")
				query=`(${l}.conll:HEAD=${r} | ${r}.conll:HEAD=${l})`;
			// TODO=> have to add some way to figre this out for {2 words in the same parse tree, eith head or chind with any number of nodes in bwtween} 
			// else
			// 	query=`((${l}.conll:HEAD=${dependency.id} & ${dependency.id}.conll:HEAD=${r}) | (${r}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${l}))`;
		}
		
		//  adding the new word which would be added, if we have a range query, for which we would be adding new dependency word
		// update in the global variables
		if(p!="adjoining" && !window.word_dependency_id_list.includes(`${dependency.id}`)){
			window.word_dependency_id_list.push(`${dependency.id}`);
		}
		if(p!="adjoining"){
			window.word_query_list[`${dependency.id}`]=`${dependency.id}:[]${dist}`;
		}

		// updating the gloable variables
		window.dependency_query_list[dependency.id]=query;

		// write the dependency on the top collapse bar
		$(".btn",dependency)[0].textContent=query;
	}

	// else, if one of the dropdowns is selected as None, then the query won't be formed 
	// and the collapse bar would only show the corresponding dependency id
	else{
		$(".btn",dependency)[0].textContent=dependency.id;
		delete window.dependency_query_list[dependency.id];
	}
} 


function delete_dependency(dependency){
	/**
	 * This function is used to delete dependency, given a dependency.
	 * Along with dletig the depndency box from the GUI, the dependency 
	 * and its corresponding query is removed from the global variables. 
	 */
	
	// delete the dependency box from the GUI
	dependency.remove();
	
	// delete the dependency from the global variabbles
	delete window.dependency_query_list[dependency.id];
	window.dependency_id_list.splice(window.dependency_id_list.indexOf(dependency.id),1);
	
	// delete the extra variables introduced by the dependency, for the range queries
	delete window.word_query_list[dependency.id];
	window.word_dependency_id_list.splice(window.word_dependency_id_list.indexOf(dependency.id),1);
	
	// will update the complete query
	update_query();
}


function delete_word(word){
	/**
	 * This function deletes a word.
	 * It not only deltes the word from the GUI, the word is also deleted from the global varibales.
	 * Also, the selected word is shifted to None in the dependdencies. Thus all the dependencies thathave the given word are also removed.
	 */
	
	// delete the word box from teh GUI
	word.remove();

	// delete the word from the global variables 
	delete window.word_query_list[word.id];
	delete window.word_name_list[word.id];
	window.word_id_list.splice(window.word_id_list.indexOf(word.id),1);
	
	// update the complete query
	update_query();	
}

function delete_property(block,word){
	/**
	 * This function is used to delete a property of a word.
	 * On deleting a property, all other properties(if any) that are in OR with the given word are also removed.
	 */
	
	// gets the complete box which all are in 1 bracket () and are in OR  
	var prop=block.parentElement.parentElement.parentElement;

	// delete the box, and if not the last one, also delete the AND div
	if(prop.previousElementSibling!=null && prop.previousElementSibling.textContent=="AND"){
		prop.previousElementSibling.remove();
	}
	else if(prop.nextElementSibling!=null && prop.nextElementSibling.textContent=="AND"){
		prop.nextElementSibling.remove();
	}
	prop.remove();
	
	// update the complete query 
	update_query();
}

function inverse(sign,word){
	/**
	 * This function is used to inverse the equal to not-equal to and vice versa.
	 * It is also updated in the corresponding word queries. 
	 */
	// check if the sign is equals
	if(sign.classList.contains("fa-equals")){
		// if the sign is equals, then change it to not-equals
		sign.classList.replace("fa-equals","fa-not-equal");
	}
	// check if the sign is not-equals
	else if(sign.classList.contains("fa-not-equal")){
		// if the sign is not-equals, then change it to equals 
		sign.classList.replace("fa-not-equal","fa-equals");
	}

	// update the complete query
	update_query();
}
