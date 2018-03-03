require('../includes/process');
let _ = require('lodash');
let async = require('async');

let brand_model = require('../../models/brands_model');

let model_model = require('../../models/models_model');

let Crawler = require("crawler");

let brands_crawler = new Crawler({
    maxConnections : 1,
    rateLimit: 5000, // `maxConnections` will be forced to 1

    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else {
            let $ = res.$;

            //获取当前品牌以及品牌对应的数据库表id
            let brand_name = $('#newscol1 > h1 > a >  b').text();
            let brand_key = brand_name.toLowerCase();

            brand_model.findOne({"brand_key": brand_key}).exec(function(err, brand_item) {
                if(err) {
                    console.log('Error:' + err);

                } else {
                    console.log('----正在抓取品牌' + brand_name + '-----');

                    let model_item_list = [];
                    //抓取页面中所有的车型
                    $('.carpages').each(function(index,model_list_title_node) {
                        let is_production_model = false;

                        let obj = $(this).clone();
                        obj.find(':nth-child(n)').remove();

                        if(obj.text().indexOf('production') !== -1) {
                            //production models
                            is_production_model = true;
                        }

                        $(this).next().find('.carmod').each(function() {
                            //model key
                            let model_key = $(this).find('h4').text().toLowerCase();
                            //model name
                            let model_name = $(this).find('h4').text();

                            //model url
                            let model_url = $(this).find('a').attr('href');

                            //model image
                            let model_image = $(this).find('a > img').attr('src');

                            //model type
                            let model_type = $(this).find('.body').text();

                            //model generation number
                            let model_generation_number = $(this).find('.col-green2').text();

                            //model time
                            let model_time = $(this).find('.col3width span').text();

                            let model_item = {
                                model_key : model_key,
                                model_name : model_name,
                                model_url : model_url,
                                model_image : model_image,
                                model_type : model_type,
                                model_generation_number : model_generation_number,
                                model_time : model_time,
                                is_production_model : is_production_model,
                                brand : brand_item._id,
                            };

                            console.log('抓取到车型' + model_item.model_name);
                            model_item_list.push(model_item);

                        })
                    });

                    //遍历页面中的所有车型
                    async.map(model_item_list, function(model_item, callback) {

                        //寻找数据库中是否已经存在该型号

                        model_model.findOne({"model_key": model_item.model_key},function(err, res) {
                            if (err) {
                                console.log("查询车型错误:" + JSON.stringify(err));
                                callback(null, model_item);
                            }
                            else {
                                //如果没有则添加，已经存在则忽略
                                if (!res) {
                                    console.log('添加新车型' + model_item.model_name );
                                    let new_model_model = new model_model(model_item);
                                    //brand_item.models.push(new_model_model);

                                    new_model_model.save(function(err) {
                                        if(err) {
                                            console.log(model_item.model_name + '保存错误' + err);
                                            callback(null, model_item);
                                        }
                                        else {
                                            brand_item.models.push(new_model_model);
                                            callback(null, model_item);
                                        }
                                    });

                                }
                                else {
                                    callback(null, model_item);
                                }
                            }
                        });

                    }, function(err,results) {

                        //设置品牌抓取时间
                        brand_item.crawler_time = Date.now();
                        //console.log(brand_item.models.length);
                        brand_item.save();

                    });






                }

            })



        }

        done();

    }
});

//从数据库中获取所有的品牌及抓取地址
brand_model.findNeedCrawBrand(function(err, brands_list) {
    console.log('有' + brands_list.length + '个品牌等待抓取');

    _.forEach(brands_list, function(brand_item) {
    brands_crawler.queue(brand_item.brand_url);
});

//brands_crawler.queue('https://www.autoevolution.com/audi/');
});




brands_crawler.on('drain', function() {
    console.log('grab brands info finished!');

});
