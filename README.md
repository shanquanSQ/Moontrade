# 🚀 Moontrade - Virtual Stock Trading Platform

Moontrade is a virtual stock trading application that allows users to engage in risk-free trading with real-time data from the S&P 100, powered by the Polygon.io API. Users can learn, practice, and enhance their trading skills without the financial risks involved in real stock trading.

![Screenshot of Markets](/pictures/Markets-ss.png)
![Screenshot of Trade](/pictures/Trade-ss.png)
![Screenshot of News](/pictures/News-ss.png)
![Screenshot of Portfolio](/pictures/Portfolio-ss.png)
![Screenshot of Leaderboard](/pictures/Leaderboard-ss.png)

## 🌟 Features

- **Real-Time Data**: Utilize real-time stock data from the S&P 100 via Polygon.io API.
- **Virtual Trading**: Perform trades, manage portfolios, and evaluate performance in a risk-free environment.
- **Competitions**: Engage in trading competitions with friends and the Moontrade community.
- **News**: Get the latest news from your Watchlist to keep up to date.

## 🛠️ Getting Started

### Prerequisites

- React
- Firebase
- Polygon API Key

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/shanquanSQ/ftbc13-project2.git

   ```

2. Install NPM packages:

cd Moontrade && npm install

3. Create a .env file in the root directory and add your Polygon.io API Key:

REACT_APP_POLYGON_API_KEY=YOUR_API_KEY

4. Start the development server:

npm start

5. Visit http://localhost:3000 in your browser.

## 📈 Usage

### Detailed Features

1. **User Authentication**: Manage user access and secure user data via Firebase Auth.
2. **User Portfolio**:
   - **Balance**: Display and manage user's virtual financial balance.
   - **Top-up Credits**: Allow users to virtually top-up credits using Stripe.
3. **Markets**:
   - **View S&P100 Data**: Display essential trading asset data to users.
4. **Trading**:

   - **Trade**: Enable virtual buying/selling of S&P100 stocks.
   - **Validation**: Ensure trades are validated based on available credits and stock holdings.
   - **Charts**: Present user-friendly and insightful asset charts for informed trading via Tradingview light charts.

5. **Portfolio Positions**: Showcase and manage current user portfolio.

   - **RealizedPnL**: Show realized PnL by stock and for the whole portfolio
   - **UnrealizedPnL**: Display unrealized possible PnL based on last traded price.

6. **Navigation**:
   - **Routing**: Use React Router to manage Nav.
7. **Social**:
   - **Referral**: Refer others and gain credits.
   - **Competition**: Facilitate virtual trading competitions based on Realized PnL among users.
8. **News of Watchlist**: Keep users informed with the latest news related to their watchlist.
9. **DARK MODE**: Implement a dark mode for enhanced usability and aesthetics.

### Development and Setup

- **Firebase Setup**: Implement and configure Firebase for backend services using Auth, Realtime DB and Storage.
- **Repo Setup**: Establish a clean and manageable repository structure.
- **API Implementation**:
  - **Evaluation**: Assess API options and integrate the selected API.
  - **Display Information**: Extract and display relevant data from the Polygon.io API
- **Charting Library**:
  - Evaluate and implement the TradingView charting library.
- **PRD for Trading App**: Establish a Product Requirements Document for product planning.
- **TDD for Trading App**: Establish a Technical Detail Document for development planning.
- **Wireframe for Trading App**: Establish a Figma design flow for design development.
- **Github dev flow & Netlify Deployment**: Manage PR, repo and deploy via Netlify

### Frontend Development

1. **Markets**: Develop frontend interfaces for various market views.
2. **Portfolio**: Create user-specific portfolio displays and management.
3. **Trade**: Construct UI for seamless and informed trading activities.
4. **Profile and Login**: Develop interfaces for user profiles and authentication.
5. **Social/Competition/Referral**: Create engaging social and competition interfaces.

## 👥 Contributors

- **Welcome contributors**: We built this project as part of Rocket Academy FTBC13 Bootcamp. Please feel free to use or adapt from the code base.
- **Core Contributors**: SQ, SPY, JS

## 📜 License

- **MIT Open-source license**

## Created using CRA

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
