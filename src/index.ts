import * as bodyParser from 'body-parser';
import * as express from 'express';
import { routes } from './routes';
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.get('/', routes.home);
app.get('/users', routes.getUsers);
app.get('/users/:id', routes.getUserById);
app.post('/users', routes.createUser);
app.put('/users/:id', routes.updateUser);
app.delete('/users/:id', routes.deleteUser);

app.listen(port, () => {
    /* tslint:disable-next-line:no-console */
    console.log(`App running on port ${port}.`);
});
