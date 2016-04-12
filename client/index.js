import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './store';
import {Provider} from 'react-redux';
import App from './components/app';
import ReconnectingWebSocket from 'ReconnectingWebSocket';
import {createClient} from 'stateroom/client';
import {setServerData} from './store/actions';


function main(rootEl) {
	const store = createStore();
	window.store = store;

	syncStoreWithServer(store);

	ReactDOM.render(
		<Provider store={store}>
			<App/>
		</Provider>,
		rootEl
	)
}

main(document.getElementById('approot'));


function syncStoreWithServer(store) {
	const url = `ws${location.protocol === 'https:' ? 's' : ''}://${location.hostname}${location.pathname}`;
	const ws = new ReconnectingWebSocket(url, null, {maxReconnectAttempts: 100});
	const client = createClient(ws);

	// Keep our icon synced to the server
	onChanged(store, ({icon}) => icon, icon => {
		client.set('icon', icon);
	});

	// Keep our position synced to the server
	navigator.geolocation.watchPosition(
		({coords}) => {
			client.set({
				lat: coords.latitude,
				lng: coords.longitude
			});
		},
		err => {
			if(err.code === 1) {
				alert('The application will not work without your location');
			} else if(err.code === 2) {
				alert('Unable to determine your position');
			}
		},
		{enableHighAccuracy: true}
	);

	// Keep the latest server state in the store
	client.subscribe(() => {
		store.dispatch(setServerData(client.getState()));
	});
}


// Run fn if selector(store.getState()) changes
function onChanged(store, selector, fn) {
	let first = true;
	let lastValue;

	function update() {
		const value = selector(store.getState());
		if(value !== lastValue || first) {
			first = false;
			lastValue = value;
			fn(value);
		}
	}

	update();
	store.subscribe(update);
}
