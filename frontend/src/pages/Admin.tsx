
import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '../firebase';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import { g } from '../api';
import type { Product } from '../types';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  const [me, setMe] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        const t = await u.getIdToken();
        setToken(t);
        const m = await g('/api/me', t).catch(() => null);
        setMe(m);
        const list = await g('/api/products');
        setProducts(list);
      } else {
        setMe(null); setToken('');
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <AdminLogin />;
  }

  return (
    <AdminPanel user={user} token={token} me={me} products={products} setProducts={setProducts} />
  );
}
