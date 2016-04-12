import express from 'express';
import expressWs from 'express-ws';
import path from 'path';
import routes from './routes';
import wss from './websocket';


const app = express();
expressWs(app);

app.use(express.static('dist/public'));

wss(app);
routes(app);

// It's going to be in a Docker container so just listen on 80
app.listen(80, () => console.log('Listening on port 80'));
