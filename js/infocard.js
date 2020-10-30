class Infocard {
    constructor(selected, renderTypes) {
        this.selected = null;
        this.renderTypes = renderTypes;
        this.updateSelected(selected);
    }

    updateSelected(data) {
        this.selected = data;

        let header = d3.select(".infocard-header");
        let body = d3.select(".infocard-body");

        header.select("#info-name").text(`${data.name} #${data.pokedex_number}`);

        d3.select("#infocard").attr("class", `${data.type1}-type`);
        body.select(".sprite").attr("src", `sprites/pokemon/${data.pokedex_number}.png`)
        body.select("#info-types").html(`<label>Types:</label>${this.renderTypes(data.type1, data.type2)}`);
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
}