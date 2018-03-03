

var _ = require('lodash');

let Crawler = require("crawler");


let index_crawler = new Crawler({
    debug : false,
    maxConnections : 1,

    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else {
            let $ = res.$;
            console.log($('title').text());

        }

        done();
    }
});


index_crawler.queue({
    uri : 'https://www.autoevolution.com/cars/',
    //proxy : 'http://140.143.96.141',
    //proxy : 'http://27.113.26.193',
    proxy : 'http://59.72.58.174:1080',
    timeout : 5000
});
