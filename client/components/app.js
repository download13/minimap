import React from 'react';
import Minimap from './minimap';
import Controls from './controls';
import QRCode from './qrcode';
import IconTray from './icontray';
import {
	centerOnMe,
	openIconPicker,
	pickIcon,
	showQRCode,
	hideQRCode,
	stopTrackingSelf
} from '../store/actions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';


const App = React.createClass({
	render() {
		const {
			ourId,
			users,
			trackingSelf,
			icon,
			qrCodeShowing,
			iconPickerShowing,

			centerOnMe,
			openIconPicker,
			pickIcon,
			showQRCode,
			hideQRCode,
			stopTrackingSelf
		} = this.props;

		return <div style={{height: '100%'}}>
			<Minimap
				trackingSelf={trackingSelf}
				ourId={ourId}
				users={users}
				stopTrackingSelf={stopTrackingSelf}
			/>
			<Controls
				icon={icon}
				trackingSelf={trackingSelf}
				centerOnMe={centerOnMe}
				openIconPicker={openIconPicker}
				showQRCode={showQRCode}
			/>
			<IconTray
				iconPickerShowing={iconPickerShowing}
				currentIcon={icon}
				pickIcon={pickIcon}
			/>
			<QRCode
				qrCodeShowing={qrCodeShowing}
				hideQRCode={hideQRCode}
			/>
		</div>
	}
});

export default connect(
	state => state,
	dispatch => bindActionCreators({
		centerOnMe,
		openIconPicker,
		pickIcon,
		showQRCode,
		hideQRCode,
		stopTrackingSelf
	}, dispatch)
)(App);
