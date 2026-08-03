import './index.css'

const isEmbedRoute = /^\/embed\/[a-zA-Z0-9-]+\/?$/.test(
  window.location.pathname,
)

const entry = isEmbedRoute
  ? import('./embed-main')
  : import('./editor-main')

void entry.then(({ mount }) => mount()).catch((error) => {
  console.error('Unable to start Liveesh', error)
})
