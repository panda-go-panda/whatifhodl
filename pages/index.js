import Head from 'next/head'
import CoinGecko from 'coingecko-api'
import React, { useEffect, useState } from 'react'

const CoinGeckoClient = new CoinGecko()
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function Home() {
  const [allCoins, setAllCoins] = useState([])
  const [coinId, setCoinId] = useState('ethereum')
  const [fiatTotal, setFiatTotal] = useState(1000)
  const [newFiatTotal, setNewFiatTotal] = useState(0)
  const currentCoin = allCoins.find(item => item.id === coinId)

  const onSelectChange = (e) => {
    setCoinId(e.target.value)
  }

  const onInputChange = (e) => {
    setFiatTotal(e.target.value)
  }

  const calculateTotal = (percentageChange) => {
    return Math.floor(fiatTotal * (1 + percentageChange / 100))
  }

  const renderCoinsResults = (coins, currentCoinId) => {
    let count = 0;
    const randomCoins = coins
      .sort((a, b) => 0.5 - Math.random())
      .filter((item) => {
        if(item.id !== currentCoin && count < 5) {
          count++
          return true
        }})

    return randomCoins.map(coin => (
      <div>{coin.symbol}: ${calculateTotal(coin.percentageChange)}</div>
    ))
    
  }

  useEffect(() => {
    const fetchAllCoins = async () => {
      const resp =  await CoinGeckoClient.coins.all()

      const coinItems = resp.data.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        percentageChange: coin.market_data.price_change_percentage_1y,
        image: coin.image.large
      }))

      console.log(resp.data)
  
      setAllCoins(coinItems)
    }

    fetchAllCoins()
  }, [setAllCoins])

  useEffect(() => {
    if (!currentCoin) return
    const newTotal = calculateTotal(currentCoin.percentageChange)
    setNewFiatTotal(newTotal)
  }, [currentCoin, fiatTotal, setNewFiatTotal])

  return (
    <div className="container">
      <Head>
        <title>What if you invested last year?</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          How much would you have if you invested
          <div className="inputsWrapper">
            $<input className="inputField" defaultValue="1000" onChange={onInputChange} type="number" autoFocus />
            <span>in</span>
            <select onChange={onSelectChange} value={coinId} className="coinSelect">
              {allCoins.map(coin => (
                <option key={coin.id} value={coin.id} title={coin.name}>{coin.symbol}</option>
              ))}
            </select>
            {currentCoin && <img src={currentCoin.image} key={coinId} />}
          </div>
          exactly a year ago?
        </h1>

        <p className="result">
          {usdFormatter.format(newFiatTotal).replace(/.00$/, '')}
        </p>

        {/* <div className="otherCoins">
          What if you invested in other coins? 
          <div className="randomCoinsContainer">
            {renderCoinsResults(allCoins, coinId)}
          </div>
        </div> */}
      </main>

      <footer>
        <div className="link">
          Made by
          <a
            href="https://github.com/panda-go-panda"
            target="_blank"
            rel="noopener noreferrer"
          >
            Panda-go-panda
          </a>
        </div>
        <div className="link">
          Powered by 
          <a
            href="https://www.coingecko.com/en"
            target="_blank"
            rel="noopener noreferrer"
          >
            CoinGecko
          </a>
        </div>

      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #1F233C;
          color: white;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #8B92B2;
          flex-direction: column;
          font-size: 12px;
          opacity: 0.5;
        }

        .link {
          padding-top: 5px;
        }

        footer a {
          display: inline;
          padding-left: 5px;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        a:hover,
        a:focus,
        a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 3rem;
        }

        .title {
          text-align: center;
          line-height: 1.4;
        }
        
        .result {
          font-size: 10rem;
          text-align: center;
          margin-top: 8vh;
          margin-bottom: 0;
          width: 100%;
          line-height: 1.5em;
          border-radius: 30px;
          background: #1F2351;
          background-image: linear-gradient( 90.1deg,  rgba(255,85,85,1) 0.1%, rgba(85,85,255,1) 100% );
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .logo {
          height: 1em;
        }

        .inputsWrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .inputsWrapper img {
          display: block;
          height: 0.6em;
          width: 0.6em;
          margin-left: 0.1em;
        }

        .inputsWrapper span {
          padding: 0 0.4em;
        }

        .inputsWrapper input,
        .inputsWrapper select {
          font-size: 0.8em;
          max-width: 6.5em;
        }

        .inputField {
          background-color: transparent;
          color: white;
          border: none;
          border-bottom: 1px solid white;
        }

        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }

        .coinSelect {
          background-color: transparent;
          color: white;
          border: none;
          border-bottom: 1px solid white;
        }

        .otherCoins {
          margin-top: 6em;
          font-size: 1em;
          text-align: center;
        }

        .randomCoinsContainer {
          display: flex;
        }

        .randomCoinsContainer div {
          border-left: 1px solid white;
          border-right: 1px solid white;
        }

        @media (max-width: 600px) {

          .title {
            font-size: 1.5em;
          }
          .result {
            font-size: 3em;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
