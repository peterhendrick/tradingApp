PERN Full Stack fake cryptocurrency trading app
=======

tradingApp is a website where you can register to login and make fake trades between btc, ltc, xmr, salt, doge and usd.

For a live example of this full stack app running visit https://cryptotradingapp.herokuapp.com/

**Author:** Peter Hendrick

## Requirements and Downloading

To use tradingApp, you need:

* Node.js

* tsc - a typescript compiler (npm install -g tsc)

* postgres - you need a postgres server running locally. For mac users, you can run:

```bash
brew install postgres && brew services start postgres
```

To download locally, run:
```bash
git clone https://github.com/peterhendrick/tradingApp && cd tradingApp
```

To install run:
```bash
npm install && npm run build
```

You can now run the app locally (on the condition that you provide the proper database connection environment variables)

You'll need to add the following node environment variables to connect to a database locally.
DB  - the database name you'd like to connect to.
HOST  - the postgres server you'd like to connect to.
DB_PASS  - your database user password
DB_PORT  - the port your postgres server is running on
DB_USER  - the username of your database user.

The app will run on port 5000. To use the app visit localhost:5000 and click register. Enter a username and password (passwords are hashed on the client and stored hashed in the database. Plaintext passwords are not sent to the server). Once registered, you can then login.

Each account will be given a fake $10000 usd to begin trading. All trades must use BTC. Once you have BTC, you can trade among other cryptos or back to usd.

