// const geodataURL = 'data/geodata_locations.geojson';
const dataURL = 'https://proxy.hxlstandard.org/api/data-preview.csv?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vTQ-Ryt1Obw4bnGaHruXcHDq2pZpxuGjJqsA8ZePTgtiRTtqiy8zSFAH46okegDvdE72J_Se-dva1Nn%2Fpub%3Fgid%3D864201017%26single%3Dtrue%26output%3Dcsv';
// const dataURL = 'data/Feedback_data_consolidated_HDX - DATA.csv';
const langFileURL = 'data/lang.json';

let langDict;
let lang = 'fr';

let feedbackData;

let maxiDate,
    miniDate;

let diseaseSelected;
let typeSelected;
let categorySelection;
let keywordsSelection;
let healthzoneSelection;

$( document ).ready(function() {

  function getData() {
  	Promise.all([
  		// d3.json(geodataURL),
  		d3.json(langFileURL),
  		d3.csv(dataURL)
  	]).then(function(data){
  		langDict = data[0];
      data[1].forEach( function(element, index) {
        var d = moment(element["Date AAAA-MM-JJ"],['DD-MM-YYYY']);

        var date = new Date(d.year(), d.month(), d.date())
        element["Date AAAA-MM-JJ"] = date;

        healthzones_data.includes(element["Zone de Santé"]) ? '' : healthzones_data.push(element["Zone de Santé"]);
      });
      feedbackData = data[1];
      
      //get date ranges
      miniDate = new Date(d3.min(feedbackData,function(d){return d["Date AAAA-MM-JJ"];}));
      maxiDate = new Date(d3.max(feedbackData,function(d){return d["Date AAAA-MM-JJ"];}));

  		initialize();
      $('.loader').hide();
      $('main, footer').css('opacity', 1);
  	});

  }

  async function initialize() {
    var diseasePrepend = '<option value="">Séléctionner maladie</option>';
    lang=='en' ? diseasePrepend = '<option value="">Select disease</option></option>': null;
    diseases_data = await getFiltersPivotData();  
    if (diseases_filter == undefined) {
      diseases_filter = d3.select('#disease-dropdown')
          .selectAll("option")
          .data(diseases_data)
          .enter().append("option")
            .text(function(d){ return d; })
            .attr("value", function(d) { return d; });
      $('#disease-dropdown').prepend(diseasePrepend);
      $('#disease-dropdown').val($('.disease-dropdown option:first').val());
      $('#disease-dropdown').multipleSelect();
    } else {
      $('#disease-dropdown').empty();
      diseases_filter = d3.select('#disease-dropdown')
        .selectAll("option")
        .data(diseases_data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });
      
      $('#disease-dropdown').prepend(diseasePrepend);
      $('#disease-dropdown').val($('.disease-dropdown option:first').val());
      $('#disease-dropdown').multipleSelect('refresh');

      // reset others filters
      resetFilters();
    }

    //date picker
    createDatePicker();

    // healtthzone filter
    // test and create or update selects
    var healthzonePrepend = '<option value="">Séléctionner une zone de santé</option>';
    lang=='en' ? healthzonePrepend = '<option value="">Select health zone</option></option>': null;
    
    if (healthzones_filter == undefined) {      
      // $('#health-zone-dropdown').empty();
      healthzones_filter = d3.select('#health-zone-dropdown')
            .selectAll("option")
            .data(healthzones_data)
            .enter().append("option")
              .text(function(d){ return d; })
              .attr("value", function(d) { return d; });
        
      $('#health-zone-dropdown').prepend(healthzonePrepend);
      $('#health-zone-dropdown').val($('.health-zone-dropdown option:first').val());
      $('#health-zone-dropdown').multipleSelect();
     } else {
      $('#health-zone-dropdown').multipleSelect('destroy');
      $('#health-zone-dropdown').removeAttr("multiple");
      $('#health-zone-dropdown').empty();
      healthzones_filter = d3.select('#health-zone-dropdown')
        .selectAll("option")
        .data(healthzones_data)
        .enter().append("option")
          .text(function(d){ return d; })
          .attr("value", function(d) { return d; });
      $('#health-zone-dropdown').prepend(healthzonePrepend);
      $('#health-zone-dropdown').val($('.health-zone-dropdown option:first').val());
      $('#health-zone-dropdown').multipleSelect();
      $('#health-zone-dropdown').multipleSelect('refresh');
     }

    
    globalChartsManager();
    detailedChart = undefined;
    $('#global-chart').show();
    $('#chart').html('');

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
    var areaTitle = '<h3>'+diseaseSelected+'</h3>Top 5 mots clés à -selection par defaut->';
    if(lang=='en'){
      areaTitle = '<h3>'+diseaseSelected+'</h3>Top 5 key words in -default selection->';
    }
    var data = getDetailedData();
    var cols = formatDetailedData_pct(data);
    if (detailedChart == undefined) {
      $('#mainAreaTitle').html(areaTitle);
      drawDetailedChart(cols);
    } else {
      console.log("update detailed chart");

    } 
  }//detailedChart


  getData();


  $('#update').on('click', function(d){
    diseaseSelected = $('#disease-dropdown').val();
    typeSelected = $('#type-dropdown').val();
    categorySelection = $('#category-dropdown').val();
    keywordsSelection = $('#keyword-dropdown').val();
    healthzoneSelection = $('#health-zone-dropdown').val();
    
    if (diseaseSelected=='') {
      console.log("should updated global chart");
      updateGlobalChart();
    } else {
      detailedChartManager();
    }

  });
  
  $('#disease-dropdown').on('change', function(e){
    var selected = $('#disease-dropdown').val();
    if(selected !=" "){
      setFilters(selected);
    }
  });

  $("input[name='langRadio']").change(function(d){
    var en = $("#english").is(':checked') ;
    en ? lang='en' : lang='fr';

    //translate interface
    initialize();

  })


});




