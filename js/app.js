////////////////////////
// I Simulator
////////////////////////
let items = ["Jordan", "Phelps", "Durant", "Lochte", "Pippen", "Kukoč", "Lebron", "Vincanity", "Waitzkin"];

const dataObservable = Rx.Observable
    .interval(100)
    .map(x => {
        return {
            item: chance.pickset(items, 1)[0],
            timestamp: new Date().getTime(),
        }
    }).share();

////////////////////////
// II Palochki
////////////////////////
let palochkiOptions = {
    graphdiv: "#palochkiGraph",
    observable: dataObservable,
    key: "item",
    values: items,
    humanValues: items.map(x => "Mr. " + x),
    onMouseOverCb: x => {
        $("#dataValue").html(formatHover(x.item, x.timestamp));
    },
    onMouseOutCb: _ => {
        $("#dataValue").html("&nbsp;");
    }
};

let simulatorLocation = new Palochki(palochkiOptions);


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