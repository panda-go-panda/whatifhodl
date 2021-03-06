import Head from 'next/head'
import { useRouter } from 'next/router'
import CoinGecko from 'coingecko-api'
import React, { useEffect, useState } from 'react'

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export const fetchAllCoins = async () => {
  const CoinGeckoClient = new CoinGecko()
  const resp =  await CoinGeckoClient.coins.all()

  return resp.data.map(coin => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    percentageChange: coin.market_data.price_change_percentage_1y,
    image: coin.image.large
  }))
  .sort((a, b) => {
    if (a.id === 'ethereum' || a.id === 'bitcoin') return 1
    if (b.id === 'ethereum' || b.id === 'bitcoin') return 1
    return a > b.symbol ? 1 : b.symbol > a.symbol ? -1 : 0
  })
}

const formatTotal = (total) => {
  return usdFormatter.format(total).replace(/.00$/, '')
}

const calculateTotal = (fiatTotal, percentageChange) => {
  const total =  Math.floor(fiatTotal * (1 + percentageChange / 100))
  return formatTotal(total)
}

export function CoinPage({ defaultCoinId, defaultAllCoins = [] }) {
  const router = useRouter()
  const [coinId, setCoinId] = useState(defaultCoinId)
  const [allCoins, setAllCoins] = useState(defaultAllCoins)
  const [percentages, setPercentages] = useState({})
  const [fiatTotal, setFiatTotal] = useState(1000)

  const currentCoin = allCoins.find(item => item.id === coinId)
  const newTotal = calculateTotal(fiatTotal, percentages[coinId])

  const onSelectChange = (e) => {
    const newCoinId = e.target.value
    setCoinId(newCoinId)
    router.push(`/${newCoinId}`, undefined, { shallow: true })
  }

  const onInputChange = (e) => {
    setFiatTotal(e.target.value)
  }

  const renderCoinResults = (coins, currentCoinId) => {
    let count = 0;

    const randomCoins = coins
      // .sort((a,b) => 0.5 - Math.random())
      .filter((item) => {
        if (item.id !== currentCoin.id && item.percentageChange > 20 && count < 5) {
          count++
          return true
        }})

    return randomCoins.map(coin => (
      <div key={coin.id}>{coin.symbol}: {calculateTotal(fiatTotal, percentages[coin.id])}</div>
    ))
  }

  useEffect(() => {
    const reduce = (data) => {
      return data.reduce((result, coin) => {
        result[coin.id] = coin.percentageChange
        return result
      }, {})
    }
    const getCoins = async () => {
      const data = await fetchAllCoins()
      setPercentages(reduce(data))
    }
    setPercentages(reduce(defaultAllCoins))
    getCoins()
  }, [setPercentages, defaultAllCoins])

  return (
    <div className="container">
      <Head>
        <title>What if you had invested in this coin last year?</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`What if you had invested $1000 in ${currentCoin.name} a year ago?`} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={`You would have ${newTotal}`} />
        <meta property="og:image" content={currentCoin.image} />
      </Head>

      <main>
        <h1 className="title">
          How much would you have if you had invested
          <div className="inputsWrapper">
            $<input 
              className="inputField"
              defaultValue="1000"
              onChange={onInputChange}
              type="number"
              autoFocus
            />
            <span>in</span>
            <select onChange={onSelectChange} className="coinSelect" value={coinId}>
              {allCoins.map((coin, index) => (
                <option key={coin.id} value={coin.id} title={coin.name} label={coin.symbol} />
              ))}
            </select>
            {currentCoin && <img src={currentCoin.image} key={coinId} alt={currentCoin.name} />}
          </div>
          exactly a year ago?
        </h1>

        <p className="result">
          {newTotal}
        </p>

        <div className="otherCoins">
          What if you invested in other coins? 
          <div className="randomCoinsContainer">
            {renderCoinResults([...allCoins], coinId)}
          </div>
        </div>
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
          border-radius: 100%;
          box-shadow: 0px 0px 5px 5px #555A77;
        }

        .inputsWrapper span {
          padding: 0 0.4em;
        }

        .inputsWrapper input,
        .inputsWrapper select {
          font-size: 0.8em;
          max-width: 6.5em;
          outline: none;
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
          margin-top: 10em;
          font-size: 1em;
          text-align: center;
          border: 1px solid #555A77;
          padding: 40px;
          box-shadow: 0px 0px 5px 5px #555A77;
        }

        .randomCoinsContainer {
          margin-top: 30px;
          display: flex;
          justify-content: space-evenly;
          gap: 20px;
          flex-wrap: wrap;
        }

        @media (max-width: 600px) {

          .title {
            font-size: 1.5em;
          }
          .result {
            font-size: 3em;
          }

          .otherCoins {
            padding: 20px;
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

const Home = CoinPage
export default Home

export async function getStaticProps(context) {
  const allCoins = await fetchAllCoins()

  return {
    props: {
      defaultCoinId: context.params && context.params.coinId ? context.params.coinId : 'ethereum',
      defaultAllCoins: allCoins
    },
  }
}