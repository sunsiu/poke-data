class Infocard {
    constructor(selected, renderTypes, getEvolutionTree) {
        this.selected = null;
        this.renderTypes = renderTypes;
        this.getEvolutionTree = getEvolutionTree;
        this.statNames = ['HP', 'ATK', 'DEF', 'SPEED', 'SP ATK', 'SP DEF'];

        let context = document.getElementById("statsChart").getContext('2d');
        this.chart = new Chart(context, {
            type: 'radar',
            data: {
                labels: this.statNames,
            },
            options: {
                legend: {
                    display: false
                },
                scale: {
                    ticks: {
                        maxTicksLimit: 4,
                        showLabelBackdrop: false,
                        min: 0,
                        max: 100,
                    },
                    pointLabels: {
                        fontStyle: 'bold' 
                    }
                }
            }
        })
        d3.select(".infocard-footer").append("svg")
            .attr("width", "100%")
            .attr('height', '200px')
            .classed("family-tree", true)

        this.typeColorScale = d3.scaleOrdinal()
            .domain(['water', 'normal', 'grass', 'bug', 'fire', 'psychic',
                     'rock', 'electric', 'ground', 'dark', 'poison', 'fighting',
                     'dragon', 'ghost', 'ice', 'steel', 'fairy', 'flying'])
            .range(['#718bc680', '#a7a87880', '#7cc25180', '#a8b93980', '#ef802e80', '#f0588880',
                    '#b7a03680', '#f8d03180', '#e0c06780', '#6c537a80', '#d874d380', ' #c0322880',
                    '#6457a580', '#70599980', '#98d7d680', '#b8b8cf80', '#ee99ac80', '#9f8fc480'])

        this.hpScale = d3.scaleLinear()
            .domain([0, 255]).range([0, 100]).nice()
        this.atkScale = d3.scaleLinear()
            .domain([0, 185]).range([0, 100]).nice()
        this.defScale = d3.scaleLinear()
            .domain([0, 230]).range([0, 100]).nice()
        this.spdScale = d3.scaleLinear()
            .domain([0, 180]).range([0, 100]).nice()
        this.spAtkScale = d3.scaleLinear()
            .domain([0, 194]).range([0, 100]).nice()
        this.spDefScale = d3.scaleLinear()
            .domain([0, 230]).range([0, 100]).nice()
        
        this.updateSelected(selected);
    }

    updateSelected(data) {
        this.selected = data;

        let header = d3.select(".infocard-header");
        let body = d3.select(".infocard-body");
        let footer = d3.select(".infocard-footer");

        header.select("#info-name").text(`${data.name} #${data.pokedex_number}`);

        d3.select("#infocard").attr("class", `${data.type1}-type`);
        body.select(".sprite").attr("src", `sprites/pokemon/${data.pokedex_number}.png`)
        body.select("#info-types").html(`<label>Types:</label>${this.renderTypes(data.type1, data.type2)}`);
        body.select("#info-height").text(`Height:  ${data.height_m}m`);
        body.select("#info-weight").text(`Weight:  ${data.weight_kg}kg`);
        d3.select("#evolve-toggle")
            .on("change", function() {
                if(d3.select('#evolve-toggle').node().checked) {
                    footer.style("display", "block");
                }
                else {
                    footer.style("display", "none");
                }
            })

        footer.style("border", `3px solid ${this.typeColorScale(data.type1)}`)
            .style("background", "white")

        let stats = [this.hpScale(+data.hp), this.atkScale(+data.attack), this.defScale(+data.defense),
            this.spdScale(+data.speed), this.spAtkScale(+data.sp_attack), this.spDefScale(+data.sp_defense)]
        this.drawStats(stats, data.type1);

        this.drawEvolutionTree();
    }

    drawStats(stats, type) {
        this.chart.data.datasets = [{
                data: stats,
                backgroundColor: `${this.typeColorScale(type)}`,
            }]
        this.chart.update();
    }

    drawEvolutionTree() {
        let tree = this.getEvolutionTree(this.selected.pokedex_number);
        let treeSvg = d3.select(".family-tree").data(tree);

        treeSvg.selectAll()

    }
}