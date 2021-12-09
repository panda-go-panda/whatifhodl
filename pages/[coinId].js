import * as index from '.'

export default index.CoinPage
export const getStaticProps = index.getStaticProps

export async function getStaticPaths() {
  const allCoins = await index.fetchAllCoins()

  // Get the paths we want to pre-render based on posts
  const paths = allCoins.map((coin) => ({
    params: { coinId: coin.id },
  }))

  return { paths, fallback: false }
}