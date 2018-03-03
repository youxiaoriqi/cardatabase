module.exports = exports = function timeStampPlugin(schema, options) {
    schema.add( {
        create_time: Date ,
        update_time: Date
    });

    schema.pre('save', function (next) {
        if(!this.createTime) {
            this.create_time = new Date();
        }
        this.update_time = new Date();
        next();
    });
};
