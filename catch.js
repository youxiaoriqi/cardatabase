var _ = require('lodash');

let Crawler = require("crawler");

let brands_list = [];
let models_list = [];
let index_crawler = new Crawler({
    maxConnections : 1,

    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else {
            let $ = res.$;
            $(".carman").each(function(index,brand_node) {
                brands_list.push({brand_name : $(this).find('a > span').text() , brand_url : $(this).find('a').attr('href') });
            });

        }

        done();
    }
});


index_crawler.queue('https://www.autoevolution.com/cars/');

index_crawler.on('drain', function() {
    console.log('grab index info finished!');
    //console.log(brands_list);

    let car_modes_number = 0;

    let brands_crawler = new Crawler({
        maxConnections : 1,
        rateLimit: 10000, // `maxConnections` will be forced to 1

        callback : function (error, res, done) {
            if(error) {
                console.log(error);
            } else {
                let $ = res.$;
                $('.carpages').each(function(index,model_list_title_node) {
                    let is_production_model = false;

                    let obj = $(this).clone();
                    obj.find(':nth-child(n)').remove();

                    if(obj.text().indexOf('production') !== -1) {
                        //production models
                        is_production_model = true;
                    }

                    $(this).next().find('.carmod').each(function() {
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
                        let model_time = $(this).find('span').text();

                        models_list.push({
                            model_name : model_name,
                            model_url : model_url,
                            model_image : model_image,
                            model_type : model_type,
                            model_generation_number : model_generation_number,
                            model_time : model_time
                        })

                        car_modes_number ++;


                        console.log(model_name);
                    })
                });

            }

            done();

        }
    });

    _.forEach(brands_list, function(brand_item) {
        brands_crawler.queue(brand_item['brand_url']);
    });

    //brands_crawler.queue('https://www.autoevolution.com/audi/');

    brands_crawler.on('drain', function() {
        console.log(car_modes_number);

        let models_crawler = new Crawler({
            maxConnections : 1,
            rateLimit: 10000, // `maxConnections` will be forced to 1

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


        _.forEach(models_list, function(model_item) {
            models_crawler.queue(model_item['model_url']);
        });

    });
});
