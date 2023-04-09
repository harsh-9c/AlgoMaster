const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { JsonWebTokenError } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');

// SCHEMA

const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  confirmpassword: {
    type: String,
    trim: true,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//Generating Tokens
// working with instance

employeeSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      'process.env.SECRET_KEY'
    );
    this.tokens = this.tokens.concat({ token: token }); //key-val are same

    await this.save();
    return token;
  } catch (error) {
    res.send('Errorrrrr ' + error);
    // console.log("Errorrrrr " + error);
  }
};

//Hashing password

employeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Register = mongoose.model('Register', employeeSchema);

module.exports = Register;
