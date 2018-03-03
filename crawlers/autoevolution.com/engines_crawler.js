let Crawler = require("crawler");

let generation_model = require('../../models/generations_model');

let mongoose = require('../../models/db');

let engines_schema = mongoose.Schema({
    engine_name: String,
    engine_data: {},
    generation: {type: mongoose.Schema.Types.ObjectId, ref: 'generation'}
});

let engines_model = mongoose.model('engines',engines_schema);


let generation_crawler = new Crawler({
    maxConnections : 1,
    rateLimit: 5000, // `maxConnections` will be forced to 1

    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else {
            let $ = res.$;

            let generation_intro = $('.modelbox').text();

            $('.engine-block').each(function() {
                let engine_item = {};

                engine_item.engine_name = $(this).find('.col-green2').text();
                engine_item.engine_data = {};

                $(this).find('.techdata').each(function() {
                    let data_list = $(this).find('dl');

                    let specs_type = data_list.attr('title').toLowerCase();
                    engine_item.engine_data[specs_type] = {};

                    data_list.find('dt').each(function() {
                        engine_item.engine_data[specs_type][$(this).text().toLowerCase()] = $(this).next().text();
                    })


                });

                let new_engine_model = new engines_model(engine_item);
                new_engine_model.save();
            });

        }

        done();

    }
});

generation_crawler.queue('https://www.autoevolution.com/cars/audi-a4-2007.html');
