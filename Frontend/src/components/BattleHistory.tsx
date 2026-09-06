import { useEffect, useState } from 'react';
import { getBattlesApi } from '../services/api';

interface Battle {
  _id: string;
  problem: string;
  judge: {
    winner: string;
  };
  createdAt: string;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(dateString));
}

function BattleCard({ battle }: { battle: Battle }) {
  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-3xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-100 mb-2 truncate">{battle.problem}</h3>
      <p className="text-xs text-gray-500 mb-1">Winner</p>
      <p className="text-sm font-medium text-emerald-300 mb-3">{battle.judge.winner || 'TBD'}</p>
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">{formatDate(battle.createdAt)}</p>
    </div>
  );
}

export default function BattleHistory() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBattles() {
      try {
        setBattles(await getBattlesApi());
      } catch (fetchError: any) {
        console.error('[BattleHistory] fetch error', fetchError?.message || fetchError);
        setError('Could not load battle history.');
      } finally {
        setLoading(false);
      }
    }

    fetchBattles();
  }, []);

  return (
    <aside className="space-y-4">
      <div className="bg-gray-950/80 border border-gray-800 rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">Battle History</h2>
        <p className="text-sm text-gray-500">Recent AI battles are loaded automatically.</p>
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-4 text-sm text-gray-400">
            Loading battles...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && battles.length === 0 && (
          <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-4 text-sm text-gray-400">
            No battles yet. Submit a question to start the first fight.
          </div>
        )}

        {battles.map((battle) => (
          <BattleCard key={battle._id} battle={battle} />
        ))}
      </div>
    </aside>
  );
}
