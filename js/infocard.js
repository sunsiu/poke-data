class Infocard {
    constructor(selected, renderTypes, getEvolutionTree, getPokemon, updateSelectedCircle, updateSelectedRow) {
        this.selected = null;
        this.renderTypes = renderTypes;
        this.getEvolutionTree = getEvolutionTree;
        this.getPokemon = getPokemon;
        this.updateSelectedCircle = updateSelectedCircle;
        this.updateSelectedRow = updateSelectedRow;

        this.statNames = ['HP', 'ATK', 'DEF', 'SPEED', 'SP ATK', 'SP DEF'];

        let context = document.getElementById("statsChart").getContext('2d');
        this.chart = new Chart(context, {
            type: 'radar',
            data: {
                labels: this.statNames,
                datasets: [{
                    data: [],
                    backgroundColor: 'gray'
                }]
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
        body.select("#info-height").text(`Height: ${data.height_m ? data.height_m : '?'} m`);
        body.select("#info-weight").text(`Weight: ${data.weight_kg ? data.weight_kg : '?'} kg`);
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
        this.chart.data.datasets[0].data = stats
        this.chart.data.datasets[0].backgroundColor = `${this.typeColorScale(type)}`
        this.chart.update();
    }

    drawEvolutionTree() {
        let treeData = this.getEvolutionTree(this.selected.pokedex_number);

        let root = d3.hierarchy(treeData);
        const treeWidth = 435;
        const treeHeight = 200;
        let treeLayout = d3.tree().size([treeHeight, treeWidth]);
        treeLayout(root);

        let offset;
        let height = root.height;
        if (height == 0) {
            offset = 250;
        }
        else {
            offset = 30;
        }
        // Nodes
        let that = this;
        let nodeGroups = d3.select('.family-tree')
            .selectAll('g')
            .data(root.descendants())
            .join('g')
            .attr("transform", d => `translate(${d.y + offset}, ${d.x})`) // Mirror the tree
            .attr("id", d => `evo-${d.data.id}`)
            .classed('node', true)
            .on("click", function() {
                // Remove the "evo-" from the id
                const selectedId = this.id.slice(4);
                that.updateSelected(that.getPokemon(+selectedId))
                that.updateSelectedCircle({pokedex_number: selectedId});
                that.updateSelectedRow({pokedex_number: selectedId});
            });

        // Nodes
        nodeGroups.selectAll("circle")
            .data(d => [d])
            .join("circle")
            .attr('r', 22)
            .style("stroke", this.typeColorScale(this.selected))
            .classed("evo-bubble", true)

        nodeGroups.selectAll("image")
            .data(d => [d])
            .join("image")
            .attr("href", d => `sprites/pokemon/${d.data.id}.png`)
            .attr("height", 40)
            .attr("width", 40)
            .attr("x", -20)
            .attr("y", -20)

        // Links
        d3.select('.family-tree')
            .selectAll('line')
            .data(root.links())
            .join('line')
            .classed('link', true)
            .attr('x1', d => d.source.y + offset + 22)
            .attr('y1', d => d.source.x)
            .attr('x2', d => d.target.y + 8)
            .attr('y2', d => d.target.x);
   
    }
}