import { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Shield, ChefHat, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_META = {
  admin: { label: 'Admin', icon: Shield, color: 'text-primary-100 bg-primary-100/10' },
  restaurant_user: { label: 'Restaurant Manager', icon: ChefHat, color: 'text-accent-200 bg-accent-100/20' },
  token_operator: { label: 'Token Operator', icon: Hash, color: 'text-primary-200 bg-primary-50' },
};

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'restaurant_user', label: 'Restaurant Manager' },
  { value: 'token_operator', label: 'Token Operator' },
];

const UserList = ({ users, onEdit, onDelete }) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-200">No users found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-300" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterRole(opt.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filterRole === opt.value
                  ? 'bg-primary-100 text-white'
                  : 'bg-bg-100 text-text-100 hover:bg-bg-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-text-200">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-200">No users match your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-bg-300 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-100 border-b border-bg-300">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-text-200">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-text-200 hidden sm:table-cell">Username</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-text-200 hidden md:table-cell">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-text-200">Role</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-text-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-300">
              {filteredUsers.map(u => {
                const meta = ROLE_META[u.role] || ROLE_META.restaurant_user;
                const RoleIcon = meta.icon;
                const isSelf = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-bg-100 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-100">{u.name}</span>
                        {isSelf && (
                          <span className="text-xs text-primary-100 font-medium">(you)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-200 font-mono text-sm hidden sm:table-cell">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 text-text-200 text-sm hidden md:table-cell">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(u)}
                          className="p-2 text-text-200 hover:text-primary-100 hover:bg-bg-200 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(u)}
                          disabled={isSelf}
                          className={`p-2 rounded-lg transition-colors ${
                            isSelf
                              ? 'text-text-300 cursor-not-allowed'
                              : 'text-text-200 hover:text-accent-200 hover:bg-accent-100/20'
                          }`}
                          title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
