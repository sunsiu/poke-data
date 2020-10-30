d3.csv('./data/pokemon.csv').then(function (data) {
    console.log(data)
    
    let infocard = new Infocard(data[3]);
    let table = new Table(data, updateInfocard);
    
    function updateInfocard(data) {
        infocard.updateSelected(data);
    }

    function updateAllData(dataset) {
        infocard.updateSelected(dataset[3]);
        table.updateData(dataset);
    }
    setupBanner(data, updateAllData);
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

