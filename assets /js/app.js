
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 50);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenX = "income";
var chosenY = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenX) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenX]) * 0.9,
        d3.max(data, d => d[chosenX]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenY) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenY])-2,d3.max(data, d => d[chosenY])+2])
      .range([height, 0]);
  
    return yLinearScale;
  
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newX, xAxis) {
    var bottomAxis = d3.axisBottom(newX);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newY, yAxis) {
    var leftAxis = d3.axisLeft(newY);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// functions used for updating circles group with a transition to
// new circles for x
function renderXCirc(circlesGroup, newX, chosenX) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newX(d[chosenX]))
      .attr("dx", d => newX(d[chosenX]));
  
    return circlesGroup;
}
// new circles for y
function renderYCirc(circlesGroup, newY, chosenY) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newY(d[chosenY]))
      .attr("dy", d => newY(d[chosenY])+5)
  
    return circlesGroup;
}
// Updating text location
function renderXTex(circlesGroup, newX, chosenX) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dx", d => newX(d[chosenX]));
  
    return circlesGroup;
}
function renderYTex(circlesGroup, newY, chosenY) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dy", d => newY(d[chosenY])+5)
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenX, chosenY, circlesGroup) {

    var xlabel;
    var ylabel;
  
    if (chosenX === "income") {
      xlabel = "Household Income:";
    }
    else if (chosenX === "age") {
      xlabel = "Age:";
    }
    else if (chosenX === "poverty"){
        xlabel = "Poverty:"
    }

    if (chosenY === 'obesity'){
        ylabel = "Obesity:"
    }
    else if (chosenY === 'health'){
        ylabel = "Health:"
    }
    else if (chosenY === 'smokes'){
        ylabel = "Smokes:"
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([120, -60])
      .style("color", "black")
      .style("background", 'white')
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenX]}<br>${ylabel} ${d[chosenY]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
     
    .on("mouseout", function(data, index) {
    toolTip.hide(data);
    });
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data/data.csv").then(function(data, err) {
    
    if (err) throw err;
  
    data.forEach(d => {
      d.poverty = +d.poverty;
      d.povertyMoe = +d.povertyMoe;
      d.age = +d.age;
      d.ageMoe = +d.ageMoe;
      d.income = +d.income;
      d.incomeMoe = +d.incomeMoe;
      d.healthcare = +d.healthcare;
      d.healthcareLow = +d.healthcareLow;
      d.healthcareHigh = +d.healthcareHigh;
      d.obesity = +d.obesity;
      d.obesityLow = +d.obesityLow;
      d.obesityHigh = +d.obesityHigh;
      d.smokes = +d.smokes;
      d.smokesLow = +d.smokesLow;
      d.smokesHigh = +d.smokesHigh;
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenX);
  
    // Create y scale function
    var yLinearScale = yScale(data, chosenY);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("g");

    var circles = circlesGroup.append("circle")
      .attr("cx", d => xLinearScale(d[chosenX]))
      .attr("cy", d => yLinearScale(d[chosenY]))
      .attr("r", 15)
      .classed('stateCirc', true);

    // append text inside circles
    var circlesText = circlesGroup.append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenX]))
      .attr("dy", d => yLinearScale(d[chosenY])+5) 
      .classed('stateAcc', true);
  
    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    
    var ObeseMark = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Median Household Income ($)");
  
    var AgeMark = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") 
      .classed("inactive", true)
      .text("Median Age");

    var ObesityLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") 
    .classed("active", true)
    .text("Obesity (%)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
    
    var ObeseMark = ylabelsGroup.append("text")
      .attr("y", -80)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "obesity") 
      .classed("inactive", true)
      .text("Obesity Rate(%)");
  
    var SmokeMark = ylabelsGroup.append("text")
      .attr("y", -60)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "smokes") 
      .classed("inactive", true)
      .text("Smoker Population (%)");

    var HealthMark = ylabelsGroup.append("text")
      .attr("y", -40)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lack HealthCare(%)");


    circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);
  

    xlabelsGroup.selectAll("text")
      .on("click", function() {
       
        var value = d3.select(this).attr("value");
        if (value !== chosenX) {
  
         
          chosenX = value;
  
        
          xLinearScale = xScale(data, chosenX);
  
        
          xAxis = renderXAxes(xLinearScale, xAxis);
  
         
          circles = renderXCirc(circles, xLinearScale, chosenX);

     
          circlesText = renderXTex(circlesText, xLinearScale, chosenX)  
  
      
          circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);
  
         
          if (chosenX === "income") {
            IncomeMark
              .classed("active",true)
              .classed("inactive", false);
            PovertyMark
              .classed("active", false)
              .classed("inactive", true);
            AgeMark
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenX === "age"){
            AgeMark
              .classed("active", true)
              .classed("inactive", false);
            PovertyMark
              .classed("active", false)
              .classed("inactive", true);
            IncomeMark
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            IncomeMark
              .classed("active", false)
              .classed("inactive", true);
            AgeMark
              .classed("active", false)
              .classed("inactive", true);
            PovertyMark
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

     
    ylabelsGroup.selectAll("text")
    .on("click", function() {

      var value = d3.select(this).attr("value");
      if (value !== chosenY) {

        chosenY = value;

      

    
        yLinearScale = yScale(data, chosenY);

 
        yAxis = renderYAxes(yLinearScale, yAxis);

 
        circles = renderYCirc(circles, yLinearScale, chosenY);

  
        circlesText = renderYTex(circlesText, yLinearScale, chosenX) 

  
        circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);

     
        if (chosenY === "obesity") {
          ObeseMark
            .classed("active", true)
            .classed("inactive", false);
          SmokeMark
            .classed("active", false)
            .classed("inactive", true);
          HealthMark
            .classed("active", false)
            .classed("inactive", true);
        }
        else if(chosenY === 'smokes'){
          SmokeMark
            .classed("active", true)
            .classed("inactive", false);
          HealthMark
            .classed("active", false)
            .classed("inactive", true);
          ObeseMark
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          HealthMark
            .classed("active", true)
            .classed("inactive", false);
          SmokeMark
            .classed("active", false)
            .classed("inactive", true);
          ObeseMark
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
  }).catch(function(error) {
    console.log(error);
  });