require('./db');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index.routes');
const { PORT } = require('./config');

const app = express();
app.set('port', PORT);
app.use(express.json());
app.use(bodyParser.json());

app.use(routes);

app.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`);
});
