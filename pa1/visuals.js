d3.json("data.json", init);
var datasetMaster;
var currentDataset;
var paradigms;
var svg;
var dropdown;
var button;
var buttonOn;

var w = 1000;
var h = 600;
var padding = 50;
var transitionDuration = 500;

function init(error, data) {
    datasetMaster = data;
    currentDataset = data;
    buttonOn = false;
    var dataset = data;
    // get all paradigms
    paradigmsTmp = [];
    for(i = 0; i < dataset.length; i++) {
        for(p in dataset[i].paradigms) {
            paradigmsTmp.push(dataset[i].paradigms[p]);
        }
    }
    // filter out duplicates
    var paradigms = paradigmsTmp.filter(function(item, pos) {
        return paradigmsTmp.indexOf(item) == pos;
    })

    svg = d3.select("#graph")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    // Build the dropdown menu
    dropdown = d3.select("#drop")
                    .append("select")
                    .on("change", changed)
                    .selectAll("option")
                    .data(paradigms)
                    .enter()
                    .append("option")
                    .text(function(d, i) {
                        return paradigms[i];
                    });

    button = d3.select("#drop")
                .append("button")
                .on("click", lines)
                .text("Turn on influence lines");

    console.log(paradigms);
    draw(dataset);
}

function changed() {
    var paradigm = this.value;
    console.log("paradigm = " + paradigm);
    // Get subset of programming languages
    var dataset = [];
    for(i = 0; i < datasetMaster.length; i++) {
        if( datasetMaster[i].paradigms.indexOf(paradigm) > -1) {
            dataset.push(datasetMaster[i]);
        }
    }
    console.log(dataset);
    currentDataset = dataset;
    draw(currentDataset)
}

function draw(data) {

    var dataset = data;

    console.log("drawing");
    console.log(dataset);


    // set x scale to be from smallest year to largest
    var xScale = d3.scale.linear()
                    .domain([d3.min(dataset, function(d) { return d.year; }),
                                d3.max(dataset, function(d) { return d.year; })])
                    .range([padding, w - padding * 2])
                    .nice();

    // set y scale to be from 0 to largest number of repos
    var yScale = d3.scale.log()
                    .domain([1, d3.max(dataset, function(d) { return d.nbRepos; })])
                    .range([h - padding, padding])
                    .nice();

    var xAxis = d3.svg.axis()
                        .scale(xScale)
                        .orient("bottom")
                        .ticks(2);

    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient("left")
                        .ticks(2);

    var circles = svg.selectAll("circle")
                        .data(dataset, function(d) {
                            return d.name;
                        });

    // Extra credit lines
    var links = [];
    var newIndex;
    if(buttonOn) {
        console.log("finding links")
        dataset.forEach(function(d) {
            for( index in d.influenced ) {
                newIndex = -1;
                for(i = 0; i < dataset.length; i++) {
                    if (dataset[i].name == d.influenced[index]) {
                        newIndex = i;
                        break;
                    }
                }
                //newIndex = dataset.indexOf(d.influenced[index]);
                if(newIndex > -1) {
                    secondLanguage = dataset[newIndex];
                    //console.log(secondLanguage);
                    links.push({
                        "id" : d.name+"-"+d.influenced[index],
                        "x1" : d.year,
                        "y1" : d.nbRepos,
                        "x2" : secondLanguage.year,
                        "y2" : secondLanguage.nbRepos
                    });
                }
            }
        });
    }
    console.log("links")
    console.log(links)

    var influenceLines = svg.selectAll("line")
                            .data(links, function(d) {
                                return d.id;
                            });
    influenceLines.enter()
        .append("line")
        .transition()
        .duration(transitionDuration)
        .delay(500)
        .attr("x1", function(d) {
            return xScale(d.x1);
        })
        .attr("y1", function(d) {
            return yScale(d.y1);
        })
        .attr("x2", function(d) {
            return xScale(d.x2);
        })
        .attr("y2", function(d) {
            return yScale(d.y2);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    influenceLines.transition()
        .duration(transitionDuration)
        .delay(500)
        .attr("x1", function(d) {
            return xScale(d.x1);
        })
        .attr("y1", function(d) {
            return yScale(d.y1);
        })
        .attr("x2", function(d) {
            return xScale(d.x2);
        })
        .attr("y2", function(d) {
            return yScale(d.y2);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 2);


    influenceLines.exit()
        .transition()
        .duration(transitionDuration)
        .attr("stroke-width", 0)
        .remove();

    // plot the points
    circles.enter()
        .append("circle")
        .transition()
        .delay(1000)
        .duration(transitionDuration)
        .attr("cx", function(d) {
            return xScale(d.year);
        })
        .attr("cy", function(d) {
            return yScale(d.nbRepos);
        })
        .attr("r", 5);

    circles.transition()
        .duration(transitionDuration)
        .delay(500)
        .attr("cx", function(d) {
            return xScale(d.year);
        })
        .attr("cy", function(d) {
            return yScale(d.nbRepos);
        })
        .attr("r", 5);


    circles.exit()
        .transition()
        .duration(transitionDuration)
        .attr("r", 0)
        .remove();

    // add text
    var text = svg.selectAll("text")
                    .data(dataset, function(d) {
                        return d.name;
                    });
    text.enter()
        .append("text")
        .transition()
        .duration(transitionDuration)
        .delay(500)
        .text(function(d) {
            return d.name;
        })
        .attr("x", function(d) {
            return xScale(d.year) + 2;
        })
        .attr("y", function(d) {
            return yScale(d.nbRepos) - 3;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "red");

    text.transition()
        .duration(transitionDuration)
        .delay(500)
        .attr("x", function(d) {
            return xScale(d.year) + 2;
        })
        .attr("y", function(d) {
            return yScale(d.nbRepos) - 3;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "red");

    text.exit()
        .transition()
        .duration(transitionDuration)
        .remove();

    // x axis
    var axisX = svg.selectAll("g")
                    .data(["x"], function(d) {
                        return d[0];
                    });
    axisX.enter()
        .append("g")
        .transition()
        .delay(500)
        .duration(transitionDuration)
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    axisX.transition()
        .duration(transitionDuration)
        .delay(500)
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    // y axis
    var axisY = svg.selectAll("g")
                    .data(["y"], function(d) {
                        return d[0];
                    });
    axisY.enter()
        .append("g")
        .transition()
        .duration(transitionDuration)
        .delay(500)
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    axisY.transition()
        .duration(transitionDuration)
        .delay(500)
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);


}

function lines() {
    buttonOn = !buttonOn;
    console.log(buttonOn);
    draw(currentDataset);

}
