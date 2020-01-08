// Code For Chart is Wrapped Inside a Function that Automatically Resizes the Chart
function makeResponsive() {

    // Create SVG Area
    var svgArea = d3.select("body").select("svg");

    // Clear SVG Area if it Isn't Empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Set SVG Dimensions
    var svgWidth = window.innerWidth / 1.7;
    var svgHeight = window.innerHeight / 1.7;

    // Set SVG Margins
    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };

    // Set Dimensions of Chart Area
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG Element/Wrapper
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG Group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // Function For Updating xScale Upon Click on Axis Label
    function xScale(acsData, chosenXAxis) {

        // Create Scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(acsData, d => d[chosenXAxis]) * 0.8,
            d3.max(acsData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);

        return xLinearScale;
    }

    // Function For Updating yScale Upon Click on Axis Label
    function yScale(acsData, chosenYAxis) {

        // Create Scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(acsData, d => d[chosenYAxis]) * 0.8,
            d3.max(acsData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);

        return yLinearScale;
    }

    // Function For Updating xAxis Upon Click on Axis Label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // Function For Updating yAxis Upon Click on Axis Label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // Function For Updating Circles Group with a Transition to New Circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }

    // Function For Updating Text Group with a Transition to New Text
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]))
            .attr("text-anchor", "middle");

        return textGroup;
    }

    // Function For Updating Circles Group with New Tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

        // For Updating xLabels
        if (chosenXAxis === "poverty") {
            var xLabel = "Poverty:";
            var xUnits = "%";
        }
        else if (chosenXAxis === "age") {
            var xLabel = "Age (Median):";
            var xUnits = " Years";
        }
        else {
            var xLabel = "Household Income (Median):";
            var xUnits = "";
        }

        // For Updating yLabels
        if (chosenYAxis === "healthcare") {
            var yLabel = "Lacks Healthcare:";
            var yUnits = "%";
        }
        else if (chosenYAxis === "smokes") {
            var yLabel = "Smokes:";
            var yUnits = "%";
        }
        else {
            var yLabel = "Obese:";
            var yUnits = "%";
        }

        // Initialize Tooltip
        var toolTip = d3.tip()
            .attr("class", "tooltip d3-tip")
            .offset([-5, 80])
            .html(function (d) {
                return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}${xUnits}<br>${yLabel} ${d[chosenYAxis]}${yUnits}`);
            });

        // Create Circles Tooltip in Chart
        circlesGroup.call(toolTip);

        // Onmouseover Event
        circlesGroup.on("mouseover", function (data) {
            toolTip.show(data, this);
        })
            // Onmouseout Event
            .on("mouseout", function (data) {
                toolTip.hide(data);
            });

        // Create Text Tooltip in Chart
        textGroup.call(toolTip);

        // Onmouseover Event
        textGroup.on("mouseover", function (data) {
            toolTip.show(data);
        })
            // Onmouseout Event
            .on("mouseout", function (data) {
                toolTip.hide(data);
            });

        return circlesGroup;
    }

    // Retrieve Data From the CSV File and Execute Everything Below
    d3.csv("assets/data/data.csv").then(function (acsData, err) {
        if (err) throw err;

        // Format/Parse Data
        acsData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // Create xLinearScale & yLinearScale Functions For the Chart
        var xLinearScale = xScale(acsData, chosenXAxis);
        var yLinearScale = yScale(acsData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append X Axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // Append Y Axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // Append Initial Circles
        var circlesGroup = chartGroup.selectAll(".stateCircle")
            .data(acsData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("opacity", ".75")
            .attr("class", "stateCircle");

        // Append Text to Circles
        var textGroup = chartGroup.selectAll(".stateText")
            .data(acsData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .text(d => (d.abbr))
            .attr("class", "stateText")

        // Create Group For 3 X Axis Labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // Value to Grab For Event Listener
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // Value to Grab For Event Listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // Value to Grab For Event Listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // Create Group For 3 Y Axis Labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(-20, ${height / 2})`);

        var healthcareLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", -20)
            .attr("value", "healthcare") // Value to Grab For Event Listener
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", -40)
            .attr("value", "smokes") // Value to Grab For Event Listener
            .classed("inactive", true)
            .text("Smokes (%)");

        var obeseLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0)
            .attr("y", -60)
            .attr("value", "obesity") // Value to Grab For Event Listener
            .classed("inactive", true)
            .text("Obese (%)");

        // UpdateToolTip Function
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        // X Axis Labels Event Listener
        xLabelsGroup.selectAll("text")
            .on("click", function () {

                // Get Value of Selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // Replaces ChosenXAxis with Value
                    chosenXAxis = value;

                    // Updates xScale For New Data
                    xLinearScale = xScale(acsData, chosenXAxis);

                    // Updates xAxis with Transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // Updates Circles with New Values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // Updates Text with New Values
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // Updates Tooltips with New Information
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                    // Changes Classes to Change Bold Text
                    if (chosenXAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (chosenXAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });

        // Y Axis Labels Event Listener
        yLabelsGroup.selectAll("text")
            .on("click", function () {

                // Get Value of Selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // Replaces ChosenYAxis with Value
                    chosenYAxis = value;

                    // Updates yScale For New Data
                    yLinearScale = yScale(acsData, chosenYAxis);

                    // Updates yAxis with Transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // Updates Circles with New Values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // Updates Text with New Values
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // Updates Tooltips with New Information
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                    // Changes Classes to Change Bold Text
                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else if (chosenYAxis === "smokes") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obeseLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    })
}

// When the Browser Loads, makeResponsive is Called
makeResponsive();

// When the Browser Window is Resized, makeResponsive is Called
d3.select(window).on("resize", makeResponsive);