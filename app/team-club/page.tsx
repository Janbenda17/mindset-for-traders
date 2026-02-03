'use client';

import { useEffect, useState } from 'react';
import { Shield, Users, TrendingUp } from 'lucide-react';

export default function TeamClubPage() {
  const [loading, setLoading] = useState(true);
  const [isLiveMode, setIsLiveMode] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-300">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6 pt-20">
        <div className="text-center py-20">
          <Shield className="w-20 h-20 text-purple-400 mx-auto mb-6" />
          <h1 className="text-5xl font-black text-white mb-4">Team Club</h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto mb-8">
            Spojte se s ostatními tradery v komunitě a sdílejte své zkušenosti
          </p>

          {!isLiveMode ? (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-blue-300">
                🎮 <strong>Virtual Mode:</strong> Prozkoumejte Team Club v demomodu. Zakupte si Premium pro LIVE režim a spojte se s opravdovými tradery.
              </p>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-green-300">
                ✅ <strong>Live Mode:</strong> Jste připojeni k živému Team Clubu!
              </p>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/50 transition-all">
            <Users className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Najdi partnera</h3>
            <p className="text-purple-200">
              Najděte ideálního trading partnera s kompatibilním stylem obchodování.
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-900/50 to-slate-900/50 border border-pink-500/20 rounded-2xl p-8 hover:border-pink-400/50 transition-all">
            <TrendingUp className="w-12 h-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sdílej pokrok</h3>
            <p className="text-pink-200">
              Sledujte pokrok ostatních traderů a inspirujte se jejich úspěchy.
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/20 rounded-2xl p-8 hover:border-indigo-400/50 transition-all">
            <Shield className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Podpora komunity</h3>
            <p className="text-indigo-200">
              Získejte pomoc od zkušených traderů a sdílejte své znalosti.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <p className="text-purple-300 text-lg mb-6">
            {isLiveMode 
              ? "Jste připraveni explorovat komunitu?"
              : "Chcete se připojit k živému Team Clubu?"}
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all">
            {isLiveMode ? "Prohlédnout komunitu" : "Upgradovat na Premium"}
          </button>
        </div>
      </div>
    </div>
  );
}
