// welcome page + inspo

import { Link } from 'react-router-dom';
import daisyImage from '../assets/daisy.png';

export default function WelcomePage() {
    return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '60px', position:'relative' }}>

    <img
        src={daisyImage}
        alt="daisy"
        style={{
            position: 'absolute',
            left: '-50px',
            top: '30%',
            transform: 'translateY(-50%)',
            width: '80px',
            height: '80px',
            animation: 'spin 10s linear infinite'
        }}
    />

    <img
        src={daisyImage}
        alt="daisy"
        style={{
            position: 'absolute',
            right: '-50px',
            top: '30%',
            transform: 'translateY(-50%)',
            width: '80px',
            height: '80px',
            animation: 'spin 10s linear infinite reverse'
        }}
    />

      <h2 >
        Welcome to:
      </h2>

      <h1 style={{ fontFamily: 'Slow Play, cursive', fontWeight: 400, fontSize: '3rem', marginTop: '60px', textAlign: 'center', whiteSpace: 'nowrap', animation: 'fadeSlide 2s ease-out, float 3s ease-in-out infinite', textShadow: '2px 2px 0px #ddd, 4px 4px 0px #ccc, 6px 6px 0px #bbb'  }}>
        The Daily Daisy Planner!
      </h1>

      <p style={{ fontSize: '1rem', color: 'var(--text-light)', marginTop: '60px', marginBottom: '60px', lineHeight: '1.5'}}>
        Daily Daisy is a modular digital planner app that allows you to customize a planner for your needs and keep track of all of your daily / weekly / and monthly tasks
      </p>
    
      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <Link to="/login" style={{ textDecoration: 'none', flex: 1 }}>
          <button 
            className="primary"
            style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Login
          </button>
        </Link>

        <Link to="/register" style={{ textDecoration: 'none', flex: 1 }}>
          <button 
            className="secondary"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
          >
            Register
          </button>
        </Link>
      </div>
    </div>
  )
}