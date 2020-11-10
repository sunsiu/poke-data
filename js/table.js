class Filter {
    constructor(label, value) {
        this.label = label;
        this.value = value;
    }
}

class Table {
    constructor(data, updateInfocard) {
        this.data = data;
        this.filteredData = [...this.data];
        this.updateInfocard = updateInfocard;
        this.visWidth = 70;
        this.visHeight = 25;
        this.currentFilters = [];
        this.colKeys = ["pokedex_number", "name", "type1", "type2", "hp", "attack", "defense", "sp_attack", "sp_defense", "speed"];
        this.visLabels = this.colKeys.slice(4);
        this.allTypes = ['water', 'normal', 'grass', 'bug', 'fire', 'psychic', 'rock', 'electric', 'ground', 'dark', 'poison', 'fighting',
            'dragon', 'ghost', 'ice', 'steel', 'fairy', 'flying']

        this.headerData = this.makeHeaderData();

        this.attachSortHandlers();
        this.attachFilterToggle();
        this.drawFilters();
        this.drawTable();
    }

    drawTable(data = this.data) {
        if (this.currentFilters.length > 0) {
            // Filter data again
        }
        this.updateHeaders();
        let rows = d3.select("#table-body")
            .selectAll("tr")
            .data(data)
            .join("tr")
            .attr("class", "row");

        rows.on("click", d => this.updateInfocard(d));

        let tds = rows.selectAll("td")
            .data(this.getCellData)
            .join("td");

        tds.filter(d => !d.vis && !d.isType)
            .text(d => d.val);

        let typeImgs = tds.filter(d => !d.vis && d.isType).text(d => d.val ? "" : "--");
        typeImgs
            .selectAll("img")
            .data(d => [d])
            .join("img")
            .attr("src", d => d.val ? "sprites/types/" + d.val + ".png" : null)
            .attr("class", d=> d.val ? d.val + "-badge" : null);

        let statsSelect = tds.filter(d => d.vis);
        this.makeStatsVis(statsSelect);
    }

    getCellData(d) {
        let cells = [];
        let wordVals = ["pokedex_number", "name", "type1", "type2"];
        wordVals.forEach(key => {
            if (key.includes("type")) {
                let statInfo = {
                    vis: false,
                    isType: true,
                    val: d[key]
                };
                cells.push(statInfo);
            }
            else {
                let statInfo = {
                    vis: false,
                    isType: false,
                    val: d[key]
                };
                cells.push(statInfo);
            }
        });

        let visVals = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed']
        visVals.forEach(key => {
            let statInfo = {
                vis: true,
                isType: false,
                stat: key,
                type: d.type1,
                val: +d[key]
            };
            cells.push(statInfo);
        });

        return cells;
    }

    updateData(newData) {
        this.data = newData;
        this.drawTable();
    }

    updateHeaders() {
        let colSel = d3.select("#headers");
        colSel.selectAll("th")
            .data(this.headerData)
            .classed("sorting", d => d.sorted);

        colSel.selectAll("i")
            .data(this.headerData)
            .classed('no-display', d => !d.sorted)
            .classed('fa-sort-up', d => d.ascending && d.sorted)
            .classed('fa-sort-down', d => !d.ascending && d.sorted);
    }

    attachSortHandlers() {
        d3.select("#headers")
            .selectAll("th")
            .data(this.headerData)
            .on("click", d => {
                let sortAsc = d.sorted ? !d.ascending : true;
                this.sortData(d.key, sortAsc, d.func);
                this.headerData.forEach(h => h.sorted = false);
                d.sorted = true;
                d.ascending = sortAsc;
                this.drawTable();
            });
    }

    sortData(key, isAsc, func) {
        this.data.sort((a, b) => {
            let x = a[key];
            let y = b[key];

            if (!isAsc) {
                [x,y] = [y,x];
            }
            if (func) {
                x = func(x);
                y = func(y);
            }
            if (x < y) {
                return -1;
            }
            else if (x > y) {
                return 1;
            }
            return 0;
        });
    }

    makeHeaderData() {
        let headers = []
        let strings = this.colKeys.slice(1, 4);
        this.colKeys.forEach(k => {
            if (strings.includes(k)) {
                headers.push({
                    sorted: false,
                    ascending: false,
                    key: k
                });
            }
            else {
                headers.push({
                    sorted: false,
                    ascending: false,
                    key: k,
                    func: d => +d
                });
            }
        });


        return headers;
    }

    makeStatsVis(visSelection) {
        this.visLabels.forEach(stat => {
            let selection = visSelection.filter(d => d.stat === stat);
            let svg = selection.selectAll('svg')
                .data(d => [d])
                .join("svg")
                .attr("width", this.visWidth)
                .attr("height", this.visHeight);
            this.drawRects(svg);
        });
        
    }

    drawRects(selection) {
        let that = this;
        let tooltip = d3.select('#tool-tip')
            .classed("tooltip", true)
            .style("opacity", 0);

        selection.selectAll("rect")
            .data(d => [d])
            .join("rect")
            .attr("class", d => `${d.type}-type`)
            .attr("width", d => {
                let scale = d3.scaleLinear()
                    .domain([0, d3.max(this.data, data => data[d.stat])])
                    .range([0, this.visWidth]);
                return scale(d.val)
            })
            .attr("height", this.visHeight)
            .on("mouseover", function(d) {
                tooltip.style("opacity", 0.75)
                    .html(that.tooltipRender(d));
                d3.select(this)
                    .style("opacity", 0.5);
            })
            .on("mousemove", d => tooltip
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY) + "px"))
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0);
                d3.select(this)
                    .style("opacity", 1)
            });
    }

    attachFilterToggle() {
        let button = d3.select("#exp-button");
        button.on('click', function() {
            let filters = d3.select("#filters");
        
            if (filters.style("display") == 'none') {
                filters.style("display", "grid");
                button.select('i').classed("fa-sort-down", false)
                    .classed("fa-sort-up", true);
            }
            else {
                filters.style("display", "none");
                button.select("i").classed("fa-sort-down", true)
                    .classed("fa-sort-up", false);
            }
        });
    }

    drawFilters() {
        let filterSel = d3.select("#filters");

        let searchBar = d3.select("#search-bar");
        searchBar.on("keyup", () => this.onSearchPokemon());

        let imgGroup = filterSel.select("#type-buttons");
        this.allTypes.forEach(d => 
            imgGroup
                .append("img")
                .attr("src", "sprites/types/" + d + ".png")
                .attr("class", "filter-type-button")
                .on("click", () => {
                    let newFilter = new Filter("type", d);
                    if (!this.hasFilter(newFilter)) {  
                        this.currentFilters.push(new Filter("type", d));
                        this.filteredData = this.filteredData.filter(f => f.type1 == d  || f.type2 == d);
                        this.drawTable(this.filteredData);
                        this.drawCurrentFilter(newFilter);
                    }
                }));
    }

    drawCurrentFilter(filter) {
        let currFilterDiv = d3.select("#current-filters")
            .append("svg")
            .attr("id", filter.value + "-curr-filter");

        currFilterDiv.append("rect")
            .attr("class", "curr-filter");
        currFilterDiv.append("image")
            .attr("href", filter.label == "type" ? "sprites/types/" + filter.value + ".png" : null)
            .attr("height", "20px")
            .attr("width", "60px");
        currFilterDiv.append("image")
            .attr("href", "sprites/x.png")
            .attr("height", "15px")
            .attr("width", "15px")
            .attr("x", "63px")
            .attr("y", "3px");
    }

    removeFilter(filter) {

    }

    /**
     * Returns html that can be used to render the tooltip.
     * @author DataVis course staff
     * @param data 
     * @returns {string}
     */
    tooltipRender(data) {
        let text = "<h2>" + data.stat.toUpperCase() + ": " + data.val + "</h2>";
        return text;
    }

    onSearchPokemon() {
        let searchBar = d3.select("#search-bar");
        let filter = searchBar.property("value").toLowerCase();
        this.filteredData = this.data.filter(d => d.name.toLowerCase().includes(filter));
        this.drawTable(this.filteredData);
    }

    hasFilter(filter) {
        var f;
        for (f of this.currentFilters) {
            if (f.label == filter.label && f.value == filter.value) {
                return true;
            }
        }
        return false;
    }
}