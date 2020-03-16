/* eslint-disable prettier/prettier */
'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const bcrypt         = require('bcrypt');
const bcrypt_p       = require('bcrypt-promise');
const jwt            = require('jsonwebtoken');

const {TE, to}       = require('../services/util.service');
const CONFIG         = require('../config/config');

const Schema = mongoose.Schema;
const oAuthTypes = ['facebook', 'google'];

/**
 * User Schema
 */

const UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    unique:true,
    default: ''
  },
  social_type: {
    type: Number,
    trim: true,
    default: 0
  },
  facebook_id: {
    type: String,
    trim: true,
    default: ''
  },
  google_id: {
    type: String,
    trim: true,
    default: ''
  },
  hashed_password: {
    type: String,
    default: ''
  },

  verification:{
    type: Number,
    default: 0
  },

  verify_code:{
    type: String,
    default: ''
  },

  phone_number: {
    type: String,
    trim: true,
    default: ''
  },
  user_type: {
    type: Number,
    trim: true,
    default: 0
  },
  first_name: {
    type: String,
    trim: true,
    default: ''
  },
  last_name: {
    type: String,
    trim: true,
    default: ''
  },
  photo: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: ''
  },
  country_state_province: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  address_line1: {
    type: String,
    trim: true,
    default: ''
  },
  address_line2: {
    type: String,
    trim: true,
    default: ''
  },
  geo_lat: {
    type: String,
    trim: true,
    default: ''
  },
  geo_lng: {
    type: String,
    trim: true,
    default: ''
  },
  device_type: {
    type: Number,
    trim: true,
    default: 0 //0:ios  1:android 0:iOS
  },
  device_id: {
    type: String,
    trim: true,
    default: ''
  },
  isIndexed:{
      type:Boolean,
      default:false
  },
  points:{
    type: Schema.Types.ObjectId,
    ref:'UserPoint',
  },
  updatedAt: {
      type: Date,
      default: Date.now
  },
  createdAt: {
      type: Date,
      default: Date.now
  },
});

const validatePresenceOf = value => value && value.length;

/**
 * Virtuals
 */

UserSchema.virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

/**
 * Validations
 */

// the below 5 validations only apply if you are signing up traditionally

UserSchema.path('first_name').validate(function(name) {
  if (this.skipValidation()) return true;
  return name.length;
}, 'Name cannot be blank');

UserSchema.path('last_name').validate(function(name) {
  if (this.skipValidation()) return true;
  return name.length;
}, 'Name cannot be blank');

UserSchema.path('email').validate(function(email) {
  if (this.skipValidation()) return true;
  return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate(function(email) {
  return new Promise(resolve => {
    const User = mongoose.model('User');
    if (this.skipValidation()) return resolve(true);

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
      User.find({ email }).exec((err, users) => resolve(!err && !users.length));
    } else resolve(true);
  });
}, 'Email `{VALUE}` already exists');

UserSchema.path('hashed_password').validate(function(hashed_password) {
  if (this.skipValidation())
    return true;
  return hashed_password.length && this._password.length;
}, 'Password cannot be blank');

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  // if (!this.isNew) return next();
  //
  // if (!validatePresenceOf(this.password) && !this.skipValidation()) {
  //   next(new Error('Invalid password'));
  // } else {
  //   next();
  // }
    this._doc.password = this.encryptPassword(this._doc.password);
    next();
});

/**
 * Methods
 */

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: async function(plainText) {
    // return this.encryptPassword(plainText) === this.hashed_password;
    let err, pass;
    if(!this.hashed_password)
      TE('password not set');

    [err, pass] = await to(bcrypt_p.compare(plainText, this.hashed_password));
    if(err) TE(err);

    if(!pass) TE('invalid password');

    return this;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function(password) {
    if (!password) return '';
    try {
      let salt, hash ,err;
      if (err)
        TE(err.message , true);

      hash = bcrypt.hashSync(password, 10);
      if (err)
        TE(err.message, true);
      return hash;
      // return crypto
      //   .createHmac('sha1', this.salt)
      //   .update(password)
      //   .digest('hex');
    } catch (err) {
      return '';
    }
  },

  /**
   * Validation is not required if using OAuth
   */

  skipValidation: function() {
    //return ~oAuthTypes.indexOf(this.provider);
      return this.social_type != 0;
  },


  getJWT: function(){
      let expiration_time = parseInt(CONFIG.jwt_expiration);
      return jwt.sign({user_id:this.id}, CONFIG.jwt_encryption, {expiresIn: expiration_time});
      //return jwt.sign({user_id:this.id}, CONFIG.jwt_encryption);
  },

  toWeb: function(){
      let json = this.toJSON();
      return json;
  },
};

/**;
 * Statics
 */

UserSchema.statics = {
  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  load: function(options, cb) {
    options.select = options.select || 'name username';
    return this.findOne(options.criteria)
      .select(options.select)
      .exec(cb);
  }
};

mongoose.model('User', UserSchema);
