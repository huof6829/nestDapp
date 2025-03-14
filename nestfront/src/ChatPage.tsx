import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from './stores/authStore';

export function ChatPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        'http://localhost:8000/api/trade/question',
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswer(data);
    } catch (error) {
      console.error('Failed to submit question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="answer-box">
        {answer && <pre>{answer}</pre>}
      </div>
      <div className="input-box">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question..."
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}