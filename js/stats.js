class Stats {
    constructor(data) {
        this.data = data;
        this.visWidth = 220;
        this.visHeight = 25;
        this.height = 300;
        this.offset = 80;
        this.statKeys = ["attack", "defense", "speed", "hp", "sp_attack", "sp_defense"];
        this.labels = ["ATK", "DEF", "SPD", "HP", "SP ATK", "SP DEF"];
        this.hpScale = d3.scaleLinear()
            .domain([0, 255]).range([this.offset, this.visWidth]).nice()
        this.atkScale = d3.scaleLinear()
            .domain([0, 185]).range([this.offset, this.visWidth]).nice()
        this.defScale = d3.scaleLinear()
            .domain([0, 230]).range([this.offset, this.visWidth]).nice()
        this.spdScale = d3.scaleLinear()
            .domain([0, 180]).range([this.offset, this.visWidth]).nice()
        this.spAtkScale = d3.scaleLinear()
            .domain([0, 194]).range([this.offset, this.visWidth]).nice()
        this.spDefScale = d3.scaleLinear()
            .domain([0, 230]).range([this.offset, this.visWidth]).nice()
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
            .attr("width", this.visWidth+30)
            .attr("height", this.height);

    }

    updatePlot(data) {
        let stats = this.statKeys.map(k => this.calculateQuartiles(k, data));

        let svg = d3.select("#stats-svg");
        // Middle lines
        svg.selectAll("horizontalLines")
            .data(stats)
            .join("line")
            .attr("x1", this.offset)
            .attr("x2", this.visWidth)
            .attr("y1", d => this.yScale(d.name))
            .attr("y2", d => this.yScale(d.name))
            .style("stroke", "gray")
            .style("stroke-width", "2px");

        // Middle box
        svg.selectAll("rect")
            .data(stats)
            .join("rect")
            .attr("x", d => {
                let scale = this.getScale(d.name);
                return scale(d.q1);
            })
            .attr("y", d => this.yScale(d.name) - (this.visHeight/2))
            .attr("height", this.visHeight)
            .attr("width", d => {
                let scale = this.getScale(d.name);
                return scale(d.q3) - scale(d.q1);
            })
            .style("fill", "none")
            .style("stroke", d => {
                let c = d3.color(this.statColors(d.name));
                c.opacity = 1
                return c;
            })
            .style("stroke-width", "2px");

        // Show median
        svg.selectAll("medianLines")
            .data(stats)
            .join("line")
            .attr("x1", d => {
                let scale = this.getScale(d.name);
                return scale(d.median);
            })
            .attr("x2", d => {
                let scale = this.getScale(d.name);
                return scale(d.median);
            })
            .attr("y1", d => this.yScale(d.name) - (this.visHeight/2))
            .attr("y2", d => this.yScale(d.name) + (this.visHeight/2))
            .style("stroke", d => {
                let c = d3.color(this.statColors(d.name));
                c.opacity = 1
                return c;
            })
            .style("stroke-width", "2px");

        svg.selectAll("minLines")
            .data(stats)
            .join("line")
            .attr("x1", this.offset)
            .attr("x2", this.offset)
            .attr("y1", d => this.yScale(d.name) - (this.visHeight/2))
            .attr("y2", d => this.yScale(d.name) + (this.visHeight/2))
            .style("stroke", "gray")
            .style("stroke-width", "2px");
        svg.selectAll("maxLines")
            .data(stats)
            .join("line")
            .attr("x1", this.visWidth)
            .attr("x2", this.visWidth)
            .attr("y1", d => this.yScale(d.name) - (this.visHeight/2))
            .attr("y2", d => this.yScale(d.name) + (this.visHeight/2))
            .style("stroke", "gray")
            .style("stroke-width", "2px");

        // Stat labels
        svg.selectAll("labelText")
            .data(stats)
            .join("text")
            .attr("x", 0)
            .attr("y", d => this.yScale(d.name) + 5)
            .text((d, i) => this.labels[i])
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "gray");
        
        // Stat numbers
        svg.selectAll("minText")
            .data(stats)
            .join("text")
            .attr("x", this.offset-13)
            .attr("y", d => this.yScale(d.name) + 3)
            .text(d => d.min)
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .attr("fill", "gray");
        svg.selectAll("maxText")
            .data(stats)
            .join("text")
            .attr("x", this.visWidth+5)
            .attr("y", d => this.yScale(d.name) + 3)
            .text(d => d.max)
            .attr("font-size", "9px")
            .attr("font-weight", "bold")
            .attr("fill", "gray");
    }

    getScale(key) {
        switch(key) {
            case "attack":
                return this.atkScale;
            case "defense":
                return this.defScale;
            case "speed":
                return this.spdScale;
            case "hp":
                return this.hpScale;
            case "sp_attack":
                return this.spAtkScale;
            case "sp_defense":
                return this.spDefScale;
        }
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