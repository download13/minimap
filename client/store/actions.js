export function centerOnMe() {
	return {type: 'CENTER_ON_ME'}
}

export function stopTrackingSelf() {
	return {type: 'STOP_TRACKING_SELF'}
}

export function showQRCode() {
	return {type: 'SHOW_QR_CODE'}
}

export function hideQRCode() {
	return {type: 'HIDE_QR_CODE'}
}

export function openIconPicker() {
	return {type: 'OPEN_ICON_PICKER'}
}

export function pickIcon(iconUrl) {
	return {type: 'PICK_ICON', payload: iconUrl}
}

export function setServerData(payload) {
	return {type: 'SET_SERVER_DATA', payload}
}
