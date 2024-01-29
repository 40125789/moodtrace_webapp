const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv').config({ path: './config.env' });
const session = require('express-session');
const path = require('path');
const router = require ('./routes/moodroutes');
const bodyParser = require('body-parser');
// Import your contextual triggers route
const contextualTriggersRoute = require('./routes/moodroutes'); // Adjust the path accordingly
//const PORT = 3000;

const app = express();



app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/styles', express.static(path.join(__dirname, '/styles')));
app.use(bodyParser.json());
app.use('/api', contextualTriggersRoute);




app.use(session({
    secret: 'mysecretstring1234',
    resave: false,
    saveUninitialized: false
    }));

app.use('/', router);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.listen(process.env.PORT, (err) => {
    if (err) return console.log(err);

    console.log(`Express listening on port ${process.env.PORT}`);
});


