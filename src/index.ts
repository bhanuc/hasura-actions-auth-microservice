import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import expressValidator from 'express-validator';

import authenticationController from './controllers/authentication';

const app = express();

app.set('host', '0.0.0.0');
app.set('port', process.env.PORT || 3000);

app.use(cors());
app.use(bodyParser.json());
app.use(expressValidator());

app.get('/jwks', authenticationController.getJwks);
app.post('/signup', authenticationController.postSignup);
app.post('/signin', authenticationController.postSignin);

app.listen(app.get('port'), () => {
  console.log(`App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`);
});
