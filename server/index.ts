import * as bodyParser from 'body-parser';
import * as express from 'express';
import { routes } from './routes';
import * as path from 'path';
const app = express();
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'client/build')));


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

// An api endpoint that returns a short list of items
app.get('/api/getList', (req,res) => {
	var list = ["item1", "item2", "item9"];
	res.json(list);
	console.log('Sent list of items');
});

app.get('/api/home', (req, res) => {
    routes.home(req, res);
})

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
	res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.listen(port, () => {
    /* tslint:disable-next-line:no-console */
    console.log(`App running on port ${port}.`);
});
