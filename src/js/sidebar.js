var multipleSelectOptions =  {
		multiple: true,
		multipleWidth: 1,
		minimumCountSelected: 3,
      	// displayValues: true,
      	selectAll: true
	};

var defaultTypeSelected,
	defaultCategorySelected;

function setFilters(disease) {
	
	updateFiltersData();

	// type filter
	// test and create or update selects 
	if (type_filter == undefined) {
		$('#type-dropdown').empty();
	    type_filter = d3.select('#type-dropdown')
	        .selectAll("option")
	        .data(type_data)
	        .enter().append("option")
	          .text(function(d){ return d; })
	          .attr("value", function(d) { return d; });
	    
	    $('#type-dropdown').multipleSelect({});
	    $('#type-dropdown').val(type_data[0]);
	    $('#type-dropdown').multipleSelect('refresh');
	} else {
		$('#type-dropdown').empty();

    	type_filter = d3.select('#type-dropdown')
        .selectAll("option")
        .data(type_data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });
		
		$('#type-dropdown').val(type_data[0]);
		$('#type-dropdown').multipleSelect('refresh');
	}


	// category filter
	// test and create or update selects 
	if (category_filter == undefined) {
		d3.select('#category-dropdown').attr("multiple", "multiple");
		$('#category-dropdown').empty();
	    category_filter = d3.select('#category-dropdown')
	        .selectAll("option")
	        .data(category_data)
	        .enter().append("option")
	          .text(function(d){ return d; })
	          .attr("value", function(d) { return d; });
	    
	    $('#category-dropdown').multipleSelect({
			minimumCountSelected: 3,
	      	displayValues: true,
	      	selectAll: true
	    });
	    $('#category-dropdown').val(category_data[0]);
	    $('#category-dropdown').multipleSelect('refresh');
	} else {
		$('#category-dropdown').empty();

    	category_filter = d3.select('#category-dropdown')
        .selectAll("option")
        .data(category_data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });
		
		$('#category-dropdown').val(category_data[0]);
		$('#category-dropdown').multipleSelect('refresh');
	}


	// keyword filter
	// test and create or update selects
	if (keyword_filter == undefined) {
		d3.select('#keyword-dropdown').attr("multiple", "multiple");
		$('#keyword-dropdown').empty();
	    keyword_filter = d3.select('#keyword-dropdown')
	        .selectAll("option")
	        .data(keyword_data)
	        .enter().append("option")
	          .text(function(d){ return d; })
	          .attr("value", function(d) { return d; });
	    
	    $('#keyword-dropdown').multipleSelect({
			minimumCountSelected: 3,
	      	displayValues: true,
	      	selectAll: true
	    });
	    $('#keyword-dropdown').val(keyword_data[0]);
	    $('#keyword-dropdown').multipleSelect('refresh');
	 } else {
		$('#keyword-dropdown').empty();

    	keyword_filter = d3.select('#keyword-dropdown')
        .selectAll("option")
        .data(keyword_data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });
		
		$('#keyword-dropdown').val(keyword_data[0]);
		$('#keyword-dropdown').multipleSelect('refresh');
	 } 
	 
}

function updateFiltersData() {
	var disease = $('#disease-dropdown').val();
	
	var byDisease,
		byType,
		byCategory;

	byDisease = filtersPivotData.filter(function(d){
		return d.key == disease;
	})[0].values;

	type_data = [];
	byDisease.forEach( function(element, index) {
		type_data.push(element.key);
	});


	byType = byDisease.filter(function(d){
		return d.key == type_data[0];
	})[0].values;
	category_data = [];
	byType.forEach( function(element, index) {
		category_data.push(element.key);
	});

	byCategory = byType.filter(function(d){
		return d.key == category_data[0];
	})[0].values;
	keyword_data = [];
	byCategory.forEach( function(element, index) {
		keyword_data.push(element.key);
	});

}

function resetFilters() {
	//type filter
	$('#type-dropdown').multipleSelect('destroy');
	var typePrepend = '<option value="">';
    lang=='fr' ? typePrepend += 'Séléctionner un type</option>' : typePrepend += 'Select type</option>';
	$('#type-dropdown').empty(); 
	$('#type-dropdown').prepend(typePrepend);
    $('#type-dropdown').val($('.type-dropdown option:first').val());


	//category filter
	$('#category-dropdown').multipleSelect('destroy');
	$('#category-dropdown').removeAttr("multiple");
	$('#category-dropdown').removeAttr("class");
	var categoryPrepend = '<option value="">';
    lang=='fr' ? categoryPrepend += 'Séléctionner une catégorie</option>' : categoryPrepend += 'Select category</option>';
	$('#category-dropdown').empty(); 
	$('#category-dropdown').prepend(categoryPrepend);
    $('#category-dropdown').val($('.category-dropdown option:first').val());

	//key word filter
	$('#keyword-dropdown').multipleSelect('destroy');
	$('#keyword-dropdown').removeAttr("multiple");
	$('#keyword-dropdown').removeAttr("class");
	var keyWordPrepend = '<option value="">';
    lang=='fr' ? keyWordPrepend += 'Séléctionner un mot clé</option>' : keyWordPrepend += 'Select keyword</option>';
	$('#keyword-dropdown').empty(); 
	$('#keyword-dropdown').prepend(keyWordPrepend);
    $('#keyword-dropdown').val($('.keyword-dropdown option:first').val());

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
} 


