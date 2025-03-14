import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from './stores/authStore';

interface TradingPair {
  base: string;
  quote: string;
  price: number;
}

export function TradePage() {
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = useAuthStore((state) => state.token);

  const fetchPairs = async (kind?: string) => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/trade/recommend', {
        headers: { Authorization: `Bearer ${token}` },
        params: { kind }
      });
      setPairs(data);
    } catch (error) {
      console.error('Failed to fetch trading pairs:', error);
    }
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  return (
    <div className="trade-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search trading pairs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => fetchPairs(searchTerm)}>OK</button>
      </div>
      
      <table className="trading-pairs-table">
        <thead>
          <tr>
            <th>Pair</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair, index) => (
            <tr key={index}>
              <td>{pair.base}/{pair.quote}</td>
              <td>${pair.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}