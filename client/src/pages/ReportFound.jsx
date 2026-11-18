import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowLeft, Shield, HelpCircle } from 'lucide-react';
import { createItem } from '../api/items.api';
import { CATEGORIES } from '../utils/constants';
import { ZoneSelect } from '../components/ui/ZoneSelect';
import { ImageUploader } from '../components/ui/ImageUploader';

export const ReportFound = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    zone: '',
    dateEvent: new Date().toISOString().split('T')[0],
    color: '',
    brand: '',
    heldAtDesk: false,
    verificationQuestion: '',
    verificationAnswer: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      setError('At least one photo of the found item is required');
      return;
    }
    if (!formData.category) {
      setError('Please select an item category');
      return;
    }
    if (!formData.zone) {
      setError('Please select the campus zone where item was found');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('type', 'found');
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('zone', formData.zone);
      data.append('dateEvent', new Date(formData.dateEvent).toISOString());
      if (formData.color) data.append('color', formData.color);
      if (formData.brand) data.append('brand', formData.brand);
      data.append('heldAtDesk', String(formData.heldAtDesk));

      if (formData.verificationQuestion) {
        data.append('verificationQuestion', formData.verificationQuestion);
      }
      if (formData.verificationAnswer) {
        data.append('verificationAnswer', formData.verificationAnswer);
      }

      images.forEach((img) => {
        data.append('images', img);
      });

      const response = await createItem(data);
      const createdItem = response.data.item;
      navigate(`/items/${createdItem._id || createdItem.id}`);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to submit found report. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Report a Found Item
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a photo so our neural network can automatically match it with lost item reports.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Photo upload (Required) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Item Photo * (Required)
            </label>
            <ImageUploader files={images} onChange={setImages} maxFiles={3} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Found blue water bottle with silver cap"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Found in Campus Zone *
              </label>
              <ZoneSelect
                value={formData.zone}
                onChange={(z) => setFormData({ ...formData, zone: z })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date Found *
              </label>
              <input
                type="date"
                required
                name="dateEvent"
                value={formData.dateEvent}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Color (Optional)
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Silver, Black"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Brand (Optional)
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Milton, Boat, Casio"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Where was it found (e.g. 2nd floor bench, under library table)..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Security Desk Handover Toggle */}
          <div className="flex items-center gap-3 p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
            <input
              type="checkbox"
              id="heldAtDesk"
              name="heldAtDesk"
              checked={formData.heldAtDesk}
              onChange={handleChange}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="heldAtDesk" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <span className="font-bold">I have handed this item to Campus Security Desk</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                The owner can verify their ID and collect it directly from security personnel.
              </span>
            </label>
          </div>

          {/* Secret Verification Question (Anti-Fraud) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Anti-Fraud Verification (Optional)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Ask a question that only the real owner can answer (e.g. phone lock screen wallpaper, engraving, inside tag label).
            </p>

            <div className="space-y-3 pt-1">
              <input
                type="text"
                name="verificationQuestion"
                value={formData.verificationQuestion}
                onChange={handleChange}
                placeholder="Question: What is on the lock screen / sticker?"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                name="verificationAnswer"
                value={formData.verificationAnswer}
                onChange={handleChange}
                placeholder="Secret Answer (stored securely as a cryptographic hash)"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Submit Found Report</span>
          </button>
        </form>
      </div>
    </div>
  );
};
