import {createStore, applyMiddleware} from 'redux';
//import thunk from 'redux-thunk';
import reducer from './reducer';


//const finalCreateStore = applyMiddleware(thunk)(createStore);

export default () => createStore(reducer);
