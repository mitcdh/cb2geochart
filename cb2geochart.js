(function () {
  google.charts.load('current', {
    'packages':['geochart'],
  });

  let countries;

  fetch('countries.json')
    .then(response => response.json())
    .then(json => {
      countries = json;
    })
    .catch(error => console.error(error));

  function getCountryRecord(country) {
    const countryUpperCase = country.toUpperCase();
    const countryLowerCase = country.toLowerCase();
  
    // Search for an exact match of the alpha-2 or alpha-3 code
    for (let i = 0, len = countries.length; i < len; i++) {
      const countryRecord = countries[i];
      if (countryRecord['alpha_2'] === countryUpperCase || countryRecord['alpha_3'] === countryUpperCase) {
        return countryRecord;
      }
    }
  
    // Search for a match of the country name
    for (let i = 0, len = countries.length; i < len; i++) {
      const countryRecord = countries[i];
      if (countryRecord['name'].toLowerCase() === countryLowerCase) {
        return countryRecord;
      }
    }
  
    // Search for a match of an alternative name
    for (let i = 0, len = countries.length; i < len; i++) {
      const countryRecord = countries[i];
      for (let j = 0, altLen = countryRecord['alternative_names'].length; j < altLen; j++) {
        const alternativeName = countryRecord['alternative_names'][j];
        if (alternativeName === country.normalize("NFKD").toLowerCase()) {
          return countryRecord;
        }
      }
    }
    console.info("No country match found for '" + country + "'");
  }

  function generateCountryData(list) {
    var countryData = [];
    var countryCounts = {};

    for (var i = 0; i < list.length; i++) {
      var countryRecord = getCountryRecord(list[i]);
      if (countryRecord) {
        var alpha2 = countryRecord.alpha_2;
        if (!countryCounts[alpha2]) {
          countryCounts[alpha2] = 0;
        }
        countryCounts[alpha2]++;
      }
    }

    for (var country in countryCounts) {
      countryData.push([country, countryCounts[country], getCountryRecord(country).name]);
    }
    return countryData;
  }

  // function drawRegionsMap(countryData) {
  //   var data = google.visualization.arrayToDataTable(countryData);
  //   var options = {};
  //   var chart = new google.visualization.GeoChart(document.getElementById('output'));

    // google.visualization.events.addListener(chart, 'ready', function () {
    //   download.innerHTML = '<a download="chart.png" href="' + chart.getImageURI() + '">Download as PNG</a>';
    // });

  //   chart.draw(data, options);
  // }

  // https://stackoverflow.com/questions/11098153/geochart-using-iso-3266-2-region-code-but-show-real-name
  function drawRegionsMap(countryData) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Country');
    data.addColumn('number', 'Count');
    data.addColumn('string', 'Name');

    data.addRows(countryData);

    var geochart = new google.visualization.GeoChart(document.getElementById('output'));

    var formatter = new google.visualization.PatternFormat('{1}');  
    formatter.format(data, [0, 2]);

    var view = new google.visualization.DataView(data);
    view.setColumns([0, 1]);  

    google.visualization.events.addListener(geochart, 'ready', function () {
      download.innerHTML = '<a download="chart.png" href="' + geochart.getImageURI() + '">Download as PNG</a>';
    });

    var options = {};
    geochart.draw(view, options);
  }

  // http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
  document.addEventListener('DOMContentLoaded', function () {
    var info = document.querySelector('#info');
    var pastebin = document.querySelector('#pastebin');
    var output = document.querySelector('#output');
    var wrapper = document.querySelector('#wrapper');

    document.addEventListener('keydown', function (event) {
      if (event.ctrlKey || event.metaKey) {
        if (String.fromCharCode(event.which).toLowerCase() === 'v') {
          pastebin.innerHTML = '';
          pastebin.focus();
          info.classList.add('d-none');
          wrapper.classList.add('d-none');
        }
      }
    });

    pastebin.addEventListener('paste', function () {
      setTimeout(function () {
        var html = pastebin.innerText;
        var countryList = html.split(/\r?\n/);
        var countryData = generateCountryData(countryList);
        console.log(countryData);
        wrapper.classList.remove('d-none');

        drawRegionsMap(countryData);
      }, 200);
    });
  });
})();