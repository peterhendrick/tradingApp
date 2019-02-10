import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';
import { routes } from './routes';
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.get('/', routes.home);
app.get('/users', routes.getUsers);
app.post('/users/authenticate', routes.authenticateUser);
app.get('/users/:id', routes.getUserById);
app.post('/users', routes.createUser);
app.put('/users/:id', routes.updateUser);
app.delete('/users/:id', routes.deleteUser);

// An api endpoint that returns a short list of items
app.get('/api/getList', (req: express.Request, res: express.Response) => {
    const list = ['item1', 'item2', 'item9'];
    res.json(list);
    console.log('Sent list of items');
});

app.get('/api/home', (req, res) => {
    routes.home(req, res);
});

// Handles any requests that don't match the ones above
app.get('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    /* tslint:disable-next-line:no-console */
    console.log(`App running on port ${port}.`);
});
