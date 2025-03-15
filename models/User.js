const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    channelName: { type: String, },
    email: { type: String, required: true },
    phone: { type: String,  },
    password: { type: String,  },
    logoUrl: { type: String,  },
    logoId: { type: String,  },
    subscribers: { type: Number, default: 0 },
    subscribedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    subscribedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true } 
);

module.exports = mongoose.model('User', userSchema);
