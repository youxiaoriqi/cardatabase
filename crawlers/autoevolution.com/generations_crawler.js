var _ = require('lodash');

let Crawler = require("crawler");

let model_model = require('../../models/models_model');

let generation_model = require('../../models/generations_model');

let models_crawler = new Crawler({
    maxConnections : 1,
    rateLimit: 5000, // `maxConnections` will be forced to 1

    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else {
            let $ = res.$;

            //获取车型的名称并从数据库中找到对应的记录
            let model_name = $('.seriestitle a').text();
            console.log(model_name);
            model_model.find({model_name:model_name}).exec(function(err, model_items) {
                if(model_items.length !== 1) {
                    console.log('error :' + JSON.stringify(model_items));
                }
                else {
                    let model_item = model_items[0];
                    console.log(model_item);



                    $('.carmodel').each(function(){
                        let generation_name = $(this).find('[itemprop=name]').text();
                        let generation_years = $(this).find('.years').text();
                        let generation_begin_year = $(this).find('[itemprop=vehicleModelDate]').attr('content');
                        let generation_url = $(this).find('[itemprop=url]').attr('href');

                        let generation_item = {
                            generation_name,
                            generation_years,
                            generation_begin_year,
                            generation_url,
                            model: model_item._id
                        };

                        console.log(generation_item);
                        //寻找数据库中是否已经存在该型号的此代

                        generation_model.findOne({generation_name: generation_item.generation_name},function(err, res) {
                            if (err) {
                                console.log("Error:" + JSON.stringify(err));
                            }
                            else {
                                //如果没有则添加，已经存在则忽略
                                if (!res) {
                                    console.log("Res:" + res);
                                    console.log(generation_item);
                                    let new_generation_model = new generation_model(generation_item);
                                    new_generation_model.save();

                                }

                            }
                        });
                    });


                    //设置车型抓取时间
                    model_item.crawler_time = Date.now();
                    model_item.save();

                }


            });
        }

        done();

    }
});


//从数据库中获取所有的车型及抓取地址
model_model.findNeedCrawModel(function(err, models_list) {
    console.log(models_list);

    _.forEach(models_list, function(model_item) {
        models_crawler.queue(model_item.model_url);
    });

    //models_crawler.queue('https://www.autoevolution.com/audi/a8/');
});




models_crawler.on('drain', function() {
    console.log('grab models info finished!');




});
