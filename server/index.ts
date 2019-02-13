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

app.get('/users', routes.getUsers);
app.post('/users/authenticate', routes.authenticateUser);
app.get('/users/:id', routes.getUserById);
app.post('/users', routes.createUser);
app.put('/users/:id', routes.updateUser);
app.delete('/users/:id', routes.deleteUser);
app.get('/balances/:id', routes.getBalancesById);
app.get('/rates', routes.getRates);
app.put('/buyBtc', routes.buyBtc);
app.put('/sellBtc', routes.sellBtc);

// Handles any requests that don't match the ones above
app.get('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => {
    /* tslint:disable-next-line:no-console */
    console.log(`App running on port ${port}.`);
});
