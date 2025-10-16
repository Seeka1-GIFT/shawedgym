import React, { useState, useEffect, useRef } from 'react';
// Removed dummy imports to ensure DB-only data
import { apiService, authHelpers } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AddMemberForm from '../components/AddMemberForm';
import { 
  Users, Plus, Search, Filter, Download, Mail, Phone, 
  Calendar, CreditCard, AlertTriangle, CheckCircle, 
  Clock, Edit, Trash2, Eye, UserPlus, Star, MapPin,
  Activity, TrendingUp, Award, X, Save
} from 'lucide-react';

const Members = () => {
  const { showSuccess, showError } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
  const [expandedMemberIds, setExpandedMemberIds] = useState(new Set());
  const [planOptions, setPlanOptions] = useState([]);
  const videoRefEdit = useRef(null);
  const canvasRefEdit = useRef(null);
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const currentUser = authHelpers.getUser();
  const isAdmin = currentUser?.role === 'admin';
  const isCashier = currentUser?.role === 'cashier';

  // Load members and plans
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [membersResponse, plansResponse] = await Promise.all([
          apiService.getMembers({ search: searchTerm }),
          apiService.getPlans()
        ]);
        
        setMembers(membersResponse.data.members || []);
        setPlanOptions(plansResponse.data.plans || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load members');
        showError(err.message || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchTerm, showError]);

  // When opening edit modal, prefill current photo url
  useEffect(() => {
    if (editingMember && (editingMember.photo_url || editingMember.photo)) {
      setEditPhotoUrl(editingMember.photo_url || editingMember.photo || '');
    }
  }, [editingMember]);

  // Enhanced member data (use backend photo_url/registered/expires when present)
  const enhancedMembers = members.map(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
    const registered = member.registered_at ? new Date(member.registered_at) : (member.created_at ? new Date(member.created_at) : null);
    const expires = member.plan_expires_at ? new Date(member.plan_expires_at) : null;
    return {
      ...member,
      name: fullName,
      photo: member.photo_url || '',
      membershipType: member.membership_type || 'Standard',
      registeredLabel: registered ? registered.toISOString().split('T')[0] : '-',
      expiresLabel: expires ? expires.toISOString().split('T')[0] : '-',
    };
  });

  // Filter members
  const filteredMembers = enhancedMembers.filter((m) => {
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    const phone = m.phone || '';
    const searchLower = (searchTerm || '').toLowerCase();
    
    const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || (m.status && m.status.toLowerCase() === filterStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  // Export: CSV
  const exportMembersCSV = () => {
    try {
      const headers = ['ID','First Name','Last Name','Phone','Email','Membership Type','Status'];
      const rows = filteredMembers.map(m => [
        m.id,
        m.first_name || '',
        m.last_name || '',
        m.phone || '',
        m.email || '',
        m.membershipType || '',
        m.status || ''
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Members exported (CSV)');
    } catch (e) { console.error('Export CSV failed', e); showError('CSV export failed'); }
  };

  // Export: PDF/HTML via print dialog
  const exportMembersPDF = () => {
    try {
      const rows = filteredMembers.map(m => `
        <tr>
          <td>${m.id}</td>
          <td>${m.first_name || ''}</td>
          <td>${m.last_name || ''}</td>
          <td>${m.phone || ''}</td>
          <td>${m.email || ''}</td>
          <td>${m.membershipType || ''}</td>
          <td>${m.status || ''}</td>
        </tr>`).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Members</title>
      <style>body{font-family:Arial;padding:16px;} h1{margin:0 0 12px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #e5e7eb;padding:8px;text-align:left} th{background:#f9fafb}</style>
      </head><body><h1>Members Export</h1><p>Date: ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>ID</th><th>First</th><th>Last</th><th>Phone</th><th>Email</th><th>Membership</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      const done = () => { try { w.print(); } catch(e) {} setTimeout(() => { try { w.close(); URL.revokeObjectURL(url); } catch(e) {} }, 400); };
      if (w) { w.onload = done; setTimeout(done, 800); }
    } catch (e) { console.error('Export PDF failed', e); showError('PDF export failed'); }
  };

  // CRUD Functions
  const handleAddMember = async (memberData) => {
    if (!(isAdmin || isCashier)) {
      showError('Only administrators or cashiers can create members');
      return;
    }
    try {
      const response = await apiService.createMember(memberData);
      if (response.success) {
        const refreshResponse = await apiService.getMembers();
        setMembers(refreshResponse.data.members || []);
        setShowAddModal(false);
        showSuccess('Member added successfully!');
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      showError(error.message || 'Failed to add member');
      throw error; // Re-throw to be handled by the form
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!isAdmin) {
      showError('Only administrators can delete members');
      return;
    }
    try {
      const response = await apiService.deleteMember(memberId);
      if (response.success) {
        // quick refetch to stay in sync with backend
        const refreshResponse = await apiService.getMembers({ search: searchTerm });
        setMembers(refreshResponse.data.members || []);
        setDeletingMember(null);
        showSuccess('Member deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
      showError(error.message || 'Failed to delete member');
    }
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showError('Only administrators can update members');
      return;
    }
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      // Prepare photo URL from input or webcam snapshot
      let newPhotoUrl = (data.get('photo_url') || '').trim() || editPhotoUrl;
      if (!newPhotoUrl && canvasRefEdit.current && videoRefEdit.current && videoRefEdit.current.videoWidth) {
        const canvas = canvasRefEdit.current;
        const video = videoRefEdit.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        try {
          const uploadRes = await apiService.api.post('/uploads/base64', { imageBase64: base64 });
          const resJson = uploadRes?.data;
          if (resJson?.success && resJson?.data?.url) newPhotoUrl = resJson.data.url;
        } catch (_) {}
      }
      const payload = {
        firstName: data.get('firstName') || editingMember.first_name,
        lastName: data.get('lastName') || editingMember.last_name,
        phone: data.get('phone') || editingMember.phone,
        membershipType: data.get('membershipType') || editingMember.membership_type,
        // Map Date of Registration field to dateOfBirth param for backward compatibility
        dateOfBirth: data.get('dateOfBirth') || editingMember.date_of_birth,
        photo_url: newPhotoUrl || undefined
        // registrationFee and paymentMethod are intentionally collected for UI parity
        // but are ignored by the backend update endpoint at the moment
      };
      await apiService.updateMember(editingMember.id, payload);
      const refreshResponse = await apiService.getMembers({ search: searchTerm });
      setMembers(refreshResponse.data.members || []);
      setEditingMember(null);
      showSuccess('Member updated successfully!');
    } catch (err) {
      console.error('Failed to update member:', err);
      showError(err.message || 'Failed to update member');
    }
  };

  const stats = {
    total: enhancedMembers.length,
    active: enhancedMembers.filter(m => m.status === 'Active').length,
    expiringSoon: 3,
    newThisMonth: 3
  };

  const toggleExpand = (memberId) => {
    setExpandedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading members..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <ErrorBoundary 
        error={error ? { message: error } : null} 
        onRetry={() => window.location.reload()}
        onDismiss={() => setError(null)}
      >
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Members</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage gym members and track memberships</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportMembersCSV}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={exportMembersPDF}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            {(isAdmin || isCashier) && (
            <button
              onClick={async () => {
                try {
                  const plansResponse = await apiService.getPlans();
                  setPlanOptions(plansResponse?.data?.plans || plansResponse?.data || []);
                } catch {
                  setPlanOptions([]);
                } finally {
                  setShowAddModal(true);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Members', value: stats.total, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active', value: stats.active, color: 'from-green-500 to-emerald-500' },
          { label: 'Expiring Soon', value: stats.expiringSoon, color: 'from-orange-500 to-red-500' },
          { label: 'New This Month', value: stats.newThisMonth, color: 'from-purple-500 to-pink-500' }
        ].map((card) => (
          <div key={card.label} className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700`}> 
            <div className={`inline-flex px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r ${card.color}`}>{card.label}</div>
            <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white shadow-sm"
              />
            </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

      {/* Members Table - modern responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {filteredMembers.map(member => (
                <tr key={member.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" onError={(e)=>{e.currentTarget.style.display='none';}} />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700" />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{member.name || '—'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{member.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{member.membershipType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{member.face_id || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{member.registeredLabel}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{member.expiresLabel}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>{member.status || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => toggleExpand(member.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white hover:bg-blue-700"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => setEditingMember(member)} className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-600 text-white hover:bg-gray-700"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeletingMember(member)} className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-600 text-white hover:bg-red-700"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No members found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Member</h2>
                <button onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <AddMemberForm onClose={() => setShowAddModal(false)} onMemberAdded={handleAddMember} planOptions={planOptions} />
                      </div>
                    </div>
                  </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Member</h3>
                <button onClick={() => setDeletingMember(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete {deletingMember.name}? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button onClick={() => setDeletingMember(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDeleteMember(deletingMember.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                  Delete
                </button>
                    </div>
                    </div>
                    </div>
                    </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Member</h2>
                <button onClick={() => setEditingMember(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
                    </div>
              <form onSubmit={handleUpdateMember} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input
                      name="firstName"
                      type="text"
                      defaultValue={editingMember.first_name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter first name"
                    />
                  </div>
                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input
                      name="lastName"
                      type="text"
                      defaultValue={editingMember.last_name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter last name"
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                    <input
                      name="phone"
                      type="tel"
                      defaultValue={editingMember.phone}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+252-61-123-4567"
                    />
                  </div>
                  {/* Membership Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Type *</label>
                    <select
                      name="membershipType"
                      defaultValue={editingMember.membership_type || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a plan</option>
                      {planOptions.map(plan => (
                        <option key={plan.id} value={plan.name}>{plan.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Date of Registration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Registration</label>
                    <input
                      name="dateOfBirth"
                      type="date"
                      defaultValue={editingMember.date_of_birth || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {/* Registration Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Fee ($)</label>
                    <input
                      name="registrationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 10"
                    />
                  </div>
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                    <select
                      name="paymentMethod"
                      defaultValue={"EVC-PLUS"}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="EVC-PLUS">EVC-PLUS</option>
                      <option value="E-DAHAB">E-DAHAB</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="wallet">Wallet</option>
                    </select>
                  </div>
                  {/* Device Person ID (face_id) - editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Person ID</label>
                    <input
                      name="external_person_id"
                      type="text"
                      defaultValue={editingMember.face_id || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 712"
                    />
                  </div>
                  {/* Photo (capture or URL) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo</label>
                    <div className="flex items-center gap-3 mb-2">
                      <video ref={videoRefEdit} className="w-36 h-24 bg-black rounded" autoPlay playsInline muted />
                      <canvas ref={canvasRefEdit} className="hidden" />
                      {editPhotoUrl && (
                        <img src={editPhotoUrl} alt="current" className="w-24 h-24 rounded object-cover border dark:border-gray-600" />
                      )}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={async () => {
                        try {
                          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                          if (videoRefEdit.current) videoRefEdit.current.srcObject = stream;
                        } catch (_) {}
                      }} className="px-3 py-1 rounded bg-gray-600 text-white">Open Camera</button>
                      <button type="button" onClick={() => {
                        if (canvasRefEdit.current && videoRefEdit.current) {
                          const canvas = canvasRefEdit.current;
                          const video = videoRefEdit.current;
                          canvas.width = video.videoWidth;
                          canvas.height = video.videoHeight;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(video, 0, 0);
                          setEditPhotoUrl(canvas.toDataURL('image/jpeg', 0.9));
                        }
                      }} className="px-3 py-1 rounded bg-blue-600 text-white">Take Snapshot</button>
                    </div>
                    <input
                      name="photo_url"
                      type="url"
                      defaultValue={editingMember.photo_url || ''}
                      onChange={(e)=>setEditPhotoUrl(e.target.value)}
                      placeholder="https://.../member.jpg"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Update Member
                  </button>
                </div>
              </form>
                        </div>
          </div>
        </div>
      )}
      </ErrorBoundary>
    </div>
  );
};

export default Members;
