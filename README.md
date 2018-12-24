# karanda-shee
time series plot for categorical data

![screenshot](karandashee.png)

## Demo
See [here](https://maslick.github.io/karandashee/demo/).

## Features
* a running plot with bars representing a categorical event
* input: Rx streams (e.g. live MQTT data)
* multiple plots on a page
* uses ``d3`` and ``rx-lite``

## Usage
Include this into your html:

```html
<div id="karandasheeGraph"></div>
```

```html
<script src="vendor/d3.min.js"></script>
<script src="vendor/rx.lite.min.js"></script>
<script src="src/karandashee.js"></script>
<script src="src/queue.js"></script>
```

Define your data stream (rx-lite):
```js
const items = ["rain", "sunshine", "icy cold", "snow", "thunderstorm", "cloudy", "blizard", "hot", "tsunami"];

const dataObservable = Rx.Observable
    .interval(500)
    .map(x => {
        return {
            item: items[x % items.length],
            timestamp: new Date().getTime(),
        };
    }).share();
```

Instantiate a Karandashee object:
```js
let karandasheeOptions = {
    graphdiv: "#karandasheeGraph",
    observable: dataObservable,
    key: "item",
    values: items
};

let karandashee = new Karandashee(karandasheeOptions);
```
