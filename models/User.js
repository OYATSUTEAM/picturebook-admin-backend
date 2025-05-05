const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  id: { type: String, },

  name: {

    type: String,

    required: true

  },

  email: {

    type: String,

    required: true,

    unique: true

  },

  password: {

    type: String,

    required: true

  },

  decryptedPassword: {

    type: String,

    required: true
  },

  role: {

    type: String,

    default: 'user'

  },



  purchased: [{

    type: mongoose.Schema.Types.ObjectId,

    ref: 'Product',

    default: null

  }],

  expired: {

    start: {

      type: Date

    },

    end: {

      type: Date

    }

  },

  status: {
    type: String,
    default: 'permitted'
  },


}, { timestamps: true });


userSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

userSchema.pre('save', function (next) {

  this.searchField = `${this.name} ${this.email} ${this.role}`;

  next();

});


// Add indexes to frequently queried fields

userSchema.index({ searchField: 'text' });



const User = mongoose.model('User', userSchema);

module.exports = User
