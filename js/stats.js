class Stats {
    constructor(data) {
        this.data = data;
        this.visWidth = 150;
        this.visHeight = 400;
        this.axisScale = d3.scaleLinear()
            .domain([0,255])
            .range([this.visHeight, 0]);
    }

    drawPlot() {

    }

    updateData(newData) {
        this.data = newData;
        this.drawPlot();
    }
}