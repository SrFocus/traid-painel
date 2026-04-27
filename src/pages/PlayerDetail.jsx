import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPlayer,
  updatePlayer,
  modifyPlayerMoney,
  modifyPlayerCasino,
  addInventoryItem,
  removeInventoryItem,
  addPlayerVehicle,
  removePlayerVehicle,
  addVehicleTrunkItem,
  removeVehicleTrunkItem,
  addHouseStashItem,
  removeHouseStashItem,
  addPlayerHouse,
  removePlayerHouse,
  addPlayerGroup,
  removePlayerGroup,
  addPlayerWeaponSkin,
  removePlayerWeaponSkin
} from '../services/api';
import { 
  ArrowLeft, Save, User, Phone, Calendar, 
  DollarSign, Car, Plus, Minus, RefreshCw, Ban, Coins, Wallet, Package, Heart, Droplet, Utensils, X, Home, Trash2, Shield, Palette
} from 'lucide-react';

function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [moneyModal, setMoneyModal] = useState({ open: false, action: 'add' });
  const [moneyAmount, setMoneyAmount] = useState('');
  const [casinoModal, setCasinoModal] = useState({ open: false, action: 'add' });
  const [casinoAmount, setCasinoAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [inventoryModal, setInventoryModal] = useState({ open: false, action: 'add', item: null });
  const [itemForm, setItemForm] = useState({ name: '', amount: 1 });
  const [vehicleModal, setVehicleModal] = useState({ open: false, action: 'add', vehicle: null });
  const [vehicleForm, setVehicleForm] = useState({ model: '', plate: '', item: '', amount: 1 });
  const [vehicleDias, setVehicleDias] = useState('');
  const [houseModal, setHouseModal] = useState({ open: false, action: 'add', house: null, item: null });
  const [houseForm, setHouseForm] = useState({ item: '', amount: 1 });
  const [houseAddModal, setHouseAddModal] = useState({ open: false });
  const [houseAddForm, setHouseAddForm] = useState({ name: '' });
  const [vehicleTrunkRemoveTarget, setVehicleTrunkRemoveTarget] = useState({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
  const [houseStashRemoveTarget, setHouseStashRemoveTarget] = useState({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
  const [groupInput, setGroupInput] = useState('');
  const [groupDias, setGroupDias] = useState('');
  const [groupMessage, setGroupMessage] = useState({ type: '', text: '' });
  const [weaponSkinInput, setWeaponSkinInput] = useState('');

  useEffect(() => {
    loadPlayer();
  }, [id]);

  const loadPlayer = async ({ refreshVehicleId = null, refreshHouseId = null } = {}) => {
    try {
      const response = await getPlayer(id);
      setData(response.data);
      setFormData(response.data.player);
      if (refreshVehicleId) {
        const updated = response.data.vehicles?.find(v => v.id === refreshVehicleId);
        if (updated) setVehicleModal(prev => ({ ...prev, vehicle: updated }));
      }
      if (refreshHouseId) {
        const updated = response.data.houses?.find(h => h.id === refreshHouseId);
        if (updated) setHouseModal(prev => ({ ...prev, house: updated }));
      }
    } catch (err) {
      console.error('Erro ao carregar jogador:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlayer(id, formData);
      setMessage({ type: 'success', text: 'Jogador atualizado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar jogador' });
    } finally {
      setSaving(false);
    }
  };

  const handleMoneyAction = async () => {
    if (!moneyAmount || isNaN(moneyAmount)) return;
    
    try {
      await modifyPlayerMoney(id, moneyModal.action, parseInt(moneyAmount));
      setMoneyModal({ open: false, action: 'add' });
      setMoneyAmount('');
      loadPlayer();
      setMessage({ type: 'success', text: 'Saldo atualizado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao modificar saldo' });
    }
  };

  const handleCasinoAction = async () => {
    if (!casinoAmount || isNaN(casinoAmount)) return;
    try {
      await modifyPlayerCasino(id, casinoModal.action, parseInt(casinoAmount));
      setCasinoModal({ open: false, action: 'add' });
      setCasinoAmount('');
      loadPlayer();
      setMessage({ type: 'success', text: 'Saldo casino atualizado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao modificar casino' });
    }
  };

  const handleAddItem = async () => {
    if (!itemForm.name.trim() || itemForm.amount <= 0) return;
    
    try {
      await addInventoryItem(id, itemForm.name.trim(), parseInt(itemForm.amount));
      setInventoryModal({ open: false, action: 'add', item: null });
      setItemForm({ name: '', amount: 1 });
      loadPlayer();
      setMessage({ type: 'success', text: 'Item adicionado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao adicionar item' });
    }
  };

  const handleRemoveItem = async (slot, removeAmount = null) => {
    try {
      await removeInventoryItem(id, slot, removeAmount);
      setInventoryModal({ open: false, action: 'add', item: null });
      loadPlayer();
      setMessage({ type: 'success', text: 'Item removido com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover item' });
    }
  };

  const openInventoryModal = (item = null) => {
    if (item) {
      setInventoryModal({ open: true, action: 'remove', item });
      setItemForm({ name: item.item, amount: 1 });
    } else {
      setInventoryModal({ open: true, action: 'add', item: null });
      setItemForm({ name: '', amount: 1 });
    }
  };

  const openVehicleModal = (vehicle = null) => {
    if (vehicle) {
      setVehicleModal({ open: true, action: 'trunk-remove', vehicle });
      setVehicleForm({ model: '', plate: '', item: '', amount: 1 });
      setVehicleTrunkRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
      return;
    }
    setVehicleModal({ open: true, action: 'add', vehicle: null });
    setVehicleForm({ model: '', plate: '', item: '', amount: 1 });
    setVehicleDias('');
  };

  const handleAddVehicle = async () => {
    if (!vehicleForm.model.trim()) return;

    try {
      await addPlayerVehicle(id, vehicleForm.model.trim(), vehicleForm.plate.trim(), vehicleDias ? parseInt(vehicleDias) : null);
      setVehicleModal({ open: false, action: 'add', vehicle: null });
      setVehicleForm({ model: '', plate: '', item: '', amount: 1 });
      setVehicleDias('');
      loadPlayer();
      setMessage({ type: 'success', text: 'Veículo adicionado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao adicionar veículo' });
    }
  };

  const handleRemoveVehicle = async (vehicleId) => {
    try {
      await removePlayerVehicle(id, vehicleId);
      loadPlayer();
      setMessage({ type: 'success', text: 'Veículo removido com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover veículo' });
    }
  };

  const handleAddVehicleTrunkItem = async () => {
    if (!vehicleModal.vehicle || !vehicleForm.item.trim() || vehicleForm.amount <= 0) return;
    const vid = vehicleModal.vehicle.id;
    try {
      await addVehicleTrunkItem(id, vid, vehicleForm.item.trim(), parseInt(vehicleForm.amount));
      setVehicleForm(prev => ({ ...prev, item: '', amount: 1 }));
      await loadPlayer({ refreshVehicleId: vid });
      setMessage({ type: 'success', text: 'Item adicionado no baú do veículo!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar item no baú do veículo' });
    }
  };

  const handleRemoveVehicleTrunkItem = async () => {
    if (!vehicleModal.vehicle) return;
    const { slot, qty, maxAmount } = vehicleTrunkRemoveTarget;
    if (!slot) return;
    const vid = vehicleModal.vehicle.id;
    const amount = qty >= maxAmount ? null : qty;
    try {
      await removeVehicleTrunkItem(id, vid, slot, amount);
      setVehicleTrunkRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
      await loadPlayer({ refreshVehicleId: vid });
      setMessage({ type: 'success', text: 'Item removido do baú do veículo!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover item do baú do veículo' });
    }
  };

  const openHouseModal = (house = null) => {
    setHouseModal({ open: true, action: 'add', house, item: null });
    setHouseForm({ item: '', amount: 1 });
    setHouseStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
  };

  const handleAddHouse = async () => {
    if (!houseAddForm.name.trim()) return;
    try {
      await addPlayerHouse(id, houseAddForm.name.trim());
      loadPlayer();
      setHouseAddModal({ open: false });
      setHouseAddForm({ name: '' });
      setMessage({ type: 'success', text: 'Casa adicionada com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar casa' });
    }
  };

  const handleRemoveHouse = async (homeId) => {
    if (!window.confirm('Tem certeza que deseja remover esta casa do jogador?')) return;
    try {
      await removePlayerHouse(id, homeId);
      loadPlayer();
      setMessage({ type: 'success', text: 'Casa removida com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover casa' });
    }
  };

  const handleAddHouseItem = async () => {
    if (!houseModal.house || !houseForm.item.trim() || houseForm.amount <= 0) return;
    const hid = houseModal.house.id;
    try {
      await addHouseStashItem(id, hid, houseForm.item.trim(), parseInt(houseForm.amount));
      setHouseForm({ item: '', amount: 1 });
      await loadPlayer({ refreshHouseId: hid });
      setMessage({ type: 'success', text: 'Item adicionado no baú da casa!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar item no baú da casa' });
    }
  };

  const handleRemoveHouseItem = async () => {
    if (!houseModal.house) return;
    const { slot, qty, maxAmount } = houseStashRemoveTarget;
    if (!slot) return;
    const hid = houseModal.house.id;
    const amount = qty >= maxAmount ? null : qty;
    try {
      await removeHouseStashItem(id, hid, slot, amount);
      setHouseStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' });
      await loadPlayer({ refreshHouseId: hid });
      setMessage({ type: 'success', text: 'Item removido do baú da casa!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao remover item do baú da casa' });
    }
  };

  const handleAddGroup = async () => {
    const g = groupInput.trim().toLowerCase();
    if (!g) return;
    try {
      await addPlayerGroup(id, g, groupDias ? parseInt(groupDias) : null);
      setGroupInput('');
      setGroupDias('');
      const label = groupDias ? `Permissão "${g}" adicionada por ${groupDias} dia(s)!` : `Permissão "${g}" adicionada!`;
      setGroupMessage({ type: 'success', text: label });
      setTimeout(() => setGroupMessage({ type: '', text: '' }), 3000);
      await loadPlayer();
    } catch (err) {
      setGroupMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar' });
    }
  };

  const handleRemoveGroup = async (group) => {
    try {
      await removePlayerGroup(id, group);
      setGroupMessage({ type: 'success', text: `Permissão "${group}" removida!` });
      setTimeout(() => setGroupMessage({ type: '', text: '' }), 3000);
      await loadPlayer();
    } catch (err) {
      setGroupMessage({ type: 'error', text: 'Erro ao remover' });
    }
  };

  const handleAddWeaponSkin = async () => {
    const component = weaponSkinInput.trim().toUpperCase();
    if (!component) return;

    try {
      await addPlayerWeaponSkin(id, component);
      setWeaponSkinInput('');
      await loadPlayer();
      setMessage({ type: 'success', text: `Skin ${component} adicionada com sucesso!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao adicionar skin' });
    }
  };

  const handleRemoveWeaponSkin = async (component) => {
    try {
      await removePlayerWeaponSkin(id, component);
      await loadPlayer();
      setMessage({ type: 'success', text: `Skin ${component} removida com sucesso!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao remover skin' });
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.player) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Jogador não encontrado</p>
        <button
          onClick={() => navigate('/players')}
          className="mt-4 text-primary-400 hover:text-primary-300"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  const player = data.player;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between animate-slideUp">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/players')}
            className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors hover:scale-105"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {player.name} {player.name2}
              </h1>
              {data.isBanned && (
                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Ban size={14} />
                  Banido
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">ID: #{player.id} | Steam: {player.steam}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>Salvar</span>
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-6">
              <User className="text-primary-500" size={24} />
              <h2 className="text-lg font-semibold text-white">Informações do Personagem</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Sobrenome</label>
                <input
                  type="text"
                  value={formData.name2 || ''}
                  onChange={(e) => handleInputChange('name2', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Telefone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Idade</label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Registro (Placa)</label>
                <input
                  type="text"
                  value={formData.registration || ''}
                  readOnly
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-4 text-slate-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Prisão (minutos)</label>
                <input
                  type="number"
                  value={formData.prison || 0}
                  onChange={(e) => handleInputChange('prison', parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.15s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-6">
              <Coins className="text-yellow-500" size={24} />
              <h2 className="text-lg font-semibold text-white">Outras Informações</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Garagem (slots)</label>
                <input
                  type="number"
                  value={formData.garage || 0}
                  onChange={(e) => handleInputChange('garage', parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              {/* <div>
                <label className="block text-slate-400 text-sm mb-2">Coins</label>
                <input
                  type="number"
                  value={formData.coins || 0}
                  onChange={(e) => handleInputChange('coins', parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div> */}
              {/* <div>
                <label className="block text-slate-400 text-sm mb-2">PayPal</label>
                <input
                  type="number"
                  value={formData.paypal || 0}
                  onChange={(e) => handleInputChange('paypal', parseInt(e.target.value))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div> */}
            </div>
          </div>

          {/* Vehicles */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Car className="text-purple-500" size={24} />
                <h2 className="text-lg font-semibold text-white">Veículos ({data.vehicles?.length || 0})</h2>
              </div>
              <button
                onClick={() => openVehicleModal()}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                Adicionar Veículo
              </button>
            </div>

            {data.vehicles?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.vehicles.map((vehicle, index) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200">
                    <div className="flex gap-4">
                      {/* Vehicle Image */}
                      <div className="w-24 h-16 flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                        <img 
                          src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/vehicles/${vehicle.vehicle}.png`}
                          alt={vehicle.vehicle}
                          className="w-full h-full object-contain select-none pointer-events-none"
                          draggable="false"
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>';
                          }}
                        />
                      </div>
                      {/* Vehicle Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{vehicle.vehicle}</p>
                            <p className="text-slate-400 text-sm">Placa: {vehicle.plate}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => openVehicleModal(vehicle)}
                              className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                            >
                              Baú ({vehicle.trunkItems?.length || 0})
                            </button>
                            <button
                              onClick={() => handleRemoveVehicle(vehicle.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remover veículo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                          <span>Motor: {vehicle.engine || 0}</span>
                          <span>Fuel: {vehicle.fuel || 0}</span>
                          {vehicle.data_expiracao && (() => {
                            const expDate = new Date(vehicle.data_expiracao.replace(' ', 'T') + '-03:00');
                            const isExpired = expDate < new Date();
                            return (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-300'}`}>
                                {isExpired ? '(expirado)' : `exp: ${expDate.toLocaleDateString()}`}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhum veículo registrado</p>
            )}
          </div>

          {/* Casas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Home className="text-cyan-500" size={24} />
                <h2 className="text-lg font-semibold text-white">Casas ({data.houses?.length || 0})</h2>
              </div>
              <button
                onClick={() => { setHouseAddModal({ open: true }); setHouseAddForm({ name: '' }); }}
                className="flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Plus size={16} />
                Adicionar Casa
              </button>
            </div>

            {data.houses?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.houses.map((house, index) => (
                  <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{house.home}</p>
                        <p className="text-slate-400 text-sm">Tamanho: {house.vault || 0}kg</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openHouseModal(house)}
                          className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-lg transition-colors"
                        >
                          Baú ({house.stashItems?.length || 0})
                        </button>
                        <button
                          onClick={() => handleRemoveHouse(house.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remover casa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhuma casa registrada</p>
            )}
          </div>

          {/* Skins de Arma */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.23s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-3">
                <Palette className="text-fuchsia-400" size={24} />
                <h2 className="text-lg font-semibold text-white">Skins de Arma ({data.weaponSkins?.length || 0})</h2>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                list="weapon-skins-list"
                value={weaponSkinInput}
                onChange={(e) => setWeaponSkinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWeaponSkin()}
                placeholder="Ex: COMPONENT_AK47_SKIN"
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
              />
              <button
                onClick={handleAddWeaponSkin}
                className="px-3 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 rounded-lg transition-colors"
              >
                Adicionar Skin
              </button>
              <datalist id="weapon-skins-list">
                {(data.weaponSkinStock || []).map((skin) => (
                  <option key={skin.component} value={skin.component}>{skin.name} - {skin.component}</option>
                ))}
              </datalist>
            </div>

            {(data.weaponSkins || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(data.weaponSkins || []).map((skin) => (
                  <div key={skin.component} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-700/50">
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-white">{skin.name || skin.component}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{skin.component}</span>
                    </div>
                    {skin.equipped && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">Equipada</span>
                    )}
                    <button
                      onClick={() => handleRemoveWeaponSkin(skin.component)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Remover skin"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Nenhuma skin de arma registrada</p>
            )}
          </div>

          {/* Inventário */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.25s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package className="text-yellow-500" size={24} />
                <h2 className="text-lg font-semibold text-white">Inventário ({data.inventory?.length || 0} itens)</h2>
              </div>
              <button
                onClick={() => openInventoryModal()}
                className="flex items-center gap-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Package size={16} />
                Modificar Inventário
              </button>
            </div>

            {data.inventory?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {data.inventory.map((item, index) => (
                  <div 
                    key={index} 
                    onClick={() => openInventoryModal(item)}
                    className="bg-slate-700/50 rounded-lg p-3 flex flex-col items-center text-center hover:bg-slate-700 transition-colors cursor-pointer hover:ring-2 hover:ring-primary-500/50"
                    title={`Clique para modificar ${item.item}`}
                  >
                    <div className="w-16 h-16 mb-2 flex items-center justify-center">
                      <img
                        src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${item.item.toLowerCase()}.png`}
                        alt={item.item}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>';
                        }}
                      />
                    </div>
                    <p className="text-white text-xs font-medium truncate w-full">{item.item}</p>
                    <p className="text-primary-400 text-sm font-bold">x{item.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Inventário vazio</p>
            )}
          </div>
        </div>

        {/* Money Sidebar */}
        <div className="space-y-6">
          {/* Player Status */}
          {data.playerStatus && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
              <h3 className="text-lg font-semibold text-white mb-4">Status do Personagem</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 text-sm flex items-center gap-2">
                      <Heart size={14} className="text-red-500" /> Vida
                    </span>
                    <span className="text-white text-sm">{data.playerStatus.health || 0}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(data.playerStatus.health || 0, 200) / 2}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 text-sm flex items-center gap-2">
                      <Utensils size={14} className="text-yellow-500" /> Fome
                    </span>
                    <span className="text-white text-sm">{data.playerStatus.hunger || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${data.playerStatus.hunger || 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 text-sm flex items-center gap-2">
                      <Droplet size={14} className="text-blue-500" /> Sede
                    </span>
                    <span className="text-white text-sm">{data.playerStatus.thirst || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.playerStatus.thirst || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift\" style={{ animationDelay: '0.15s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="text-green-500" size={24} />
              <h2 className="text-lg font-semibold text-white">Saldo Bancário</h2>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30">
              <p className="text-slate-400 text-sm mb-2">Banco</p>
              <p className="text-4xl font-bold text-green-400">
                {formatMoney(player.bank)}
              </p>
              <button
                onClick={() => setMoneyModal({ open: true, action: 'add' })}
                className="mt-4 w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg transition-colors"
              >
                Modificar Saldo
              </button>
            </div>
          </div>

          {/* Casino */}
          {data.casino && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400 text-xl">🎰</span>
                  <h2 className="text-lg font-semibold text-white">Casino</h2>
                </div>
                <button
                  onClick={() => setCasinoModal({ open: true, action: 'add' })}
                  className="flex items-center gap-2 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Editar Saldo
                </button>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl border border-yellow-500/30">
                <p className="text-slate-400 text-sm mb-1">Saldo Casino</p>
                <p className="text-3xl font-bold text-yellow-400">{formatMoney(data.casino.balance)}</p>
              </div>
            </div>
          )}

          {/* Ban Status */}
          {data.isBanned && data.banInfo && (
            <div className="bg-slate-800 rounded-xl p-6 border border-red-500/50">
              <div className="flex items-center gap-3 mb-4">
                <Ban className="text-red-500" size={24} />
                <h2 className="text-lg font-semibold text-red-400">Banimento Ativo</h2>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">
                  Motivo: <span className="text-white">{data.banInfo.motivo}</span>
                </p>
                <p className="text-slate-400">
                  Data: <span className="text-white">{data.banInfo.banimento}</span>
                </p>
                {data.banInfo.desbanimento && (
                  <p className="text-slate-400">
                    Expira: <span className="text-white">{data.banInfo.desbanimento}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-slideUp hover-lift\" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-indigo-400" size={20} />
              <h3 className="text-lg font-semibold text-white">Permissões</h3>
            </div>

            {/* Current groups */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
              {(data.permissions || []).length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhuma permissão</p>
              ) : (
                (data.permissions || []).map(group => {
                  const temp = (data.tempGroups || []).find(t => t.grupo === group);
                  const expDate = temp ? new Date(temp.data_expiracao.replace(' ', 'T') + '-03:00') : null;
                  const isExpired = expDate && expDate < new Date();
                  return (
                    <span key={group} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                      isExpired
                        ? 'bg-red-500/15 border-red-500/30 text-red-400'
                        : temp
                        ? 'bg-orange-500/15 border-orange-500/30 text-orange-300'
                        : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    }`}>
                      <span>
                        {group}
                        {temp && (
                          <span className="ml-1 text-[10px] opacity-70">
                            {isExpired ? '(expirado)' : `(exp: ${expDate.toLocaleDateString()})`}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleRemoveGroup(group)}
                        className="hover:text-red-400 transition-colors leading-none"
                        title="Remover"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })
              )}
            </div>

            {/* Add group */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                  placeholder="Nova permissão..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  value={groupDias}
                  onChange={(e) => setGroupDias(e.target.value)}
                  placeholder="Dias"
                  min="1"
                  className="w-20 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  title="Deixe vazio para permissão permanente"
                />
                <button
                  onClick={handleAddGroup}
                  className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                  title="Adicionar"
                >
                  <Plus size={16} />
                </button>
              </div>
              {groupDias && (
                <p className="text-orange-400 text-xs">Temporária: expira em {groupDias} dia(s)</p>
              )}
              {!groupDias && groupInput && (
                <p className="text-slate-500 text-xs">Permanente (sem expiração)</p>
              )}
            </div>
            {groupMessage.text && (
              <p className={`text-xs mt-2 ${groupMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {groupMessage.text}
              </p>
            )}
          </div>

          {/* Steam ID */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-400 mb-2">Steam ID</h3>
            <p className="text-white font-mono text-sm break-all">{player.steam}</p>
          </div>
        </div>
      </div>

      {/* Money Modal */}
      {moneyModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Modificar Saldo Bancário
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Ação</label>
                <div className="flex gap-2">
                  {['add', 'remove', 'set'].map((action) => (
                    <button
                      key={action}
                      onClick={() => setMoneyModal(prev => ({ ...prev, action }))}
                      className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        moneyModal.action === action
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {action === 'add' && <Plus size={16} />}
                      {action === 'remove' && <Minus size={16} />}
                      {action === 'add' ? 'Adicionar' : action === 'remove' ? 'Remover' : 'Definir'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Valor</label>
                <input
                  type="number"
                  value={moneyAmount}
                  onChange={(e) => setMoneyAmount(e.target.value)}
                  placeholder="Digite o valor"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setMoneyModal({ open: false, action: 'add' });
                  setMoneyAmount('');
                }}
                className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMoneyAction}
                className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Casino Modal */}
      {casinoModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Modificar Saldo Casino
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Ação</label>
                <div className="flex gap-2">
                  {['add', 'remove', 'set'].map((action) => (
                    <button
                      key={action}
                      onClick={() => setCasinoModal(prev => ({ ...prev, action }))}
                      className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        casinoModal.action === action
                          ? action === 'add' ? 'bg-green-500 text-white' : action === 'remove' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {action === 'add' && <Plus size={16} />}
                      {action === 'remove' && <Minus size={16} />}
                      {action === 'add' ? 'Adicionar' : action === 'remove' ? 'Remover' : 'Definir'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Valor</label>
                <input
                  type="number"
                  value={casinoAmount}
                  onChange={(e) => setCasinoAmount(e.target.value)}
                  placeholder="Digite o valor"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setCasinoModal({ open: false, action: 'add' }); setCasinoAmount(''); }}
                className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCasinoAction}
                className={`flex-1 py-2 text-white rounded-lg transition-colors ${
                  casinoModal.action === 'add' ? 'bg-green-500 hover:bg-green-600' :
                  casinoModal.action === 'remove' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {inventoryModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Modificar Inventário
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Ação</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInventoryModal(prev => ({ ...prev, action: 'add', item: null }));
                      setItemForm({ name: '', amount: 1 });
                    }}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      inventoryModal.action === 'add'
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Plus size={16} />
                    Adicionar
                  </button>
                  <button
                    onClick={() => setInventoryModal(prev => ({ ...prev, action: 'remove' }))}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      inventoryModal.action === 'remove'
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Minus size={16} />
                    Remover
                  </button>
                </div>
              </div>

              {inventoryModal.action === 'add' ? (
                <>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Nome do Item</label>
                    <input
                      type="text"
                      value={itemForm.name}
                      onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: water, bread, weapon_pistol"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={itemForm.amount}
                      onChange={(e) => setItemForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  {inventoryModal.item ? (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                        <img
                          src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${inventoryModal.item?.item?.toLowerCase()}.png`}
                          alt={inventoryModal.item?.item}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>';
                          }}
                        />
                        <div>
                          <p className="text-white font-medium">{inventoryModal.item?.item}</p>
                          <p className="text-slate-400 text-sm">Quantidade atual: {inventoryModal.item?.amount}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 text-sm mb-2">Quantidade a remover</label>
                        <input
                          type="number"
                          min="1"
                          max={inventoryModal.item?.amount}
                          value={itemForm.amount}
                          onChange={(e) => setItemForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveItem(inventoryModal.item.slot)}
                        className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Remover Tudo
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-400 mb-4">Selecione um item do inventário para remover</p>
                      {data.inventory?.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {data.inventory.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setInventoryModal(prev => ({ ...prev, item }));
                                setItemForm({ name: item.item, amount: 1 });
                              }}
                              className="bg-slate-700/50 rounded-lg p-2 flex flex-col items-center hover:bg-slate-700 transition-colors"
                            >
                              <img
                                src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${item.item.toLowerCase()}.png`}
                                alt={item.item}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
                                }}
                              />
                              <span className="text-xs text-slate-300 truncate w-full">{item.item}</span>
                              <span className="text-xs text-primary-400">x{item.amount}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500">Inventário vazio</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setInventoryModal({ open: false, action: 'add', item: null });
                  setItemForm({ name: '', amount: 1 });
                }}
                className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (inventoryModal.action === 'add') {
                    handleAddItem();
                  } else if (inventoryModal.item) {
                    handleRemoveItem(inventoryModal.item.slot, itemForm.amount);
                  }
                }}
                disabled={inventoryModal.action === 'remove' && !inventoryModal.item}
                className={`flex-1 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  inventoryModal.action === 'add'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {inventoryModal.action === 'add' ? 'Adicionar' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {vehicleModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">

            {vehicleModal.action === 'add' ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Car className="text-green-400" size={20} />
                    </div>
                    <h3 className="text-white font-semibold text-lg">Adicionar Veículo</h3>
                  </div>
                  <button
                    onClick={() => { setVehicleModal({ open: false, action: 'add', vehicle: null }); setVehicleForm({ model: '', plate: '', item: '', amount: 1 }); setVehicleDias(''); }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Modelo do Veículo *</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Ex: sultanrs"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Placa <span className="text-slate-500 normal-case font-normal">(opcional — gerada automaticamente)</span></label>
                    <input
                      type="text"
                      value={vehicleForm.plate}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                      placeholder="Ex: ABC1234"
                      maxLength={8}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Dias <span className="text-slate-500 normal-case font-normal">(opcional — permanente se vazio)</span></label>
                    <input
                      type="number"
                      value={vehicleDias}
                      onChange={(e) => setVehicleDias(e.target.value)}
                      placeholder="Ex: 30"
                      min="1"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                    {vehicleDias ? (
                      <p className="text-orange-400 text-xs mt-1">Temporário: expira em {vehicleDias} dia(s)</p>
                    ) : (
                      <p className="text-slate-500 text-xs mt-1">Permanente (sem expiração)</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => { setVehicleModal({ open: false, action: 'add', vehicle: null }); setVehicleForm({ model: '', plate: '', item: '', amount: 1 }); setVehicleDias(''); }}
                      className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddVehicle}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Package className="text-purple-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Baú do Veículo</h3>
                      <p className="text-slate-400 text-sm">{vehicleModal.vehicle?.vehicle} — {vehicleModal.vehicle?.plate}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setVehicleModal({ open: false, action: 'add', vehicle: null }); setVehicleForm({ model: '', plate: '', item: '', amount: 1 }); }}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vehicleForm.item}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, item: e.target.value }))}
                      placeholder="Nome do item"
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary-500 text-sm"
                    />
                    <input
                      type="number"
                      min="1"
                      value={vehicleForm.amount}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                      className="w-20 bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary-500 text-sm"
                    />
                    <button
                      onClick={handleAddVehicleTrunkItem}
                      disabled={!vehicleForm.item.trim()}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Adicionar
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {(vehicleModal.vehicle?.trunkItems || []).length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {vehicleModal.vehicle.trunkItems.map((item) => (
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
                            onClick={() => setVehicleTrunkRemoveTarget({ slot: item.slot, item: item.item, maxAmount: item.amount, qty: 1, qtyInput: '1' })}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex"
                            title="Remover"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">Baú vazio</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setVehicleModal({ open: false, action: 'add', vehicle: null }); setVehicleForm({ model: '', plate: '', item: '', amount: 1 }); }}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </>
            )}

          </div>
        </div>
      )}

      {/* House Add Modal */}
      {houseAddModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Adicionar Casa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Nome da Casa</label>
                <input
                  type="text"
                  value={houseAddForm.name}
                  onChange={(e) => setHouseAddForm(prev => ({ ...prev, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddHouse()}
                  placeholder="Ex: high_luxury_1"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setHouseAddModal({ open: false })}
                className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddHouse}
                className="flex-1 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* House Modal */}
      {houseModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Baú da Casa: {houseModal.house?.home}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={houseForm.item}
                  onChange={(e) => setHouseForm(prev => ({ ...prev, item: e.target.value }))}
                  placeholder="Item"
                  className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary-500"
                />
                <input
                  type="number"
                  min="1"
                  value={houseForm.amount}
                  onChange={(e) => setHouseForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                  className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <button
                onClick={handleAddHouseItem}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Adicionar no Baú da Casa
              </button>

              <div className="max-h-64 overflow-y-auto">
                {(houseModal.house?.stashItems || []).length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {houseModal.house.stashItems.map((item) => (
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
                        <p className="text-cyan-400 text-xs font-bold">x{item.amount}</p>
                        <button
                          onClick={() => setHouseStashRemoveTarget({ slot: item.slot, item: item.item, maxAmount: item.amount, qty: 1, qtyInput: '1' })}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white rounded-full text-xs items-center justify-center hidden group-hover:flex"
                          title="Remover"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Baú da casa vazio</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setHouseModal({ open: false, action: 'add', house: null, item: null });
                  setHouseForm({ item: '', amount: 1 });
                }}
                className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Remove Trunk Item Popup */}
      {vehicleTrunkRemoveTarget.slot && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setVehicleTrunkRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-lg flex items-center justify-center">
                <img
                  src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${vehicleTrunkRemoveTarget.item?.toLowerCase()}.png`}
                  alt={vehicleTrunkRemoveTarget.item}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M12 8v8M8 12h8%22/></svg>'; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{vehicleTrunkRemoveTarget.item}</p>
                <p className="text-slate-400 text-xs">disponível: {vehicleTrunkRemoveTarget.maxAmount.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mb-2">Quantidade a remover</p>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setVehicleTrunkRemoveTarget(prev => { const q = Math.max(1, prev.qty - 1); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-red-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >−</button>
              <input
                type="text"
                value={vehicleTrunkRemoveTarget.qtyInput}
                onChange={(e) => setVehicleTrunkRemoveTarget(prev => ({ ...prev, qtyInput: e.target.value.replace(/[^\d]/g, '') }))}
                onBlur={(e) => {
                  const q = Math.min(Math.max(1, parseInt(e.target.value.replace(/[^\d]/g, '')) || 1), vehicleTrunkRemoveTarget.maxAmount);
                  setVehicleTrunkRemoveTarget(prev => ({ ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }));
                }}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 text-white text-sm font-bold text-center focus:outline-none focus:border-red-400"
              />
              <button
                onClick={() => setVehicleTrunkRemoveTarget(prev => { const q = Math.min(prev.qty + 1, prev.maxAmount); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-green-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >+</button>
              <button
                onClick={() => setVehicleTrunkRemoveTarget(prev => ({ ...prev, qty: prev.maxAmount, qtyInput: prev.maxAmount.toLocaleString('pt-BR') }))}
                className="px-2 h-9 bg-slate-700 hover:bg-orange-500/80 text-orange-300 hover:text-white rounded-lg text-xs font-bold transition-colors"
              >Max</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setVehicleTrunkRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >Cancelar</button>
              <button
                onClick={handleRemoveVehicleTrunkItem}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
              >Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove House Stash Item Popup */}
      {houseStashRemoveTarget.slot && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setHouseStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
        >
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 w-96 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 flex-shrink-0 bg-slate-700 rounded-lg flex items-center justify-center">
                <img
                  src={`https://media.githubusercontent.com/media/SrFocus/cdn-traid/main/inventory/${houseStashRemoveTarget.item?.toLowerCase()}.png`}
                  alt={houseStashRemoveTarget.item}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M12 8v8M8 12h8%22/></svg>'; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{houseStashRemoveTarget.item}</p>
                <p className="text-slate-400 text-xs">disponível: {houseStashRemoveTarget.maxAmount.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs mb-2">Quantidade a remover</p>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setHouseStashRemoveTarget(prev => { const q = Math.max(1, prev.qty - 1); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-red-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >−</button>
              <input
                type="text"
                value={houseStashRemoveTarget.qtyInput}
                onChange={(e) => setHouseStashRemoveTarget(prev => ({ ...prev, qtyInput: e.target.value.replace(/[^\d]/g, '') }))}
                onBlur={(e) => {
                  const q = Math.min(Math.max(1, parseInt(e.target.value.replace(/[^\d]/g, '')) || 1), houseStashRemoveTarget.maxAmount);
                  setHouseStashRemoveTarget(prev => ({ ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }));
                }}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg py-2 text-white text-sm font-bold text-center focus:outline-none focus:border-red-400"
              />
              <button
                onClick={() => setHouseStashRemoveTarget(prev => { const q = Math.min(prev.qty + 1, prev.maxAmount); return { ...prev, qty: q, qtyInput: q.toLocaleString('pt-BR') }; })}
                className="w-9 h-9 bg-slate-700 hover:bg-green-500/80 text-white rounded-lg font-bold transition-colors flex items-center justify-center text-lg"
              >+</button>
              <button
                onClick={() => setHouseStashRemoveTarget(prev => ({ ...prev, qty: prev.maxAmount, qtyInput: prev.maxAmount.toLocaleString('pt-BR') }))}
                className="px-2 h-9 bg-slate-700 hover:bg-orange-500/80 text-orange-300 hover:text-white rounded-lg text-xs font-bold transition-colors"
              >Max</button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setHouseStashRemoveTarget({ slot: null, item: null, maxAmount: 0, qty: 1, qtyInput: '1' })}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >Cancelar</button>
              <button
                onClick={handleRemoveHouseItem}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
              >Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
