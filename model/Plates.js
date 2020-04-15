var mongoose = require("mongoose");

var schemaOptions = {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
};

var PlatesSchema = new mongoose.Schema(
    {
        event_time: String,
        plate_number: String,
        plate_code: String,
        state: String,
        country: String,
        plate_img: String,
        vehicle_img: String,
        data: String,
        is_junk: Boolean,
        is_valid_code: Boolean,
        is_valid_plate: Boolean,
        is_valid_source: Boolean,
        isDeleted: Boolean,
    },
    schemaOptions
);

PlatesSchema.index({ event_time: "text", plate_number: "text", plate_code: "text", state: "text", country: "text" });

var Plates = mongoose.model("plates", PlatesSchema);

Plates.syncIndexes();

module.exports = Plates;
