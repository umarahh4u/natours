const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModels');
//const validator = require('validator');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 character'],
      minlength: [10, 'A tour name must have more or equal than 10 character'],
      //validate: [validator.isAlpha, 'Tour name must only contain character'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour mush have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, ,edium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //4.6666, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on NEW docement creation
          return val < this.price; // 100 < 200
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, ' A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // this will show to users
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      dafault: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/////////////////
// improve read performance with indexes
// 1 for accending & -1 for decending order
// toursSchema.index({ price: 1 });
toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: -1 });
toursSchema.index({ startLocation: '2dsphere' });

// Virtual properties
toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate i.e each tour to have access to review
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUEMENT MIDDLEWARE: runs before .save() and .create() but not on .insertMany()
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

///////////////////////////////////////////
// for performing embedding
// toursSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// eslint-disable-next-line prefer-arrow-callback
// toursSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// eslint-disable-next-line prefer-arrow-callback
// toursSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLEWARE
// eslint-disable-next-line prefer-arrow-callback
// the find hook make it query middle not document middleware

// toursSchema.pre('find', function (next) {
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// eslint-disable-next-line prefer-arrow-callback
// toursSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   //console.log(docs);
//   next();
// });

toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });

  next();
});

// eslint-disable-next-line prefer-arrow-callback
//AGGREGATION MIDDLEWARE
// toursSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
