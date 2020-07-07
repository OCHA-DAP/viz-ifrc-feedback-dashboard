// const geodataURL = 'data/geodata_locations.geojson';
const dataURL = 'https://proxy.hxlstandard.org/api/data-preview.csv?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vTQ-Ryt1Obw4bnGaHruXcHDq2pZpxuGjJqsA8ZePTgtiRTtqiy8zSFAH46okegDvdE72J_Se-dva1Nn%2Fpub%3Fgid%3D864201017%26single%3Dtrue%26output%3Dcsv';
// const dataURL = 'data/Feedback_data_consolidated_HDX - DATA.csv';
const langFileURL = 'data/lang.json';
const locationsURL = 'data/locations.csv' ;
const keyFigDataURL = 'https://proxy.hxlstandard.org/data.csv?tagger-match-all=on&tagger-01-header=admin0name&tagger-01-tag=%23country+%2Bname&tagger-02-header=admin1name&tagger-02-tag=%23adm1+%2Bname&tagger-03-header=admin1pcod&tagger-03-tag=%23adm1+%2Bpcode&tagger-04-header=cas_confirmes&tagger-04-tag=%23affected+%2Binfected&tagger-05-header=deces&tagger-05-tag=%23affected+%2Bkilled&tagger-06-header=gueris&tagger-06-tag=%23affected+%2Brecovered&tagger-15-header=coord_x&tagger-15-tag=%23geo+%2Blat&tagger-16-header=coord_y&tagger-16-tag=%23geo+%2Blon&url=https%3A%2F%2Fdata.humdata.org%2Fdataset%2F2ec81cad-04a3-4bfe-b127-c36658947427%2Fresource%2Fab052e46-72e9-4bbf-b9a1-12a285c62fdd%2Fdownload%2Fwca_covid19_data_admin1_master.xlsx&sheet=2&header-row=1&dest=data_view&strip-headers=on';


let langDict;
let lang = 'fr';

let feedbackData;
let dataTableData = [];
let keyFiguresCovid19;
let keyFiguresEbola;

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
      d3.csv(keyFigDataURL)
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
      console.log(locationsData)


      keyFiguresCovid19 = data[3].filter(function(d) {
        return d['#country+name'] == "Democratic Republic of Congo";
      });
      keyFiguresCovid19.forEach( function(element, index) {
        element['#affected+infected'] = +element['#affected+infected'];
        element['#affected+killed'] = +element['#affected+killed'];
        element['#affected+recovered'] = +element['#affected+recovered'];
      });

      
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
      // generateDiseaseKeyFigures();
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




