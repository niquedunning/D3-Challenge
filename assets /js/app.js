
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
var chosenX = "poverty";
var chosenY = "income";

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
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// functions used for updating circles group with a transition to
// new circles for x
function renderXCircles(circlesGroup, newXScale, chosenX) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenX]))
      .attr("dx", d => newXScale(d[chosenX]));
  
    return circlesGroup;
}
// new circles for y
function renderYCircles(circlesGroup, newYScale, chosenY) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenY]))
      .attr("dy", d => newYScale(d[chosenY])+5)
  
    return circlesGroup;
}
// Updating text location
function renderXText(circlesGroup, newXScale, chosenX) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenX]));
  
    return circlesGroup;
}
function renderYText(circlesGroup, newYScale, chosenY) {

    circlesGroup.transition()
      .duration(1000)
      .attr("dy", d => newYScale(d[chosenY])+5)
  
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

    if (chosenY === 'healthcare'){
        ylabel = "Health:"
    }
    else if (chosenY === 'obesity'){
        ylabel = "Obesity:"
    }
    else if (chosenY === 'smokes'){
        ylabel = "Smokes:"
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .style("color", "black")
      .style("background", 'white')
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenX]}%<br>${ylabel} ${d[chosenY]}%`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
    .on("mouseout", function(data, index) {
    toolTip.hide(data);
    });
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data/data.csv").then(function(data, err) {
    // console.log(data)
    if (err) throw err;
  
    // parse data
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
      .classed('stateCircle', true);

    // append text inside circles
    var circlesText = circlesGroup.append("text")
      .text(d => d.abbr)
      .attr("dx", d => xLinearScale(d[chosenX]))
      .attr("dy", d => yLinearScale(d[chosenY])+5) 
      .classed('stateText', true);
  
    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    
    var IncomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Median Household Income");
  
    var AgeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Median Age");

    var PovertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
    
    var ObeseLabel = ylabelsGroup.append("text")
      .attr("y", -80)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese Population (%)");
  
    var SmokeLabel = ylabelsGroup.append("text")
      .attr("y", -60)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smoker Population (%)");

    var HealthLabel = ylabelsGroup.append("text")
      .attr("y", -40)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("No Healthcare (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenX) {
  
          // replaces chosenXAxis with value
          chosenX = value;
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(data, chosenX);
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circles = renderXCircles(circles, xLinearScale, chosenX);

        //   updating text within circles
          circlesText = renderXText(circlesText, xLinearScale, chosenX)  
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);
  
          // changes classes to change bold text
          if (chosenX === "income") {
            IncomeLabel
              .classed("active",true)
              .classed("inactive", false);
            PovertyLabel
              .classed("active", false)
              .classed("inactive", true);
            AgeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenX === "age"){
            AgeLabel
              .classed("active", true)
              .classed("inactive", false);
            PovertyLabel
              .classed("active", false)
              .classed("inactive", true);
            IncomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            IncomeLabel
              .classed("active", false)
              .classed("inactive", true);
            AgeLabel
              .classed("active", false)
              .classed("inactive", true);
            PovertyLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      // y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenY) {

        // replaces chosenYAxis with value
        chosenY = value;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenY);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circles = renderYCircles(circles, yLinearScale, chosenY);

        // update text within circles
        circlesText = renderYText(circlesText, yLinearScale, chosenX) 

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenX, chosenY, circlesGroup);

        // changes classes to change bold text
        if (chosenY === "obesity") {
          ObeseLabel
            .classed("active", true)
            .classed("inactive", false);
          SmokeLabel
            .classed("active", false)
            .classed("inactive", true);
          HealthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if(chosenY === 'smokes'){
          SmokeLabel
            .classed("active", true)
            .classed("inactive", false);
          HealthLabel
            .classed("active", false)
            .classed("inactive", true);
          ObeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          HealthLabel
            .classed("active", true)
            .classed("inactive", false);
          SmokeLabel
            .classed("active", false)
            .classed("inactive", true);
          ObeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
  }).catch(function(error) {
    console.log(error);
  });