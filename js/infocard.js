class Infocard {
    constructor(selected) {
        this.selected = null;

        this.updateSelected(selected);
    }

    updateSelected(data) {
        this.selected = data;

        let header = d3.select(".infocard-header");
        let body = d3.select(".infocard-body");

        header.select("#info-name").text(`${data.name} #${data.pokedex_number}`);

        d3.select("#infocard").classed(`${data.type1}-type`, true);
        body.select("#info-types").html(this.renderTypes(data.type1, data.type2));
        body.select("#info-height").text(`Height:  ${data.height_m}m`);
        body.select("#info-weight").text(`Weight:  ${data.weight_kg}kg`);

        let stats = {
            hp: data.hp,
            attack: data.attack,
            defense: data.defense,
            sp_attack: data.sp_attack,
            sp_defense: data.sp_defense
        }
    }

    renderTypes(type1, type2) {
        return `${type1}`
    }
}