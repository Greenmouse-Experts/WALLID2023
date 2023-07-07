const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const passwordResetSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin to convert mongoose to json
passwordResetSchema.plugin(toJSON);
passwordResetSchema.plugin(paginate);

/**
 * @typedef PasswordReset
 */
const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
