const cum_data = d3.text("death.csv").then(function(raw) {

  var dsv = d3.dsvFormat(';');
  var data = dsv.parse(raw);
  var death_data = {};

  const geolong = {CH: "Switzerland", CH011: "Vaud", CH012: "Valais", CH013: "Genève", CH021: "Bern", CH022: "Freiburg", CH023: "Solothurn", CH024: "Neuchâtel", CH025: "Jura", CH031: "Basel-Stadt", CH032: "Basel-Landschaft", CH033: "Aargau", CH040: "Zürich", CH051: "Glarus", CH052: "Schaffhausen", CH053: "Appenzell Ausserrhoden", CH054: "Appenzell Innerrhoden", CH055: "St. Gallen", CH056: "Graubünden", CH057: "Thurgau", CH061: "Luzern", CH062: "Uri", CH063: "Schwyz", CH064: "Obwalden", CH065: "Nidwalden", CH066: "Zug", CH070: "Ticino"};

  data.forEach(function(d) {
      d['TIME_PERIOD'] = d['TIME_PERIOD'].slice(0,4) + "-" + parseInt(d['TIME_PERIOD'].slice(6));
      d['GEO'] = geolong[d['GEO']];
  });

  death_data['GEO']         = d3.map(data, function(d){return d['GEO'];}).keys()
  death_data['TIME_PERIOD'] = d3.map(data, function(d){return d['TIME_PERIOD'];}).keys()
  death_data['AGE']         = d3.map(data, function(d){return d['AGE'];}).keys()
  death_data['SEX']         = d3.map(data, function(d){return d['SEX'];}).keys()

  regionlist = death_data['GEO'];
  regionlist = regionlist.splice(1);
  regionlist.push('Switzerland');
  death_data['GEO'] = regionlist;

  death_data['AGE'].splice( death_data['AGE'].indexOf('_T'), 1 );

  death_data['GEO'].map((value1, index1) => {
    death_data[value1] = {}
    death_data['TIME_PERIOD'].map((value2, index2) => {
      death_data[value1][value2] = {}
      death_data['AGE'].map((value3, index3) => {
        death_data[value1][value2][value3] = {}
        death_data['SEX'].map((value4, index4) => {
          death_data[value1][value2][value3][value4] = 0
        });
      });
    });
  });

  for (var i = 0; i < data.length; i++) {
    if (data[i]['AGE'] != "_T") {
      death_data[data[i]['GEO']][data[i]['TIME_PERIOD']][data[i]['AGE']][data[i]['SEX']] = parseInt(data[i]['Obs_value'])
    }
  }

  var cum_data = {};
  cum_data['death_data'] = death_data;
  return cum_data;

});

cum_data.then(async function(cum_data) {


  const geoshort = {CH: "Switzerland", VD: "Vaud", VS: "Valais", GE: "Genève", BE: "Bern", FR: "Freiburg", SO: "Solothurn", NE: "Neuchâtel", JU: "Jura", BS: "Basel-Stadt", BL: "Basel-Landschaft", AG: "Aargau", ZH: "Zürich", GL: "Glarus", SH: "Schaffhausen", AR: "Appenzell Ausserrhoden", AI: "Appenzell Innerrhoden", SG: "St. Gallen", GR: "Graubünden", TG: "Thurgau", LU: "Luzern", UR: "Uri", SZ: "Schwyz", OW: "Obwalden", NW: "Nidwalden", ZG: "Zug", TI: "Ticino"};

  corona_data = {};
  corona_data['Switzerland'] = {};
  data = await getCorona();

  for (var line of data) {
    var abbr = line['abbreviation_canton_and_fl'];
    if (abbr == "FL") {
      continue;
    }
    var geo = geoshort[abbr];
    var week = moment(line['date']).isoWeek();
    var year = moment(line['date']).year();
    var act_ts = year + "-" + week;
    var last_ts = year + "-" + String(week-1);
    var ncumul_deceased = parseInt(line['ncumul_deceased'])
    var ncumul_tested = parseInt(line['ncumul_tested'])
    var current_hosp = parseInt(line['current_hosp'])

    corona_data[geo] = typeof(corona_data[geo]) == 'undefined' ? {} : corona_data[geo];
    corona_data[geo][act_ts] = typeof(corona_data[geo][act_ts]) == 'undefined' ? {} : corona_data[geo][act_ts];
    corona_data[geo][act_ts]['deceased'] =  ncumul_deceased;
      
    if (isNaN(corona_data[geo][act_ts]['deceased']) && typeof corona_data[geo][last_ts] !== "undefined" && !isNaN(corona_data[geo][last_ts]['deceased'])) {
      corona_data[geo][act_ts]['deceased'] = corona_data[geo][last_ts]['deceased']
    } else if (isNaN(corona_data[geo][act_ts]['deceased'])) {
      corona_data[geo][act_ts]['deceased'] = 0;
    }
  }

  console.log(corona_data);
  
  cum_data['corona_data'] = corona_data;
  return cum_data;

}).then(async function(cum_data) {
  
  var death_data = cum_data['death_data']
  var corona_data = cum_data['corona_data']

  var region_data = {};
  var region_data_keys = [];
  for (var geo of death_data['GEO']) {
    region_data[geo] = [] 
    for (var act_ts in death_data[geo]) {
      var values = {} 
      var week = act_ts.slice(5);
      var year = act_ts.slice(0,4);
      var last_ts = year + "-" + String(week-1);
      values['TIME_PERIOD'] = "W"+week;
      if (region_data_keys.indexOf("W"+week) === -1) {
        region_data_keys.push("W"+week);
      }
      for (var age in death_data[geo][act_ts]) {
        values[age] = death_data[geo][act_ts][age]['T']
      };
      if (geo != 'Switzerland') {
        if (typeof corona_data[geo] !== "undefined" && typeof corona_data[geo][act_ts] !== "undefined") {
          if (typeof corona_data[geo][last_ts] !== "undefined") {
            values['Corona'] = corona_data[geo][act_ts]['deceased'] - corona_data[geo][last_ts]['deceased'];
          } else {
            values['Corona'] = corona_data[geo][act_ts]['deceased']
          }
        } else {
          values['Corona'] = 0;
        }
      } else {
        values['Corona'] = corona_data[geo][act_ts]['deceased']
      }
      if (geo != 'Switzerland') {
        if (typeof(corona_data['Switzerland'][act_ts]) == 'undefined') {
          corona_data['Switzerland'][act_ts] = {};
          corona_data['Switzerland'][act_ts]['deceased'] = 0;
        } 
        corona_data['Switzerland'][act_ts]['deceased'] += values['Corona'];
      }
      region_data[geo].push(values)
      if (values['Corona'] < 0) {
        console.log(geo);
        console.log(act_ts);
        console.log(last_ts);
      }
    };   
  };

  console.log(region_data);

  var divWidth = 1200;
  var divHeight = 800;
  var margin = {top: 20, right: 20, bottom: 30, left: 40}
    width = divWidth - margin.left - margin.right,
    height = divHeight - margin.top - margin.bottom;

  // set x scale
  var x = d3.scaleBand()
    .rangeRound([0, width - 80])
    .paddingInner(0.05)
    .align(0.1);

  // set y scale
  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  // set the colors
  var colors = d3.schemeSpectral[11].reverse();

  //var colors = d3.scaleSequential().domain([1, 19]).range([0, 1])
  //console.log(colors)

  var z = d3.scaleOrdinal()
    .range(colors);

  var keys = ['Y0T4', 'Y5T9', 'Y10T14', 'Y15T19', 'Y20T24', 'Y25T29', 'Y30T34', 'Y35T39', 'Y40T44', 'Y45T49', 'Y50T54', 'Y55T59', 'Y60T64', 'Y65T69', 'Y70T74', 'Y75T79', 'Y80T84', 'Y85T89', 'Y_GE90', 'Corona']

  x.domain(region_data_keys);
  y.domain([0, 2500]).nice();
  z.domain(keys);

  for (var region in region_data) {
    var svg = d3.select("body")
      .append("div")    
      .attr("width", divWidth)
      .attr("height", divHeight)
      .attr("style", "margin: 50px")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", "0 0 " + divWidth  + " " + divHeight)
    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("text")
      .attr("x", 30)
      .attr("y", 00)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text(region)
      .style("font", "23px avenir")
      .style("fill", "#000000");

    g.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(region_data[region]))
      .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) { return x(d.data['TIME_PERIOD']); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())
      .on("mouseover", function() { tooltip.style("display", null); })
      .on("mouseout", function() { tooltip.style("display", "none"); })
      .on("mousemove", function(d) {
        var xPosition = d3.mouse(this)[0] - 5;
        var yPosition = d3.mouse(this)[1] - 5;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(d[1]-d[0]);
      });

    g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text") 
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start");

    var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

    legend.append("text")
      .attr("x", width - 30)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");
      
    tooltip.append("rect")
      .attr("width", 60)
      .attr("height", 20)
      .attr("fill", "white")
      .style("opacity", 0.5);

    tooltip.append("text")
      .attr("x", 30)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

  };
});

async function getCorona() {
  const data = await d3.csv('corona.csv');
  //return Promise.resolve(data);
  return data;
}
