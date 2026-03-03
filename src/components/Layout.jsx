import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Ban, 
  LogOut, 
  Menu,
  X,
  Shield,
  FileText,
  Crown,
  Home,
  Package
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard',   active: 'bg-orange-500 text-white' },
  { path: '/players', icon: Users,    label: 'Jogadores',   active: 'bg-blue-500 text-white' },
  { path: '/vehicles', icon: Car,     label: 'Veículos',    active: 'bg-purple-500 text-white' },
  { path: '/houses', icon: Home,      label: 'Casas',       active: 'bg-cyan-500 text-white' },
  { path: '/chests', icon: Package,   label: 'Baús',        active: 'bg-amber-500 text-white' },
  { path: '/bans', icon: Ban,         label: 'Banimentos',  active: 'bg-red-500 text-white' },
];

const ownerNavItems = [
  { path: '/panel-users', icon: Shield,   label: 'Usuários do Painel', active: 'bg-yellow-500 text-white' },
  { path: '/panel-logs',  icon: FileText, label: 'Logs de Ações',      active: 'bg-yellow-500 text-white' },
];

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-800 border-r border-slate-700
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-200 ease-in-out
      `}>
        <div className="relative flex items-center justify-center p-4 border-b border-slate-700">
          <div className="flex flex-col items-center gap-1">
            <div className="text-center">
              <h1 className="text-white font-bold">Traid Roleplay</h1>
              <p className="text-slate-400 text-sm">Painel de Controle</p>
            </div>
          </div>
          <button 
            className="lg:hidden absolute right-4 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? `${item.active} shadow-lg` 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:translate-x-1'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Owner Only Section */}
          {user?.role === 'dono' && (
            <>
              <div className="border-t border-slate-700 my-4 pt-4">
                <p className="px-4 text-xs text-slate-500 uppercase font-semibold mb-2 flex items-center gap-2">
                  <Crown size={12} />
                  Área do Dono
                </p>
              </div>
              {ownerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? `${item.active} shadow-lg` 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:translate-x-1'
                      }
                    `}
                  >
                    <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-slate-300">
              <p className="font-medium flex items-center gap-2">
                {user?.username}
                {user?.role === 'dono' && <Crown size={14} className="text-yellow-400" />}
              </p>
              <p className="text-sm text-slate-500">
                {user?.role === 'dono' ? 'Dono' : 'Admin'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
