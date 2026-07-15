import { Link } from 'react-router-dom'

function Navigation() {
  return (
    <header className="topbar">
      <a className="brand" href="/">
        Blood Donation Web
      </a>
      <Link className="login-button" to="/admin/login">
        Login
      </Link>
    </header>
  )
}

export default Navigation
