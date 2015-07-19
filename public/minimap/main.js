// Nobody else will initialize this so we better do it bere
require('./stores/location');


// Components
require('./components/qrcode')();

require('./components/icontray')();

require('./components/minimap')('map');
