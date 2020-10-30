class Table {
    constructor(data, updateInfocard) {
        this.data = data;
        this.updateInfocard = updateInfocard;
        this.colKeys = ["pokedex_number", "name", "type1", "type2", "hp", "attack", "defense", "sp_attack", "sp_defense", "speed"];
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

        rows.selectAll("td")
            .data(this.getCellData)
            .join("td")
            .text(d => d);
    }

    getCellData(d) {
        let cells = [d.pokedex_number, d.name, d.type1, d.type2, d.hp, d.attack, d.defense, d.sp_attack, d.sp_defense, d.speed];
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
}