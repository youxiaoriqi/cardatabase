let mongoose = require('./db.js');
let time_stamp_plugin = require('./timeStampPlugin');

let model_schema = new mongoose.Schema({
    model_key: String,
    model_name: String,
    model_url: String,
    model_image: String,
    model_type: String,
    model_generation_number: Number,
    model_time : String,
    is_production_model : Boolean,
    crawler_time: Date,
    brand: {type: mongoose.Schema.Types.ObjectId, ref: 'brand'},
    model_generations: [{type: mongoose.Schema.Types.ObjectId, ref: 'generation'}],

});
model_schema.plugin(time_stamp_plugin);


model_schema.statics.findNeedCrawModel = function(cb) {
    return this.find({crawler_time:null}, cb);
};

module.exports = mongoose.model('model',model_schema);
