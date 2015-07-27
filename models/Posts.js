var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: String,
  author: String,
  upvotes: { type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(callback) {
  this.upvotes += 1;
  this.save(callback);
};

PostSchema.methods.downvote = function(callback) {
  this.upvotes -= 1;
  this.save(callback);
};

mongoose.model('Post', PostSchema);
