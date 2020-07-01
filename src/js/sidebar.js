// for filters
let filtersPivotData;
let diseases_data = [];
let type_data = [];
let category_data = [];
let keyword_data = [];
let healthzones_data = [];

let diseases_filter;
let type_filter;
let category_filter;
let keyword_filter;
let healthzones_filter;

let multipleSelectOptions =  {
		minimumCountSelected: 3,
      	displayValues: true,
      	selectAll: true
	};


// date picker
let datePickerFrom,
	datePickerTo;

function setFilters() {
	var plc_type = "Séléctionner un type";
	var plc_category = "Selectionner category";
	var plc_keyword = "Séléctionner un mot clé";

	if (lang=='en') {
		plc_type = "Select type" ;
		plc_category = "Select category" ;
		plc_keyword = "Select keyword";
	}
	// filter type
	$('#type-dropdown').multipleSelect({
		placeholder: plc_type
	});
	$('#type-dropdown').multipleSelect('refresh');


	// category filter
	d3.select('#category-dropdown').attr("multiple", "multiple");
	$('#category-dropdown').multipleSelect({
		minimumCountSelected: 3,
      	displayValues: true,
      	selectAll: false,
      	placeholder: plc_category,
      	onClose: function(){
      		diseaseSelected = $('#disease-dropdown').val();
    		typeSelected = $('#type-dropdown').val();
    		categorySelection = $('#category-dropdown').val();
      		if(categorySelection.length !=0) {
      			updateKeyWordFilter();
      		}
      		
      	}
	});    
	$('#category-dropdown').multipleSelect('refresh');

	// keyword filter
	d3.select('#keyword-dropdown').attr("multiple", "multiple");	    
	$('#keyword-dropdown').multipleSelect({
		minimumCountSelected: 3,
      	displayValues: true,
      	selectAll: false,
      	placeholder: plc_keyword,
      	onClose: function(){
      		diseaseSelected = $('#disease-dropdown').val();
    		typeSelected = $('#type-dropdown').val();
    		categorySelection = $('#category-dropdown').val();
    		keywordsSelection = $('#keyword-dropdown').val();
    		if (keywordsSelection !=0) {
    			updateHealthzoneFilter();
    		}      		
      	}
	});
	$('#keyword-dropdown').multipleSelect('refresh'); 
	 
}


function resetFilters() {
	//type filter
	$('#type-dropdown').empty();
	$('#type-dropdown').multipleSelect('destroy');


	//category filter
	$('#category-dropdown').empty();
	$('#category-dropdown').multipleSelect('destroy');
	$('#category-dropdown').removeAttr("multiple");
	$('#category-dropdown').removeAttr("class");
	

	//key word filter
	$('#keyword-dropdown').empty();
	$('#keyword-dropdown').multipleSelect('destroy');
	$('#keyword-dropdown').removeAttr("multiple");
	$('#keyword-dropdown').removeAttr("class");
	

}//resetFilters


// create a multipleSelect 
function createMultipleSelect(id, data) {
    var dropDown = d3.select('#' +id)
        .selectAll("option")
        .data(data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });
    
    $('#' +id).multipleSelect({multipleSelectOptions});

    return dropDown;
}

// update dropdwown's content
function updateMultipleSelect(filterName, id, data) {
	$('#' +id).empty();

    filterName = d3.select('#' +id)
        .selectAll("option")
        .data(data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });

	$('#' +id).multipleSelect('refresh'); 

} //updateMultipleSelect



// update healthzone's content
function updateHealthzoneMultipleSelect(data) {
	var plc_healthzone = "Séléctionner une zone de santé";
	lang=='en' ? plc_healthzone = "Select health zone" : null;

	$('#health-zone-dropdown').empty();
	$('#health-zone-dropdown').multipleSelect('destroy');
	d3.select('#health-zone-dropdown').attr("multiple", "multiple");
	$('#health-zone-dropdown').removeAttr("class");

    healthzones_filter = d3.select('#health-zone-dropdown')
        .selectAll("option")
        .data(data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });
	
	$('#health-zone-dropdown').multipleSelect({
		minimumCountSelected: 3,
      	displayValues: true,
      	selectAll: false,
      	placeholder: plc_healthzone		
	});
	$('#health-zone-dropdown').multipleSelect('refresh'); 

} //updateMultipleSelect


function createDatePicker(argument) { 
	if (datePickerFrom==undefined) {
		datePickerFrom = $('#from')
			.datepicker({
				minDate: miniDate,
				maxDate: maxiDate
			});
		datePickerTo = $('#to')
			.datepicker({
				minDate: miniDate,
				maxDate: maxiDate
			});
	}
	$("#from").datepicker( "setDate" , miniDate );
    $("#to").datepicker( "setDate" , maxiDate );
} //createDatePicker


function getFilterTypeList (disease) {
	lang=='en' ? diseaseKey = "Disease" : '';
	var arr,
		ret =[];

	filtersPivotData.forEach( function(element, index) {
		element.key == disease ? arr = element : '';
	});
	arr.values.forEach( function(element, index) {
		ret.push(element.key)
	});
	return ret;
} //getFilterTypeList


function getFilterCategoryList(tSelected) {
	if (lang=='en') {
		diseaseKey = "Disease";
		typeKey = "Type_english";
	}
	var byDiseaseArr,
		bytype,
		ret =[];

	var dSelected = $('#disease-dropdown').val();

	filtersPivotData.forEach( function(element, index) {
		element.key == dSelected ? byDiseaseArr = element : '';
	});

	byDiseaseArr.values.forEach( function(element, index) {
		element.key == tSelected ? bytype = element : '';
	});

	bytype.values.forEach( function(element, index) {
		ret.push(element.key)
	});
	return ret;
} //getFilterCategoryList

function getFilterkeywordList() {
	if (lang=='en') {
		diseaseKey = "Disease";
		typeKey = "Type_english";
		categoryKey = "Category_english";
	}
	var byDiseaseArr,
		byType,
		bycategory = [],
		ret =[];


	filtersPivotData.forEach( function(element, index) {
		element.key == diseaseSelected ? byDiseaseArr = element.values : '';
	});

	byDiseaseArr.forEach( function(element, index) {
		element.key == typeSelected ? byType = element.values : '';
	});

	byType.forEach( function(element, index) {
		categorySelection.includes(element.key) ? bycategory.push(element) : '';
	});

	for (var i = 0; i < bycategory.length; i++) {
		bycategory[i].values.forEach( function(element, index) {
			ret.push(element.key);
		});
	}
	return ret;
} //getFilterTypeList

function getFilterHealthzonesList() {
	if (lang=='en') {
		diseaseKey = "Disease";
		typeKey = "Type_english";
		categoryKey = "Category_english";
	}
	var byDiseaseArr,
		byType,
		bycategory = [],
		ret =[];


	filtersPivotData.forEach( function(element, index) {
		element.key == diseaseSelected ? byDiseaseArr = element.values : '';
	});

	byDiseaseArr.forEach( function(element, index) {
		element.key == typeSelected ? byType = element.values : '';
	});

	byType.forEach( function(element, index) {
		categorySelection.includes(element.key) ? bycategory.push(element) : '';
	});

	var arr = [];
	for (var i = 0; i < bycategory.length; i++) {
		bycategory[i].values.forEach( function(element, index) {
			arr.push(element.values)
			for (var j = 0; j < element.values.length; j++) {
				ret.includes(element.values[j]["Zone de Santé"]) ? '': ret.push(element.values[j]["Zone de Santé"]);
			}
		});
	}
	return ret;
} //getFilterHealthzonesList


function updateKeyWordFilter() {
	var options = getFilterkeywordList();
	updateMultipleSelect(keyword_filter, "keyword-dropdown", options); 
}//updateKeyWordFilter

function updateHealthzoneFilter() {
	var options = getFilterHealthzonesList();
	updateHealthzoneMultipleSelect(options); 
}//updateKeyWordFilter





