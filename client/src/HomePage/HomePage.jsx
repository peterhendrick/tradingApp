import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { userActions } from '../_actions';

class HomePage extends React.Component {
    componentDidMount() {
        // this.props.dispatch(userActions.getAll());
    }

    handleDeleteUser(id) {
        return (e) => this.props.dispatch(userActions.delete(id));
    }

    render() {
        const { user } = this.props;
        const rates = JSON.parse(localStorage.getItem('rates'));
        return (
            <div className="col-md-6 col-md-offset-3">
                <h3>Hi {user.email}!</h3>
                <p>You're logged in with React!!</p>
                <h3>Your Balances: </h3>
                <h4>btc: ₿{user.balances.btc}</h4>
                <h4>xmr: ɱ{user.balances.xmr}</h4>
                <h4>ltc: Ł{user.balances.ltc}</h4>
                <h4>salt: Δ{user.balances.salt}</h4>
                <h4>doge: Ð{user.balances.doge}</h4>
                <h4>usd: ${user.balances.usd}</h4>
                <h3>Current rates: </h3>
                <h4>xmr: {rates.xmr} xmr/btc</h4>
                <h4>ltc: {rates.ltc} ltc/btc</h4>
                <h4>salt: {rates.salt} salt/btc</h4>
                <h4>doge: {rates.doge} doge/btc</h4>
                <h4>usd: {rates.usd} usd/btc</h4>
                {/* <h3>All registered users:</h3> */}
                {/* {users.loading && <em>Loading users...</em>}
                {users.error && <span className="text-danger">ERROR: {users.error}</span>}
                {users.items &&
                    <ul>
                        {users.items.map((user, index) =>
                            <li key={user.id}>
                                {user.email}
                                {
                                    user.deleting ? <em> - Deleting...</em>
                                    : user.deleteError ? <span className="text-danger"> - ERROR: {user.deleteError}</span>
                                    : <span> - <a onClick={this.handleDeleteUser(user.id)}>Delete</a></span>
                                }
                            </li>
                        )}
                    </ul>
                } */}
                <p>
                    <Link to="/login">Logout</Link>
                </p>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { authentication } = state;
    const { user } = authentication;
    return {
        user
    };
}

const connectedHomePage = connect(mapStateToProps)(HomePage);
export { connectedHomePage as HomePage };