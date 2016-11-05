function createTooltip(svg, tooltipOptions) {
    width = tooltipOptions.width || 40;
    height = tooltipOptions.height || 20;
    var tooltipGroup = svg.append("g")
        .attr("class", "tooltip")				
        .style("opacity", 0);
    var tooltipRect = tooltipGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
    tooltipGroup.append("rect")
        .attr("width", 8)
        .attr("height", 8)
        .attr("x", width/2 - 4)
        .attr("y", height - 4)
        .attr("transform", "rotate(45 " + width/2 + " " + height + ")")
    var tooltipText = tooltipGroup.append("text")
        .attr("x", width/2)
        .attr("y", height/2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central");
    var tooltip = {
        move: function(x, y) {
            tooltipGroup.attr("transform",  "translate(" + (x - width/2) + "," + (y - height - 5) + ")");
            return tooltip;
        },
        visible: function(value) {
            tooltipGroup.style("opacity", value ? 1 : 0)
            return tooltip;
        },
        text: function(text) {
            tooltipText.text(text);
            return tooltip;
        }
    }
    return tooltip;
}

function createBarChart(options) {
    var data = options.data;
    var outerWidth = document.body.offsetWidth * 0.9 - 20; // possible scroll
    if (outerWidth > 800) {
        outerWidth /= 2;
    }
    var outerHeight = Math.max(outerWidth/2, 200);
    var margin = {top: 60, right: 20, bottom: 30, left: 50},
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;
    var barWidth = width/data.length - 1;
    var xTickGap = Math.ceil(32/barWidth);
    var lastTs = new Date(data[data.length-1].ts);
    lastTs.setHours(lastTs.getHours() + 1);
    var x = d3.scale.ordinal()
        .rangePoints([0, width])
        .domain(data.map(function(d) { return d.ts; }).concat(lastTs));

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, Math.ceil(d3.max(data, function(d) { return d.count; })/100) * 100]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function(d,i) {
            if (i%xTickGap == 0) {
                return options.tickFormat(d);
            }
        })

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(8);

    d3.select("#" + options.containerId + ">svg").remove()
    var svg = d3.select("#" + options.containerId).append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
    
    var bars = svg.selectAll(".bar").data(data).enter()
            .append("rect")
            
    bars.attr("class", "bar")
            .attr("x", function(d) { return x(d.ts); })
            .attr("width", barWidth)
            .attr("y", height)
            .attr("height", 0)
            .transition().duration(300)
            .attr("y", function(d) { return y(d.count); })
            .attr("height", function(d) { return height - y(d.count); })
    
    if (options.mouseover) {
        bars.on("mouseover", options.mouseover)
    }
    if (options.mouseout) {
        bars.on("mouseout", options.mouseout);
    }
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    
    svg.append("text")
        .attr("class", "title")
        .attr("x", width/2)
        .attr("y", -30)
        .style("text-anchor", "middle")
        .text(options.title);
        
    var tooltip = createTooltip(svg, options.tooltip);
    
    return {
        options: options,
        hover: function(d, value) {
            var bar = bars
                .filter(function(_d) { return _d.ts.getTime() === d.ts.getTime(); })
                .classed("hover", value);
            var tx = + bar.attr("x") + bar.attr("width")/2;
            var ty = + bar.attr("y");
            var text = bar.datum().count;
            if (options.tooltip && options.tooltip.text) {
                text = options.tooltip.text(bar.datum());
            }
            tooltip
                .visible(value)
                .move(tx, ty)
                .text(text)
        }
    };
}