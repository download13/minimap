import React from 'react';


export default ({qrCodeShowing, hideQRCode}) => {
	return <div className={`qrcode__holder ${qrCodeShowing ? 'showing' : ''}`} onClick={hideQRCode}>
		<img className="qrcode" src={'/qr/' + location.pathname.split('/').pop()} />
		<div className="qrcode__bg" />
	</div>
}
