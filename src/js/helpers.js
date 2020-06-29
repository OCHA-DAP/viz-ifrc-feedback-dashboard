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








