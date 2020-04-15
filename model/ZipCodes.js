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

var ZipCodesSchema = new mongoose.Schema(
    {
        city: String,
        pop: Number,
        state: String,
        isDeleted: Boolean,
    },
    schemaOptions
);

var ZipCodes = mongoose.model("zipcodes", ZipCodesSchema);
module.exports = ZipCodes;
