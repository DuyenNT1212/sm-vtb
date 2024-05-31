const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
app.use(cookieParser());

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/users')

app.use(express.static(path.join(__dirname, 'public')));


// Set view enginer to ejs
app.set('view engine', 'ejs');

// Serve static content
app.use("/static", express.static(__dirname + '/static'));

// Parsing application/json
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/', loginRouter)

app.use('/', indexRouter);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}...`);
});