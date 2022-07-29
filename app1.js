const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

// express is a function that upon calling will add a bunch of methods to our app variable here
const app = express();

// 1. MIDDLEWARES
// middleware
// simple middleware::: without the middleware we can not have access to req.body
// order in which middleware is placed is matter

app.use(express.json());
app.use(morgan('dev'));

////////////////////////////////
// creating our own middleware and remember in each middleware function we have access to req and res and also we have next function
// we can next anything we want, but next is convention
app.use((req, res, next) => {
  console.log('Hello from the middleware😞');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this end point...');
// });

// 2. ROUTE HANDLERS
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// app.get('/api/v1/tours', (req, res) => {
//   // use Jsend formatting standard
//   // also add result when sending multiple object of array, to know the number
//   res.status(200).json({
//     status: 'success',
//     result: tours.length,
//     data: {
//       //tours: tours
//       tours,
//     },
//   });
// });

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour = tours.find((el) => el.id === id);

  //if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'sucess',
        data: {
          tours: newTour,
        },
      });
    }
  );

  // created (201)
  res.status(201).json({
    message: 'success',
    data: {
      tour: newTour,
    },
  });

  // we can not send response twice

  //res.send('Done');
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour Here...',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  //  204 mean no content
  res.status(204).json({
    status: 'success',
    data: null,
    // means simple to show that the data deleted no longer available
  });
};

//app.get('/api/v1/tours', getAllTours);

// respondin to url parameter
// add ? to make parameter optional

//app.get(`/api/v1/tours/:id`, getTour);

// data available at req
//The request object again is what holds all the data, all the information, about the request that was done. If that request contains some data that was sent, that data should be on the request, right? Now out of the box, Express does not put that body data on the request, and in order to have that data available, we have to use something called middleware. We are gonna talk in great detail about middleware in a couple of lectures, but for now, in order to make this work, we need to include a simple middleware here at the top of the file. So actually, right here.
//app.post('/api/v1/tours', createTour);
// PATCH
//app.patch(`/api/v1/tours/:id`, updateTour);

// Delete
//app.delete(`/api/v1/tours/:id`, deleteTour);

// using route advance manner/robust
// 3. ROUTE
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route(`/api/v1/tours/:id`)
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 4. Start SERVER
const port = 4000;
app.listen(port, () => {
  console.log(`App running on ${port}....`);
});
