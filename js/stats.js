class Stats {
    constructor(data) {
        this.data = data;
        this.visWidth = 200;
        this.visHeight = 40;
        this.height = 350;
        this.width = 250;
        this.statKeys = ["attack", "defense", "speed", "hp", "sp_attack", "sp_defense"];
        this.xScale = d3.scaleLinear()
            .domain([0,255])
            .range([0, this.width]);
        this.yScale = d3.scaleBand()
            .domain(this.statKeys)
            .range([0, this.height])
            .paddingInner(1)
            .paddingOuter(0.5);
        this.statColors = d3.scaleOrdinal()
            .domain(this.statKeys)
            .range(["#FA6163", "#F47E3E", "#F9C74F", "#90BE6D", "#6DC5AB", "#6687A3"]);

       this.drawPlot();
       this.updatePlot(this.data);
    }

    drawPlot() {
        let svg = d3.select("#stats")
            .append("svg")
            .attr("id", "stats-svg")
            .attr("width", this.width)
            .attr("height", this.height);
        // svg.append("g").call(d3.axisTop(this.xScale));
        // svg.append("g").call(d3.axisLeft(this.yScale));

    }

    updatePlot(data) {
        let stats = this.statKeys.map(k => this.calculateQuartiles(k, data));

        let svg = d3.select("#stats-svg");
        // Vertical line
        svg.selectAll("horizontalLines")
            .data(stats)
            .join("line")
            .attr("x1", d => this.xScale(d.min))
            .attr("x2", d => this.xScale(d.max))
            .attr("y1", d => this.yScale(d.name))
            .attr("y2", d => this.yScale(d.name));

        // Middle box
        svg.selectAll("rect")
            .data(stats)
            .join("rect")
            .attr("x", d => this.xScale(d.q1))
            .attr("y", d => this.yScale(d.name) - (this.visHeight/2))
            .attr("height", this.visHeight)
            .attr("width", d => this.xScale(d.q3) - this.xScale(d.q1))
            .style("fill", d => this.statColors(d.name));
    }

    calculateQuartiles(key, data) {
        let values = data.map(function(d) {
            return d[key];
        });
        values = values.sort(d3.ascending);
        
        let stats = {
            name: key,
            min: values[0],
            q1: d3.quantile(values, .25),
            median: d3.quantile(values, .5),
            q3: d3.quantile(values, .75),
            max: values[values.length-1]
        }
        return stats
    }

    updateData(newData) {
        this.data = newData;
        this.drawPlot();
    }
}