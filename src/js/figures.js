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





