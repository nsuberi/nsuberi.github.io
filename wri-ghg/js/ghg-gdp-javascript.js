//
// Global variables
//

// Sets up page layout
var margin = { top: 50, right: 20, bottom: 50, left: 50 };
var width = 530 - margin.left - margin.right;
var height = 560 - margin.top - margin.bottom;

var map_width = 620;
var map_height = 560;
  
// If true, will cycle through data
var playing = true;

// Currently displayed data
var year = 2000;
var selected_country = "WLD";
var active_metric = "CO2";
var active_ymetric = "GDP";

// Dictionaries for matching data w/ map
var isoLookup = {};
var idLookup = {};

// This is the variable that all data will be stored into
var lookup = {};

// Excluded countries, for one reason or another
var exclude = ["AFG", "COD", "LBY", "LCA", "LIE", "LSO", "MCO", "MDA", "NRU", "PRK", "ROU", "SMR", "SOM", "SSD", "SYR", "TLS", "TUV", "WLD"];

//
// List all metrics, for looping over
//

//
// Text and unit formatters, have to be defined above metric_lookup
//

var format = d3.format(".0%");

var default_format = d3.format(",.2r");

var format_si = d3.format(".2s");

function format_abbrev(x) {
  var s = format_si(x);
  switch (s[s.length - 1]) {
    case "G": return s.slice(0, -1) + "B";
  }
  return s;
}

var metrics = [
   "index_territorial", 
   "consumption_co2", 
   "GDP", 
   "CO2", 
   "abs_carbon", 
   "life_expectancy_at_birth_total_years_sp_dyn_le00_in", 
   "individuals_using_the_internet_of_population_it_net_user_z", 
   "employment_to_population_ratio_15_total_modeled_ilo_est", 
   "abs_gdp", 
   "access_to_electricity_of_population_eg_elc_accs_zs", 
   "household_final_consumption_expenditure_per_capita_constant_20", 
   "merchandise_imports_current_us_tm_val_mrch_cd_wt", 
   "industry_value_added_constant_2010_us_nv_ind_totl_kd", 
   "net_migration_sm_pop_netm", 
   "total_natural_resources_rents_of_gdp_ny_gdp_totl_rt_zs", 
   "renewable_energy_consumption_of_total_final_energy_consumpti", 
   "urban_population_of_total_sp_urb_totl_in_zs", 
   "proportion_of_seats_held_by_women_in_national_parliaments"
 ];

// Have to fill in units for GDP, index_territorial, employment to population ratio

var metric_lookup = {
  "GDP": {
    "key": "GDP",
    "name": "GDP Change",
    "units": "",
    "scale": "d3.scaleLinear",
    "format": format,
    "extent": [-0.3,0.3],
    "longextent": [-0.5,3]
  },
  "CO2": {
    "key": "CO2",
    "name": "Fossil fuels and cement production emissions by country (territorial, GCB)",
    "units": "change based on Mt C",
    "scale": "d3.scaleLinear",
    "format": format,
    "extent": [-0.3,0.3],
    "longextent": [-0.5,3]
  },
  "abs_carbon": {
    "key": "abs_carbon",
    "name": "Fossil fuels and cement production emissions by country (territorial, GCB)",
    "units": "Mt C",
    "scale": "d3.scaleLinear",
    "format": default_format,
    "extent": [0,10000],
    "longextent": [-0.5,3]
  },
  "consumption_co2": {
    "key": "consumption_co2",
    "name": "Consumption emissions (GCB)",
    "units": "change based on Mt C",
    "scale": "d3.scaleLinear",
    "format": format,
    "extent": [-0.3,0.3],
    "longextent": [-0.5,3]
  },
  "index_territorial": {
    "key": "index_territorial",
    "name": "Territorial ICGGD",
    "units": "",
    "scale": "d3.scaleLinear",
    "format": default_format,
    "extent": [-1,2],
    "longextent": [-0.5,3]
  },
  "life_expectancy_at_birth_total_years_sp_dyn_le00_in": {
    "key": "life_expectancy_at_birth_total_years_sp_dyn_le00_in",
    "name": "Life expectancy at birth, total",
    "units": "years",
    "scale": "d3.scaleLinear",
    "format": default_format
  },
  "individuals_using_the_internet_of_population_it_net_user_z": {
    "key": "individuals_using_the_internet_of_population_it_net_user_z",
    "name": "Individuals using the Internet",
    "units": "of population",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "employment_to_population_ratio_15_total_modeled_ilo_est": {
    "key": "employment_to_population_ratio_15_total_modeled_ilo_est",
    "name": "Employment to population ratio, 15+, total (modeled ILO estimate)",
    "units": "",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "abs_gdp": {
    "key": "abs_gdp",
    "name": "GDP",
    "units": "constant 2010 US$",
    "scale": "d3.scaleLinear",
    "format": format_si,
    "extent": [0,2e13],
    "longextent": [1,1e15]
  },
  "access_to_electricity_of_population_eg_elc_accs_zs": {
    "key": "access_to_electricity_of_population_eg_elc_accs_zs",
    "name": "Access to electricity",
    "units": "of population",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "household_final_consumption_expenditure_per_capita_constant_20": {
    "key": "household_final_consumption_expenditure_per_capita_constant_20",
    "name": "Household final consumption expenditure per capita",
    "units": "constant 2010 US$",
    "scale": "d3.scaleLinear",
    "format": default_format
  },
  "merchandise_imports_current_us_tm_val_mrch_cd_wt": {
    "key": "merchandise_imports_current_us_tm_val_mrch_cd_wt",
    "name": "Merchandise imports",
    "units": "change of current US$",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "industry_value_added_constant_2010_us_nv_ind_totl_kd": {
    "key": "industry_value_added_constant_2010_us_nv_ind_totl_kd",
    "name": "Industry, value added",
    "units": "change of constant 2010 US$",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "net_migration_sm_pop_netm": {
    "key": "net_migration_sm_pop_netm",
    "name": "Net migration",
    "units": "number of persons",
    "scale": "d3.scaleLinear",
    "format": format_abbrev
  },
  "total_natural_resources_rents_of_gdp_ny_gdp_totl_rt_zs": {
    "key": "total_natural_resources_rents_of_gdp_ny_gdp_totl_rt_zs",
    "name": "Total natural resources rents",
    "units": "of GDP",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "renewable_energy_consumption_of_total_final_energy_consumpti": {
    "key": "renewable_energy_consumption_of_total_final_energy_consumpti",
    "name": "Renewable energy consumption",
    "units": "change of share of total final energy consumption",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "urban_population_of_total_sp_urb_totl_in_zs": {
    "key": "urban_population_of_total_sp_urb_totl_in_zs",
    "name": "Urban population",
    "units": "of total",
    "scale": "d3.scaleLinear",
    "format": format
  },
  "proportion_of_seats_held_by_women_in_national_parliaments": {
    "key": "proportion_of_seats_held_by_women_in_national_parliaments",
    "name": "Proportion of seats held by women in national parliaments",
    "units": "of total seats",
    "scale": "d3.scaleLinear",
    "format": format
  }
}
















//
// Permanent components
//

// Tooltip, will appear for any mouseover events on the scatter or map
var tooltip = d3.select("#tooltip");

// Country label for over the wb_data indicator plumb-lines
d3.select("body")
  .append("h3")
  .attr("class", "country-label")
  .text(function(d) { return "Global"; });


//
// Create map_container
//

var map_container = d3.select("body")
  .append("div")
    .style("width", map_width + "px")
    .style("height", map_height + "px")
    .style("position", "relative")
    .style("display", "inline-block");

// add link to the scatterplot (2-axis to 1-axis transition)
map_container.append("a")
  .text("Colored by Territorial ICGGD Value")
  .attr("href", "../scatterplot/04_divergence_final.html")
  .style("position", "absolute")
  .style("top", (map_height-40) + "px")
  .style("left", (map_width/2-40) + "px")


// Set map projection, graticule
var projection = d3.geoTimes()
    .scale((map_width - 4) / (1.5 * Math.PI))
    .translate([map_width / 2, map_height / 2])
    .precision(0.1);

var path = d3.geoPath()
    .projection(projection);

// graticule is a grid that shows lat/lon grid over Earth
var graticule = d3.geoGraticule();


// append SVG inside the map_container, set to same width of the containing div
var map_svg = map_container
  .append("svg")
    .attr("width", map_width)
    .attr("height", map_height);


// what are these, defs, use-stroke, use-fill, path
map_svg.append("defs").append("path")
    .datum(graticule.outline())
    .attr("id", "sphere")
    .attr("d", path);

map_svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

map_svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

map_svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

    //
    // Set up map geojson
    //
  
    // import data, draw lines
    d3.json("../data/world-50m.json", function(error, world) {
      if (error) throw error;

    // draw country boundaries
    map_svg.selectAll("path.country")
        .data(topojson.feature(world, world.objects.countries).features)
      .enter().append("path")
        .attr("class", "country")
        .attr("d", path);

    map_svg.insert("path", ".graticule")
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", path);

    }
  )
      
    // Create look-up table with iso3 codes to match map IDs
    d3.csv("../data/iso-3166.csv", function(error, isoCodes) {

      isoCodes.forEach(function(d) {
        isoLookup[String(+d["country-code"])] = d;
      });
      isoCodes.forEach(function(d) {
        idLookup[d["alpha-3"]] = d;
      });

    })


      map_svg.selectAll("path.country")
      
      // set fill color for country
        .style("fill", function(d) {
        
        // if country not in isoLookup, return gray
          if (!(d.id in isoLookup)) { return "#eaeaea"; }
        // grab iso3 code
        // if in set to exclude, return gray
        // if not in data lookup table, return gray
          var country = isoLookup[d.id]["alpha-3"];
          if (exclude.indexOf(country) > -1) { return "#eaeaea"; }
          if (!(country in lookup)) { return "#eaeaea"; }
        
        // grab data for that country
          var datum = lookup[country];
          //console.log(datum);
        
        // if missing data for a given year for that country / metric, return gray
          if (datum[active_ymetric][year] == "") { return "#eaeaea" };
        // if data exists, color it
        
        //
        // change to color by another variable here
        //
          var color_var = "index_territorial"
          return color(+datum[color_var][year]) || "#eaeaea";
        })
      
      // set mouseover function for country
        .on("mouseover", function(d) {
        
        // if not in isoLookup, return gray
          if (!(d.id in isoLookup)) { return "#eaeaea"; }
        
        // grab iso3 code
        // if in set to exclude, return gray
        // if not in data lookup table, return gray
          var country = isoLookup[d.id]["alpha-3"];
          if (exclude.indexOf(country) > -1) { return "#eaeaea"; }
          if (!(country in lookup)) { return "#eaeaea"; }
        
        // set global variable selected_country
          selected_country = country;
        
        // grab data for that country
          var datum = lookup[country];

        // update country, label, tooltip
          d3.selectAll(".country-label").text(isoLookup[d.id].name);
          tooltip.style("display", null).html("");
          tooltip.append("h3").text(isoLookup[d.id].name);
        // loop over all data and print inside the tooltip
          d3.keys(datum).forEach(function(metric) {
            if (datum[metric][year]) {
              var div = tooltip.append("div");
              div.append("span").text(metric_lookup[metric].name + ": ");
              div.append("span").text(metric_lookup[metric].format(+datum[metric][year]));
              div.append("span").text(" " + metric_lookup[metric].units);
            }
          });
           
        // Update visualization for countries. Gray out borders for all un-selected countries
        // Q *** does the 0.3 do anything in the first call, if stroke gets set to null in second part?
          map_svg.selectAll("path.country")
            .style("opacity", function(p) {
              return p.id == d.id ? 1 : 0.3;
            })
            .style("stroke", function(p) {
              return p.id == d.id ? "#222" : null;
            });

        // Select bubble in scatter plot
        // how does .raise() work? Brings to top, eh? 
        // where is this defined/
        // need to reset bubble ordering on mouseout
          var selected_bubble = svg.selectAll(".bubble")
            .filter(function(p) {
              return country == p;
            })
            .raise();

         // stroke becomes bold and wider
          selected_bubble.select("circle")
            .style("stroke", "#111")
            .style("stroke-width", "2px");

        // should make country name show... confused with the null value here
          selected_bubble.select("text")
            .style("display", null);

        // loop over all of the wb indicators
        // for each year in the range 2000 - 2016 (with 2016 a proxy for the summary ranges):
          multiples.each(function(metric) {
            var series = [];
            d3.range(2000,2016).forEach(function(year) {
              series.push({
                year: +year,
                value: +datum[metric][year]
              })
            });
            d3.select(this)
              .select("path.spark")
              .attr("d", metric_lookup[metric].line(series))
          });

          updateDataValues();
        })
      
      // Causes the tool tip to track the mouse movement
        .on("mousemove", function(d) {
          return tooltip.style("top", (d3.event.pageY-52) + "px").style("left", (d3.event.pageX+18) + "px");
        })
      
      // Reset map to have all countries showing
        .on("mouseout", function() {
        
        // update global variable back to "WLD"
          selected_country = "WLD";
        
        // .country-label is the text over the wb_data windows
          d3.selectAll(".country-label").text("Global");
        
        // reset opacity on map rendering of country boundaries
          map_svg.selectAll("path.country")
            .style("opacity", 1)
            .style("stroke", null);

        // set the borders of all circles to be null, not show their text
          svg.selectAll(".bubble circle")
            .style("stroke", null)
            .style("stroke-width", null);

          svg.selectAll(".bubble text")
            .style("display", "none");

        // unclear what this does
        // Q *** ???
          d3.selectAll("path.spark")
            .attr("d", "");

        // hide the tooltip
          tooltip.style("display", "none");

        // update shown data
          updateDataValues();
        });






//
// Create scatterplot
//

// Create bubbles, sort them according to which has more abs_carbon


// Create scatterplot area

var scatter_canvas = d3.select("body")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



// Creates x-axis, y-axis
    scatter_canvas.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(xAxis);

    scatter_canvas.selectAll(".x.axis text")
      .attr("y", 8);

    scatter_canvas.append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "y axis")
      .call(yAxis);


// Dark lines that reference 0,0
    scatter_canvas
      .append("line")
      .attr("class", "dark-line-1")
      .style("stroke", "#777")
      .style("stroke-width", 1)
      .attr("x1", xscale(0))
      .attr("x2", xscale(0))
      .attr("y1", 0)
      .attr("y2", height)

    scatter_canvas
      .append("line")
      .attr("class", "dark-line-2")
      .style("stroke", "#777")
      .style("stroke-width", 1)
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yscale(0))
      .attr("y2", yscale(0))


  
  // Create label for active y-metric
    scatter_canvas.append("text")
      .attr("x", 6)
      .attr("y", -5)
      .attr("class", "label active-ymetric-label")
      .text(metric_lookup[active_ymetric].name + " (" + metric_lookup[active_ymetric].units+ ")");

  // Create label for active x-metric
    scatter_canvas.append("text")
      .attr("x", width-2)
      .attr("y", height-6)
      .attr("text-anchor", "end")
      .attr("class", "label active-metric-label")
      .text(metric_lookup[active_metric].name + " (" + metric_lookup[active_ymetric].units+ ")");

  // Create label for current year
    var year_label = scatter_canvas.append("text")
      .attr("x", width-2)
      .attr("y", -5)
      .attr("class", "label")
      .attr("text-anchor", "end")
      .style("font-weight", "bold")
      .style("font-size", "36px")
      .text("1999-2000");




    var countries = d3.keys(lookup);

    var group = scatter_canvas.selectAll("g.bubble")
      .data(countries.filter(function(d) {
        return d && exclude.indexOf(d) == -1;
      }))
      .enter().append("g")
      .sort(function(a,b) {
        return +lookup[b]["abs_carbon"][year].replace(",","") - (+lookup[a]["abs_carbon"][year].replace(",",""));
      })
      .attr("class", "bubble")
      .attr("transform", function(d) {
        return "translate(" + xscale(+lookup[d][active_metric][year]) + "," + yscale(+lookup[d][active_ymetric][year]) + ")"
      });
      
// Sets the country names for every bubble
    group
      .append("text")
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(function(d) {
        return d in idLookup ? idLookup[d].name : "";
      })
      .style("display", "none");



    group
      .append("circle")
      .attr("r", function(d) {
        return radius(+lookup[d]["abs_carbon"][year].replace(",",""));
      })
      .style("fill", function(d) {
        return "#777";
      })
      .on("click", function(d) {
        console.log(d);
      })
      .on("mouseover", function(d) {
        var country = d;
        if (exclude.indexOf(country) > -1) { return "#eaeaea"; }
        if (!(country in lookup)) { return "#eaeaea"; }
        selected_country = country;
        var datum = lookup[country];

        d3.selectAll(".country-label").text(idLookup[d].name);

        map_svg.selectAll("path.country")
          .style("opacity", function(p) {
            return p.id == String(+idLookup[d]["country-code"]) ? 1 : 0.3;
          })
          .style("stroke", function(p) {
            return p.id == String(+idLookup[d]["country-code"]) ? "#222" : null;
          });

        tooltip.style("display", null).html("");
        tooltip.append("h3").text(idLookup[d].name);

      // Sets up text inside the tooltip
        d3.keys(datum).forEach(function(metric) {
          if (datum[metric][year]) {
            var div = tooltip.append("div");
            div.append("span").text(metric_lookup[metric].name + ": ");
            div.append("span").text(metric_lookup[metric].format(+datum[metric][year]));
            div.append("span").text(" " + metric_lookup[metric].units);
          }
        });

      
        scatter_canvas.selectAll(".bubble")
          .filter(function(p) {
            return country == p;
          })
          .raise();
        scatter_canvas.selectAll(".bubble circle")
          .style("stroke", function(p) {
            return country == p ? "#111" : null;
          })
          .style("stroke-width", function(p) {
            return country == p ? "2px" : null;
          });


        updateDataValues();
      })
      .on("mousemove", function(d) {
        return tooltip.style("top", (d3.event.pageY-52) + "px").style("left", (d3.event.pageX+18) + "px");
      })
      .on("mouseout", function() {
        selected_country = "WLD";
        d3.selectAll(".country-label").text("Global");
        map_svg.selectAll("path.country")
          .style("opacity", 1)
          .style("stroke", null);
        scatter_canvas.selectAll(".bubble circle")
          .style("stroke", function(p) {
            return null;
          })
          .style("stroke-width", function(p) {
            return null;
          });

        d3.selectAll("path.spark")
          .attr("d", "");

        tooltip.style("display", "none");

        updateDataValues();
      })

  



// Set scale for sizing dots
var radius = d3.scaleSqrt()
  .range([2.5,20])
  .domain([0, 3000]);

// Set the domain to be reasonable for both map and scatter
// Q *** perhaps this should update as the variable used for the color ramp changes?
var color = d3.scaleThreshold()
  .domain([-0.05, 0, 0.5, 0.75, 1])
  .range(["#d73027","#f46d43","#fdae61","#abd9e9","#74add1","#4575b4"]);



// Set up scales

// why are domains of the scales set to -0.5 to 0.5?
var xscale = d3.scaleLinear()
  .domain([-0.5,0.5])
  .range([0,width])
  .clamp("true");

var yscale = d3.scaleLinear()
  .domain([-0.5,0.5])
  .range([height,0])
  .clamp("true");


// Create x- and y-axis lines
// Use formatter (format)
var xAxis = d3.axisBottom()
  .tickSize(-height)
  .tickFormat(function(d) {
//    if (d == -0.25) return "<" + format(d);
//    if (d == 0.25) return ">" + format(d);
    return format(d);
  })
  .scale(xscale);

var yAxis = d3.axisLeft()
  .tickFormat(function(d) {
//    if (d == 0) { return "N/A"; }
    return format(d);
  })
  .tickSize(-width)
  .scale(yscale)










//
// Sets up the divs for the wb_data boxes at bottom
//

d3.select("body")
  .append("div")
  .attr("id", "multiples");

var multiples = d3.select("#multiples")
  .selectAll("div")
  .data(metrics)
  .enter().append("div")
  .attr("class", "multiple")


// References metric_lookup, defined below
multiples.append("h3")
  .text(function(d) { return metric_lookup[d].name; });

multiples.append("h3")
  .attr("class", function(d) { return "multiple-value multiple-value-" + d })
  .text(function(d) { return ""; });

multiples.append("svg")
  .attr("height", "120px")
  .attr("width", "180px")

 multiples.select("svg")
  .append("path")
  .attr("class", "spark")



var multiple_xscale = d3.scaleLinear().domain([2000,2015]).range([12, 168]);

multiples.select("svg")
  .append("line")
  .attr("class", "plumb")
  .attr("x1", multiple_xscale(2000))
  .attr("x2", multiple_xscale(2000))
  .attr("y1", 6)
  .attr("y2", 70)
  .style("stroke", "#bbb")

multiples.select("svg")
  .append("text")
  .attr("class", "multiple-year-label")
  .attr("x", multiple_xscale(2000))
  .attr("y", 78)
  .style("text-anchor", "middle")
  .style("stroke", "#bbb")
  .style("font-size", "12px")
  .text(2000)

  
  
    d3.selectAll(".multiple")
      .on("click", function(metric) {
        // 2000-2014 for consumption_co2 only
        active_metric = metric;
        if (String(year).indexOf("-") > -1) {
          if (metric == "consumption_co2") {
            year = "2000-2014";
          } else {
            year = "2000-2015";
          }
        }
        setYear(year);
        updateXMetric(metric);
        updateBubbles();
      });
















//
// Load data
//



d3.queue()
  .defer(d3.csv, "../final-data/GDP\ annual\ change\ 2000-15\ 9.28.17.csv")
  .defer(d3.csv, "../final-data/CO2 annual change data 2000-2015 9.18.17.csv")
  .defer(d3.csv, "../final-data/wb_data\ 9.29.17.csv")
  .defer(d3.csv, "../final-data/absolute\ country\ GDP\ 1999-2015.csv")
  .defer(d3.csv, "../final-data/absolute\ country\ annual\ carbon\ emissions\ 2000-2015.csv")
  .defer(d3.csv, "../final-data/consumption\ CO2\ annual\ change\ data\ 2000-2015\ 9.28.17.csv")
  .defer(d3.csv, "../data/Index\ calculated\ with\ Territorial\ Emissions\ and\ GDP.csv")
  .await(function(error, raw_gdp, raw_co2, wb_data, abs_gdp, abs_carbon, consumption_co2, index_territorial) {
  
  // Once all the data has loaded, perform ISO lookup
  
    //console.log(d3.keys(wb_data[0]));
    //console.log(consumption_co2);
    //console.log(index_territorial);

  
    // first line initializes the country's entry in lookup
    // then proceeds to expand the data for each country
  
    raw_gdp.forEach(function(d) {
      lookup[d["ISO"]] = lookup[d["ISO"]] || {};
      lookup[d["ISO"]]["GDP"] = d;
    });
  
    raw_co2.forEach(function(d) {
      lookup[d["ISO"]] = lookup[d["ISO"]] || {};
      lookup[d["ISO"]]["CO2"] = d;
    });
  
    abs_gdp.forEach(function(d) {
      lookup[d["ISO"]] = lookup[d["ISO"]] || {};
      lookup[d["ISO"]]["abs_gdp"] = d;
    });
  
    abs_carbon.forEach(function(d) {
      lookup[d["ISO"]] = lookup[d["ISO"]] || {};
      lookup[d["ISO"]]["abs_carbon"] = d;
    });
  
    consumption_co2.forEach(function(d) {
      lookup[d["ISO"]] = lookup[d["ISO"]] || {};
      lookup[d["ISO"]]["consumption_co2"] = d;
    });
  
    index_territorial.forEach(function(d) {
      lookup[d["ISO"]] = lookup[d["ISO"]] || {};
      lookup[d["ISO"]]["index_territorial"] = d;
    });
  
  // notice that the look-up here is different, as country_code is how wb_data is stored
    wb_data.forEach(function(d) {
      metrics.forEach(function(metric) {
        if (metric in d) {
          lookup[d["country_code"]] = lookup[d["country_code"]] || {};
          lookup[d["country_code"]][metric] = lookup[d["country_code"]][metric] || {};
          lookup[d["country_code"]][metric][d.year] = d[metric];
        }
      });
    });
  
  
  
  
  metrics.forEach(function(metric) {
    
      var calculated_extent = d3.extent(
        wb_data.filter(function(d) { 
           return d.year.indexOf("-") < 0 && d.country_code !== "WLD"; 
        }), 
        function(d) { 
          return +d[metric]; 
        })

      var calculated_long_extent = d3.extent(
        wb_data.filter(function(d) { 
          return d.year.indexOf("-") > -1 && d.country_code !== "WLD"; 
        }), 
        function(d) { 
          return +d[metric]; 
        })
      
      // 
      // What is going on here with the multiple assignments?
      //
      
      var extent = metric_lookup[metric].extent = metric_lookup[metric].extent || calculated_extent;
      metric_lookup[metric].longextent = metric_lookup[metric].longextent || calculated_long_extent;
    
      var yscale = metric_lookup[metric].yscale = d3.scaleLinear().domain(extent).range([70,6]).clamp(true);
      metric_lookup[metric].scale = d3.scaleLinear().domain(extent).range([0,width]).clamp(true);

      metric_lookup[metric].line = d3.line()
        .defined(function(d) { return d.value != "" && !isNaN(d.value); })
        .x(function(d) { return multiple_xscale(d.year); })
        .y(function(d) { return yscale(d.value); });
    
      metric_lookup[metric].yAxis = d3.axisLeft()
        .tickFormat(metric_lookup[metric].format)
        .tickSize(-200)
        .scale(metric_lookup[metric].scale)
    });

    /*
    multiples.select("svg")
      .append("g")
      .attr("transform", "translate(100,0)")
      .attr("class", "y axis")
      .each(function(d) {
        d3.select(this)
          .call(metric_lookup[d].yAxis);
      });
      */
});
  
  
  
  
   




  
  
  
  
  
  //
  // Functions used for updating visual
  //

  // nextYear() -> used recursively for autoplay
  // updateXMetric(metric) -> change x-axis of scatter
  // updateYMetric(metric) -> change y-axis of scatter
  // setYear(year) -> used to setYear to a specific choice
 
    // autoplay
    function nextYear() {
      
      // only continue if playing is True
      if (!playing) return;

      // increment the year
      year++;
      
      /* hardcode the year as "2000-2014" for consumption_co2
      if (year == 2015 && active_metric == "consumption_co2") {
        year = "2000-2014";
        setYear(year);
        return;
      }*/
      
      // The above commented out code fits into this case
      if (year >= 2015) {
        if (active_metric == "consumption_co2") {
          year = "2000-2014";
        } else {
          year = "2000-2015";
        }
        setYear(year);
        return;
      }

      // changes global variablem which updates all else
      setYear(year);

      setTimeout(nextYear, 1100);
      
    };

    setYear(2000);
    setTimeout(nextYear, 1100);

    d3.select("#year-slider")
      .on("input", function() {
        playing = false;
        year = this.value;
        if (year == 2016) {
          if (active_metric == "consumption_co2") {
            year = "2000-2014";
          } else {
            year = "2000-2015";
          }
        }
        setYear(year);
      });

  
    function updateXMetric(metric) {
      d3.selectAll(".active-metric-label").text(metric_lookup[metric].name);

      xscale = metric_lookup[metric].scale;

      // for 2000-2015 year ranges
      if (String(year).indexOf("-") > -1 && "longextent" in metric_lookup[metric]) {
        xscale.domain(metric_lookup[metric].longextent);
      } else {
        xscale.domain(metric_lookup[metric].extent);
      }

      var xAxis = d3.axisBottom()
        .tickSize(-height)
        .tickFormat(metric_lookup[metric].format)
        .scale(xscale);

      scatter_canvas.select(".x.axis")
        .transition()
        .call(xAxis);

      d3.selectAll(".dark-line-1")
        .transition()
        .attr("x1", xscale(0))
        .attr("x2", xscale(0))

      scatter_canvas.selectAll(".x.axis text")
        .transition()
        .attr("y", 8);
    };

 
    function updateYMetric(metric) {
      active_ymetric = metric;

      d3.selectAll(".active-ymetric-label").text(metric_lookup[metric].name);

      // for 2000-2015 year ranges
      if (String(year).indexOf("-") > -1 && "longextent" in metric_lookup[metric]) {
        yscale.domain(metric_lookup[metric].longextent);
      } else {
        yscale.domain(metric_lookup[metric].extent);
      }

      var yAxis = d3.axisLeft()
         .tickFormat(metric_lookup[metric].format)
        .tickSize(-width)
        .scale(yscale)

      scatter_canvas.select(".y.axis")
        .transition()
        .call(yAxis);

      d3.selectAll(".dark-line-2")
        .transition()
        .attr("y1", yscale(0))
        .attr("y2", yscale(0))
    };

  
  
  
  
  
    function setYear(year) {
      var single_year = true;
      
      if (String(year).indexOf("-") > -1) {
        single_year = false;
        if (active_metric == "consumption_co2") {
          year = "2000-2014";
        } else {
          year = "2000-2015";
        }
        year_label.text(year);
        d3.select("#year-slider").node().value = 2016;
      } else {
        year_label.text((year-1) + "-" + year);
        d3.select("#year-slider").node().value = year;
      }

      if (single_year) {
        d3.selectAll("line.plumb")
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("x1", multiple_xscale(year))
          .attr("x2", multiple_xscale(year))

        d3.selectAll(".multiple-year-label")
          .text(year)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("x", multiple_xscale(year))
      } else {
        d3.selectAll("line.plumb")
          .transition()
          .duration(200)
          .style("opacity", 0)

        d3.selectAll(".multiple-year-label")
          .text(year)
          .transition()
          .duration(200)
          .style("opacity", 0)
      }

      updateXMetric(active_metric);
      updateYMetric(active_ymetric);
      updateBubbles();
      updateDataValues();
    }

  
  
  
  // both_exist refers to previous timestep and following time step's data
  //
    function updateBubbles() {
      scatter_canvas.selectAll("g.bubble")
        .transition()
        .duration(700)
      // set destination opacity depending on whether the point should stay displayed
      // in the new time step
        .style("opacity", function(d) {
          var both_exist = true;
          if (active_metric in lookup[d] && year in lookup[d][active_metric]) {
            var value = lookup[d][active_metric][year];
            if (value == "") {
              both_exist = false;
            }
          } else {
            both_exist = false;
          }
          if (active_ymetric in lookup[d] && year in lookup[d][active_ymetric]) {
            var value = lookup[d][active_ymetric][year];
            if (value == "") {
              both_exist = false;
            }
          } else {
            both_exist = false;
          }
          return both_exist ? 0.8 : 0;
        })
      // check to see if xvalue exists in the data
      // assume that the y_value does exist...
      // would have to update this to look more like the xscale lookup if we allow 
      // any variable on the y-axis
        .attr("transform", function(d) {
          if (active_metric in lookup[d] && year in lookup[d][active_metric]) {
            var value = lookup[d][active_metric][year];
            var x = value == "" ? 0 : xscale(+value);
          } else {
            var x = 0;
          }
          return "translate(" + x + "," + yscale(+lookup[d][active_ymetric][year]) + ")"
        });

      // change radius
      // change color of fill
      scatter_canvas.selectAll("g.bubble circle")
        .transition()
        .duration(700)
        .attr("r", function(d) {
          // if no data, return previous radius
          if (!(year in lookup[d]["abs_carbon"])) { return d3.select(this).attr("r"); }
          return radius(+lookup[d]["abs_carbon"][year].replace(",","")) || 2;
        })
        .style("fill", function(d) {
          if (lookup[d][active_ymetric][year] == "") { return "#eaeaea" };
          return color(+lookup[d][active_ymetric][year]) || "#eaeaea";
        })
      
      // change color of map
      map_svg.selectAll("path.country")
        .transition(700)
        .style("fill", function(d) {
          if (!(d.id in isoLookup)) { return "#eaeaea"; }
          var country = isoLookup[d.id]["alpha-3"];
          if (exclude.indexOf(country) > -1) { return "#eaeaea"; }
          if (!(country in lookup)) { return "#eaeaea"; }
          var datum = lookup[country];
          if (datum[active_ymetric][year] == "") { return "#eaeaea" };
        
        
          return color(+datum["index_territorial"][year]) || "#eaeaea";
        })
    }

  
  
  
  
    function updateDataValues() {
      var datum = lookup[selected_country];
      tooltip.selectAll("div").remove();

      d3.selectAll(".multiple-value").text("");
      d3.keys(datum).forEach(function(metric) {
        if (datum[metric][year]) {
          var div = tooltip.append("div");
          div.append("span").text(metric_lookup[metric].name + ": ");
          div.append("span").text(metric_lookup[metric].format(+datum[metric][year]));
          div.append("span").text(" " + metric_lookup[metric].units);
          d3.select(".multiple-value-" + metric).text(metric_lookup[metric].format(+datum[metric][year]) + " " + metric_lookup[metric].units)
        }
      });

      multiples.each(function(metric) {
        if (metric in datum) {
          var series = [];
          d3.range(2000,2016).forEach(function(year) {
            series.push({
              year: +year,
              value: +datum[metric][year]
            })
          });
          d3.select(this)
            .select("path.spark")
            .attr("d", metric_lookup[metric].line(series))
        }
      });
    }

  });
