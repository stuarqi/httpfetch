var HttpFetch = require('../index');
var fs = require('fs');

var httpFetch = new HttpFetch();

httpFetch.fetch('http://www.puzzle8.com/cross/cross.asp', function (err, data) {
    fs.writeFile('./data/result.html', data, {encoding : 'utf8'}, function (err) {
        if (!err) {
            console.log(data);
            console.log('Done');
        }
    });
}, {
    recordId : 2
});