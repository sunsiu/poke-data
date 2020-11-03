Promise.all([d3.csv('./data/pokemon.csv'), d3.csv('./data/evolutions.csv')]).then(function (loaded) {
    let pokeData = loaded[0];
    let evolveData = loaded[1];
    console.log(pokeData)
    console.log(evolveData)
    
    let infocard = new Infocard(pokeData[3], typeRender, evolveData);
    let table = new Table(pokeData, updateInfocard);
    
    function updateInfocard(data) {
        infocard.updateSelected(data);
    }

    function updateAllData(dataset) {
        infocard.updateSelected(dataset[3]);
        table.updateData(dataset);
    }
    setupBanner(pokeData, updateAllData);
});

function setupBanner(data, updateAllData) {
    d3.select("#dataset-selector")
    .on("change", function() {
        let dataset = data;
        let setKey = d3.select("#dataset-selector").node().value;
        if (setKey !== "all") {
            dataset = data.filter(d => d.generation == setKey);
        }

        updateAllData(dataset);
    });
}

function typeRender(type1, type2) {
    if (type2 !== "") {
        return `
        <div class="type-container">
            <img class="${type1}-badge" src="sprites/types/${type1}.png">
            <img class="${type2}-badge" src="sprites/types/${type2}.png">
        </div>`
    }
    return `
    <div class="type-container">
        <img class="${type1}-badge" src="sprites/types/${type1}.png">
    </div>`;
}

