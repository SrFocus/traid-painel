import { useState, useEffect } from 'react';
import { getBans, addBan, removeBan } from '../services/api';
import { Ban, Plus, Trash2, X, AlertTriangle, Clock, Search } from 'lucide-react';

function Bans() {
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newBan, setNewBan] = useState({ user_id: '', motivo: '', desbanimento: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const filteredBans = bans.filter(b => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    // ID: só números com até 7 dígitos (IDs de usuário são pequenos)
    // Hex steam: números com 8+ dígitos ou contém letras (a-f)
    const isId = /^\d{1,7}$/.test(q);
    if (isId) {
      return String(b.numeric_id) === q;
    }
    // user_id agora é o steam hex (ex: steam:110000112345678)
    const steamHex = b.user_id ? b.user_id.replace('steam:', '').toLowerCase() : '';
    return (
      steamHex.includes(q) ||
      (b.user_id && b.user_id.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    loadBans();
  }, []);

  const loadBans = async () => {
    setLoading(true);
    try {
      const response = await getBans();
      setBans(response.data.bans || []);
    } catch (err) {
      console.error('Erro ao carregar banimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBan = async (e) => {
    e.preventDefault();
    try {
      await addBan(newBan.user_id, newBan.motivo, newBan.desbanimento || null, 1);
      setShowModal(false);
      setNewBan({ user_id: '', motivo: '', desbanimento: '' });
      loadBans();
      setMessage({ type: 'success', text: 'Jogador banido com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao banir jogador' });
    }
  };

  const handleRemoveBan = async (user_id) => {
    if (!confirm('Tem certeza que deseja remover este banimento?')) return;
    
    try {
      await removeBan(user_id);
      loadBans();
      setMessage({ type: 'success', text: 'Banimento removido com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover banimento' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-white">Banimentos</h1>
          <p className="text-slate-400">{filteredBans.length} de {bans.length} banimentos</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID ou Steam Hex"
              className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 w-64"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Novo Banimento</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/50 text-green-400'
            : 'bg-red-500/10 border border-red-500/50 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Bans List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden animate-slideUp hover-lift" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : bans.length === 0 ? (
          <div className="text-center py-12">
            <Ban className="mx-auto text-slate-500 mb-3" size={48} />
            <p className="text-slate-400">Nenhum jogador banido</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredBans.map((ban, index) => (
              <div key={index} className="p-4 hover:bg-slate-700/30 transition-all duration-200 hover:translate-x-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                      <Ban className="text-red-400" size={24} />
                      {ban.hwid === 1 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold px-1 rounded">HWID</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {ban.name ? `${ban.name} ${ban.name2}` : ban.user_id}
                      </p>
                      <p className="text-slate-500 text-xs font-mono mt-0.5">
                        {ban.numeric_id ? `ID: ${ban.numeric_id} · ` : ''}{ban.user_id}
                      </p>
                      <div className="flex items-center gap-2 text-red-400 mt-2">
                        <AlertTriangle size={14} />
                        <span className="text-sm">{ban.motivo || 'Sem motivo especificado'}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
                        {ban.banimento && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Banido em: {ban.banimento}
                          </span>
                        )}
                        {ban.desbanimento ? (
                          <span className="text-yellow-400">
                            Expira: {ban.desbanimento}
                          </span>
                        ) : (
                          <span className="text-red-400 font-medium">Permanente</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBan(ban.user_id)}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                    title="Remover banimento"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Ban Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Novo Banimento</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddBan} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">ID do Jogador</label>
                <input
                  type="number"
                  value={newBan.user_id}
                  onChange={(e) => setNewBan(prev => ({ ...prev, user_id: e.target.value }))}
                  placeholder="Ex: 123"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Motivo</label>
                <textarea
                  value={newBan.motivo}
                  onChange={(e) => setNewBan(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Motivo do banimento..."
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500 resize-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Data de Desbanimento (deixe vazio para permanente)
                </label>
                <input
                  type="text"
                  value={newBan.desbanimento}
                  onChange={(e) => setNewBan(prev => ({ ...prev, desbanimento: e.target.value }))}
                  placeholder="Ex: 20/03/2026 ou deixe vazio"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Banir Jogador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bans;
