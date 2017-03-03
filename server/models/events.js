var mongoose = require('mongoose');

var EventSchema = mongoose.Schema({
    title: String,
    deadline: Date,
    duration_minutes: Number,
    queue: String,
    repeat_duration: Number,
    repeat_units: String,
    repeats: Boolean,
    text: String,
    scheduled: Date,
    owner: String,
    encrypted: Boolean
});

// Populate a virtual 'id' field for compatability with Marionette.
EventSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

EventSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Event', EventSchema);
