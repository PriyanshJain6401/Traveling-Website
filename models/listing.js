const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,   
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    set: (v) => (v === "" ? "https://unsplash.com/photos/a-person-standing-on-a-beach-at-sunset-vn4qEdHkHPo" : v),
    default: "https://unsplash.com/photos/a-person-standing-on-a-beach-at-sunset-vn4qEdHkHPo",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    }
  ]
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
