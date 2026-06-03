// src/components/dashboard/FileManager.tsx
import React, { useState, useRef } from 'react';
import { 
  Folder, File, Search, ChevronRight, CornerDownRight, 
  Trash2, Upload, AlertCircle, FileArchive, FileCode, 
  Image, FileText, CheckCircle
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../hooks/useTranslation';
import { useToastStore } from '../../stores/useToastStore';

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
  onDeployTrigger?: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  subdomainName,
  onDeployTrigger
}) => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();

  const [currentPath, setCurrentPath] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<FileItem | null>(null);
  
  // File upload simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock file systems
  const [filesDb, setFilesDb] = useState<FileItem[]>([
    // Root Files
    { name: 'public', path: 'public', is_dir: true, size: '-', size_bytes: 0, last_modified: '2026-06-02 14:22', extension: '' },
    { name: 'app', path: 'app', is_dir: true, size: '-', size_bytes: 0, last_modified: '2026-06-02 14:20', extension: '' },
    { name: 'bootstrap', path: 'bootstrap', is_dir: true, size: '-', size_bytes: 0, last_modified: '2026-06-02 14:21', extension: '' },
    { name: 'index.php', path: 'index.php', is_dir: false, size: '1.2 KB', size_bytes: 1224, last_modified: '2026-06-01 10:00', extension: 'php' },
    { name: '.env', path: '.env', is_dir: false, size: '820 B', size_bytes: 820, last_modified: '2026-06-03 10:20', extension: 'env' },
    { name: '.htaccess', path: '.htaccess', is_dir: false, size: '240 B', size_bytes: 240, last_modified: '2026-06-01 09:45', extension: 'htaccess' },
    { name: 'package.json', path: 'package.json', is_dir: false, size: '512 B', size_bytes: 512, last_modified: '2026-06-01 09:45', extension: 'json' },
    
    // Inside public/
    { name: 'index.html', path: 'public/index.html', is_dir: false, size: '3.4 KB', size_bytes: 3400, last_modified: '2026-06-02 14:30', extension: 'html' },
    { name: 'logo.png', path: 'public/logo.png', is_dir: false, size: '42 KB', size_bytes: 43008, last_modified: '2026-06-02 14:31', extension: 'png' },
    { name: 'css', path: 'public/css', is_dir: true, size: '-', size_bytes: 0, last_modified: '2026-06-02 14:25', extension: '' },
    
    // Inside public/css
    { name: 'style.css', path: 'public/css/style.css', is_dir: false, size: '12 KB', size_bytes: 12288, last_modified: '2026-06-02 14:26', extension: 'css' },
  ]);

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

      // Apply Safety Traversal Guard: Hide .env visually
      if (file.name === '.env') return false;

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

  const executeDelete = () => {
    if (deleteConfirmItem) {
      setFilesDb(prev => prev.filter(f => !f.path.startsWith(deleteConfirmItem.path)));
      addToast({
        type: 'success',
        title: 'Berkas Dihapus',
        message: `Sukses menghapus ${deleteConfirmItem.name} dari server hosting.`,
      });
      setDeleteConfirmItem(null);
    }
  };

  // Drag and Drop implementation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
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

    // Simulation upload progress bar
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            
            // Add zip file to mock db
            const newFile: FileItem = {
              name: file.name,
              path: currentPath ? `${currentPath}/${file.name}` : file.name,
              is_dir: false,
              size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
              size_bytes: file.size,
              last_modified: new Date().toISOString().replace('T', ' ').substring(0, 16),
              extension: 'zip'
            };
            
            setFilesDb(prevDb => [...prevDb, newFile]);

            addToast({
              type: 'success',
              title: 'Upload Selesai',
              message: `File ${file.name} sukses diunggah ke folder target.`,
            });

            // Trigger deployment stream log in console if hook is active
            if (onDeployTrigger) {
              onDeployTrigger();
            }
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
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
      <div className="glass-panel px-6 py-3.5 rounded-2xl flex items-center justify-between shadow-xs">
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

        {currentPath !== '' && (
          <button 
            onClick={handleGoUp}
            className="text-[9px] font-bold uppercase tracking-widest text-text-muted hover:text-text-main transition-all bg-bg-surface border border-border-main px-3 py-1.5 rounded-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            Go Up
          </button>
        )}
      </div>

      {/* Upload Drag and Drop zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel border-dashed border-2 rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2.5 ${
          dragActive 
            ? 'border-brand-primary bg-brand-primary/5 shadow-lg' 
            : 'border-border-main hover:border-brand-primary hover:bg-brand-primary/2'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".zip"
          onChange={handleFileChange}
          className="hidden" 
        />
        {isUploading ? (
          <div className="w-full max-w-xs flex flex-col items-center gap-2">
            <div className="flex justify-between w-full text-xs font-bold text-brand-primary">
              <span>{t('loading')}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-border-main h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-brand-primary h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="h-10 w-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-text-main">{t('deployZip')}</p>
              <p className="text-[10px] text-text-muted mt-1 leading-normal">
                {t('dropzoneText')} (Maks. 50 MB)
              </p>
            </div>
          </>
        )}
      </div>

      {/* Explorer file grid list */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xs flex flex-col">
        <div className="px-6 py-4 border-b border-border-main/50 bg-bg-surface/20 flex justify-between items-center select-none">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            Daftar Berkas & Folder ({currentItems.length} item)
          </span>
          <span className="text-[9px] font-bold bg-border-main/50 px-2 py-0.5 rounded text-text-muted">
            Path: /{currentPath}
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-surface/60 text-[9px] text-text-muted uppercase tracking-widest border-b border-border-main/40">
                <th className="py-3 px-6 font-bold">Nama</th>
                <th className="py-3 px-6 text-center font-bold">Ukuran</th>
                <th className="py-3 px-6 text-center font-bold">Terakhir Diubah</th>
                <th className="py-3 px-6 text-right font-bold pr-8">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/40">
              {currentItems.map((item, index) => (
                <tr key={index} className="group hover:bg-border-main/10 transition-colors">
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
                  <td className="py-3 px-6 text-right pr-8">
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
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-xs text-left">
            <p className="font-bold">Menghapus item:</p>
            <p className="font-mono mt-0.5 text-[10px] bg-red-500/10 px-2 py-0.5 rounded break-all">
              /{deleteConfirmItem?.path}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default FileManager;
