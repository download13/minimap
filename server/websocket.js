import WebSocketClient from 'stateroom/server/clients/websocket';
import {createRoomManager} from 'stateroom';


const rooms = createRoomManager();

export default app => {
	app.ws('/m/:roomname', (ws, req) => {
		const {roomname} = req.params;
		const room = rooms.get(roomname);
		const client = new WebSocketClient(ws);

		const done = () => room.removeClient(client);
		ws.on('close', done);
		ws.on('error', done);

		room.addClient(client);
	});
}
