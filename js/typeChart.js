class TypeChart {
    constructor(typeData) {
        this.data = typeData;
        const types = ['water', 'normal', 'grass', 'bug', 'fire', 'psychic',
        'rock', 'electric', 'ground', 'dark', 'poison', 'fighting',
        'dragon', 'ghost', 'ice', 'steel', 'fairy', 'flying']

        this.typeToIndex = new Map();
        for(let i = 0; i < types.length; i++) {
            this.typeToIndex.set(types[i], i);
        }

        this.colors = ['#718bc6', '#a7a878', '#7cc251', '#a8b939', '#ef802e', '#f05888',
        '#b7a036', '#f8d031', '#e0c067', '#6c537a', '#d874d3', ' #c03228',
        '#6457a5', '#705999', '#98d7d6', '#b8b8cf', '#ee99ac', '#9f8fc4']

        // 0:neutral against, 1:weak against, 2:strong against, 3:no affect against
        this.legend = ['none', '#20639B80', '#F6D55C80', '#ED553B80'];

        this.width = 1200;
        this.height = 650;

        this.smallPadding = 15;
        this.bigPadding = 50;

        this.drawArcChart();
    }

    drawArcChart() {
        /*Initiate the SVG*/
        let svg = d3.select(".item-types").append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g");

        let relations = this.createRelations(this.data);

        let spacing = (this.width)/relations.nodes.length
        let xPos = d3.scaleLinear()
            .range([30, this.width - spacing])
            .domain([0, relations.nodes.length-1])

        svg.append("g")
            .classed("line-group", true)
            .selectAll("path")
            .data(relations.links)
            .join("path")
            .classed("type-line", true)
            .attr("d", d => {
                const start = xPos(this.typeToIndex.get(d.from));
                const end = xPos(this.typeToIndex.get(d.to));
                return ['M', start, this.height-this.bigPadding,    // the arc starts at the coordinate x=start, y=height-30 (where the starting node is)
                'A',                            // This means we're gonna build an elliptical arc
                (start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Height of this point is proportional with start - end distance
                (start - end)/2, 0, 0, ',',
                start < end ? 1 : 0, end, ',', this.height-this.bigPadding] // We always want the arc on top. So if end is before start, putting 0 here turn the arc upside down.
                .join(' ');
            })

        let nodes = svg.append("g")
            .classed("node-group", true)
            .selectAll("circle")
            .data(relations.nodes)
            .join("circle")
            .classed("type-circle", true)
            .attr("cx", (_, i) => xPos(i))
            .attr("cy", this.height - this.bigPadding)
            .attr("r", 15)
            .style("fill", (_, i) => this.colors[i])

        svg.append("g")
            .classed("label-group", true)
            .selectAll("text")
            .data(relations.nodes)
            .join("text")
            .classed("type-label", true)
            .attr("x", (_, i) => xPos(i))
            .attr("y", this.height - this.smallPadding)
            .text(d => d)

        nodes.on('mouseover', function(d) {
            d3.select(this).style("stroke-width", 2);

            let nodeLinks = d3.selectAll(".type-line");
            nodeLinks.classed("blurred-line", true);

            // Strong or no effect against
            nodeLinks.filter(link => link.from === d)
                .attr("class", link => {
                    const prepend = "type-line ";
                    if(link.relation == "strong_against")
                        return prepend + "highlight-strong";
                    else if(link.relation == "weak_against")
                        return prepend + "highlight-weak";
                    else if(link.relation == "no_effect_against")
                        return prepend + "highlight-no-effect";

                    return prepend;
                })
                .raise()
        })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke-width", 1)
            d3.selectAll(".type-line").attr("class", "type-line");
        })

        this.drawLegend();
    }

    createRelations(data) {
        let result = {};
        result.links = [];
        data.forEach(d => {
            const name = d.type;
            if (d.strong_against.length > 0)
                d.strong_against.forEach(t => {
                    result.links.push({from: name, to: t, relation: "strong_against"})
                })
                
            if (d.weak_against.length > 0)
                d.weak_against.forEach(t => {
                    result.links.push({from: name, to: t, relation: "weak_against"})
                })
            if (d.no_effect_against.length > 0)
                d.no_effect_against.forEach(t => {
                    result.links.push({from: name, to: t, relation: "no_effect_against"})
                })
        })

        result.nodes = data.map(d => d.type);
        return result
    }

    drawLegend() {
        let legendGroup = d3.select(".item-types")
            .select("svg")
            .append("g")
            .classed("legend-group", true)
            .attr("transform", "translate(15, 15)")

        let item1 = legendGroup.append("g");
        item1.append("line")
            .attr("x1", 0)
            .attr("x2", 25)
            .classed("highlight-strong", true)
        item1.append("text")
            .text("Strong Against")
            .attr("transform", "translate(30, 5)")

        let item2 = legendGroup.append("g").attr("transform", "translate(0, 25)");
        item2.append("line")
            .attr("x1", 0)
            .attr("x2", 25)
            .classed("highlight-weak", true)
        item2.append("text")
            .text("Weak Against")
            .attr("transform", "translate(30, 5)")

        let item3 = legendGroup.append("g").attr("transform", "translate(0, 50)");
        item3.append("line")
            .attr("x1", 0)
            .attr("x2", 25)
            .classed("highlight-no-effect", true)
        item3.append("text")
            .text("No Effect Against")
            .attr("transform", "translate(30, 5)")
    }
}