const sorted = d3.text("death.csv").then(function(raw) {

  var dsv = d3.dsvFormat(';');
  var data = dsv.parse(raw);
  var sorted = {};

//  var parseDate = d3.utcParse("%Y-W%W");
//
//  data.forEach(function(d) {
//      d['TIME_PERIOD'] = parseDate(d['TIME_PERIOD']);
//  });

  data.forEach(function(d) {
      d['TIME_PERIOD'] = d['TIME_PERIOD'].slice(5);
  });

  sorted['GEO']         = d3.map(data, function(d){return d['GEO'];}).keys()
  sorted['TIME_PERIOD'] = d3.map(data, function(d){return d['TIME_PERIOD'];}).keys()
  sorted['AGE']         = d3.map(data, function(d){return d['AGE'];}).keys()
  sorted['SEX']         = d3.map(data, function(d){return d['SEX'];}).keys()

  sorted['AGE'].splice( sorted['AGE'].indexOf('_T'), 1 );

  sorted['GEO'].map((value1, index1) => {
    sorted[value1] = {}
    sorted['TIME_PERIOD'].map((value2, index2) => {
      sorted[value1][value2] = {}
      sorted['AGE'].map((value3, index3) => {
        sorted[value1][value2][value3] = {}
        sorted['SEX'].map((value4, index4) => {
          sorted[value1][value2][value3][value4] = 0
        });
      });
    });
  });

  for (var i = 0; i < data.length; i++) {
    if (data[i]['AGE'] != "_T") {
      sorted[data[i]['GEO']][data[i]['TIME_PERIOD']][data[i]['AGE']][data[i]['SEX']] = parseInt(data[i]['Obs_value'])
    }
  }

  return sorted;
});

sorted.then(function(sorted) {

  var margin = {top: 20, right: 20, bottom: 30, left: 40}
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  // create the svg
  var svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 1200 800")

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set x scale
  var x = d3.scaleBand()
    .rangeRound([0, width - 80])
    .paddingInner(0.05)
    .align(0.1);

  // set y scale
  var y = d3.scaleLinear()
    .rangeRound([height, 0]);



  // set the colors
  var colors = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a"];
  var z = d3.scaleOrdinal()
    .range(colors);

  var keys = ['Y0T4', 'Y5T9', 'Y10T14', 'Y15T19', 'Y20T24', 'Y25T29', 'Y30T34', 'Y35T39', 'Y40T44', 'Y45T49', 'Y50T54', 'Y55T59', 'Y60T64', 'Y65T69', 'Y70T74', 'Y75T79', 'Y80T84', 'Y85T89', 'Y_GE90']

  x.domain(sorted['TIME_PERIOD']);
  y.domain([0, 2000]).nice();
  z.domain(keys);

  var cantons = {};
  
  for (var geo of sorted['GEO']) {
    cantons[geo] = [] 
    for (var timestamp in sorted[geo]) {
      var values = {} 
      values['TIME_PERIOD'] = timestamp
      for (var age in sorted[geo][timestamp]) {
        values[age] = sorted[geo][timestamp][age]['T']
      };
      cantons[geo].push(values)
    };   
  };

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(cantons['CH']))
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
});

