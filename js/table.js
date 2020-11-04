class Table {
    constructor(data, updateInfocard) {
        this.data = data;
        this.updateInfocard = updateInfocard;
        this.visWidth = 84;
        this.visHeight = 25;
        this.colKeys = ["pokedex_number", "name", "type1", "type2", "hp", "attack", "defense", "sp_attack", "sp_defense", "speed"];
        this.visLabels = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed']

        this.headerData = this.makeHeaderData();

        this.attachSortHandlers();
        this.drawTable();
    }

    drawTable() {
        this.updateHeaders();
        let rows = d3.select("#table-body")
            .selectAll("tr")
            .data(this.data)
            .join("tr")
            .attr("class", "row");

        rows.on("click", d => this.updateInfocard(d));

        let tds = rows.selectAll("td")
            .data(this.getCellData)
            .join("td");
        tds.filter(d => !d.vis)
            .text(d => d.val);

        let statsSelect = tds.filter(d => d.vis);
        this.makeStatsVis(statsSelect);
    }

    getCellData(d) {
        let cells = [];
        let wordVals = [d.pokedex_number, d.name, d.type1, d.type2];
        wordVals.forEach(d => {
            let statInfo = {
                vis: false,
                val: d
            };
            cells.push(statInfo);
        });

        let visVals = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed']
        visVals.forEach(key => {
            let statInfo = {
                vis: true,
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
            let sortKey = key;
            let x = a[sortKey];
            let y = b[sortKey];

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
            .classed("tooltip", true);

        selection.selectAll("rect")
            .data(d => [d])
            .join("rect")
            .attr("class", d => `${d.type}-type`)
            .attr("width", d => {
                let scale = d3.scaleLinear()
                    .domain([d3.min(that.data, data => data[d.stat]), d3.max(this.data, data => data[d.stat])])
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
}