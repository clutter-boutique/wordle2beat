const TARGET_URL = 'https://api.twitter.com/2/tweets/'
const START_REGEX = RegExp('^.[^🟩|⬛|🟨]*')
const END_REGEX = RegExp('[^🟩|⬛|🟨]*$')

export async function onRequest(ctx) {
  try {
    let tweetId = getTweetId(ctx)
    let response =  await getTweetJson(tweetId, ctx.env.BEARER_TOKEN)
    if (Object.keys(response).includes('data')){
      let wordle = extractWordle(response)
      let hash = wordleToBeatHash(wordle)
      return Response.redirect(`https://${ctx.env.APP_BASE_URL}/#${hash}`)
    } else {
      return new Response("No tweet with wordle found for id ", tweetId)
    }
  } catch (err){
    return new Response(err.message)
  }
}


async function getTweetJson(tweetId, bearerToken){
  let target = TARGET_URL + tweetId
  let headers =  {headers: {Authorization: `Bearer ${bearerToken}`}}
  let response = await fetch(target, headers)
  return await response.json()
}

function wordleToBeatHash(wordle){
  let binary =  wordle.replaceAll("\n", "000")
    .replaceAll('🟨', '1')
    .replaceAll('🟩', '1')
    .replaceAll('⬛', '0')
  binary += "000"
  return parseInt(binary, 2).toString(16)
}

function getTweetId(ctx){
  let url = new URL(ctx.request.url)
  let searchParams = new URLSearchParams(url.search)
  return searchParams.get('tweet')
}

function extractWordle(response){
  let text = response['data']['text']
  return text.replace(START_REGEX, '').replace(END_REGEX, '')
}



