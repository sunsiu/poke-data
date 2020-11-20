class TypeChart {
    constructor(typeData) {
        this.data = typeData;
        this.types = ['water', 'normal', 'grass', 'bug', 'fire', 'psychic',
        'rock', 'electric', 'ground', 'dark', 'poison', 'fighting',
        'dragon', 'ghost', 'ice', 'steel', 'fairy', 'flying']
        this.colors = ['#718bc6', '#a7a878', '#7cc251', '#a8b939', '#ef802e', '#f05888',
        '#b7a036', '#f8d031', '#e0c067', '#6c537a', '#d874d3', ' #c03228',
        '#6457a5', '#705999', '#98d7d6', '#b8b8cf', '#ee99ac', '#9f8fc4']

        // 0:neutral against, 1:weak against, 2:strong against, 3:no affect against
        this.legend = ['none', '#20639B80', '#F6D55C80', '#ED553B80'];

        this.size = 750;
        this.drawChords();
    }

    drawChords() {
        const innerRadius = this.size * .39;
        const outerRadius = innerRadius * 1.04;

        let chord = d3.chord()
            .padAngle(.04)
            .sortSubgroups(d3.descending) /*sort the chords inside an arc from high to low*/
            .sortChords(d3.descending) /*which chord should be shown on top when chords cross. Now the biggest chord is at the bottom*/

        /*Initiate the SVG*/
        let svg = d3.select(".item-types").append("svg")
            .attr("width", this.size)
            .attr("height", this.size)

        let chords = chord(this.data);

        let g = svg.append("g")
            .attr("transform", `translate(${this.size/2}, ${this.size/2})`)

        let arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
            
        let groups = g.append("g")
            .classed("groups", true)
            .selectAll("g")
            .data(chords.groups)
            .join("g")
            
        groups.append("path")
              .attr("class", "arc")
              .style("stroke", d => this.colors[d.index])
              .style("fill", d => this.colors[d.index])
              .attr("d", arc);

        let ribbon = d3.ribbon()
            .radius(innerRadius);

        console.log(chords)
        let ribbons = g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(chords)
            .join("path")
            .attr("d", ribbon)
            .style("stroke", d => this.legend[d.source.value])
            .style("fill", d => this.legend[d.source.value])
    }
}