const mongoose = require("mongoose");
const {schema} = require('./secure/postValidation');
const blogSchmea = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100,
  },
  summary:{
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "public",
    enum: ["private", "public"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  thumbnail:{
    type:String,
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

blogSchmea.index({title:"text"});

blogSchmea.statics.postValidation = function(body){
  return schema.validate(body,{abortEarly:false});
}

const Blog = mongoose.model("Blog", blogSchmea);
module.exports = Blog;
