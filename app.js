const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// import router from './routes/tourRoutes';
// import router from './routes/userRoutes';

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoute');

const app = express();

app.enable('trust proxy');

//////////////
// Set up pug engine
// define view engine / template
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLE WARES
// serve the static file/serving static file
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP headers
app.use(helmet());
//app.use(helmet.contentSecurityPolicy());
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       'img-src': ["'self'", 'http: https: ws: wss: data: blob:'],
//     },
//   })
// );

// Developement logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// middleware // needed to post to the server

// Body parser, reading data from body into req.body also limit the amount of data to be pass into body
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(cookieParser());

// middle to post data coming from form
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against NoSQL query injection "email": {"$gt": ""}
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

// creating our own middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 😞');
//   next();
// });

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 2) Route Handlers

// app.get('/', (req, res) => {
//   //   res.status(200).send('Hello from the server side');
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side', app: 'natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

// const getAllTour = (req, res) => {
//   console.log(req.requestTime);
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// };

// const getTour = (req, res) => {
//   console.log(req.params);

//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);

//   //   if (id > tours.length) {
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// };

// const createTour = (req, res) => {
//   //   console.log(req.body);

//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'sucess',
//         data: {
//           tours: newTour,
//         },
//       });
//     }
//   );

//   //   res.send(newTour);
// };

// const updateTour = (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: `<Updated tour here...>`,
//     },
//   });
// };

// const deleteTour = (req, res) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };

// Route Handler
// app.get('/api/v1/tours', getAllTour);

// :id => variables, also can pass more than one variable
// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createTour);

// app.patch(`/api/v1/tours/:id`, updateTour);

// app.delete(`/api/v1/tours/:id`, deleteTour);

// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet define',
//   });
// };

// const createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet define',
//   });
// };

// const getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet define',
//   });
// };

// const updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet define',
//   });
// };

// const deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet define',
//   });
// };

// 3) ROUTE

// ulternative to route handler
//app.use('/api/v1/tours', tourRouter);
// mounting router i.e mounting new rout on router
//app.use('/api/v1/users', userRouter);
// because of tourRouter middleware

//const tourRouter = express.Router();
//const userRouter = express.Router();

//tourRouter.route('/').get(getAllTour).post(createTour);

//tourRouter.route(`/:id`).get(getTour).patch(updateTour).delete(deleteTour);

// const userRouter = express.Router();
// userRouter.route('/').get(getAllUsers).post(createUser);

// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// handling on hanlde eror
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// implementing a Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
