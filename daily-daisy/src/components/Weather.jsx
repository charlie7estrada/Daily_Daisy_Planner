// displays current weather for a city

import { useState, useEffect } from 'react';
import { getWeather } from '../services/weatherService';

export default function Weather({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!city) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getWeather(city);
        setWeather(data);
      } catch (err) {
        setError('Unable to load weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]); // Refetch when city changes

  if (loading) return <div style={{ fontSize: '0.9rem', color: '#666' }}>Loading weather...</div>;
  if (error) return <div style={{ fontSize: '0.9rem', color: '#999' }}>{error}</div>;
  if (!weather) return null;

  return (
    <div style={{ 
      padding: '15px', 
      background: 'white', 
      borderRadius: '8px', 
      border: '2px solid var(--almond-silk)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    }}>
      <img 
        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        alt={weather.description}
        style={{ width: '50px', height: '50px' }}
      />
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{weather.temp}°F</div>
        <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'capitalize' }}>
          {weather.description}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#999' }}>{weather.city}</div>
      </div>
    </div>
  );
}