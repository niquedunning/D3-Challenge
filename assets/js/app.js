//Create SVG Window
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
//Set width and height of chart
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create SVG Wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 50);

// Append SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameters
var CurrentXAxis = "income";
var CurrentYAxis = "healthcare";



function xScale(data, CurrentXAxis) {

  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[CurrentXAxis])-2,d3.max(data, d => d[CurrentXAxis])+2])
    .range([height, 0]);

  return xLinearScale;
function yScale(data, CurrentYAxis) {

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[CurrentYAxis])-2,d3.max(data, d => d[CurrentYAxis])+2])
      .range([height, 0]);
  
    return yLinearScale;
  
}


//updates circle group with a transition
function renderXCirc(circleGroup, newX, CurrentXAxis) {

    circleGroup.transition()
      .duration(1000)
      .attr("cx", d => newX(d[CurrentXAxis]))
      .attr("dx", d => newX(d[CurrentXAxis]));
  
    return circleGroup;
}
// new circles for y
function renderYCirc(circleGroup, newY, CurrentYAxis) {

    circleGroup.transition()
      .duration(1000)
      .attr("cy", d => newY(d[CurrentYAxis]))
      .attr("dy", d => newY(d[CurrentYAxis])+5)
  
    return circleGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(data, err) {
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
  var xLinearScale = xScale(data, CurrentXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, CurrentYAxis);

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
  var circleGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("g");

  var circles = circleGroup.append("circle")
    .attr("cx", d => xLinearScale(d[CurrentXAxis]))
    .attr("cy", d => yLinearScale(d[CurrentYAxis]))
    .attr("r", 15)
    .classed('stateCirc', true);

  // append text inside circles
  var circleText = circleGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[CurrentXAxis]))
    .attr("dy", d => yLinearScale(d[CurrentYAxis])+5) //to center the text in the circles
    .classed('stateAcc', true);

  // Create group for three x-axis labels
  var xLabels = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var IncomeLabel = xLabels.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income")
    .classed("active blue", true)
    .text("Household Income (Median, Multiply by 100)");
  
  // Create group for three y-axis labels
  var yLabels = chartGroup.append("g")
    .attr("transform", "rotate(-90)")


  var HealthLabel = yLabels.append("text")
    .attr("y", -50)
    .attr("x", -(height/2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active green", true)
    .text("Lacks Healthcare (%)");

  
}).catch(function(error) {
  console.log(error);
});

}