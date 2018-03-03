require('../includes/process');

let _ = require('lodash');
let mongoose = require('../../models/db');
let brand_model = require('../../models/brands_model');

let count_tag = 0;

let Crawler = require('crawler');

let index_crawler = new Crawler({
    maxConnections : 1,

    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else {
            let $ = res.$;
             $(".carman").each(   function(index,brand_node) {
                let brand_item = {
                    brand_key : $(this).find('a > span').text().toLowerCase(),
                    brand_name : $(this).find('a > span').text() ,
                    brand_url : $(this).find('a').attr('href'),
                };

                //寻找数据库中是否已经存在该品牌

                 brand_model.findOne({"brand_key": brand_item.brand_key }, function(err, res) {
                     if (err) {
                         console.log("Error:" + err);
                     }
                     else {
                         //如果没有则添加，已经存在则忽略
                         if (!res) {
                             count_tag ++;
                             let new_brand_model = new brand_model(brand_item);
                             new_brand_model.save(function(err) {
                                 if(err) {
                                     console.log('Error: ' + err);
                                 }
                                 else {
                                     console.log(brand_item.brand_name);
                                     count_tag --;

                                     if(count_tag == 0) {
                                         mongoose.disconnect();
                                     }

                                 }

                             });

                         }

                     }
                 });


            });

        }

        done();
    }
});

index_crawler.queue('https://www.autoevolution.com/cars/');

index_crawler.on('drain', function() {
    console.log('grab index info finished!');


});



