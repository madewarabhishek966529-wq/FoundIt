import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const ImageUploader = ({ files, onChange, maxFiles = 3, required = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [warning, setWarning] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = (newFiles) => {
    setWarning('');
    const validFiles = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        setWarning('Only JPEG, PNG, or WebP images are supported.');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setWarning('Image file size must be less than 5MB.');
        continue;
      }

      // Client-side image quality check (Brightness & Resolution)
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 200 || img.height < 200) {
            setWarning('Image resolution is very low. Clear photos improve neural matching accuracy.');
            return;
          }

          // Offscreen canvas for luminosity check
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);
          const imageData = ctx.getImageData(0, 0, 64, 64);
          const data = imageData.data;
          let totalLuminance = 0;
          for (let p = 0; p < data.length; p += 4) {
            totalLuminance += 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
          }
          const avgLuminance = totalLuminance / (64 * 64);
          if (avgLuminance < 45) {
            setWarning('This photo appears quite dark. Good lighting improves CLIP visual matching accuracy.');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

      validFiles.push(file);
    }

    const combined = [...files, ...validFiles].slice(0, maxFiles);
    onChange(combined);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={maxFiles > 1}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
            }
          }}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Click to upload or drag & drop photo{maxFiles > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              PNG, JPG, or WEBP up to 5MB (Max {maxFiles} {maxFiles === 1 ? 'photo' : 'photos'})
            </p>
          </div>
        </div>
      </div>

      {warning && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {files.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div
                key={idx}
                className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src={previewUrl}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
