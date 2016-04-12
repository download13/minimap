import React from 'react';


export default React.createClass({
	render() {
		const {
			icon,
			trackingSelf,
			centerOnMe,
			openIconPicker,
			showQRCode
		} = this.props;

		return <div className="controls">
			<button className="controls__pick-icon" onClick={openIconPicker}>
				<img src={icon} />
			</button>
			<button className="controls__show-qr" onClick={showQRCode}>
				<img src="/images/qrcode.png" />
			</button>
			{ !trackingSelf ?
				<button className="controls__center-on-me" onClick={centerOnMe}>
					<img src="/images/crosshair.png" />
				</button>
				: null
			}
		</div>
	}
});
