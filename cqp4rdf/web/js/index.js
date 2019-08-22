var counter=0; 
var word_query_list={};
var word_id_list=[];
var word_name_list={};

var dependency_query_list={};
var dependency_id_list=[];
var dependencycounter=0;
var word_dependency_id_list=[]

window.config=null;

function send_config(vars) {
	window.config=vars;
    return vars
}

var suggest_counter=0

function or_property(block,word){
	var prop=block.parentElement.parentElement.parentElement.getElementsByClassName("inside_card")[0];
	
	order=window.config['corpora'][config['default']]['order'];
	annotations=window.config['corpora'][config['default']]['fields'];
	options="";
	for(i=0;i<order.length;i++){
		if(annotations[order[i]]['disabled']!=true){
			options+=`<option value="${annotations[order[i]]['name']}">${annotations[order[i]]['name']}</option>`;	
		}
	}

	property_selector=`
	<div style="text-align: center; color: rgb(102, 102, 102);">OR</div>
	<select class="property_name form-control" style="width: 100%;" onchange="update_input_style(this,${word.id});">
        <option value="None" disabled="" selected="">Feature</option>
        ${options}
    </select>
    <i class="property_rel fa fa-equals" onclick="inverse(this,${word.id})" style="margin: 0px 45%;"></i>
    <input type="text" class="form-control property_value" onchange="update_query()" style="width: 100%; margin: 1%;">`;
    
	$(prop).append(property_selector);	
}

function update_input_style(element,word){
	// console.log(element.nextElementSibling.nextElementSibling);
	// console.log(element);
	// console.log(word.id);

	replace_element=element.nextElementSibling.nextElementSibling;
	if(window.config['corpora'][config['default']]['fields'][element.value]["type"]=="list"){

		values=window.config['corpora'][config['default']]['fields'][element.value]["values"];
		
		values_list="<option value='' disabled selected>Values</option>"
		for(i=0;i<values.length;i++){
			values_list+=`<option value="${values[i]}">${values[i]}</option>`;
		}
		
		input_dropdown=`
		<select class="form-control property_value" onchange="update_query()" style="width: 100%; margin: 1%;">	
			${values_list}		
		</select>
		`;
			
		$(replace_element).replaceWith(input_dropdown);
	}
	else if(window.config['corpora'][config['default']]['fields'][element.value]["type"]=="integer"){

		input_integer=`
			<input type="number" min="1" class="form-control property_value" onchange="update_query(${word.id})" style="width: 100%; margin: 1%;">
		`;

		$(replace_element).replaceWith(input_integer);
	}
	if(window.config['corpora'][config['default']]['fields'][element.value]["type"]=="suggest"){

		values=window.config['corpora'][config['default']]['fields'][element.value]["values"];
		
		values_list=""
		for(i=0;i<values.length;i++){
			values_list+=`<option value="${values[i]}" /><br/>`;
		}
		
		suggest_counter+=1;

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
					<input name="suggest" list="suggest${suggest_counter}" type="text" style="border-radius:0 0 5px 5px;" class="form-control property_value" onchange="update_query()">		
					<datalist id="suggest${suggest_counter}">
						${values_list}
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

		$(replace_element).replaceWith(input_suggest);
	}
	
}

function update_input_box(dropdown){	
	console.log("lol");
	children=dropdown.parentElement.nextElementSibling.children;
	console.log(children);
	if(dropdown.value=="normal"){
		$(children[0]).hide();
		$(children[3]).hide();
		$(children[1]).css({"border-radius":"0 0 5px 5px"});
	}
	else if(dropdown.value=="contains"){
		$(children[0]).show();
		$(children[3]).show();
		$(children[1]).css({"border-radius":"0px"});
	}
	else if(dropdown.value=="start"){
		$(children[0]).hide();
		$(children[3]).show();
		$(children[1]).css({"border-radius":"0 0 0 5px"});
		// children[1].style.border-radius="0 0 0 5px";
	}
	else if(dropdown.value=="end"){
		$(children[0]).show();
		$(children[3]).hide();	
		$(children[1]).css({"border-radius":"0 0 5px 0"});
	}
	update_query();
	// dropdown.parentElement.nextElementSibling.value="-"+dropdown.parentElement.nextElementSibling.value+"-";
}

function add_property(word){
	var properties = word.getElementsByClassName("word_property_list")[0];
	
	order=window.config['corpora'][config['default']]['order'];
	annotations=window.config['corpora'][config['default']]['fields'];
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

	if(properties.children.length>0){
		content=and+content;
	}

	$(properties).append(content);
}

function add_word(){
	window.counter+=1;

	
	word_list=document.getElementsByClassName('word_list')[0];

	collapse_list=word_list.getElementsByClassName("collapse");
	for(i=0;i<collapse_list.length;i++){
		$(collapse_list[i]).collapse("hide");
	}

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

	var left_value= $('.left_value',word_list).eq(-1)[0];
    var slider = $('.test-slider',word_list).eq(-1)[0];
    var right_value=$('.right_value',word_list).eq(-1)[0];

    noUiSlider.create(slider, {
        start: [1,1],
        connect: true,
        step: 1,
        range: {
            'min': 0,
            'max': 20
        },
        behaviour: 'tap-drag',
        tooltips: true,
        format: wNumb({
            decimals: 0
        })
    });

    var snapValues = [ left_value,right_value ];

    slider.noUiSlider.on('update', function (values, handle) {
        snapValues[handle].textContent = parseInt(values[handle]);
        // console.log(this.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement);
		update_query();
    });

	window.word_query_list[`w${window.counter}`]= `w${window.counter}:[]{1}`;
	window.word_name_list[`w${window.counter}`]= `w${window.counter}`;
	window.word_id_list.push(`w${window.counter}`);
	// update_dropdown();
	// write_query();

	if(window.word_id_list.length>1){
		add_dependency(add_sequence_dependency=true);
		// console.log("called add_dependency specially");
	}
	update_query();
}

function update_query_regex_escape(value){
	update_value=""
	for(i=0;i<value.length;i++){
		if("()[]{}.*+?".includes(value[i])){
			update_value+="\\";
		}
		update_value+=value[i];
	}
	return update_value;
}

function get_word_query(word){
	query="";
	varible_name=word.getElementsByClassName("variable_name")[0].value;
	
	range_from=word.getElementsByClassName("left_value")[0].textContent;
	range_to=word.getElementsByClassName("right_value")[0].textContent;	
	// console.log(word.getElementsByClassName("left_value")[0].textContent);
	// console.log(word.getElementsByClassName("right_value")[0].textContent);

	range="{"+range_from+", "+range_to+"} ";
	if(range_to.trim()=="inf"){
		if(range_from.trim()=="0"){
			range="*";
		}
		else if(range_from.trim()=="1"){
			range="+";
		}
	}
	if(range_from.trim()==range_to.trim()){
		if(range_from.trim()=="1")
			range="";
		else{
			range="{"+range_from+"} ";	
		}
	}

	query+=varible_name+":[ ";
	inner_card=word.getElementsByClassName("inside_card");
	first_time=true;
	for(j=0;j<inner_card.length;j++){
		query_in=" ( ";
		has_info=false;
		
		property_name=inner_card[j].getElementsByClassName("property_name");
		property_rel=inner_card[j].getElementsByClassName("property_rel");
		property_value=inner_card[j].getElementsByClassName("property_value");

		for(k=0;k<property_name.length;k++){
			name=property_name[k].value;
			rel=property_rel[k];
			value=property_value[k].value.trim();

			if(name!="None" && value!=""){
				if(window.config['corpora'][config['default']]['fields'][name]['type']=="suggest"){
					regex_escape=property_value[k].parentElement.nextElementSibling.children[0];
					if(regex_escape.checked==false){
						value=update_query_regex_escape(value);
						console.log(">sagar>"+value);
					}				
					regex_constrain=property_value[k].parentElement.previousElementSibling.children[0].value;
					if(regex_constrain=="start"){
						value=value+".*";						
					}
					else if(regex_constrain=="end"){
						value=".*"+value;
					}
					else if(regex_constrain=="contains"){
						value=".*"+value+".*";
					}
				}
				if(has_info==true)
					query_in+=" | ";
				// query_in+="conll:"+name;
				query_in+=annotations=window.config['corpora'][config['default']]['fields'][name]['query'];
				has_info=true;
				x=true;
				if(rel.classList.contains("fa-equals"))
					query_in+=" = ";
				else if(rel.classList.contains("fa-not-equal"))
					query_in+=" != ";
				query_in+="\""+value+"\"";
			}
		}
		query_in+=" ) ";
		if(has_info){
			if(j!=0 && !first_time){
				query+=" & ";
			}
			if(first_time)
				first_time=false;
			query+=query_in;
		}
		// console.log(first_time);
	}
	query+=" ]"+range;

	return query;
}

function update_word_query(word){
	// console.log("here")
	id=word.id;
	var_name=$(".variable_name",word)[0].value;
	if(id!=var_name && window.word_name_list[id]!=var_name ){
		if(Object.values(window.word_name_list).includes(var_name)){
			alert("2 words have the same variable name. Please correct that to update the query.");
			return;
		}
		else if(Object.values(window.dependency_id_list).includes(var_name)){
			alert("The variable name is already reserved for including dependencies. Please update the variable name.");
			return;	
		}
		else
			window.word_name_list[id]=var_name;
	}
	query=get_word_query(word);
	word.getElementsByClassName("btn")[0].textContent=query;
	window.word_query_list[word.id]=query;
	// write_query();
	// update_dropdown();
}

function write_query(){
	query1="";

	for(i=0;i<window.word_id_list.length;i++){
		if(window.word_query_list[window.word_id_list[i]].trim()!="")
			query1+=window.word_query_list[window.word_id_list[i]]+" ";
	} 
	for(i=0;i<window.word_dependency_id_list.length;i++){
		if(window.dependency_query_list[window.dependency_id_list[i]]!=undefined && window.word_query_list[window.word_dependency_id_list[i]].trim()!="")
			query1+=window.word_query_list[window.word_dependency_id_list[i]]+" ";
	} 
	
	query2="";
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

	query=query1+query2.trim();
	document.getElementById("cqp").value=query;

	if(query.length>0){
		document.getElementById("cqp").disabled=true;
	}
	else{
		document.getElementById("cqp").disabled=false;	
	}
}

function update_query(){
	
	for(i=0;i<window.word_id_list.length;i++){
		w=$("#"+window.word_id_list[i])[0];
		update_word_query(w);
	}
	
	update_dropdown();
	
	for(i=0;i<window.dependency_id_list.length;i++){
		d=$("#"+window.dependency_id_list[i])[0];
		update_dependency_query(d);
	}
	
	// // >>> update_word_query
	// // >>> update_dropdown
	// // >>> update_dependency_query
	// // >>> write 
	write_query();	
}

function update_dropdown(add_sequence_dependency=false){
	console.log(add_sequence_dependency);
	left=$("select.word_left");

	for(left_word=0;left_word<left.length;left_word++){

		added=false;
		selected_option=left[left_word][left[left_word].selectedIndex].value.split(":")[0].trim();
		left[left_word].options.length=1;
		left[left_word].options[0].selected=true;

		if(add_sequence_dependency && left_word==left.length-1)
			selected_option=window.word_id_list[window.word_id_list.length-2];

		for(left_word_options=0;left_word_options<window.word_id_list.length;left_word_options++){
			
			selected="";
			if(window.word_id_list[left_word_options].trim()==selected_option.trim()){
				selected="selected";
				added=true;
			}

			$(left[left_word]).append(`<option value="${window.word_id_list[left_word_options]}" ${selected}> ${window.word_query_list[window.word_id_list[left_word_options]]} </option>`);
		}
		// parent=$(left[left_word]).closest(".card.shadow")[0];
		// if(added==false && selected_option!="None"){
		// 	console.log(added);
		// 	console.log(selected_option);
		// 	delete_dependency(parent);
		// }
	}

	right=$("select.word_right");
		
	for(right_word=0;right_word<right.length;right_word++){

		added=false;
		selected_option=right[right_word][right[right_word].selectedIndex].value.split(":")[0].trim();
		right[right_word].options.length=1;
		right[right_word].options[0].selected=true;

		if(add_sequence_dependency && right_word==right.length-1)
			selected_option=window.word_id_list[window.word_id_list.length-1];

		for(right_word_options=0;right_word_options<window.word_id_list.length;right_word_options++){
			
			selected="";
			if(window.word_id_list[right_word_options].trim()==selected_option.trim()){
				selected="selected";
				added=true;
			}
			// else{
			// 	console.log(window.word_name_list[window.word_id_list[right_word_options]].trim()+"~"+selected_option.trim())
			// }			
			$(right[right_word]).append(`<option value="${window.word_id_list[right_word_options]}" ${selected}> ${window.word_query_list[window.word_id_list[right_word_options]]} </option>`);
		}
	}
}















	// for(left_word=0;left_word<left.length;left_word++){
		
	// 	added=false;
	// 	selected_option_key=left[left_word][left[left_word].selectedIndex].value.split(":")[0].trim();
	// 	left[left_word].options.length=1;
	// 	left[left_word].options[0].selected=true;
		
	// 	if(add_sequence_dependency && j==left.length-1)
	// 		selected_option=window.word_id_list[window.word_id_list.length-2];
		
	// 	for(left_word_options=0;left_word_options<window.word_id_list.length;left_word_options++){
	// 		selected="";
	// 		if(window.word_id_list[left_word_options].trim()==selected_option_key.trim()){
	// 			selected="selected";
	// 			added=true;
	// 		}
	// 		else{
	// 			console.log(window.word_name_list[window.word_id_list[left_word_options]].trim()+"~"+selected_option_key.trim())
	// 		}			
	// 		$(left[left_word]).append(`<option value="${window.word_id_list[left_word_options]}" ${selected}> ${window.word_query_list[window.word_id_list[left_word_options]]} </option>`);
	// 	}
	// }
		

function add_dependency(add_sequence_dependency=false){
	
	dependency_list=document.getElementsByClassName('dependency_list')[0];

	collapse_list=dependency_list.getElementsByClassName("collapse");
	for(i=0;i<collapse_list.length;i++){
		$(collapse_list[i]).collapse("hide");
	}

	show_collapse="show";
	if(add_sequence_dependency)
		show_collapse="";

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
				            	<option value="before_after" disabled>Before/After</option>
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

	$(dependency_list).append(dependency_box);

	var left_value= $('.left_value',dependency_list).eq(-1)[0];
	var slider = $('.test-slider',dependency_list).eq(-1)[0];
	var right_value=$('.right_value',dependency_list).eq(-1)[0];

	noUiSlider.create(slider, {
	    start: [0,10],
	    connect: true,
	    step: 1,
	    range: {
	        'min': 0,
	        'max': 20
	    },
	    behaviour: 'tap-drag',
        tooltips: true,
        format: wNumb({
            decimals: 0
        })
	});

	var snapValues = [ left_value,right_value ];

	// dep_id=$(`#d${window.dependencycounter}`)[0];
	slider.noUiSlider.on('update', function (values, handle) {
    	snapValues[handle].textContent = parseInt(values[handle]);
    	update_query();
    	// sagar// update_dependency_query(this.target.parentElement.parentElement.parentElement.parentElement.parentElement);
	});

	window.dependency_id_list.push(`d${window.dependencycounter}`);
	window.dependency_query_list[`d${window.dependencycounter}`]="";

	update_dropdown(add_sequence_dependency);
	update_query();
	
	// sagar // update_dependency_query($(`#d${window.dependencycounter}`)[0]);
}

function update_dependency_query(dependency){
	
	left=$(".word_left",dependency)[0];
	dependency_type=$(".dependency_type",dependency)[0];
	proximity=$(".proximity",dependency)[0];
	right=$(".word_right",dependency)[0];

	if(proximity.value =="range"){
		$(".slider",dependency).show();
		from=$(".left_value",dependency)[0].textContent;
		to=$(".right_value",dependency)[0].textContent;
	}
	else{
		$(".slider",dependency).hide();
	}

	if(left.value!="None" && dependency_type.value!="None" && right.value!="None"){

		l=window.word_name_list[left.value.split(":")[0].trim()];
		r=window.word_name_list[right.value.split(":")[0].trim()];
		d=dependency_type.value.trim();
		p=proximity.value.trim();
		
		// if(p=="adjoining"){
		// 	dist="{0}";
		// }
		dist="";
		if(p=="range"){
			dist=`{${from},${to}}`;
			// console.log(dist);
		}
		else if(p=="any"){
			dist="*";
		}
		
		if(d=="before"){
			if(p=="adjoining")
				query=`(${l}.nif:nextWord=${r})`;
			else
				query=`(${l}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${r})`;
		}
		else if(dependency_type.value=="after"){
			if(p=="adjoining")
				query=`(${r}.nif:nextWord=${l})`;
			else
				query=`(${r}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nif:nextWord=${l})`;
		}
		else if(dependency_type.value=="before_after"){
			if(p=="adjoining")
				query=`(${l}.nif:nextWord=${r} | ${r}.nif:nextWord=${l})`;
			else
				query=`((${l}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${r}) | (${r}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${l}))`;
		}
		else if(dependency_type.value=="head"){
			if(p=="adjoining")
				query=`(${l}.conll:HEAD=${r})`;
			else
				query=`(${l}.conll:HEAD=${dependency.id} & ${dependency.id}.conll:HEAD=${r})`;
		}
		else if(dependency_type.value=="child"){
			if(p=="adjoining")
				query=`(${r}.conll:HEAD=${l})`;
			else
				query=`(${r}.conll:HEAD=${dependency.id} & ${dependency.id}.conll:HEAD=${l})`;
		}
		else if(dependency_type.value=="head_child"){
			if(p=="adjoining")
				query=`(${l}.conll:HEAD=${r} | ${r}.conll:HEAD=${l})`;
			else
				query=`((${l}.conll:HEAD=${dependency.id} & ${dependency.id}.conll:HEAD=${r}) | (${r}.nif:nextWord=${dependency.id} & ${dependency.id}.nif:nextWord=${l}))`;
		}		
		if(p!="adjoining" && !window.word_dependency_id_list.includes(`${dependency.id}`))
			window.word_dependency_id_list.push(`${dependency.id}`);
		
		if(p!="adjoining"){
			window.word_query_list[`${dependency.id}`]=`${dependency.id}:[]${dist}`;
		}

		window.dependency_query_list[dependency.id]=query;

		// console.log(query);
		$(".btn",dependency)[0].textContent=query;
		// write_query();
	}
	else{
		$(".btn",dependency)[0].textContent=dependency.id;
		delete window.dependency_query_list[dependency.id];
	}
} 


function delete_dependency(dependency){
	dependency.remove();
	
	delete window.dependency_query_list[dependency.id];
	window.dependency_id_list.splice(window.dependency_id_list.indexOf(dependency.id),1);
	
	delete window.word_query_list[dependency.id];
	window.word_dependency_id_list.splice(window.word_dependency_id_list.indexOf(dependency.id),1);
	
	write_query();
}


function delete_word(word){
	word.remove();

	delete window.word_query_list[word.id];
	delete window.word_name_list[word.id];
	window.word_id_list.splice(window.word_id_list.indexOf(word.id),1);
	// update_dropdown();
	// write_query();
	update_query();	
}

function delete_property(block,word){
	var prop=block.parentElement.parentElement.parentElement;
	if(prop.previousElementSibling!=null && prop.previousElementSibling.textContent=="AND"){
		prop.previousElementSibling.remove();
	}
	else if(prop.nextElementSibling!=null && prop.nextElementSibling.textContent=="AND"){
		prop.nextElementSibling.remove();
	}
	prop.remove();
	update_query();
}

function inverse(sign,word){
	if(sign.classList.contains("fa-equals")){
		// if the sign is equals, then change it to not-equals
		sign.classList.replace("fa-equals","fa-not-equal");
	}
	// check if the sign is not-equals
	else if(sign.classList.contains("fa-not-equal")){
		// if the sign is not-equals, then change it to equals 
		sign.classList.replace("fa-not-equal","fa-equals");
	}

	update_query();
}
