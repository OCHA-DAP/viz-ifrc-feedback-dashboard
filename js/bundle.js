//window.$ = window.jQuery = require('jquery');
let globalDiseaseChart;
let detailedChart;
 let primeColor = '#0073b7' ;

function drawGlobalChart(data) {
	globalDiseaseChart =  c3.generate({
	          bindto: '#global-chart',
	          padding: { left: 250, right: 30 },
	          size: { height: 305 },
	          color:{primeColor},
	          data: {
	              x: 'x',
	              columns: data,
	              type: 'bar',
	          },
	          axis: {
	              rotated: true,
	              x: {
	                  type: 'category',
	                  tick: {
	                      multiline: false,
	                      centered: true,
	                      outer: false
	                  }
	              }
	          },
	          grid: {
	              y: {
	                  show: true
	              }
	          },
	          legend: { hide: 'x' }
	      }); 
}

function drawDetailedChart(data) {
	$('#global-chart').hide();
	detailedChart =  c3.generate({
	          bindto: '#chart',
	          padding: { left: 250, right: 30 },
	          size: { height: 305 },
	          data: {
	              x: 'x',
	              columns: data,
	              type: 'bar',
	          },
	          axis: {
	              rotated: true,
	              x: {
	                  type: 'category',
	                  tick: {
	                      multiline: false,
	                      centered: true,
	                      outer: false
	                  }
	              },
	              y:{
	              	//max: 0,
	              	tick:{
	              		format: d3.format('d'),
	              		//count: 8
	              	}
	              }
	          },
	          grid: {
	              y: {
	                  show: true
	              }
	          },
	          legend: { hide: 'x' }
	      }); 
} //drawDetailedChart



//filter by healthzone
function filterByHealthZone(item) {
	var included = false;
	for (var i=0; i<healthzoneSelection.length; i++) {
	  if (item["Zone de Santé"] == healthzoneSelection[i]) {
	    included = true;
	    break;
	  }
	}
	return included;
}

//filter by category
function filterByCategory(item) {
	var included = false;
	for (var i=0; i<categorySelection.length; i++) {
	  if (item[categoryKey] == categorySelection[i]) {
	    included = true;
	    break;
	  }
	}
	return included;
}

function filterByKeyword(item) {
	var included = false;
	for (var i=0; i<keywordsSelection.length; i++) {
	  if (item[keyWordKey] == keywordsSelection[i]) {
	    included = true;
	    break;
	  }
	}
	return included;
}


let diseaseKey = "Maladie";
let typeKey = "Type";
let categoryKey = "Catégorie";
let keyWordKey = "Mot Clé";
 
function getGlobalData(heathzone) {
	// translate 
	lang=='en' ? diseaseKey = "Disease" : diseaseKey = "Maladie";

	var fromDate = $("#from").datepicker('getDate');
	var toDate = $("#to").datepicker('getDate'); 
	var data;

	data = feedbackData.filter(function(d){
		var date = new Date(d["Date AAAA-MM-JJ"]);
		return date.getTime() >= fromDate.getTime() &&
			date.getTime() <= toDate.getTime();
	});

	if (heathzone !=undefined) {
		data = data.filter(function(d) {
			return d["Zone de Santé"] == heathzone;
		});
	}


	var dataArr = d3.nest()
		.key(function(d) { return d[diseaseKey]; })
		.rollup(function(v) { return d3.sum(v, function(d){ return d['Nbre']; }); })
		.entries(data);

	return dataArr;

}//getGlobalData

function formatGlobalData_pct(data) {
    var yAxisLabel = 'Pourcentage';

    if(lang=='en'){
      areaTitle = '<h3>All diseases overall overview</h3>';
      yAxisLabel = 'Percentage';
    } 

    var x = ['x'];
    var y = [yAxisLabel];

    var total = d3.sum(data, function(d){ return d['value']; });
    data.forEach( function(element, index) {
        var pct = Number(((element['value'] / total)*100).toFixed(2));
        element['value'] = pct ; 
    });
    data.forEach( function(element, index) {
      x.push(element.key);
      y.push(element.value);
    });

    return [x, y]; 
}


function updateGlobalChart() {
	var healthzoneSelected = $('#health-zone-dropdown').val();
	var areaTitle = '<h3>Aperçu global toutes maladies confondues ('+healthzoneSelected+')</h3>';
    if(lang=='en'){
      areaTitle = '<h3>All diseases overall overview ('+healthzoneSelected+')</h3>';
    }
    $('#mainAreaTitle').html(areaTitle);
	
	var data = getGlobalData(healthzoneSelected);
	var newData = formatGlobalData_pct(data);

	globalDiseaseChart.load({
		columns: newData,
		unload: true,
	});
}//updateGlobalChart



function getDetailedData(argument) {
	var data; 

	if (lang=='en') {
		diseaseKey = "Disease";
		typeKey = "Type_english";
		categoryKey = "Category_english";
		keyWordKey = "Key_word_english";
	} else {
		diseaseKey = "Maladie";
		typeKey = "Type";
		categoryKey = "Catégorie";
		keyWordKey = "Mot Clé";		
	}

	data = feedbackData.filter(function(d){
		return d[diseaseKey] == diseaseSelected;
	});
	data = data.filter(function(d){
		return d[typeKey] == typeSelected;
	});
	var fromDate = $("#from").datepicker('getDate');
	var toDate = $("#to").datepicker('getDate');
	
	data = data.filter(function(d){
		var date = new Date(d["Date AAAA-MM-JJ"]);
		return date.getTime() >= fromDate.getTime() &&
			date.getTime() <= toDate.getTime();
	});
	data = data.filter(filterByHealthZone) ;
	data = data.filter(filterByCategory) ;
	data = data.filter(filterByKeyword) ;

	var dataArr = d3.nest()
		.key(function(d){ return d["Zone de Santé"]; })
		.key(function(d){ return d[keyWordKey] ; })
		.rollup(function(v){ return d3.sum(v, function(d){ return d['Nbre']; }); })
		.entries(data)

	return dataArr;
	 
} //getDetailedData

var sort_value = function (d1, d2) {
	if (d1.value > d2.value) return -1;
	if (d1.value < d2.value) return 1;
	return 0;
}

var sort_key = function (d1, d2) {
	if (d1.key > d2.key) return -1;
	if (d1.key < d2.key) return 1;
	return 0;
}

function getSum(healthzone) {
	var rightType = "type";
	lang=="en" ? rightType = "type_en" : null;

	var data = feedbackDataSum.filter(function(d){
		return d.healthzone == healthzone ;
	});
	data = data.filter(function(d) { return d[rightType] == typeSelected; });


	var fromDate = $("#from").datepicker('getDate');
	var toDate = $("#to").datepicker('getDate');
	
	data = data.filter(function(d){
		var date = new Date(d.date);
		return date.getTime() >= fromDate.getTime() &&
			date.getTime() <= toDate.getTime();
	});
	var dataArr = d3.nest()
		.key(function(d) { return [d.healthzone, d[rightType]]; })
		.rollup(function(v){ return d3.sum(v, function(d){ return d.val; }); })
		.entries(data);
	
	return dataArr[0].value; 
} //getSum

function formatDetailedData_pct(data) {
	var x = ['x'],
		columns = [];
	var dataNames = [];


	data.forEach( function(element, index) {
		var total = getSum(element.key);
		dataNames.push(element.key);
		var arr = element.values;
		arr.forEach( function(item) {
			x.includes(item.key) ? '' : x.push(item.key);
			//put value in percentage
			item.value = ((item.value / total)*100).toFixed(2);
		});
	});
	columns.push(x);
	data.forEach( function(element, index) {
		var col = [];
		col.push(element.key)
		for (var i = 1; i < x.length; i++) {
			var val = 0;
			element.values.forEach( function(item) {
				item.key==x[i] ? val = item.value : '';
			});
			col.push(val);
		}
		columns.push(col);
	});

	// toPercentage(data);
	return columns;

}//formatDetailedData

function updateDetailedChart() {
	// var healthzoneSelected = $('#health-zone-dropdown').val();
	// var areaTitle = '<h3>Aperçu global toutes maladies confondues ('+healthzoneSelected+')</h3>';
 //    if(lang=='en'){
 //      areaTitle = '<h3>All diseases overall overview ('+healthzoneSelected+')</h3>';
 //    }
 //    $('#mainAreaTitle').html(areaTitle);
	
	var data = getDetailedData();
	var newData = formatDetailedData_pct(data);

	detailedChart.load({
		columns: newData,
		unload: true,
	});
}//updateDetailedChart










function generateGlobalKeyFigures() {
	var covidLabel = "Données de feedback - Covid-19";
	var ebolaLabel = "Données de feedback - Ebola";
	var globalLabel = "Données de feedback";
	if (lang=="en") {
		covidLabel = "Covid-19 - feedback data";
		ebolaLabel = "Ebola - feedback data";
		globalLabel = "Feedback data";
	}
	var data = d3.nest()
		.key(function(d){ return d['Maladie']; })
		.rollup(function(v){ return v.length ;})
		.entries(feedbackData);

	var covidNum = 0;
	var ebolaNum = 0;
	var globalNum = feedbackData.length;

	data.forEach( function(element, index) {
		var disease = (element.key).toLowerCase();
		disease == 'ebola' ? ebolaNum = element.value : 
		disease == 'covid-19' ? covidNum = element.value : '';
	});

	writeKeyFigures([covidLabel, covidNum], [ebolaLabel, ebolaNum], [globalLabel, globalNum]);
} //generateGlobalKeyFigures


function generateDiseaseKeyFigures() {
	var keyFigures = keyFiguresCovid19;
	// (diseaseSelected).toLowerCase() == 'ebola' ? keyFigures = keyFiguresEbola : keyFigures = keyFiguresCovid19;
	var provinceArr = [];
	for (var i = 0; i < healthzoneSelection.length; i++) {
		zsProvinces.forEach( function(element, index) {
			element.key == healthzoneSelection[i] ? provinceArr.push(element.values[0]['Code']): '';
		});
	}

	var recovered = 0;
	var infected = 0;
	var killed = 0;

	for (var i = 0; i < provinceArr.length; i++) {
		keyFigures.forEach( function(element, index) {
			if (element['#adm1+code']==provinceArr[i]) {
				recovered += element['#affected+recovered'];
				killed += element['#affected+killed'];
				infected += element['#affected+infected'];
			}
		});
	}
	var recoverdLabel = "Covid-19: nombre de guéries (provinces concernées)";
	var casesLabel = "Covid-19: nombre de cas (provinces concernées)";
	var deathLabel = "Covid-19: nombre de morts (provinces concernées)";
	if (lang=="en") {
		recoverdLabel = "Covid-19: number of recovered (related provinces)";
		casesLabel = "Covid-19: number of cases (related provinces)";
		deathLabel = "Covid-19: number of deaths (related provinces)";
	}
	writeKeyFigures([casesLabel, infected], [recoverdLabel, recovered], [deathLabel, killed]);
}//generateDiseaseKeyFigures


function writeKeyFigures(arr1, arr2, arr3) {

	$('#covid h4').text(arr1[0]);
	$('#covid div.num').text(arr1[1]);

	$('#ebola h4').text(arr2[0])
	$('#ebola div.num').text(arr2[1]);

	$('#global h4').text(arr3[0]);
	$('#global div.num').text(arr3[1]); 
}//writeKeyFigures






function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}

function translateInterface() {
    switch(lang) {
        case "en":
            $('div.header > h1').text(langDict.en[0].viz_title);
            break;
        case "fr":
            $('div.header > h1').text(langDict.fr[0].viz_title);
            break;
     } 
}


function getFiltersPivotData() {
    lang == "en" ? categoryKey = "Category_english" : categoryKey = "Catégorie"; 
    dataTableData = [];

    if (lang=='en') {
      filtersPivotData = d3.nest()
          .key(function(d){ return d['Disease']; })
          .key(function(d){ return d['Type_english']; })
          .key(function(d){ return d['Category_english']; })
          .key(function(d){ return d['Key_word_english']; })
          .entries(feedbackData);
    } else {
      filtersPivotData = d3.nest()
          .key(function(d){ return d['Maladie']; })
          .key(function(d){ return d['Type']; })
          .key(function(d){ return d['Catégorie']; })
          .key(function(d){ return d['Mot Clé']; })
          .entries(feedbackData);
    }

  return new Promise(resolve => {
    var arr = [];
    feedbackData.forEach( function(element, index) {
        dataTableData.push([element[categoryKey], element["Histoire"], element["Zone de Santé"]]);
    });
    filtersPivotData.forEach( function(element, index) {
        arr.push(element.key);
    });
    resolve(arr);
  });
}


function getUnqueValues(column) {
    var vals = [];
    var columns = feedbackData.map(function(d){
        return d[column];
    });

    columns.forEach( function(element, index) {
        vals.includes(element) ? '' : vals.push(element);
    });

    return vals;
}//getUnqueValues


function waitForElement(varName){
    if(typeof varName !== "undefined"){
        //variable exists, do what you want
    }
    else{
        setTimeout(waitForElement, 250);
    }
}


function updateDataTableData() {

    if (lang=='en') {
        diseaseKey = "Disease";
        typeKey = "Type_english";
        categoryKey = "Category_english";
        keyWordKey = "Key_word_english";
    } else {
        diseaseKey = "Maladie";
        typeKey = "Type";
        categoryKey = "Catégorie";
        keyWordKey = "Mot Clé";     
    } 

    var data;
    if(typeof healthzoneSelection == "string") {
        data = feedbackData.filter(function(d) {
            return d["Zone de Santé"]==healthzoneSelection;
        })
    } else { 
        data = feedbackData.filter(filterByHealthZone) ;
    }

    if(diseaseSelected !=""){
        data = data.filter(function(d){
            return d[diseaseKey] == diseaseSelected;
        });    
    }

    if(typeSelected !==null){
        data = data.filter(function(d){
            return d[typeKey] == typeSelected;
        });
    }

    if(categorySelection.length !=0){
        data = data.filter(filterByCategory) ;
    }
    if(keywordsSelection.length !=0){
        data = data.filter(filterByKeyword) ;
    }

    var fromDate = $("#from").datepicker('getDate');
    var toDate = $("#to").datepicker('getDate');
    
    data = data.filter(function(d){
        var date = new Date(d["Date AAAA-MM-JJ"]);
        return date.getTime() >= fromDate.getTime() &&
            date.getTime() <= toDate.getTime();
    });

    
    dataTableData = [];
    data.forEach( function(element, index) {
        dataTableData.push([element[categoryKey], element["Histoire"], element["Zone de Santé"]]);
    });

}//updateDataTableData


function toPercentage(data) { 
    console.log(data)

} //toPercentage







let locationsData;
let healthzonesList = [];
let map;

function generateMap() {
  map = L.map('map',
    {
      maxZoom : 10,
      minZoom: 4
    }); 
  map.setView([-0.461, 29.530], 7); //-2.712/23.244 -4.579, 21.887
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hZG91MTciLCJhIjoib3NhRnROQSJ9.lW0PVXVIS-j8dGaULTyupg', { 
    attribution: '<a href="http://mapbox.com">Mapbox</a>'
  }).addTo(map);

  var myFeatureGroup = L.featureGroup().addTo(map).on("click", updateDashoardFromMap);
  var marker, healthZone ;

  var locs = [];
  locationsData.forEach( function(element, index) {
    if (healthzonesList.includes(element.health_zone)) {
      var obj = {
        name : element.health_zone,
        lat  : element.lat,
        lon  : element.lng 
      }
      locs.push(obj);
    }
  });

  locs.forEach( function(element, index) {
    marker = createMarker(element).addTo(myFeatureGroup).bindPopup(element.name);
    healthZone = element.name ;
    marker.healthZone = healthZone ;
  });
}//generateMap

function createMarker(d) {
  return L.marker([d.lat, d.lon], {
      icon: L.icon({
          // className: 'circle',
          iconUrl: '/assets/healthsite-marker-red.png',
          iconSize: [38,50],
          iconAnchor: [20, 60]
      })
  }) 
}//createMarker

function updateDashoardFromMap() {
  // body... 
}//updateDashoardFromMap

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
	var plc_type ;
	var plc_category ;
	var plc_keyword ;

	if (lang=='en') {
		plc_type = "Select type" ;
		plc_category = "Select category" ;
		plc_keyword = "Select keyword";
	} else{
		plc_type = "Séléctionner un type";
		plc_category = "Séléctionner category";
		plc_keyword = "Séléctionner un mot clé";
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






const langFileURL = 'data/lang.json';
const geodataURL = 'data/geodata_locations.geojson';
const dataURL = 'https://proxy.hxlstandard.org/api/data-preview.csv?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vTQ-Ryt1Obw4bnGaHruXcHDq2pZpxuGjJqsA8ZePTgtiRTtqiy8zSFAH46okegDvdE72J_Se-dva1Nn%2Fpub%3Fgid%3D864201017%26single%3Dtrue%26output%3Dcsv';
// const dataURL = 'data/Feedback_data_consolidated_HDX - DATA.csv';

const locationsURL = 'data/locations.csv' ;
const keyFigDataURL = 'data/wca_covid19_data_admin1_master.csv';
const ZSProvincesURL = 'data/drc_zs_provinces.csv';

let langDict;
let lang = 'fr';

let feedbackData;
let dataTableData = [];
let keyFiguresCovid19;
let keyFiguresEbola;
let zsProvinces;

let maxiDate,
    miniDate;

let diseaseSelected;
let typeSelected;
let categorySelection;
let keywordsSelection;
let healthzoneSelection;

let feedbackDataSum = [];

$( document ).ready(function() {

  function getData() {
  	Promise.all([
  		// d3.json(geodataURL),
  		d3.json(langFileURL),
  		d3.csv(dataURL),
      d3.csv(locationsURL),
      d3.csv(keyFigDataURL),
      d3.csv(ZSProvincesURL)
  	]).then(function(data){
  		langDict = data[0];
      data[1].forEach( function(element, index) {
        var d = moment(element["Date AAAA-MM-JJ"],['DD-MM-YYYY']);

        var date = new Date(d.year(), d.month(), d.date())
        element["Date AAAA-MM-JJ"] = date;

        healthzones_data.includes(element["Zone de Santé"]) ? '' : healthzones_data.push(element["Zone de Santé"]);
        healthzonesList.includes(element["Zone de Santé"]) ? '' : healthzonesList.push(element["Zone de Santé"]);

        dataTableData.push([element["Catégorie"], element["Histoire"], element["Zone de Santé"]]);
        var obj = {
          date: date,
          healthzone: element["Zone de Santé"],
          type : element["Type"],
          type_en: element["Type_english"],
          val : Number(element["Nbre"])
        }
        feedbackDataSum.push(obj);
      });
      
      feedbackData = data[1];
      locationsData = data[2];

      keyFiguresCovid19 = data[3].filter(function(d) {
        return d['#country+name'] == "Democratic Republic of Congo";
      });
      keyFiguresCovid19.forEach( function(element, index) {
        element['#affected+infected'] = +element['#affected+infected'];
        element['#affected+killed'] = +element['#affected+killed'];
        element['#affected+recovered'] = +element['#affected+recovered'];
      });


      zsProvinces = d3.nest()
          .key(function(d){ return d['Zone de sante']; })
          .entries(data[4]);


      //get date ranges
      miniDate = new Date(d3.min(feedbackData,function(d){return d["Date AAAA-MM-JJ"];}));
      maxiDate = new Date(d3.max(feedbackData,function(d){return d["Date AAAA-MM-JJ"];}));

  		initialize();
      $('.loader').hide();
      $('main, footer').css('opacity', 1);
  	});

  }

  async function initialize() {
    
    diseases_data = await getFiltersPivotData();  
    
    var diseasePrepend = '<option value="">Séléctionner maladie</option>';
    lang=='en' ? diseasePrepend = '<option value="">Select disease</option></option>': null;
    
    $('#disease-dropdown').multipleSelect('destroy');
    $('#disease-dropdown').empty();
    diseases_filter = d3.select('#disease-dropdown')
          .selectAll("option")
          .data(diseases_data)
          .enter().append("option")
            .text(function(d){ return d; })
            .attr("value", function(d) { return d; });
    
    $('#disease-dropdown').multipleSelect();
    $('#disease-dropdown').prepend(diseasePrepend);
    $('#disease-dropdown').val($('#disease-dropdown option:first').val());
    $('#disease-dropdown').multipleSelect('refresh');


    //date picker
    createDatePicker();

    // healtthzone filter
    // test and create or update selects
    var healthzonePrepend = '<option value="">Séléctionner une zone de santé</option>';
    lang=='en' ? healthzonePrepend = '<option value="">Select health zone</option></option>': null;
    
    $('#health-zone-dropdown').empty();
    $('#health-zone-dropdown').multipleSelect('destroy');
    $('#health-zone-dropdown').removeAttr("multiple");
    healthzones_filter = d3.select('#health-zone-dropdown')
            .selectAll("option")
            .data(healthzones_data)
            .enter().append("option")
              .text(function(d){ return d; })
              .attr("value", function(d) { return d; });
    
    $('#health-zone-dropdown').prepend(healthzonePrepend);
    $('#health-zone-dropdown').val($('#health-zone-dropdown option:first').val());
    $('#health-zone-dropdown').multipleSelect();

    generateGlobalKeyFigures();
    setFilters();
    globalChartsManager();
    generateMap();
    drawTable();
    
    $('#global-chart').show();
    // $('#chart').html('');

  } //initialize

  function globalChartsManager() {
    var areaTitle = 'Aperçu global toutes maladies confondues';
    if(lang=='en'){
      areaTitle = 'All diseases overall overview';
    }
    $('#mainAreaTitle').html(areaTitle);
    // $('.global-chart').html("Global c3 chart") 

    var data = getGlobalData(); 
    var column = formatGlobalData_pct(data);
    drawGlobalChart(column);
  }//globalCharts

  function detailedChartManager() {
    var areaTitle = '<h3>'+diseaseSelected+'</h3>Mot clé pour les categories suivantes :'+categorySelection;
    if(lang=='en'){
      areaTitle = '<h3>'+diseaseSelected+'</h3>Key words for following categories: '+categorySelection;
    }
    $('#mainAreaTitle').html(areaTitle);
    var data = getDetailedData();
    
    if (detailedChart == undefined) {
      var cols = formatDetailedData_pct(data);
      drawDetailedChart(cols);
    } else {
      updateDetailedChart();

    } 
  }//detailedChart

  function drawTable() {
    if($.fn.dataTable.isDataTable( '#datatable' )){
      $('#datatable').dataTable().fnClearTable();
    } else {
      $('#datatable').DataTable({
        data : [],
        "bFilter" : false,
        "bLengthChange" : false
      });
    }
    $('#datatable').dataTable().fnAddData(dataTableData);
  } //drawTable


  function updateDataTable() {
    $('#datatable').dataTable().fnClearTable();
    $('#datatable').dataTable().fnAddData(dataTableData); 
  }

  getData();


  $('#update').on('click', function(d){
    diseaseSelected = $('#disease-dropdown').val();
    typeSelected = $('#type-dropdown').val();
    categorySelection = $('#category-dropdown').val();
    keywordsSelection = $('#keyword-dropdown').val();
    healthzoneSelection = $('#health-zone-dropdown').val();
    
    updateDataTableData();

    if (diseaseSelected=='') {
      updateGlobalChart();
    } else {
      $('#global-chart').hide();
      generateDiseaseKeyFigures();
      detailedChartManager();
    }

    updateDataTable();

  });
  
  $('#disease-dropdown').on('change', function(e){
    var selected = $('#disease-dropdown').val();
    if(selected !=" "){
      // setFilters(selected);
      $('.hideFilters').show();
      var options = getFilterTypeList(selected);
      updateMultipleSelect(type_filter, "type-dropdown", options);
      var prepend = '<option value="">Séléctionner un type</option>';
      lang=='en' ? prepend = '<option value="">Select type</option></option>': null;
      $('#type-dropdown').prepend(prepend);
      $('#type-dropdown').val($('#type-dropdown option:first').val());
      $('#type-dropdown').multipleSelect('refresh');
    }
  });

  $('#type-dropdown').on('change', function(e){
    var selected = $('#type-dropdown').val();
    if(selected !=" "){
      var options = getFilterCategoryList(selected);
      updateMultipleSelect(category_filter, "category-dropdown", options);
    }
  });


  $("input[name='langRadio']").change(function(d){
    var en = $("#english").is(':checked') ;
    en ? lang='en' : lang='fr';

    //translate interface
    $('.hideFilters').hide();
    globalDiseaseChart = globalDiseaseChart.destroy();
    detailedChart != undefined ? detailedChart.destroy() : '';
    map.remove();
    resetFilters(); 
    initialize();

  })


});




