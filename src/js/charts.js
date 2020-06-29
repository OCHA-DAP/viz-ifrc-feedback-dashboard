let globalDiseaseChart;


function drawGlobalChart(data) {
	 globalDiseaseChart =  c3.generate({
	          bindto: '#global-chart',
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

var selectionHZ;

function filterByHealthZone(item) {
	var included = false;
	for (var i=0; i<selectionHZ.length; i++) {
	  if (item["Zone de Santé"] == selectionHZ[i]) {
	    included = true;
	    break;
	  }
	}
	return included;
}


let diseaseKey = "Maladie";
 
function getGlobalData(heathzone) {
	// translate 
	lang=='en' ? diseaseKey = "Disease" : '';

	var fromDate = $("#from").datepicker('getDate');
	var toDate = $("#to").datepicker('getDate'); 
	var data;

	if (heathzone !=undefined) {
		data = feedbackData.filter(function(d) {
			return d["Zone de Santé"] == heathzone;
		});
	}

	data = feedbackData.filter(function(d){
		var date = new Date(d["Date AAAA-MM-JJ"]);
		return date.getTime() >= fromDate.getTime() &&
			date.getTime() <= toDate.getTime();
	});
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
	var x = ['x', 'Covid-19', 'ebola'];
	var y = ['Percentage', 50, 39.1];
	var newData = formatGlobalData_pct(data);

	globalDiseaseChart.load({
		columns: newData,
		unload: true,
	});
}//updateGlobalChart






