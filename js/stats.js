class Stats {
    constructor(data) {
        this.data = data;
        this.visWidth = 220;
        this.visHeight = 15;
        this.height = 300;
        this.offset = 80;
        this.selected = this.data[3];
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

    updatePlot() {
        let stats = this.statKeys.map(k => this.calculateQuartiles(k, this.data));

        let svg = d3.select("#stats-svg");
        // Middle lines
        svg.selectAll(".horizontalLines")
            .data(stats)
            .join("line")
            .classed("horizontalLines", true)
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
            .style("stroke", d => this.statColors(d.name))
            .style("stroke-width", "2px");

        // Show median
        svg.selectAll(".medianLines")
            .data(stats)
            .join("line")
            .classed("medianLines", true)
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
            .style("stroke", d => this.statColors(d.name))
            .style("stroke-width", "2px");

        // End lines
        svg.selectAll(".minLines")
            .data(stats)
            .join("line")
            .classed("minLines", true)
            .attr("x1", this.offset)
            .attr("x2", this.offset)
            .attr("y1", d => this.yScale(d.name) - (this.visHeight/2))
            .attr("y2", d => this.yScale(d.name) + (this.visHeight/2))
            .style("stroke", "gray")
            .style("stroke-width", "2px");

        svg.selectAll(".maxLines")
            .data(stats)
            .join("line")
            .classed("maxLines", true)
            .attr("x1", this.visWidth)
            .attr("x2", this.visWidth)
            .attr("y1", d => this.yScale(d.name) - (this.visHeight/2))
            .attr("y2", d => this.yScale(d.name) + (this.visHeight/2))
            .style("stroke", "gray")
            .style("stroke-width", "2px");

        // Stat labels
        svg.selectAll(".labelText")
            .data(stats)
            .join("text")
            .classed("labelText", true)
            .attr("x", 0)
            .attr("y", d => this.yScale(d.name) + 5)
            .text((d, i) => this.labels[i])
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("fill", "gray");
        
        // Stat numbers
        svg.selectAll(".minText")
            .data(stats)
            .join("text")
            .classed("minText", true)
            .attr("x", this.offset-15)
            .attr("y", d => this.yScale(d.name) + 3)
            .text(d => d.min)
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .attr("fill", "gray");

        svg.selectAll(".maxText")
            .data(stats)
            .join("text")
            .classed("maxText", true)
            .attr("x", this.visWidth+5)
            .attr("y", d => this.yScale(d.name) + 3)
            .text(d => d.max)
            .attr("font-size", "9px")
            .attr("font-weight", "bold")
            .attr("fill", "gray");
        
        this.drawSelected()
    }

    drawSelected() {
        let svg = d3.select("#stats-svg");
        svg.selectAll("circle")
            .data(this.statKeys)
            .join("circle")
            .transition()
            .duration(800)
            .attr("visibility", d => {
                let scale = this.getScale(d);
                let scaledVal = scale(this.selected[d]);
                return (scaledVal >= this.offset) && (scaledVal <= this.visWidth) ? 
                    "visible" : 
                    "hidden";
            })
            .attr("cx", d => {
                let scale = this.getScale(d);
                return scale(this.selected[d]);
                // return (scaledVal >= this.offset) && (scaledVal <= this.visWidth) ? 
                //     scaledVal : 
                //     scaledVal < this.offset ? this.offset-3 : this.visWidth-3;
            })
            .attr("cy", d => this.yScale(d))
            .attr("r", 6)
            .attr("class", `${this.selected.type1}-type`)
            .style("opacity", 0.60)
            .style("stroke", "none");
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

    updateScales() {
        this.hpScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.hp), d3.max(this.data, d => d.hp)])
            .range([this.offset, this.visWidth]).nice();
        this.atkScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.attack), d3.max(this.data, d => d.attack)])
            .range([this.offset, this.visWidth]).nice();
        this.defScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.defense), d3.max(this.data, d => d.defense)])
            .range([this.offset, this.visWidth]).nice();
        this.spdScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.speed), d3.max(this.data, d => d.speed)])
            .range([this.offset, this.visWidth]).nice();
        this.spAtkScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.sp_attack), d3.max(this.data, d => d.sp_attack)])
            .range([this.offset, this.visWidth]).nice();
        this.spDefScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.sp_defense), d3.max(this.data, d => d.sp_defense)])
            .range([this.offset, this.visWidth]).nice();
    }

    updateData(newData) {
        if (newData.length > 0) {
            this.data = newData;
            this.updateScales();
            this.updatePlot();
        }
    }

    updateSelected(selected) {
        this.selected = selected;
        this.drawSelected();
    }
}