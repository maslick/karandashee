import * as d3 from "d3";

(function() {
    class Karandashee {
        constructor(options) {
            this.updateRate = options.updateRate || 2000;
            this.numberOfBars = options.numberOfBars || 96;
            this.minBarHeight = options.minBarHeight || 10;
            this.graphdiv = options.graphdiv;
            this.width = options.width || 960;
            this.observable = options.observable;
            this.barHeight = this.minBarHeight + 50;
            this.numbers = [];
            this.color = d3.scaleOrdinal(d3.schemePaired);
            this.key = options.key;
            this.values = options.values;
            this.humanValues = options.humanValues || options.values;
            this.onMouseOverCb = options.onMouseOverCb;
            this.onMouseOutCb = options.onMouseOutCb;
            this.currentTimestamp = null;

            this.initialize();
        }

        initialize() {
            this.reset();
            if (d3.select(this.graphdiv).empty()) {
                console.warn("no element found: " + this.graphdiv);
                return;
            }
            this.initArray();
            this.initGraph();
            this.createLegend();

            this.subscription = this.observable
                .map(x => ({
                    ...x,
                    val: this.barHeight * this.values.indexOf(x[this.key]) / this.values.length + this.minBarHeight,
                    color: this.color(this.values.indexOf(x[this.key]))
                }))
                .subscribe(x => {
                    if (this.currentTimestamp) {
                        let delay = x.timestamp - this.currentTimestamp;
                        const numberOfMissing = Math.floor(delay / this.updateRate) - 1;

                        for (let i = 0; i < numberOfMissing; i++) {
                            let ts = this.currentTimestamp + this.updateRate * (i + 1);

                            let dummy = {
                                val: 0,
                                color: "grey",
                                timestamp: this.currentTimestamp + this.updateRate * (i + 1)
                            };
                            this.numbers.push(dummy);
                            this.updateGraph();
                            this.updateAxes(dummy);
                        }

                    }
                    this.numbers.push(x);
                    this.updateGraph();
                    this.updateAxes(x);
                    this.currentTimestamp = x.timestamp;
                });
        }

        initArray() {
            this.numbers = new FixedQueue(this.numberOfBars);
        }

        initGraph() {
            d3.select(this.graphdiv).append("div").attr("id", "chart");
            // time axis
            let svg = d3.select(this.graphdiv)
                    .append("div")
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", 25)
                    .attr("id", "timescale"),
                margin = {top: 20, right: 0, bottom: 20, left: 0},
                h = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
                axisXGroup = g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + h + ")");
            this.w = +svg.attr("width") - margin.left - margin.right;
        }

        createLegend() {
            d3.select(this.graphdiv).append("div").attr("class", "legend");
            const divs = d3.select(this.graphdiv + " .legend")
                .selectAll(".legend-item")
                .data(this.humanValues ? this.humanValues : this.values)
                .enter()
                .append("div").attr("class", "legend-item");

            divs
                .append("div").attr("class", "legend-item-color")
                .style("background", d => this.color(this.humanValues ? this.humanValues.indexOf(d) : this.values.indexOf(d)));

            divs.append("div").attr("class", "legend-item-caption")
                .text(d => d);
        }

        updateGraph() {
            let self = this;
            // Updates the visualization
            let selection = d3.select(this.graphdiv + " #chart")
                .selectAll(".bar").data(this.numbers, d => d.timestamp);

            selection.enter()
                .append("div").attr("class", "bar")
                .style("height", d => d.val)
                .style("margin-top", d => this.barHeight - d.val)
                .style("background", d => d.color);

            selection
                .on("mouseover", function (d, i) {
                    if (self.onMouseOverCb)
                        self.onMouseOverCb(d);
                    d3.select(this).style("opacity", 0.2);
                })
                .on("mouseout", function (d, i) {
                    if (self.onMouseOutCb)
                        self.onMouseOutCb(d);
                    d3.select(this).style("opacity", 1);
                });

            // Exit selection: Remove elements without data from the DOM
            selection.exit().remove();
        }

        updateAxes(el) {
            let timeB;
            let timeA;
            if (this.numbers.length >= this.numberOfBars) {
                timeA = new Date(this.numbers[0].timestamp);
                timeB = new Date(el.timestamp);
            } else {
                timeA = new Date(this.numbers[0].timestamp);
                timeB = new Date(timeA.getTime());
                timeB.setSeconds(timeA.getSeconds() + this.numberOfBars * this.updateRate / 1000);
            }

            this.xScale = d3.scaleTime().domain([timeA, timeB]).range([0, this.w]);
            this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat('%H:%M:%S'));
            d3.select(this.graphdiv + " .x.axis").call(this.xAxis);
        }

        reset() {
            let sel = d3.selectAll(this.graphdiv + ">div");
            sel.remove();
            if (this.subscription) this.subscription.dispose();
            this.subscription = null;
        }
    }


    class FixedQueue extends Array {
        constructor(size) {
            super();
            this.size = size || 100;
        }

        push(...items) {
            if (items.length > 1) return;
            if (this.length > this.size - 1) this.shift();
            super.push(items[0]);
        }
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = Karandashee;
    else
        window.Karandashee = Karandashee;

})();