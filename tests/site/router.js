import { go, router } from '@ianwalter/history-router'
import { h, render } from 'preact'
import App from './components/App.jsx'

async function renderApp (loadPage) {
  const { default: Page } = await loadPage()
  render(<App Page={Page} />, document.getElementById('app'))
}

router.add('/', () => renderApp(() => import('./components/Home.jsx')))
router.add('/login', () => renderApp(() => import('./components/Login.jsx')))

export { go, router }
