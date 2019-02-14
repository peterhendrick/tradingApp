import config from 'config';
import { authHeader } from '../_helpers';

export const userService = {
    buyBtc,
    sellBtc,
    login,
    logout,
    register,
    getAll,
    getById,
    update,
    delete: _delete
};

function login(username, hashedPassword) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, hashedPassword })
    };

    return Promise.all([
        fetch(`${config.apiUrl}/users/authenticate`, requestOptions),
        fetch(`${config.apiUrl}/rates`)
    ])
        .then(data => Promise.all([handleResponse(data[0]), handleResponse(data[1])]))
        .then(response => {
            const user = response[0].text;
            const rates = response[1].text;
            localStorage.setItem('rates', JSON.stringify(rates));
            localStorage.setItem('user', JSON.stringify(user));
            return { user, rates };
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users/${id}`, requestOptions).then(handleResponse);
}

function buyBtc(pair, amount, id) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id, amount, pair})
    }
    return fetch(`${config.apiUrl}/buyBtc`, requestOptions).then(handleResponse)
        .then(response => {
            const { user, rates } = response.text;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('rates', JSON.stringify(rates));
            return { user, rates};
        });
}

function sellBtc(pair, amount, id) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({pair, amount, id})
    }
    return fetch(`${config.apiUrl}/sellBtc`, requestOptions).then(handleResponse)
        .then(response => {
            const { user, rates } = response.text;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('rates', JSON.stringify(rates));
            return { user, rates};
        });}

function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function update(user) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${config.apiUrl}/users/${user.id}`, requestOptions).then(handleResponse);;
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users/${id}`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}