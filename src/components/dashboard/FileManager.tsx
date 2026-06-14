// src/components/dashboard/FileManager.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, Search, ChevronRight, 
  Trash2, Upload, AlertCircle, FileArchive, FileCode, 
  Image, FileText, Edit, Edit2, Download, ArrowRightLeft, 
  Plus, Save
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../hooks/useTranslation';
import { useToastStore } from '../../stores/useToastStore';
import { apiFetch } from '../../utils/api';

export interface FileItem {
  name: string;
  path: string;
  is_dir: boolean;
  size: string;
  size_bytes: number;
  last_modified: string;
  extension: string;
}

interface FileManagerProps {
  subdomainName: string;
  subdomainId: number;
}

export const FileManager: React.FC<FileManagerProps> = ({
  subdomainName,
  subdomainId
}) => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();

  const [currentPath, setCurrentPath] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real files loaded from backend API
  const [filesDb, setFilesDb] = useState<FileItem[]>([]);

  // Bulk delete and Zip extract states
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState<boolean>(false);
  const [extractingZipItem, setExtractingZipItem] = useState<FileItem | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Advanced File Manager States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [createName, setCreateName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [renameNewName, setRenameNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const [moveItem, setMoveItem] = useState<FileItem | null>(null);
  const [moveNewPath, setMoveNewPath] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  const [editFileItem, setEditFileItem] = useState<FileItem | null>(null);
  const [editFileContent, setEditFileContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);

  const handleOpenCreateModal = (type: 'file' | 'folder') => {
    setCreateType(type);
    setCreateName('');
    setShowCreateModal(true);
  };

  const executeCreate = async () => {
    if (!createName.trim()) return;
    setIsCreating(true);
    try {
      const fullRelativePath = currentPath ? `${currentPath}/${createName.trim()}` : createName.trim();
      await apiFetch(`/subdomains/${subdomainId}/file-manager/create`, {
        method: 'POST',
        body: { path: fullRelativePath, type: createType }
      });
      addToast({
        type: 'success',
        title: createType === 'folder' ? 'Folder Dibuat' : 'Berkas Dibuat',
        message: `Sukses membuat ${createType === 'folder' ? 'folder' : 'berkas'} "${createName.trim()}"`,
      });
      setShowCreateModal(false);
      fetchFiles();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Membuat',
        message: err.message || 'Terjadi kesalahan.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenRenameModal = (item: FileItem) => {
    setRenameItem(item);
    setRenameNewName(item.name);
  };

  const executeRename = async () => {
    if (!renameItem || !renameNewName.trim() || renameNewName.trim() === renameItem.name) return;
    setIsRenaming(true);
    try {
      await apiFetch(`/subdomains/${subdomainId}/file-manager/rename`, {
        method: 'POST',
        body: { path: renameItem.path, newName: renameNewName.trim() }
      });
      addToast({
        type: 'success',
        title: 'Nama Diubah',
        message: `Sukses mengubah nama menjadi "${renameNewName.trim()}"`,
      });
      setRenameItem(null);
      fetchFiles();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Mengubah Nama',
        message: err.message || 'Terjadi kesalahan.',
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenMoveModal = (item: FileItem) => {
    setMoveItem(item);
    setMoveNewPath(item.path);
  };

  const executeMove = async () => {
    if (!moveItem || !moveNewPath.trim() || moveNewPath.trim() === moveItem.path) return;
    setIsMoving(true);
    try {
      await apiFetch(`/subdomains/${subdomainId}/file-manager/move`, {
        method: 'POST',
        body: { path: moveItem.path, newPath: moveNewPath.trim() }
      });
      addToast({
        type: 'success',
        title: 'Berkas Dipindahkan',
        message: `Sukses memindahkan ke "/${moveNewPath.trim()}"`,
      });
      setMoveItem(null);
      fetchFiles();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Memindahkan',
        message: err.message || 'Terjadi kesalahan.',
      });
    } finally {
      setIsMoving(false);
    }
  };

  const handleDownload = async (item: FileItem) => {
    try {
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/subdomains/${subdomainId}/file-manager/download?path=${encodeURIComponent(item.path)}`;
      const token = localStorage.getItem('subly_token');
      
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengunduh berkas dari server.');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Mengunduh',
        message: err.message || 'Terjadi kesalahan.',
      });
    }
  };

  const handleOpenFileEditor = async (item: FileItem) => {
    setEditFileItem(item);
    setIsLoadingContent(true);
    setEditFileContent('');
    try {
      const res = await apiFetch<{ success: boolean; content: string }>(
        `/subdomains/${subdomainId}/file-manager/content?path=${encodeURIComponent(item.path)}`
      );
      setEditFileContent(res.content || '');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Membaca File',
        message: err.message || 'Terjadi kesalahan.',
      });
      setEditFileItem(null);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const executeSaveContent = async () => {
    if (!editFileItem) return;
    setIsSavingContent(true);
    try {
      await apiFetch(`/subdomains/${subdomainId}/file-manager/save`, {
        method: 'POST',
        body: { path: editFileItem.path, content: editFileContent }
      });
      addToast({
        type: 'success',
        title: 'Berkas Disimpan',
        message: `Berkas "${editFileItem.name}" berhasil disimpan.`,
      });
      setEditFileItem(null);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan.',
      });
    } finally {
      setIsSavingContent(false);
    }
  };

  const isEditableFile = (ext: string) => {
    return ['php', 'html', 'css', 'js', 'json', 'ts', 'jsx', 'tsx', 'env', 'txt', 'md', 'htaccess'].includes(ext.toLowerCase());
  };

  useEffect(() => {
    setSelectedFiles([]);
  }, [currentPath, subdomainId]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(`/subdomains/${subdomainId}/file-manager?path=${currentPath}`);
      const combined: FileItem[] = [
        ...(data.folders || []).map((f: any) => ({
          name: f.name,
          path: f.path,
          is_dir: true,
          size: '-',
          size_bytes: 0,
          last_modified: f.last_modified ? new Date(f.last_modified).toLocaleString() : '-',
          extension: ''
        })),
        ...(data.files || []).map((f: any) => ({
          name: f.name,
          path: f.path,
          is_dir: false,
          size: f.size,
          size_bytes: 0,
          last_modified: f.last_modified ? new Date(f.last_modified).toLocaleString() : '-',
          extension: f.extension || ''
        }))
      ];
      setFilesDb(combined);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Memuat Berkas',
        message: err.message || 'Terjadi kesalahan saat mengambil daftar berkas.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [subdomainId, currentPath]);

  // Filters to display current directory items
  const getCurrentItems = () => {
    // Safety Traversal Guard (Section 3.A): Hide critical files like .env in visual directories if you want,
    // let's show all except system files containing sensitive tokens if needed, but let's hide .env from showing.
    return filesDb.filter(file => {
      // Must reside directly in currentPath
      const parentPath = currentPath ? currentPath : '';
      
      const isDirectChild = parentPath 
        ? file.path.startsWith(parentPath + '/') && file.path.split('/').length === parentPath.split('/').length + 1
        : !file.path.includes('/');
      
      if (!isDirectChild) return false;

      // Apply search term
      if (searchTerm && !file.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  };

  // Traversal Breadcrumbs
  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    const parts = currentPath.split('/');
    let accumulatedPath = '';
    return parts.map((part) => {
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      return { name: part, path: accumulatedPath };
    });
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  // Delete Action Trigger
  const handleDeleteRequest = (item: FileItem) => {
    // Safety Action Guard: block deletion of critical .htaccess file
    if (item.name === '.htaccess') {
      addToast({
        type: 'error',
        title: 'Aksi Ditolak',
        message: 'Berkas konfigurasi sistem (.htaccess) tidak boleh dihapus demi keamanan virtual host.',
      });
      return;
    }
    setDeleteConfirmItem(item);
  };

  const executeDelete = async () => {
    if (deleteConfirmItem) {
      try {
        await apiFetch(`/subdomains/${subdomainId}/file-manager`, {
          method: 'DELETE',
          body: { path: deleteConfirmItem.path }
        });
        addToast({
          type: 'success',
          title: 'Berkas Dihapus',
          message: `Sukses menghapus ${deleteConfirmItem.name} dari server hosting.`,
        });
        setDeleteConfirmItem(null);
        fetchFiles();
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Gagal Menghapus',
          message: err.message || 'Terjadi kesalahan saat menghapus berkas.',
        });
      }
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = async (file: File) => {
    // File validation
    if (!file.name.endsWith('.zip')) {
      addToast({
        type: 'error',
        title: 'Format Berkas Salah',
        message: 'Hanya berkas berekstensi .ZIP yang diizinkan untuk di-deploy.',
      });
      return;
    }

    // Size limit validation (e.g. 50MB max)
    if (file.size > 50 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Ukuran Berkas Terlalu Besar',
        message: 'Batas maksimum ukuran berkas ZIP adalah 50 MB.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      const token = localStorage.getItem('subly_token');
      const uploadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/subdomains/${subdomainId}/file-manager/upload?path=${currentPath}`;

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            let errorMsg = 'Gagal mengunggah berkas.';
            try {
              const resJson = JSON.parse(xhr.responseText);
              errorMsg = resJson.message || resJson.error || errorMsg;
            } catch (err) {}
            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Koneksi jaringan bermasalah.'));
        });

        xhr.open('POST', uploadUrl);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });

      addToast({
        type: 'success',
        title: 'Upload Selesai',
        message: `File ${file.name} sukses diunggah ke folder target.`,
      });

      fetchFiles();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Mengunggah',
        message: err.message || 'Terjadi kesalahan saat mengunggah file.',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFiles(currentItems.map(item => item.path));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (path: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, path]);
    } else {
      setSelectedFiles(prev => prev.filter(p => p !== path));
    }
  };

  const executeBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      await apiFetch(`/subdomains/${subdomainId}/file-manager`, {
        method: 'DELETE',
        body: { paths: selectedFiles }
      });
      addToast({
        type: 'success',
        title: 'Berkas Dihapus',
        message: `Sukses menghapus ${selectedFiles.length} item dari server hosting.`,
      });
      setSelectedFiles([]);
      setShowBulkDeleteModal(false);
      fetchFiles();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.message || 'Terjadi kesalahan saat menghapus berkas.',
      });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleExtractZip = (item: FileItem) => {
    setExtractingZipItem(item);
  };

  const executeExtract = async () => {
    if (!extractingZipItem) return;
    setIsExtracting(true);
    try {
      await apiFetch(`/subdomains/${subdomainId}/file-manager/extract`, {
        method: 'POST',
        body: { path: extractingZipItem.path }
      });
      addToast({
        type: 'success',
        title: 'Ekstraksi Berhasil',
        message: `Arsip ${extractingZipItem.name} sukses diekstrak di server.`,
      });
      setExtractingZipItem(null);
      fetchFiles();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Ekstraksi Gagal',
        message: err.message || 'Terjadi kesalahan saat mengekstrak ZIP.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const getFileIcon = (ext: string) => {
    const extension = ext.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(extension)) {
      return <Image className="w-4.5 h-4.5 text-emerald-500 shrink-0" />;
    }
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
      return <FileArchive className="w-4.5 h-4.5 text-rose-500 shrink-0" />;
    }
    if (['php', 'html', 'css', 'js', 'json', 'ts', 'jsx', 'tsx'].includes(extension)) {
      return <FileCode className="w-4.5 h-4.5 text-cyan-500 shrink-0" />;
    }
    return <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />;
  };

  const currentItems = getCurrentItems();

  return (
    <div className="w-full flex flex-col gap-5 select-none">
      {/* File Manager Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-base font-bold text-text-main uppercase tracking-widest">{t('managePortal')}: {subdomainName}</h2>
          <p className="text-[10px] text-text-muted font-semibold mt-1">
            cPanel instan - kelola berkas lokal dan folder document root server.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input 
            type="text"
            placeholder="Cari berkas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-surface/50 border border-border-main focus:border-brand-primary rounded-xl pl-9.5 pr-4 py-2 text-xs font-semibold text-text-main placeholder-text-muted/65 outline-none transition-all"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
        </div>
      </div>

      {/* Path Breadcrumbs navigation */}
      <div className="glass-panel px-6 py-3.5 rounded-xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
          <Folder className="h-4.5 w-4.5 text-brand-primary shrink-0" />
          <button 
            onClick={() => handleNavigate('')} 
            className="hover:text-brand-primary transition-colors cursor-pointer"
          >
            Root
          </button>
          
          {getBreadcrumbs().map((bc, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3 w-3 text-border-main" />
              <button 
                onClick={() => handleNavigate(bc.path)} 
                className="hover:text-brand-primary transition-colors max-w-[120px] truncate cursor-pointer"
              >
                {bc.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex gap-2 select-none">
          <button
            onClick={() => handleOpenCreateModal('file')}
            className="text-[9px] font-bold uppercase tracking-widest text-brand-primary hover:text-white hover:bg-brand-primary/10 transition-all bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-lg active:scale-95 flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            + File
          </button>
          <button
            onClick={() => handleOpenCreateModal('folder')}
            className="text-[9px] font-bold uppercase tracking-widest text-brand-primary hover:text-white hover:bg-brand-primary/10 transition-all bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-lg active:scale-95 flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            + Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[9px] font-bold uppercase tracking-widest text-brand-primary hover:text-white hover:bg-brand-primary/10 transition-all bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-lg active:scale-95 flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload ZIP
          </button>

          {selectedFiles.length > 0 && (
            <button 
              onClick={() => setShowBulkDeleteModal(true)}
              className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-all bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Terpilih ({selectedFiles.length})
            </button>
          )}

          {currentPath !== '' && (
            <button 
              onClick={handleGoUp}
              className="text-[9px] font-bold uppercase tracking-widest text-text-muted hover:text-text-main transition-all bg-bg-surface border border-border-main px-3 py-1.5 rounded-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              Go Up
            </button>
          )}
        </div>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept=".zip"
        onChange={handleFileChange}
        className="hidden" 
      />

      {/* Explorer file grid list */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-xs flex flex-col">
        <div className="px-6 py-4 border-b border-border-main/50 bg-bg-surface/20 flex justify-between items-center select-none">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Daftar Berkas & Folder ({currentItems.length} item)
          </span>
          <span className="text-[9px] font-bold bg-border-main/50 px-2 py-0.5 rounded text-text-muted">
            Path: /{currentPath}
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-bg-surface/60 text-[9px] text-text-muted uppercase tracking-widest border-b border-border-main/40">
                <th className="py-3 px-6 font-bold w-12 text-center select-none">
                  <input 
                    type="checkbox" 
                    checked={currentItems.length > 0 && selectedFiles.length === currentItems.length}
                    onChange={handleSelectAll}
                    className="rounded bg-bg-surface border-border-main text-brand-primary focus:ring-brand-primary"
                  />
                </th>
                <th className="py-3 px-6 font-bold">Nama</th>
                <th className="py-3 px-6 text-center font-bold">Ukuran</th>
                <th className="py-3 px-6 text-center font-bold">Terakhir Diubah</th>
                <th className="py-3 px-6 text-right font-bold pr-8">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/40">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-text-muted font-semibold text-xs">
                    <div className="flex flex-col items-center justify-center gap-2.5 select-none">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      <p>Memuat berkas...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {currentItems.map((item, index) => (
                    <tr key={index} className="group hover:bg-border-main/10 transition-colors">
                      <td className="py-3 px-6 text-center select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedFiles.includes(item.path)}
                          onChange={(e) => handleSelectFile(item.path, e.target.checked)}
                          className="rounded bg-bg-surface border-border-main text-brand-primary focus:ring-brand-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-6">
                        {item.is_dir ? (
                          <button 
                            onClick={() => handleNavigate(item.path)} 
                            className="font-bold text-text-main hover:text-brand-primary flex items-center gap-2.5 transition-colors text-xs font-mono cursor-pointer select-none"
                          >
                            <Folder className="w-4.5 h-4.5 text-amber-500 shrink-0 transition-transform group-hover:scale-105 duration-200" />
                            <span className="truncate max-w-[200px] sm:max-w-md">{item.name}</span>
                          </button>
                        ) : (
                          <div className="font-semibold text-text-muted group-hover:text-text-main flex items-center gap-2.5 transition-colors text-xs font-mono truncate select-none">
                            {getFileIcon(item.extension)}
                            <span className="truncate max-w-[200px] sm:max-w-md">{item.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-6 text-center font-mono text-[10px] text-text-muted font-bold">
                        {item.size}
                      </td>
                      <td className="py-3 px-6 text-center text-[10px] font-semibold text-text-muted">
                        {item.last_modified}
                      </td>
                      <td className="py-3 px-6 text-right pr-8 space-x-1.5">
                        {!item.is_dir && isEditableFile(item.extension || item.name) && (
                          <button 
                            onClick={() => handleOpenFileEditor(item)}
                            className="text-cyan-500 hover:text-cyan-400 transition-colors p-1.5 rounded-lg hover:bg-cyan-500/10 cursor-pointer active:scale-95 inline-flex"
                            title="Edit File"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {!item.is_dir && (
                          <button 
                            onClick={() => handleDownload(item)}
                            className="text-emerald-500 hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-emerald-500/10 cursor-pointer active:scale-95 inline-flex"
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenMoveModal(item)}
                          className="text-blue-500 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-500/10 cursor-pointer active:scale-95 inline-flex"
                          title="Pindahkan File/Folder"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenRenameModal(item)}
                          className="text-amber-500 hover:text-amber-400 transition-colors p-1.5 rounded-lg hover:bg-amber-500/10 cursor-pointer active:scale-95 inline-flex"
                          title="Ubah Nama"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {item.extension.toLowerCase() === 'zip' && (
                          <button 
                            onClick={() => handleExtractZip(item)}
                            className="text-brand-primary hover:text-orange-500 transition-colors p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex"
                            title="Ekstrak ZIP"
                          >
                            <FileArchive className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteRequest(item)}
                          className="text-text-muted hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Empty state inside folders */}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-text-muted italic font-semibold text-xs">
                        <div className="flex flex-col items-center justify-center gap-2.5 select-none">
                          <AlertCircle className="w-6 h-6 text-text-muted/60" />
                          <p>Direktori ini kosong.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmItem !== null}
        onClose={() => setDeleteConfirmItem(null)}
        title="Hapus Berkas / Folder?"
        description="Aksi ini tidak dapat dibatalkan. Berkas di server hosting Anda akan terhapus selamanya."
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmItem(null)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={executeDelete}>
              {t('confirm')}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-xs text-left">
            <p className="font-bold">Menghapus item:</p>
            <p className="font-mono mt-0.5 text-[10px] bg-red-500/10 px-2 py-0.5 rounded break-all">
              /{deleteConfirmItem?.path}
            </p>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Hapus Beberapa Item Terpilih?"
        description="Aksi ini tidak dapat dibatalkan. Semua berkas dan folder yang Anda pilih akan terhapus selamanya dari server."
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setShowBulkDeleteModal(false)} disabled={isDeletingBulk}>
              Batal
            </Button>
            <Button variant="danger" onClick={executeBulkDelete} isLoading={isDeletingBulk}>
              Ya, Hapus Semua
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-xs text-left">
            <p className="font-bold">Akan menghapus {selectedFiles.length} item terpilih:</p>
            <div className="max-h-32 overflow-y-auto mt-1 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
              {selectedFiles.map((p, idx) => (
                <div key={idx} className="font-mono text-[9px] bg-red-500/10 px-2 py-0.5 rounded break-all">
                  /{p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ZIP Extraction Confirmation Modal */}
      <Modal
        isOpen={extractingZipItem !== null}
        onClose={() => setExtractingZipItem(null)}
        title="Ekstrak Berkas ZIP?"
        description="Berkas di dalam arsip ZIP akan diekstraksi ke direktori folder saat ini. Berkas dengan nama yang sama akan ditimpa."
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setExtractingZipItem(null)} disabled={isExtracting}>
              Batal
            </Button>
            <Button variant="primary" onClick={executeExtract} isLoading={isExtracting}>
              Ekstrak Sekarang
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-brand-primary text-xs text-left">
          <FileArchive className="h-5 w-5 text-brand-primary shrink-0 animate-bounce" />
          <div>
            <p className="font-bold">Mengekstrak berkas:</p>
            <p className="font-mono mt-0.5 text-[10px] bg-brand-primary/10 px-2 py-0.5 rounded break-all">
              /{extractingZipItem?.path}
            </p>
          </div>
        </div>
      </Modal>

      {/* Create File/Folder Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={createType === 'folder' ? 'Buat Folder Baru' : 'Buat Berkas Baru'}
        description={`Masukkan nama ${createType === 'folder' ? 'folder' : 'berkas'} baru yang ingin dibuat.`}
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={isCreating}>
              Batal
            </Button>
            <Button variant="primary" onClick={executeCreate} isLoading={isCreating}>
              Buat
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder={createType === 'folder' ? 'contoh: assets' : 'contoh: index.js'}
            className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all font-mono"
            autoFocus
          />
        </div>
      </Modal>

      {/* Rename File/Folder Modal */}
      <Modal
        isOpen={renameItem !== null}
        onClose={() => setRenameItem(null)}
        title="Ubah Nama"
        description="Masukkan nama baru untuk berkas atau folder ini."
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setRenameItem(null)} disabled={isRenaming}>
              Batal
            </Button>
            <Button variant="primary" onClick={executeRename} isLoading={isRenaming}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <input
            type="text"
            value={renameNewName}
            onChange={(e) => setRenameNewName(e.target.value)}
            placeholder="Nama baru..."
            className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all font-mono"
            autoFocus
          />
        </div>
      </Modal>

      {/* Move File/Folder Modal */}
      <Modal
        isOpen={moveItem !== null}
        onClose={() => setMoveItem(null)}
        title="Pindahkan File / Folder"
        description="Masukkan path folder tujuan (relatif dari root, pisahkan dengan garis miring)."
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setMoveItem(null)} disabled={isMoving}>
              Batal
            </Button>
            <Button variant="primary" onClick={executeMove} isLoading={isMoving}>
              Pindahkan
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block text-left">Path Tujuan:</label>
          <input
            type="text"
            value={moveNewPath}
            onChange={(e) => setMoveNewPath(e.target.value)}
            placeholder="contoh: public/assets/image.png"
            className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main outline-none transition-all font-mono"
            autoFocus
          />
        </div>
      </Modal>

      {/* Code Editor Modal (Fullscreen style) */}
      <Modal
        isOpen={editFileItem !== null}
        onClose={() => setEditFileItem(null)}
        title={`Mengedit File: ${editFileItem?.name || ''}`}
        size="lg"
        footerActions={
          <>
            <Button variant="secondary" onClick={() => setEditFileItem(null)} disabled={isSavingContent}>
              Batal
            </Button>
            <Button variant="primary" onClick={executeSaveContent} isLoading={isSavingContent}>
              <Save className="w-3.5 h-3.5 mr-1.5 inline" /> Simpan Berkas
            </Button>
          </>
        }
      >
        {isLoadingContent ? (
          <div className="py-12 text-center text-text-muted font-semibold text-xs">
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p>Membaca isi berkas...</p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <textarea
              value={editFileContent}
              onChange={(e) => setEditFileContent(e.target.value)}
              rows={16}
              className="w-full bg-black/60 border border-border-main rounded-xl p-4 text-xs font-mono text-cyan-400 outline-none transition-all resize-none leading-relaxed"
              spellCheck="false"
            />
          </div>
        )}
      </Modal>

      {/* Floating Upload Progress Card */}
      {isUploading && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-80 p-5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.08))',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(249,115,22,0.35)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(249,115,22,0.15)'
          }}
        >
          <div className="flex items-center justify-between mb-3 text-left">
            <span className="text-xs font-bold text-text-main flex items-center gap-2">
              <Upload className="h-4 w-4 text-brand-primary animate-bounce shrink-0" />
              Mengunggah Berkas ZIP...
            </span>
            <span className="text-xs font-mono font-bold text-brand-primary">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default FileManager;
