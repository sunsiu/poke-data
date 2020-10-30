class Table {
    constructor(data, updateInfocard) {
        this.data = data;
        this.updateInfocard = updateInfocard;
        this.drawTable();
    }

    drawTable() {
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
}