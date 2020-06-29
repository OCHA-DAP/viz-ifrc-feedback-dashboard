// const geodataURL = 'data/geodata_locations.geojson';
// const dataURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWzNKbxmKZ2430Mbri8mNaFP29dFTqgmfgeUxz_Tf-M_75v2_gNi1ZUbIN524_LgfXt4C0P2HlLGZ3/pub?gid=864201017&single=true&output=csv';
const dataURL = 'data/Feedback_data_consolidated_HDX - DATA.csv';

//const figuresURL = '';
const langFileURL = 'data/lang.json';

let langDict;
let lang = 'fr';

let feedbackData;

let maxiDate,
    miniDate;


$( document ).ready(function() {

  function getData() {
  	Promise.all([
  		// d3.json(geodataURL),
  		d3.json(langFileURL),
  		d3.csv(dataURL)
  	]).then(function(data){
  		langDict = data[0];
      data[1].forEach( function(element, index) {
        var d = moment(element["Date AAAA-MM-JJ"],['DD/MM/YYYY']);
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

    
    globalCharts();

  } //initialize

  function globalCharts() {
    var areaTitle = '<h3>Aperçu global toutes maladies confondues</h3>';
    if(lang=='en'){
      areaTitle = '<h3>All diseases overall overview</h3>';
    }
    $('#mainAreaTitle').html(areaTitle);
    // $('.global-chart').html("Global c3 chart") 

    var data = getGlobalData(); 
    var column = formatGlobalData_pct(data);

    drawGlobalChart(column);
  }//globalCharts


  getData();


  $('#update').on('click', function(d){
    var diseaseSelected = $('#disease-dropdown').val();
    
    if (diseaseSelected=='') {
      console.log("should updated global chart");
      updateGlobalChart();
    } else {
      console.log("should updated detail chart");
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




