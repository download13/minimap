const initialState = {
	icon: '/icons/whale.png',
	trackingSelf: true,
	ourId: null,
	users: {},
	qrCodeShowing: false,
	iconPickerShowing: false
};

export default (state = initialState, {type, payload}) => {
	switch(type) {
		case 'CENTER_ON_ME':
			return {...state, trackingSelf: true};
		case 'STOP_TRACKING_SELF':
			return {...state, trackingSelf: false};
		case 'SHOW_QR_CODE':
			return {...state, qrCodeShowing: true};
		case 'HIDE_QR_CODE':
			return {...state, qrCodeShowing: false};
		case 'OPEN_ICON_PICKER':
			return {...state, iconPickerShowing: true};
		case 'PICK_ICON':
			return {...state, iconPickerShowing: false, icon: payload};
		case 'SET_SERVER_DATA':
			const {id, users} = payload;
			return {...state, ourId: id, users};
		default:
			return state;
	}
}
