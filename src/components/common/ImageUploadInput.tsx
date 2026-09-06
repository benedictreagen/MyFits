import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Link as LinkIcon, Trash2, Upload } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { getTranslation } from '../../utils/translations';

interface ImageUploadInputProps {
  value: string;
  onChange: (image: string) => void;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'circle';
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label,
  className = '',
  aspectRatio = 'wide',
}) => {
  const { language } = useHealth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>(
    value && !value.startsWith('data:') ? 'url' : 'upload'
  );
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB for clean client state)
    if (file.size > 3 * 1024 * 1024) {
      alert('Please choose an image under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const roundedClasses =
    aspectRatio === 'circle'
      ? 'rounded-full w-24 h-24'
      : aspectRatio === 'square'
      ? 'rounded-2xl aspect-square'
      : 'rounded-2xl aspect-video';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-[#8C8980] dark:text-[#A3A096] block">
          {label}
        </label>
      )}

      {/* Mode Switcher: Device Gallery vs Image URL */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F5F4EF] dark:bg-[#2A332B] border border-[#EBE9E1] dark:border-[#384439] w-fit">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-white shadow-xs'
              : 'text-[#8C8980] hover:text-[#3D3D3D]'
          }`}
        >
          <Upload className="w-3 h-3 text-[#7D8C6F]" />
          <span>{getTranslation('upload_from_device', language)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'url'
              ? 'bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-white shadow-xs'
              : 'text-[#8C8980] hover:text-[#3D3D3D]'
          }`}
        >
          <LinkIcon className="w-3 h-3 text-[#7D8C6F]" />
          <span>{getTranslation('image_url_option', language)}</span>
        </button>
      </div>

      {/* Preview Box & Interaction Area */}
      {value ? (
        <div className="relative group overflow-hidden border border-[#EBE9E1] dark:border-[#323E34] rounded-2xl bg-[#FAF9F5] dark:bg-[#252E27] p-2 flex items-center gap-3">
          <img
            src={value}
            alt="Preview"
            className={`object-cover ${roundedClasses} border border-[#EBE9E1] dark:border-[#384439] shadow-xs`}
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#3D3D3D] dark:text-[#E8EAE6] truncate">
              {value.startsWith('data:') ? 'Image uploaded from device' : value}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  if (activeMode === 'upload') {
                    fileInputRef.current?.click();
                  } else {
                    const next = prompt('Enter new image URL:', value);
                    if (next) onChange(next);
                  }
                }}
                className="text-xs font-bold text-[#7D8C6F] dark:text-[#9FB191] hover:underline cursor-pointer"
              >
                Replace
              </button>
              <span className="text-[#8C8980]">•</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeMode === 'upload' ? (
        /* Device Upload Trigger Area */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#DCD9D0] dark:border-[#384439] hover:border-[#7D8C6F] dark:hover:border-[#7D8C6F] rounded-2xl p-5 text-center cursor-pointer transition-colors bg-[#FAF9F5]/60 dark:bg-[#252E27]/40 flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-[#F5F4EF] dark:bg-[#2A332B] flex items-center justify-center text-[#7D8C6F] shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#3D3D3D] dark:text-[#E8EAE6]">
              Tap to browse photos or take a picture
            </p>
            <p className="text-[11px] text-[#8C8980] dark:text-[#A3A096]">
              PNG, JPG, or WebP (up to 3MB)
            </p>
          </div>
        </div>
      ) : (
        /* Image URL Input Area */
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 p-2.5 text-xs rounded-xl border border-[#EBE9E1] dark:border-[#323E34] bg-white dark:bg-[#1E2520] text-[#3D3D3D] dark:text-[#E8EAE6] focus:outline-hidden focus:border-[#7D8C6F]"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-[#7D8C6F] text-white text-xs font-bold rounded-xl hover:bg-[#6B7A5D] transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
