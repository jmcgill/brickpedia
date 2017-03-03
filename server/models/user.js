var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    calendar_id: String,
    refresh_token: String,
});

// Populate a virtual 'id' field for compatability with Marionette.
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

UserSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('User', UserSchema);
