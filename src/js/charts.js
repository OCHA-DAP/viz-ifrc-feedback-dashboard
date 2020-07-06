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









