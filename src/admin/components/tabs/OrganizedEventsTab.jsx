import { useState } from 'react';
import toast from 'react-hot-toast';
import { eventsAPI } from '../../../api/dataAPI';
import { useData } from '../../../context/DataContext';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

const OrganizedEventsTab = () => {
  const { events, refresh } = useData();
  const [editingEvent, setEditingEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', eventType: 'organized' });
  const [saving, setSaving] = useState(false);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventType: 'organized',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organized event?')) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted successfully');
      refresh();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const handleAddClick = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', eventType: 'organized' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEvent) {
        await eventsAPI.update(editingEvent._id, formData);
        toast.success('Event updated successfully!');
      } else {
        await eventsAPI.create(formData);
        toast.success('Event added successfully!');
      }
      setShowForm(false);
      refresh();
    } catch (err) {
      toast.error('Failed to save event');
    }
    setSaving(false);
  };

  const filteredEvents = events.filter(e => e.eventType === 'organized' || e.eventType === 'organised');

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black font-poppins text-white">Organized Events</h2>
          <p className="text-gray-400 text-xs mt-1">Manage main events organised by CaliYog and show accomplishments timeline.</p>
        </div>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="btn-glow text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <HiPlus /> Add Achievement
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-[#0f141c] border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-6 font-poppins">
            {editingEvent ? 'Edit Organized Event' : 'Add Organized Event'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., CaliYog National Championship 2024"
                className="w-full px-4 py-3 rounded-xl bg-[#161f2c] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-bold uppercase tracking-wider mb-2">Description / Details</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add extra description notes if any..."
                className="w-full px-4 py-3 rounded-xl bg-[#161f2c] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-3 rounded-xl border border-white/10 bg-transparent text-gray-300 hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-glow text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((item, idx) => (
            <div key={item._id} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white flex items-center justify-center font-black font-poppins text-lg shadow-lg">
                {idx + 1}
              </div>
              <div className="flex-1 bg-[#0f141c] border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-white font-poppins truncate">{item.title}</h4>
                  {item.description && <p className="text-gray-400 text-sm mt-2 leading-relaxed">{item.description}</p>}
                </div>
                <div className="flex gap-2 sm:self-center">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2.5 rounded-xl bg-green-500/10 text-[#2ecc71] hover:bg-[#2ecc71] hover:text-white transition cursor-pointer"
                    title="Edit"
                  >
                    <HiPencil />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                    title="Delete"
                  >
                    <HiTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No organized achievements logs yet. Click 'Add Achievement' to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizedEventsTab;
