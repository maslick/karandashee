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
            this.color = d3.scaleOrdinal(d3.schemeCategory10).domain([0, 20]);
            this.key = options.key;
            this.values = options.values;
            this.humanValues = options.humanValues || options.values;
            this.onMouseOverCb = options.onMouseOverCb;
            this.onMouseOutCb = options.onMouseOutCb;
            this.currentTimestamp = null;

            this.initialize();
        }

        initialize() {
            let self = this;
            self.reset();
            if (d3.select(self.graphdiv).empty()) {
                console.warn("no element found: " + self.graphdiv);
                return;
            }
            this.initArray();
            this.initGraph();
            this.createLegend();

            this.subscription = this.observable
                .map(x => Object.assign({}, x, {
                    val: self.barHeight * self.values.indexOf(x[self.key]) / self.values.length + self.minBarHeight,
                    color: self.color(self.values.indexOf(x[self.key]))
                }))
                .subscribe(x => {
                    if (self.currentTimestamp) {
                        let delay = x.timestamp - self.currentTimestamp;
                        const numberOfMissing = Math.floor(delay / self.updateRate) - 1;

                        for (let i = 0; i < numberOfMissing; i++) {
                            let ts = self.currentTimestamp + self.updateRate * (i + 1);

                            let dummy = {
                                val: 0,
                                color: "grey",
                                timestamp: self.currentTimestamp + self.updateRate * (i + 1)
                            };
                            self.numbers.push(dummy);
                            self.updateGraph();
                            self.updateAxes(dummy);
                        }

                    }
                    self.numbers.push(x);
                    self.updateGraph();
                    self.updateAxes(x);
                    self.currentTimestamp = x.timestamp;
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
            let self = this;
            d3.select(this.graphdiv).append("div").attr("class", "legend");
            const divs = d3.select(this.graphdiv + " .legend")
                .selectAll(".legend-item")
                .data(self.humanValues ? self.humanValues : self.values)
                .enter()
                .append("div").attr("class", "legend-item");

            divs
                .append("div").attr("class", "legend-item-color")
                .style("background", function (d) {
                    return self.color(self.humanValues ? self.humanValues.indexOf(d) : self.values.indexOf(d));
                });

            divs.append("div").attr("class", "legend-item-caption")
                .text(function (d) {
                    return d;
                });
        }

        updateGraph() {
            let self = this;

            // Updates the visualization
            let selection = d3.select(this.graphdiv + " #chart")
                .selectAll(".bar").data(this.numbers, function (d) {
                    return d.timestamp;
                });

            selection.enter()
                .append("div").attr("class", "bar")
                .style("height", function (d) {
                    return d.val;
                })
                .style("margin-top", function (d) {
                    return self.barHeight - d.val;
                })
                .style("background", function (d) {
                    return d.color;
                });

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