let connect = require('connect');
let serveStatic = require('serve-static');

let port = process.env.PORT || 9990;
connect().use(serveStatic("test/")).listen(port, "0.0.0.0", function(){
    console.log('Server running on port ' + port);
});
