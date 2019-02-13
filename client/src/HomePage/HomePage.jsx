import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import ModalRoot from '../App/ModalRoot';
import { showModal, hideModal } from '../_actions/modal.actions';

import { userActions } from '../_actions';

class HomePage extends React.Component {
    constructor(props) {
        super(props)
        this.onInputChange = this.onInputChange.bind(this);
        this.openTradeModal = this.openTradeModal.bind(this);
        this.showInput = this.showInput.bind(this);
    }

    componentDidMount() {
        // this.props.dispatch(userActions.getAll());
    }

    handleDeleteUser(id) {
        return (e) => this.props.dispatch(userActions.delete(id));
    }

    onInputChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    showInput(event) {
        console.log(this.state);
        this.props.hideModal();
    }

    openTradeModal(event) {
        this.props.showModal({
            open: true,
            title: 'Trade Modal',
            fields: [{
                label: 'Address name',
                name: 'addressName',
                placeholder: 'Enter address name',
            }],
            onInputChange: this.onInputChange,
            confirmAction: this.showInput
        }, 'trade')
    }

    render() {
        const { user } = this.props;
        if (!user) {
            return <Redirect to='/login' />
        }
        const rates = JSON.parse(localStorage.getItem('rates'));
        const totalBTCValue = _getBTCValue(user.balances, rates);
        const totalUSDValue = totalBTCValue * Number(rates.usd);
        return (
            <div className="col-md-6 col-md-offset-3">
                <h3>Hi {user.username}!</h3>
                <p>You're logged in with React!!</p>
                <h3>Your Current Balances: </h3>
                <h4>btc: ₿{user.balances.btc}</h4>
                <h4>xmr: ɱ{user.balances.xmr}</h4>
                <h4>ltc: Ł{user.balances.ltc}</h4>
                <h4>salt: Δ{user.balances.salt}</h4>
                <h4>doge: Ð{user.balances.doge}</h4>
                <h4>usd: ${user.balances.usd}</h4>
                <h4>Total Portfolio BTC Value: ₿{totalBTCValue.toFixed(8)}</h4>
                <h4>Total Portfolio USD Value: ${totalUSDValue}</h4>
                <div className="col">
                    <button
                        className="btn btn-outline-primary btn-block"
                        onClick={this.openTradeModal}
                    >Trade</button>
                </div>
                <h3>Current rates: </h3>
                <h4>xmr: {rates.xmr} xmr/btc</h4>
                <h4>ltc: {rates.ltc} ltc/btc</h4>
                <h4>salt: {rates.salt} salt/btc</h4>
                <h4>doge: {rates.doge} doge/btc</h4>
                <h4>usd: {rates.usd} usd/btc</h4>
                <p>
                    <Link to="/login">Logout</Link>
                </p>
                <ModalRoot />
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

const mapDispatchToProps = dispatch => ({
    dispatch: dispatch,
    logout: () => dispatch(userActions.logout()),
    hideModal: () => dispatch(hideModal()),
    showModal: (modalProps, modalType) => {
        dispatch(showModal({ modalProps, modalType }))
    }
})

function _getBTCValue(balances, rates) {
    return Number(balances.btc) +
        (Number(balances.xmr) / Number(rates.xmr)) +
        (Number(balances.ltc) / Number(rates.ltc)) +
        (Number(balances.salt) / Number(rates.salt)) +
        (Number(balances.doge) / Number(rates.doge)) +
        (Number(balances.usd) / Number(rates.usd));
}

const connectedHomePage = connect(mapStateToProps, mapDispatchToProps)(HomePage);
export { connectedHomePage as HomePage };