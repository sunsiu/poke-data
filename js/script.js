let pokeData;
let evolveData;
Promise.all([d3.json('./data/pokemon.json'), d3.json('./data/evolutions.json')]).then(function (loaded) {
    pokeData = loaded[0];
    evolveData = loaded[1];
    console.log(pokeData)

    function updateInfocard(data) {
        infocard.updateSelected(data);
    }

    function updateTable(data, isBrushed) {
        table.updateData(data, isBrushed);
    }

    function updateSelectedRow(data) {
        table.updateSelected(data);
    }

    function updateAllData(dataset) {
        table.updateData(dataset);  // Updating scatterplot with (potentially) filtered dataset in table update
        infocard.updateSelected(dataset[3]);
    }

    function updateScatterplot(data) {
        scatterplot.updateData(data);
    }

    function updateSelectedCircle(data) {
        scatterplot.updateSelected(data);
    }
    
    let table = new Table(pokeData, updateInfocard, updateScatterplot, updateSelectedCircle);
    let scatterplot = new Scatterplot(pokeData, updateInfocard, updateSelectedRow);
    let infocard = new Infocard(pokeData[3], typeRender, getEvolutionTree,
         getPokemon, updateSelectedCircle, updateSelectedRow);
    let stats = new Stats(pokeData);
    
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
    if (type2) {
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

function getPokemon(id) {
    return pokeData.filter(d => +d.pokedex_number == id)[0];
}

function getEvolutionTree(pokedex_id) {
    const index = pokedex_id - 1
    let current = evolveData[index];

    // Get root of evolution tree
    while(current.ev_from !== 0) {
        current = evolveData[current.ev_from - 1];
    }

    let tree = addNode(current);
    return tree;
}

function addNode(cur) {
    let node = {};
    node["id"] = cur.long_id;
    node["name"] = pokeData[cur.long_id - 1].name;
    node["parent"] = cur.ev_from;
    node["children"] = [];

    if(!cur.is_full_ev) {
        for(let childId of cur.ev_to) {
            node["children"].push(addNode(evolveData[childId - 1]));
        }
    }
    return node
}

