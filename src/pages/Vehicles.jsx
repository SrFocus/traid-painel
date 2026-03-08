import { useState, useEffect } from 'react';
import { getVehicles, deleteVehicle, addVehicleTrunkItem, removeVehicleTrunkItem, addPlayerVehicle } from '../services/api';
import { Car, ChevronLeft, ChevronRight, Search, Trash2, Fuel, Wrench, Package, X, Plus } from 'lucide-react';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [trunkModal, setTrunkModal] = useState({ open: false, vehicle: null });
  const [trunkForm, setTrunkForm] = useState({ item: '', amount: 1 });
  const [trunkMessage, setTrunkMessage] = useState({ type: '', text: '' });
  const [removeTarget, setRemoveTarget] = useState({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
  const [addVehicleModal, setAddVehicleModal] = useState(false);
  const [addVehicleForm, setAddVehicleForm] = useState({ userId: '', vehicle: '', plate: '', dias: '' });
  const [addVehicleMessage, setAddVehicleMessage] = useState({ type: '', text: '' });
  const [addVehicleLoading, setAddVehicleLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [pagination.page]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const response = await getVehicles(pagination.page, 20, search, userId);
      setVehicles(response.data.vehicles);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadVehicles();
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este veículo?')) return;
    try {
      await deleteVehicle(id);
      loadVehicles();
    } catch (err) {
      console.error('Erro ao remover veículo:', err);
    }
  };

  const openTrunkModal = (vehicle) => {
    setTrunkModal({ open: true, vehicle });
    setTrunkForm({ item: '', amount: 1 });
    setTrunkMessage({ type: '', text: '' });
    setRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
  };

  const refreshTrunk = async (vehicleId) => {
    try {
      const response = await getVehicles(pagination.page, 20, search, userId);
      const updatedList = response.data.vehicles;
      setVehicles(updatedList);
      setPagination(response.data.pagination);
      const updated = updatedList.find(v => v.id === vehicleId);
      if (updated) setTrunkModal(prev => ({ ...prev, vehicle: updated }));
    } catch (err) {
      console.error('Erro ao atualizar baú:', err);
    }
  };

  const handleAddTrunkItem = async () => {
    const { vehicle } = trunkModal;
    if (!vehicle || !trunkForm.item.trim() || trunkForm.amount <= 0) return;
    try {
      await addVehicleTrunkItem(vehicle.user_id, vehicle.id, trunkForm.item.trim(), parseInt(trunkForm.amount));
      setTrunkForm({ item: '', amount: 1 });
      setTrunkMessage({ type: 'success', text: 'Item adicionado no baú!' });
      setTimeout(() => setTrunkMessage({ type: '', text: '' }), 3000);
      await refreshTrunk(vehicle.id);
    } catch (err) {
      setTrunkMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar item' });
    }
  };

  const handleRemoveTrunkItem = async () => {
    const { vehicle } = trunkModal;
    const { slot, qty, maxAmount } = removeTarget;
    if (!vehicle || !slot) return;
    const amount = qty >= maxAmount ? null : qty;
    try {
      await removeVehicleTrunkItem(vehicle.user_id, vehicle.id, slot, amount);
      setRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
      setTrunkMessage({ type: 'success', text: 'Item removido do baú!' });
      setTimeout(() => setTrunkMessage({ type: '', text: '' }), 3000);
      await refreshTrunk(vehicle.id);
    } catch (err) {
      setTrunkMessage({ type: 'error', text: 'Erro ao remover item' });
    }
  };

  const handleAddVehicle = async () => {
    if (!addVehicleForm.userId || !addVehicleForm.vehicle.trim()) {
      setAddVehicleMessage({ type: 'error', text: 'ID do usuário e modelo são obrigatórios' });
      return;
    }
    setAddVehicleLoading(true);
    try {
      await addPlayerVehicle(addVehicleForm.userId, addVehicleForm.vehicle.trim(), addVehicleForm.plate.trim(), addVehicleForm.dias ? parseInt(addVehicleForm.dias) : null);
      setAddVehicleMessage({ type: 'success', text: 'Veículo adicionado com sucesso!' });
      setAddVehicleForm({ userId: '', vehicle: '', plate: '', dias: '' });
      setTimeout(() => {
        setAddVehicleModal(false);
        setAddVehicleMessage({ type: '', text: '' });
      }, 1500);
      loadVehicles();
    } catch (err) {
      setAddVehicleMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar veículo' });
    } finally {
      setAddVehicleLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-white">Veículos</h1>
          <p className="text-slate-400">{pagination.total} veículos registrados</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search by plate/model */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por placa ou modelo..."
                className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 w-56"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">ID</span>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ID usuário"
                className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 w-32"
              />
            </div>
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>
          {/* Add Vehicle */}
          <button
            onClick={() => { setAddVehicleModal(true); setAddVehicleForm({ userId: '', vehicle: '', plate: '', dias: '' }); setAddVehicleMessage({ type: '', text: '' }); }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            Adicionar Veículo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden animate-slideUp hover-lift" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Veículo</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Placa</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Proprietário</th>
                <th className="text-left text-slate-300 font-medium px-6 py-4">Estado</th>
                <th className="text-center text-slate-300 font-medium px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                      <span className="text-slate-400">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Nenhum veículo encontrado
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-700/30 transition-all duration-200 hover:translate-x-1">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Car className="text-purple-400" size={20} />
                        </div>
                        <span className="text-white font-medium">{vehicle.vehicle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 text-white px-3 py-1 rounded font-mono">
                        {vehicle.plate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white">{vehicle.name} {vehicle.name2}</p>
                        <p className="text-slate-400 text-sm">ID: {vehicle.user_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Fuel size={14} className="text-yellow-500" />
                          <span className="text-slate-300 text-sm">{vehicle.fuel || 0}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wrench size={14} className="text-blue-500" />
                          <span className="text-slate-300 text-sm">{vehicle.engine || 0}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openTrunkModal(vehicle)}
                          className="relative p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="Gerenciar baú"
                        >
                          <Package size={18} />
                          {vehicle.trunkItems?.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {vehicle.trunkItems.length}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remover veículo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Trunk Modal */}
      {trunkModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Package className="text-purple-400" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Baú do Veículo</h3>
                  <p className="text-slate-400 text-sm">{trunkModal.vehicle?.vehicle} — {trunkModal.vehicle?.plate}</p>
                </div>
              </div>
              <button
                onClick={() => setTrunkModal({ open: false, vehicle: null })}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {trunkMessage.text && (
                <div className={`px-3 py-2 rounded-lg text-sm ${
                  trunkMessage.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {trunkMessage.text}
                </div>
              )}

              {/* Add item form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trunkForm.item}
                  onChange={(e) => setTrunkForm(prev => ({ ...prev, item: e.target.value }))}
                  placeholder="Nome do item"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 text-sm"
                />
                <input
                  type="number"
                  min="1"
                  value={trunkForm.amount}
                  onChange={(e) => setTrunkForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                  className="w-20 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary-500 text-sm"
                />
                <button
                  onClick={handleAddTrunkItem}
                  disabled={!trunkForm.item.trim()}
                  className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Adicionar
                </button>
              </div>

              {/* Items grid */}
              <div className="max-h-64 overflow-y-auto">
                {(trunkModal.vehicle?.trunkItems || []).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {trunkModal.vehicle.trunkItems.map((item) => (
                      <div key={item.slot} className="relative bg-slate-700/40 rounded-lg p-2 flex flex-col items-center text-center group">
                        <div className="w-12 h-12 mb-1 flex items-center justify-center">
                          <img
                            src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${item.item.toLowerCase()}.png`}
                            alt={item.item}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M12 8v8M8 12h8%22/></svg>'; }}
                          />
                        </div>
                        <p className="text-white text-xs font-medium truncate w-full">{item.item}</p>
                        <p className="text-blue-400 text-xs font-bold">x{item.amount}</p>
                        <button
                          onClick={() => setRemoveTarget({ slot: item.slot, item: item.item, maxAmount: item.amount, qty: 1, qtyInput: '1' })}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex"
                          title="Remover"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                    <Package size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">Baú vazio</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Vehicle Modal */}
      {addVehicleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setAddVehicleModal(false)}
        >
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Car className="text-green-400" size={20} />
                </div>
                <h3 className="text-white font-semibold text-lg">Adicionar Veículo</h3>
              </div>
              <button onClick={() => setAddVehicleModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">ID do Usuário *</label>
                <input
                  type="number"
                  value={addVehicleForm.userId}
                  onChange={(e) => setAddVehicleForm(prev => ({ ...prev, userId: e.target.value }))}
                  placeholder="Ex: 1234"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Modelo do Veículo *</label>
                <input
                  type="text"
                  value={addVehicleForm.vehicle}
                  onChange={(e) => setAddVehicleForm(prev => ({ ...prev, vehicle: e.target.value }))}
                  placeholder="Ex: adder, zentorno..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Placa <span className="text-slate-500 normal-case font-normal">(opcional — gerada automaticamente)</span></label>
                <input
                  type="text"
                  value={addVehicleForm.plate}
                  onChange={(e) => setAddVehicleForm(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                  placeholder="Ex: ABC1234"
                  maxLength={8}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Dias <span className="text-slate-500 normal-case font-normal">(opcional — permanente se vazio)</span></label>
                <input
                  type="number"
                  value={addVehicleForm.dias}
                  onChange={(e) => setAddVehicleForm(prev => ({ ...prev, dias: e.target.value }))}
                  placeholder="Ex: 30"
                  min="1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
                {addVehicleForm.dias ? (
                  <p className="text-orange-400 text-xs mt-1">Temporário: expira em {addVehicleForm.dias} dia(s)</p>
                ) : (
                  <p className="text-slate-500 text-xs mt-1">Permanente (sem expiração)</p>
                )}
              </div>

              {addVehicleMessage.text && (
                <div className={`px-3 py-2 rounded-lg text-sm ${addVehicleMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  {addVehicleMessage.text}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setAddVehicleModal(false)}
                  className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddVehicle}
                  disabled={addVehicleLoading}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  {addVehicleLoading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Item Popup */}
      {removeTarget.slot && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-lg flex items-center justify-center">
                <img
                  src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${removeTarget.item?.toLowerCase()}.png`}
                  alt={removeTarget.item}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M12 8v8M8 12h8%22/></svg>'; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{removeTarget.item}</p>
                <p className="text-slate-400 text-xs">disponível: {removeTarget.maxAmount.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mb-2">Quantidade a remover</p>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setRemoveTarget(prev => { const q = Math.max(1, prev.qty - 1); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-red-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >−</button>
              <input
                type="text"
                value={removeTarget.qtyInput}
                onChange={(e) => setRemoveTarget(prev => ({ ...prev, qtyInput: e.target.value.replace(/[^\d]/g, '') }))}
                onBlur={(e) => {
                  const q = Math.min(Math.max(1, parseInt(e.target.value.replace(/[^\d]/g, '')) || 1), removeTarget.maxAmount);
                  setRemoveTarget(prev => ({ ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }));
                }}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 text-white text-sm font-bold text-center focus:outline-none focus:border-red-400"
              />
              <button
                onClick={() => setRemoveTarget(prev => { const q = Math.min(prev.qty + 1, prev.maxAmount); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-green-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >+</button>
              <button
                onClick={() => setRemoveTarget(prev => ({ ...prev, qty: prev.maxAmount, qtyInput: prev.maxAmount.toLocaleString('pt-BR') }))}
                className="px-2 h-9 bg-slate-700 hover:bg-orange-500/80 text-orange-300 hover:text-white rounded-lg text-xs font-bold transition-colors"
              >Max</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >Cancelar</button>
              <button
                onClick={handleRemoveTrunkItem}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
              >Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
