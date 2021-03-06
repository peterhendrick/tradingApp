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
        this.buyBtc = this.buyBtc.bind(this);
        this.sellBtc = this.sellBtc.bind(this);
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

    buyBtc(event) {
        event.preventDefault();
        this.setState({ submitted: true });
        this.props.dispatch(userActions.buyBtc(this.state.pair, this.state.btc, this.props.user.id));
        this.props.hideModal();
    }

    sellBtc(event) {
        event.preventDefault();
        this.setState({ submitted: true });
        this.props.dispatch(userActions.sellBtc(this.state.pair, this.state.btc, this.props.user.id))
        this.props.hideModal();
        // return this.props.sellBtc(this.state.pair, this.state.btc, this.props.user.id)
        //     .then(response => {
        //         this.props.hideModal();
        //     })
    }

    openTradeModal(event) {
        this.props.showModal({
            open: true,
            title: 'Trade Modal',
            fields: [{
                label: event.target.name === 'buy' ? 'Coin to Sell' : 'Coin to Buy',
                name: 'pair',
                placeholder: 'Enter coin name to sell ("xmr", "ltc", "salt", "doge", "usd")',
            }, {
                label: event.target.name === 'buy' ? 'Bitcoin Amount to Buy' : 'Bitcoin Amount to Sell',
                name: 'btc',
                placeholder: 'Enter bitcoin amount'
            }],
            onInputChange: this.onInputChange,
            confirmAction: event.target.name === 'buy' ? this.buyBtc : this.sellBtc,
            user: this.props.user,
            crypto: this.tradeCrypto
        }, 'trade')
    }

    render() {
        const { user, rates } = this.props;
        if (!user) {
            return <Redirect to='/login' />
        }
        const totalBTCValue = _getBTCValue(user.balances, rates);
        const totalUSDValue = Number(rates.usd) * totalBTCValue;
        return (
            <div className="col-md-6 col-md-offset-3">
                <h3>Hi {user.username}!</h3>
                <h3>Your Current Balances: </h3>
                <h4>btc: ₿{Number(user.balances.btc).toFixed(8)}</h4>
                <h4>xmr: ɱ{Number(user.balances.xmr).toFixed(8)}</h4>
                <h4>ltc: Ł{Number(user.balances.ltc).toFixed(8)}</h4>
                <h4>salt: Δ{Number(user.balances.salt).toFixed(8)}</h4>
                <h4>doge: Ð{Number(user.balances.doge).toFixed(8)}</h4>
                <h4>usd: ${Number(user.balances.usd).toFixed(2)}</h4>
                <h4>Total Portfolio BTC Value: ₿{totalBTCValue.toFixed(8)}</h4>
                <h4>Total Portfolio USD Value: ${totalUSDValue.toFixed(2)}</h4>
                <h3>Current rates: </h3>
                <h4>xmr: {rates.xmr} xmr/btc</h4>
                <h4>ltc: {rates.ltc} ltc/btc</h4>
                <h4>salt: {rates.salt} salt/btc</h4>
                <h4>doge: {rates.doge} doge/btc</h4>
                <h4>usd: {rates.usd} usd/btc</h4>
                <div className="col">
                    <button
                        className="btn btn-outline-primary btn-block"
                        name="buy"
                        onClick={this.openTradeModal}
                    >Buy BTC</button>
                </div>
                <div className="col">
                    <button
                        className="btn btn-outline-primary btn-block"
                        name="sell"
                        onClick={this.openTradeModal}
                    >Sell BTC</button>
                </div>
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
    let { user, rates } = authentication;
    if (!user) user = JSON.parse(localStorage.getItem('user'));
    if (!rates) rates = JSON.parse(localStorage.getItem('rates'));
    return {
        user,
        rates
    };
}

const mapDispatchToProps = dispatch => ({
    dispatch: dispatch,
    buyBtc: (pair, amount, id) => dispatch(userActions.buyBtc(pair, amount, id)),
    sellBtc: (pair, amount, id) => dispatch(userActions.sellBtc(pair, amount, id)),
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