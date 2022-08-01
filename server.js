const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught exception
process.on('oncaughtException', (err) => {
  console.log('UNHANDLE EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
    //useNewUrlParser: true,
    //useCreateIndex: true,
    //useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB Connection successful'));

// Environment variable are really outside of express
// this env is set by express
//console.log(app.get('env'));

// but node JS itself actually also sets a lot of environment variables.
//console.log(process.env);

// const testTour = new Tour({
//   name: 'The Park Camper',
//   rating: 4.7,
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(`ERROR :`, err);
//   });

// 4) START SERVER
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`App runing on port ${port}...`);
});

// Error outside express: unhandled rejection globally

process.on('unhandledRejection', (err) => {
  // 0: sucess 1: uncaught exception
  console.log('UNHANDLE REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('🤡 SIGTERM RECEIVED, shutting down gracefully');

  server.close(() => {
    console.log('🐢 Process terminated ');
  });
});
