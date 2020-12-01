class Filter {
    constructor(label, value) {
        this.label = label;
        this.value = value;
    }
}

class Table {
    constructor(data, updateInfocard, updateScatterplot, updateSelectedCircle, updateStats, updateSelectedStats) {
        this.data = data;
        this.filteredData = [...this.data];
        this.updateInfocard = updateInfocard;
        this.updateScatterplot = updateScatterplot;
        this.updateSelectedCircle = updateSelectedCircle;
        this.updateSelectedStats = updateSelectedStats;
        this.updateStats = updateStats;
        this.visWidth = 75;
        this.visHeight = 25;
        this.currentFilters = [];
        this.colKeys = ["pokedex_number", "name", "type1", "type2", "attack", "defense", "speed", "hp", "sp_attack", "sp_defense"];
        this.visLabels = this.colKeys.slice(4);
        this.statColors = d3.scaleOrdinal()
            .domain(this.visLabels)
            .range(["#FA6163", "#F47E3E", "#F9C74F", "#90BE6D", "#6DC5AB", "#6687A3"]);
        // ["#90be6d", "#f9c74f", "#f3722c", "#43aa8b", "#577590", "#ea2223"]
        // ["#f94144", "#f3722c", "#f9c74f", "#90be6d", "#43aa8b", "#577590"]
        this.allTypes = ['water', 'normal', 'grass', 'bug', 'fire', 'psychic', 'rock', 'electric', 'ground', 'dark', 'poison', 'fighting',
            'dragon', 'ghost', 'ice', 'steel', 'fairy', 'flying']

        this.headerData = this.makeHeaderData();

        this.attachSortHandlers();
        this.attachFilterToggle();
        this.drawFilters();
        this.drawTable();
    }

    drawTable() {
        let data = this.filteredData;
        this.updateHeaders();
        let rows = d3.select("#table-body")
            .selectAll("tr")
            .data(data)
            .join("tr")
            .attr("class", "row")
            .attr("id", d => `row-${d.pokedex_number}`)

        let that = this;
        rows.on("click", function(d) {
            that.updateSelected(d);
            that.updateSelectedStats(d);
            that.updateInfocard(d);
            that.updateSelectedCircle(d);
        });

        let tds = rows.selectAll("td")
            .data(this.getCellData)
            .join("td");

        tds.filter(d => !d.vis && !d.isType)
            .attr("width", d => d.stat == "pokedex_number" ? "30" : "70")
            .text(d => d.stat == "name" && d.isLegendary ? String.fromCharCode(9733) + d.val : d.val);

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

    updateSelected(sel, scrollTo=false) {
        this.clearSelected();
        if(sel !== null) {
            d3.select(`#row-${sel.pokedex_number}`).classed("highlight", true);
            if(scrollTo) {
                let container = $('tbody');
                let scrollTo = $(`#row-${sel.pokedex_number}`);

                container.scrollTop(scrollTo.offset().top - container.offset().top + container.scrollTop() - 30);
            }
        }
    }

    clearSelected() {
        d3.selectAll(".row").classed("highlight", false);
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
                    val: d[key],
                    stat: key,
                    isLegendary: d.is_legendary
                };
                cells.push(statInfo);
            }
        });

        let visVals = ["attack", "defense", "speed", "hp", "sp_attack", "sp_defense"]
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

    updateData(newData, isBrushed=false) {
        this.data = newData;
        if(!isBrushed) {
            this.updateCurrentFilters();
        }
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
        this.filteredData.sort((a, b) => {
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
            .style("visibility", "hidden");

        selection.selectAll("rect")
            .data(d => [d])
            .join("rect")
            .attr("width", d => {
                let scale = d3.scaleLinear()
                    .domain([0, d3.max(this.data, data => data[d.stat])])
                    .range([0, this.visWidth]);
                return scale(d.val)
            })
            .attr("height", this.visHeight)
            .style("fill", d => this.statColors(d.stat))
            .on("mouseover", function(d) {
                tooltip.style("visibility", "visible")
                    .html(that.tooltipRender(d));
                d3.select(this)
                    .style("opacity", 0.5);
            })
            .on("mousemove", d => tooltip
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY) + "px"))
            .on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
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

        // Legendary checkbox
        filterSel.select("#is-legendary-filter")
            .on("change", () => {
                let isChecked = filterSel.select("#is-leg").property("checked");
                let searchIdx = this.currentFilters.findIndex(f => f.label == "legendary");
                if (searchIdx < 0) {
                    let newFilter = new Filter("legendary", isChecked);
                    this.currentFilters.push(newFilter)
                }
                else {
                    this.currentFilters[searchIdx].value = isChecked;
                }
                this.updateCurrentFilters();
                this.drawTable();
            })

        let searchBar = d3.select("#search-bar");
        searchBar.on("keyup", () => {

            let searchVal = searchBar.property("value").toLowerCase();
            if (d3.event.keyCode === 13 || searchVal == "") {
                this.onSearchPokemon()
            }
            
        });

        // Type filter buttons
        let imgGroup = filterSel.select("#type-buttons");
        this.allTypes.forEach(d => 
            imgGroup
                .append("img")
                .attr("src", "sprites/types/" + d + ".png")
                .attr("class", "filter-type-button")
                .on("click", () => {
                    let newFilter = new Filter("type", d);
                    if (!this.hasFilter(newFilter)) {  
                        this.currentFilters.push(newFilter);
                        this.updateCurrentFilters();
                        this.drawTable();
                        this.drawCurrentFilter(newFilter);
                    }
                }));
        
        // Stat sliders
        var label;
        let that = this;
        for (label of this.visLabels) {
            let minVal = d3.min(this.data, d => d[label]);
            let maxVal = d3.max(this.data, d => d[label])
            d3.select("#" + label + "-label")
                .property("value", minVal + " - " + maxVal);

            $( "#" + label + "-range" ).slider({
                range: true,
                min: minVal,
                max: maxVal,
                values: [minVal, maxVal],
                slide: function(event, ui) {
                    let statKey = $(this).attr("id").split("-")[0];
                    d3.select("#" + statKey + "-label")
                        .property("value", ui.values[0] + " - " + ui.values[1]);
                },
                stop: function(event, ui) {
                    let statKey = $(this).attr("id").split("-")[0];
                    let filter = new Filter(statKey, [ui.values[0], ui.values[1]]);
                    if (!that.hasFilter(filter)) {  
                        that.currentFilters.push(filter);
                    }
                    else {
                        let i = that.currentFilters.findIndex(f => f.label == statKey);
                        that.currentFilters[i].value = filter.value;
                    }
                    that.updateCurrentFilters();
                    that.drawTable();
                }
            });
        }

        // Add clear all button 
        let svg = d3.select("#clear")
            .append("svg")
            .attr("width", "100px")
            .attr("height", "30px")
            .attr("id", "clear-all-button")
            .on("click", () => this.clearAllFilters());

        svg.append("text")
            .attr("x", 11)
            .attr("y", 19)
            .text("Clear all")
            .style("font-size", "14pt")
            .style("fill", "black")
            .style("opacity", "100%")
            .style("padding", "5px")
        svg.append("image")
            .attr("href", "assets/x.png")
            .attr("height", "15px")
            .attr("width", "15px")
            .attr("x", "83px")
            .attr("y", "5px");
    }

    drawCurrentFilter(filter) {
        let currFilterDiv = d3.select("#current-filters")
            .append("svg")
            .attr("id", filter.value + "-curr-filter")
            .on("click", () => {
                let selected = new Filter("type", filter.value);
                this.removeFilter(selected);
            });

        currFilterDiv.append("rect")
            .attr("class", "curr-filter");
        currFilterDiv.append("image")
            .attr("href", filter.label == "type" ? "sprites/types/" + filter.value + ".png" : null)
            .attr("height", "20px")
            .attr("width", "60px");
        currFilterDiv.append("image")
            .attr("href", "assets/x.png")
            .attr("height", "15px")
            .attr("width", "15px")
            .attr("x", "63px")
            .attr("y", "3px");

        d3.select("#clear-all-button").raise();
    }

    removeFilter(filter) {
        var i;
        for (i = 0; i < this.currentFilters.length; i++) {
            if (this.currentFilters[i].value == filter.value && this.currentFilters[i].label == filter.label) {
                this.currentFilters.splice(i, 1);
                break;
            }
        }
        
        this.updateCurrentFilters();

        d3.select("#" + filter.value + "-curr-filter").remove();
        this.drawTable();
    }

    clearAllFilters() {
        // Clear current filters
        this.currentFilters = [];
        d3.select("#current-filters").selectAll("svg").remove();

        // Clear legendary
        d3.select("#is-leg").property("checked", false);

        // Reset sliders
        var label;
        for (label of this.visLabels) {
            let minVal = d3.min(this.data, d => d[label]);
            let maxVal = d3.max(this.data, d => d[label]);
            d3.select("#" + label + "-label")
                .property("value", minVal + " - " + maxVal);

            $( "#" + label + "-range" ).slider('values', [minVal,maxVal]);
        }

        // Clear searchbar
        d3.select("#search-bar").property("value", "");

        // Clear sort headers
        this.sortData('pokedex_number', true, null);
        this.headerData.forEach(h => h.sorted = false);

        this.updateCurrentFilters()
        this.drawTable();
    }

    updateCurrentFilters() {
        this.filteredData = [...this.data];
        var f;
        for (f of this.currentFilters) {
            if (f.label == "type") {
                this.filteredData = this.filteredData.filter(d => d.type1 == f.value || d.type2 == f.value);
            }
            else if (f.label == "search") {
                this.filteredData = this.filteredData.filter(d => d.name.toLowerCase().includes(f.value) || d.pokedex_number == f.value);
            }
            else if (f.label == "legendary") {
                this.filteredData = this.filteredData.filter(d => d.is_legendary == f.value);
            }
            else {
                this.filteredData = this.filteredData.filter(d => d[f.label] >= f.value[0] && d[f.label] <= f.value[1]);
            }
        }

        this.updateScatterplot(this.filteredData);
        this.updateStats(this.filteredData);
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
        let searchVal = searchBar.property("value").toLowerCase();

        // Update current filters with searchbar value
        let searchIdx = this.currentFilters.findIndex(f => f.label == "search");
        if (searchIdx < 0) {
            let newFilter = new Filter("search", searchVal);
            this.currentFilters.push(newFilter)
        }
        else {
            this.currentFilters[searchIdx].value = searchVal;
        }
        this.updateCurrentFilters();
        this.drawTable();
    }

    hasFilter(filter) {
        var f;
        for (f of this.currentFilters) {
            if (f.value instanceof Array && f.label == filter.label) {
                return true;
            }
            if (f.label == filter.label && f.value == filter.value) {
                return true;
            }
        }
        return false;
    }
}