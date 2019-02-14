import {
    userConstants
} from '../_constants';

let user = JSON.parse(localStorage.getItem('user'));
let rates = JSON.parse(localStorage.getItem('rates'))
const initialState = user ? {
    loggedIn: true,
    user,
    rates
} : {};

export function authentication(state = initialState, action) {
    switch (action.type) {
        case userConstants.LOGIN_REQUEST:
            return {
                loggingIn: true,
                user: action.user
            };
        case userConstants.LOGIN_SUCCESS:
            return {
                loggedIn: true,
                user: action.user,
                rates: action.rates
            };
        case userConstants.LOGIN_FAILURE:
            return {};
        case userConstants.LOGOUT:
            return {};
        case userConstants.BUY_REQUEST:
            return {
                loading: true
            };
        case userConstants.BUY_SUCCESS:
            return {
                loggedIn: true,
                user: action.user,
                rates: action.rates
            };
        case userConstants.BUY_FAILURE:
            return {
                loggedIn: true,
                userid: action.id,
                error: action.error
            };
        case userConstants.SELL_REQUEST:
            return {
                loading: true
            };
        case userConstants.SELL_SUCCESS:
            return {
                loggedIn: true,
                user: action.user,
                rates: action.rates
            };
        case userConstants.SELL_FAILURE:
            return {
                loggedIn: true,
                userid: action.id,
                error: action.error
            };
        default:
            return state
    }
}