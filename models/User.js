const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({

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

  decryptedPassword :{
    type:String, 
    
    // required :true
  },

  role: {

    type: String,

    default: '学生'

  },

  avatar: {

    type: String

  },

  posterCounts: {

    type: Number,

    default: 0

  },

  viewCounts: {

    type: Number,

    default: 0

  },

  likes: [{

    type: mongoose.Schema.Types.ObjectId,

    ref: 'Video',

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

  status :{
    type: String,
    default:'permitted'
  },
  
  uploads:{type:Number, default:0},

  searchField:{

    type:String

  }

}, { timestamps: true });



userSchema.pre('save', function (next) {

  this.searchField = `${this.name} ${this.email} ${this.role}`;

  next();

});



// Add indexes to frequently queried fields

userSchema.index({ searchField: 'text' });



const User =  mongoose.model('User', userSchema);

module.exports = User
