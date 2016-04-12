import React from 'react';
import GoogleMapLoader from 'react-google-maps/lib/GoogleMapLoader';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import Marker from 'react-google-maps/lib/Marker';


export default React.createClass({
	componentDidMount() {
		// TODO
	},
	render() {
		const {
			trackingSelf,
			ourId,
			users,
			stopTrackingSelf
		} = this.props;

		console.log('users', JSON.stringify(users))
		const markers = Object.keys(users).map(userId => {
			const user = users[userId];
			console.log(' -- ', user)
			if(user.icon && typeof user.lat === 'number' && typeof user.lng === 'number') {
				console.log('Marker', userId, user)
				return <Marker key={userId} icon={user.icon} position={{lat: user.lat, lng: user.lng}} />
			}
			return null;
		});

		if(trackingSelf && this._map) {
			const me = users[ourId];
			if(me && typeof me.lat === 'number' && typeof me.lng === 'number') {
				this._map.panTo({lat: me.lat, lng: me.lng});
			}
		}

		return <GoogleMapLoader
			containerElement={
				<div style={{height: '100%'}}></div>
			}
			googleMapElement={
				<GoogleMap
					ref={map => this._map = map}
					defaultZoom={20}
					defaultCenter={{lat: 38.5785033, lng: -121.5312799}}
					onDrag={stopTrackingSelf}
				>{markers}</GoogleMap>
			}
		/>
		// Keep the map markers in sync with the users in our room

		/*const {users, trackingSelf} = this.props;
		const markersClone = {...this._markers};
		const newMarkers = {};

		users.forEach(user => {
			if(!(user.id in markersClone)) {
				const marker = new google.maps.Marker({
					position: user.position,
					map: map,
					icon: user.iconUrl
				});

				if(user.isSelf) {
					selfMarker = marker;
				}

				newMarkers[user.id] = marker;
			} else {
				const marker = markersClone[user.id];
				marker.setPosition(user.position);
				marker.setIcon(user.iconUrl);

				if(user.isSelf && trackingSelf) {
					map.panTo(user.position);
				}

				newMarkers[user.id] = marker;
				delete markersClone[user.id];
			}
		});
		Object.keys(markersClone).forEach(marker => marker.setMap(null));

		this._markers = newMarkers;
		*/
	}
});
