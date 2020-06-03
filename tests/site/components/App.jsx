import { h } from 'preact'
import { go } from '../router'

export default ({ Page }) => (
  <div>
    <header style="display: flex;">

      <a
        href="/"
        onClick={go}
        style="font-weight: bold;"
      >
        App
      </a>

      <nav style="margin-left: 15px;">
        <a
          id="loginLink"
          href="/login"
          onClick={go}
        >
          Login
        </a>
      </nav>

    </header>

    <main>
      <Page />
    </main>

  </div>
)
