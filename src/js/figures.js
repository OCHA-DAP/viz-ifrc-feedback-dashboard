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

	$('#covid h4').text(covidLabel);
	$('#covid div.num').text(covidNum);

	$('#ebola h4').text(ebolaLabel)
	$('#ebola div.num').text(ebolaNum);

	$('#global h4').text(globalLabel);
	$('#global div.num').text(globalNum);
} //generateGlobalKeyFigures


function generateDiseaseKeyFigures() {
	var keyFigures = keyFiguresCovid19;
	// (diseaseSelected).toLowerCase() == 'ebola' ? keyFigures = keyFiguresEbola : keyFigures = keyFiguresCovid19;
	console.log(keyFigures)
}//generateDiseaseKeyFigures