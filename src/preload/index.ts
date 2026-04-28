import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for the renderer
const api = {
  // Sisters
  getSisters: (filters: any) => ipcRenderer.invoke('get-sisters', filters),
  getSister: (id: string) => ipcRenderer.invoke('get-sister', id),
  upsertSister: (id: string | undefined, data: any) => ipcRenderer.invoke('upsert-sister', { id, data }),

  // Finance
  getTransactions: (filters: any) => ipcRenderer.invoke('get-transactions', filters),
  upsertTransaction: (id: string | undefined, data: any) => ipcRenderer.invoke('upsert-transaction', { id, data }),
  deleteTransaction: (id: string) => ipcRenderer.invoke('delete-transaction', id),
  getFinanceStats: () => ipcRenderer.invoke('get-finance-stats'),

  // Correspondence
  getCorrespondence: (filters: any) => ipcRenderer.invoke('get-correspondence', filters),
  upsertCorrespondence: (id: string | undefined, data: any) => ipcRenderer.invoke('upsert-correspondence', { id, data }),
  deleteCorrespondence: (id: string) => ipcRenderer.invoke('delete-correspondence', id),

  // Communities
  getCommunities: () => ipcRenderer.invoke('get-communities'),
  upsertCommunity: (id: string | undefined, data: any) => ipcRenderer.invoke('upsert-community', { id, data }),
  deleteCommunity: (id: string) => ipcRenderer.invoke('delete-community', id),
  getCommunityReports: (communityId: string) => ipcRenderer.invoke('get-community-reports', communityId),
  upsertCommunityReport: (id: string | undefined, data: any) => ipcRenderer.invoke('upsert-community-report', { id, data }),
  deleteCommunityReport: (id: string) => ipcRenderer.invoke('delete-community-report', id),

  // Obediences
  getObediences: (sisterId: string) => ipcRenderer.invoke('get-obediences', sisterId),
  upsertObedience: (data: any) => ipcRenderer.invoke('upsert-obedience', data),

  // Stats & Dashboard
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getNotifications: () => ipcRenderer.invoke('get-notifications'),

  // Auth & Security
  login: (credentials: any) => ipcRenderer.invoke('login', credentials),
  updateUser: (id: string, data: any) => ipcRenderer.invoke('update-user', { id, data }),
  changePassword: (id: string, oldPassword: string, newPassword: string) => ipcRenderer.invoke('change-password', { id, oldPassword, newPassword }),
  deleteSister: (id: string) => ipcRenderer.invoke('delete-sister', id),
  uploadPhoto: (id: string, buffer: Buffer) => ipcRenderer.invoke('upload-photo', { id, buffer }),

  // Reports
  exportSisters: (format: 'excel' | 'pdf') => ipcRenderer.invoke('export-sisters', { format }),

  // Documents
  getSisterDocuments: (sisterId: string) => ipcRenderer.invoke('get-sister-documents', sisterId),
  uploadSisterDocument: (data: any) => ipcRenderer.invoke('upload-sister-document', data),
  getReportDocuments: (reportId: string) => ipcRenderer.invoke('get-report-documents', reportId),
  uploadReportDocument: (data: any) => ipcRenderer.invoke('upload-report-document', data),
  deleteSisterDocument: (id: string) => ipcRenderer.invoke('delete-sister-document', id),
  openDocument: (fileName: string) => ipcRenderer.invoke('open-document', fileName),

  // Leadership
  getLeadership: () => ipcRenderer.invoke('get-leadership'),
  upsertLeadership: (id: string | undefined, data: any) => ipcRenderer.invoke('upsert-leadership', { id, data }),
  deleteLeadership: (id: string) => ipcRenderer.invoke('delete-leadership', id),

  // Updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateStatus: (callback: any) => {
    ipcRenderer.on('update-status', (_, data) => callback(data));
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if main world isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
