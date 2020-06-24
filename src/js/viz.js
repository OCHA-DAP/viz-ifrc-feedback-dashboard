// const geodataURL = 'data/geodata_locations.geojson';
const dataURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWzNKbxmKZ2430Mbri8mNaFP29dFTqgmfgeUxz_Tf-M_75v2_gNi1ZUbIN524_LgfXt4C0P2HlLGZ3/pub?gid=864201017&single=true&output=csv';
//const figuresURL = '';
const langFileURL = 'data/lang.json';

let langDict;
let lang = 'fr';

let feedbackData;

// for filters
let filtersPivotData;
let diseases_data = [];
let type_data = [];
let category_data = [];
let keyword_data = [];

let diseases_filter;
let type_filter;
let category_filter;
let keyword_filter;



$( document ).ready(function() {


  function getData() {
  	Promise.all([
  		// d3.json(geodataURL),
  		d3.json(langFileURL),
  		d3.csv(dataURL)
  	]).then(function(data){

  		langDict = data[0];
      feedbackData = data[1];


  		initialize();
      $('.loader').hide();
      $('main, footer').css('opacity', 1);
  	});

  }

  async function initialize() {
    var diseasePrepend = '<option value="">';
    lang=='fr' ? diseasePrepend += 'Séléctionner maladie</option>' : diseasePrepend += 'Select disease</option>';
    

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


    $('#disease-dropdown').on('change', function(e){
      var selected = $('#disease-dropdown').val();
      if(selected !=" "){
        setFilters(selected);
      }
    });
  } //initialize


  getData();

  $("input[name='langRadio']").change(function(d){
    var en = $("#english").is(':checked') ;
    en ? lang='en' : lang='fr';


    //translate interface
    initialize();

  })


});




