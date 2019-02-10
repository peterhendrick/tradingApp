import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Home extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.state = {
            rates: []
        }
    }

    // Fetch the list on first mount
    componentDidMount() {
        this.getRates();
    }


    getRates = () => {
        fetch('/api/home')
            .then(res => res.json())
            .then(rates => this.setState({ rates }))
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        const { rates } = this.state;

        return (
            <div className="App">
                <h1>Project Home</h1>
                {/* Check to see if any items are found*/}
                {rates ? (
                    <div>
                        <div>
                            xmr: {rates.xmr}
                            ltc: {rates.ltc}
                        </div>
                    </div>
                ) : (
                        <div>
                            <h2>No Rate Items Found</h2>
                        </div>
                    )
                }
                {/* Link to List.js */}
                <Link to={'./list'}>
                    <button variant="raised">
                        My List
                    </button>
                </Link>
            </div>
        );
    }
}
export default Home;