import Karandashee from '../src/karandashee.js';

////////////////////////
// I Simulator
////////////////////////
let items = ["rain", "sunshine", "icy cold", "snow", "thunderstorm", "cloudy", "blizard", "hot", "tsunami"];

const dataObservable = Rx.Observable
    .interval(100)
    .map(x => {
        return {
            item: items[x % items.length],
            timestamp: new Date().getTime(),
        };
    }).share();

////////////////////////
// II Karandashi
////////////////////////
let karandasheeOptions = {
    graphdiv: "#karandasheeGraph",
    observable: dataObservable,
    key: "item",
    values: items,
    onMouseOverCb: x => {
        $("#dataValue").html(formatHover(x.item, x.timestamp));
    },
    onMouseOutCb: _ => {
        $("#dataValue").html("&nbsp;");
    }
};

let karandashee = new Karandashee(karandasheeOptions);

////////////////////////
// HELPER FUNCTIONS
////////////////////////
function formatTime(ms) {
    var date = new Date(ms),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();
    if (hour<10) hour = "0" + hour;
    if (minute<10) minute = "0" + minute;
    if (second<10) second = "0" + second;
    return hour + ":" + minute + ":" + second;
}

function formatHover(val, ts) {
    return "<b>" + val + "</b> / " + formatTime(ts);
}