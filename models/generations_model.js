let mongoose = require('./db.js');

let generation_schema = new mongoose.Schema({
    generation_name: String,
    generation_years: String,
    generation_begin_year: String,
    generation_url: String,
    crawler_time: Date,
    model: {type: mongoose.Schema.Types.ObjectId, ref: 'model'},
    engines:[{type: mongoose.Schema.Types.ObjectId, ref: 'engine'}]
});

module.exports = mongoose.model('generation',generation_schema);
