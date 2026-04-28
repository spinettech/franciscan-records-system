import React, { useState, useEffect } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { showToast } from '../utils/toast';
import CommunityCard from './CommunityManagement/CommunityCard';
import CommunityForm from './CommunityManagement/CommunityForm';
import CommunityInfoView from './CommunityManagement/CommunityInfoView';

const CommunityManagement = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<any>(null);
  const [viewingCommunity, setViewingCommunity] = useState<any>(null);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getCommunities();
      setCommunities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this community record? This cannot be undone.')) {
      try {
        // @ts-ignore
        await window.api.deleteCommunity(id);
        showToast('success', 'Community Removed', 'The community record has been deleted.');
        fetchCommunities();
      } catch (err: any) {
        showToast('error', 'Delete Failed', err.message || 'Could not delete the community record.');
      }
    }
  };

  if (isAdding || editingCommunity) {
    return (
      <CommunityForm 
        community={editingCommunity}
        onBack={() => { setIsAdding(false); setEditingCommunity(null); }} 
        onSave={() => { setIsAdding(false); setEditingCommunity(null); fetchCommunities(); }} 
      />
    );
  }

  if (viewingCommunity) {
    return (
      <CommunityInfoView 
        community={viewingCommunity}
        onBack={() => setViewingCommunity(null)}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Community Houses</h1>
          <p>Global registry of FSIC convents and mission stations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18}/> New Establishment
        </button>
      </header>

      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>Loading international registry...</div>
      ) : communities.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {communities.map((c: any) => (
            <CommunityCard 
              key={c.id} 
              comm={c} 
              onView={setViewingCommunity}
              onEdit={setEditingCommunity} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel text-center" style={{ padding: '5rem' }}>
          <Building2 size={64} className="text-muted" style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
          <p className="text-muted" style={{ fontSize: '1.25rem' }}>No community records found.</p>
          <button className="btn btn-primary mt-6" onClick={() => setIsAdding(true)}>Register First House</button>
        </div>
      )}
    </div>
  );
};

export default CommunityManagement;
