let mongoose = require('./db.js');
let time_stamp_plugin = require('./timeStampPlugin');

let brand_schema = new mongoose.Schema({
    brand_key: String,
    brand_name: String,
    brand_url: String,
    crawler_time: Date,
    models: [{type: mongoose.Schema.Types.ObjectId, ref: 'model'}],

});
brand_schema.plugin(time_stamp_plugin);

brand_schema.statics.findNeedCrawBrand = function(cb) {
    //return this.find({crawler_time:null}, cb);
    //return this.find({$where: "this.models.length == 0"},cb);
    return this.find({},cb);
};

module.exports = mongoose.model('brand',brand_schema);
