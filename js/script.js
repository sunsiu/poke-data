d3.csv('./data/pokemon.csv').then(function (data) {
    console.log(data)
    
    let infocard = new Infocard(data[3]);
    
    function updateInfocard(data) {
        infocard.updateSelected(data);
    }

});