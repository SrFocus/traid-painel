import { useState, useEffect } from 'react';
import { getPanelUsers, createPanelUser, updatePanelUser, deletePanelUser } from '../services/api';
import { Users, Plus, Edit2, Trash2, Shield, Crown, X, Eye, EyeOff, Check } from 'lucide-react';

function PanelUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'admin' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getPanelUsers();
      setUsers(response.data.users);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setMessage({ type: 'error', text: 'Erro ao carregar usuários. Verifique suas permissões.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const updateData = {};
        if (formData.password) updateData.password = formData.password;
        if (formData.role) updateData.role = formData.role;
        
        await updatePanelUser(editingUser.id, updateData);
        setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
      } else {
        await createPanelUser(formData.username, formData.password, formData.role);
        setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'admin' });
      loadUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao salvar usuário' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (!confirm(`Tem certeza que deseja remover o usuário "${user.username}"?`)) return;
    
    try {
      await deletePanelUser(user.id);
      setMessage({ type: 'success', text: 'Usuário removido com sucesso!' });
      loadUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao remover usuário' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleToggleActive = async (user) => {
    try {
      await updatePanelUser(user.id, { active: !user.active });
      setMessage({ type: 'success', text: `Usuário ${user.active ? 'desativado' : 'ativado'} com sucesso!` });
      loadUsers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar usuário' });
    }
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários do Painel</h1>
          <p className="text-slate-400">Gerencie os administradores do painel</p>
        </div>
        
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', password: '', role: 'admin' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Novo Usuário
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

      {/* Users List */}
      <div className="grid gap-4 animate-slideUp" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <Users className="mx-auto text-slate-500 mb-4" size={48} />
            <p className="text-slate-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`bg-slate-800 rounded-xl p-6 border transition-all duration-200 hover:translate-x-1 hover:shadow-lg ${
                user.active ? 'border-slate-700' : 'border-red-500/30 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    user.role === 'dono' ? 'bg-yellow-500/20' : 'bg-primary-500/20'
                  }`}>
                    {user.role === 'dono' ? (
                      <Crown className="text-yellow-400" size={24} />
                    ) : (
                      <Shield className="text-primary-400" size={24} />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-lg">{user.username}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === 'dono' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {user.role === 'dono' ? 'Dono' : 'Admin'}
                      </span>
                      {!user.active && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-sm mt-1">
                      <span>Criado em: {formatDate(user.created_at)}</span>
                      {user.created_by_name && (
                        <span className="ml-3">Por: {user.created_by_name}</span>
                      )}
                    </div>
                    <div className="text-slate-500 text-sm">
                      Último login: {formatDate(user.last_login)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.active 
                        ? 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                        : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'
                    }`}
                    title={user.active ? 'Desativar' : 'Ativar'}
                  >
                    {user.active ? <EyeOff size={18} /> : <Check size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                }}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!!editingUser}
                  required={!editingUser}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                  placeholder="Digite o username"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Senha {editingUser && <span className="text-slate-500">(deixe vazio para manter)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingUser}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 pr-10 text-white focus:outline-none focus:border-primary-500"
                    placeholder="Digite a senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Nível de Acesso</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      formData.role === 'admin'
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Shield size={16} />
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'dono' }))}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      formData.role === 'dono'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Crown size={16} />
                    Dono
                  </button>
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  {formData.role === 'dono' 
                    ? 'Dono: Acesso total + criar usuários + ver logs de ações'
                    : 'Admin: Acesso ao painel sem gerenciamento de usuários e logs'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  {editingUser ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelUsers;
