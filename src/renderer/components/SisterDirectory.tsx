import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, FileText, Download, Building2 } from 'lucide-react';
import { showToast } from '../utils/toast';
import SisterProfileForm from './SisterDirectory/SisterProfileForm';
import SisterProfileView from './SisterDirectory/SisterProfileView';
import SisterTable from './SisterDirectory/SisterTable';
import { ObedienceForm } from './Obedience/ObedienceTimeline';

const SisterDirectory = ({ initialAddMode = false, onModeReset }: { initialAddMode?: boolean, onModeReset?: () => void }) => {
  const [isAdding, setIsAdding] = useState(initialAddMode);
  const [selectedSister, setSelectedSister] = useState<any>(null);
  const [isAddingObedienceTo, setIsAddingObedienceTo] = useState<any>(null);
  const [sisters, setSisters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [communityFilter, setCommunityFilter] = useState('');
  const [communities, setCommunities] = useState<any[]>([]);

  useEffect(() => {
    // @ts-ignore
    window.api.getCommunities().then(setCommunities).catch(console.error);
  }, []);

  const fetchSisters = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const data = await window.api.getSisters({
        search,
        status: statusFilter || undefined,
        community: communityFilter || undefined
      });
      setSisters(data);
    } catch (err: any) {
      console.error('Fetch Sisters Error:', err);
      showToast('error', 'Error', `Failed to load directory records: ${err.message || 'Database connection error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSisters();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, communityFilter]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(true);
    try {
      // @ts-ignore
      const res = await window.api.exportSisters(format);
      if (res.success) {
        showToast('success', 'Export Complete', `${format.toUpperCase()} report saved to: ${res.filePath}`);
      } else if (res.message) {
        showToast('error', 'Export Failed', res.message);
      }
    } catch (err: any) {
      showToast('error', 'Export Error', err.message || 'An error occurred during export.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      // @ts-ignore
      const res = await window.api.importSisters();
      if (res.success) {
        showToast('success', 'Import Successful', res.message);
        fetchSisters(); // Refresh the list
      } else if (res.message !== 'No file selected') {
        showToast('error', 'Import Failed', res.message);
      }
    } catch (err: any) {
      showToast('error', 'Import Error', err.message || 'An error occurred during import.');
    } finally {
      setImporting(false);
    }
  };

  if (isAdding) {
    return (
      <SisterProfileForm
        sister={selectedSister}
        onBack={() => { setIsAdding(false); setSelectedSister(null); onModeReset?.(); }}
        onSave={() => { setIsAdding(false); setSelectedSister(null); onModeReset?.(); fetchSisters(); }}
      />
    );
  }

  if (isAddingObedienceTo) {
    return (
      <ObedienceForm
        sisterId={isAddingObedienceTo.id}
        onBack={() => setIsAddingObedienceTo(null)}
        onSave={() => { setIsAddingObedienceTo(null); fetchSisters(); }}
      />
    );
  }

  if (selectedSister) {
    return (
      <SisterProfileView
        sister={selectedSister}
        onBack={() => setSelectedSister(null)}
        onEdit={(s: any) => { setSelectedSister(s); setIsAdding(true); }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1>FSIC Sister Directory</h1>
          <p>Managing {sisters.length} records in the congregation registry.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn btn-outline"
            style={{ background: 'white' }}
            title="Export as Excel"
            disabled={exporting}
            onClick={() => handleExport('excel')}
          >
            {exporting ? 'Exporting...' : <><FileText size={18} /> Excel</>}
          </button>
          <button
            className="btn btn-outline"
            style={{ background: 'white' }}
            title="Export as PDF"
            disabled={exporting}
            onClick={() => handleExport('pdf')}
          >
            <Download size={18} /> PDF
          </button>
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.5rem' }}></div>
          <button
            className="btn btn-secondary ripple"
            disabled={importing}
            onClick={handleImport}
          >
            {importing ? 'Importing...' : <><FileText size={18} /> Import Excel</>}
          </button>
          <button className="btn btn-primary ripple" onClick={() => setIsAdding(true)}>
            <UserPlus size={18} /> Register New Sister
          </button>
        </div>
      </header>

      <div className="directory-controls glass-panel">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, community, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="retired">Retired</option>
              <option value="mission">On Mission</option>
              <option value="transferred">Transferred</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
          <div className="filter-item">
            <Building2 size={16} />
            <select value={communityFilter} onChange={e => setCommunityFilter(e.target.value)}>
              <option value="">All Communities</option>
              {communities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          {(search || statusFilter || communityFilter) && (
            <button className="text-btn text-danger" onClick={() => { setSearch(''); setStatusFilter(''); setCommunityFilter(''); }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel no-padding overflow-hidden">
        <SisterTable
          sisters={sisters}
          loading={loading}
          onView={setSelectedSister}
          onEdit={(s) => { setSelectedSister(s); setIsAdding(true); }}
          onAddObedience={setIsAddingObedienceTo}
        />
      </div>
    </div>
  );
};

export default SisterDirectory;
