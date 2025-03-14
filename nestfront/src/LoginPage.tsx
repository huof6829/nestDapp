import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

export function LoginPage() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);
  const { setVisible } = useWalletModal();
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSignMessage = async () => {
      try {
        setLoading(true);
        const message = new TextEncoder().encode('Sign in to NestFront');
        const signature = await signMessage!(message);

        const { data } = await axios.post('http://localhost:8000/api/wallet/login', {
          wallet: publicKey!.toBase58(),
          signature: Array.from(signature)
        });

        alert('登录成功');
        setToken(data.token);
        navigate('/trade');
      } catch (error: any) {
        console.error('连接失败:', error);
        disconnect();
        if (error.message.includes('WalletNotReady')) {
          alert('请先安装Phantom钱包插件');
        } else {
          alert('验证失败，请重试');
        }
      } finally {
        setLoading(false);
      }
    };

    if (connected && publicKey) {
      handleSignMessage();
    }
  }, [connected, publicKey]);

  return (
    <div className="login-container">
      <h1>Connect Phantom Wallet</h1>
      <button 
        onClick={() => setVisible(true)}
        disabled={loading}
        className="connect-button"
      >
        {loading ? '处理中...' : '连接钱包'}
      </button>
    </div>
  );
}