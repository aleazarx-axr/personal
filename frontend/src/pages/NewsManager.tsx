// src/pages/NewsManager.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Newspaper, Plus, Trash2, Edit, Image as ImageIcon, X, Upload, ChevronDown, Save, Search } from 'lucide-react';
import { UnderDevelopment } from '../components/UnderDevelopment';

// --- CUSTOM OVERLAY DROPDOWN ---
const CustomSelect = ({ value, onChange, options, className = "h-[42px]", placeholder = "Select..." }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], className?: string, placeholder?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors shadow-sm`}
      >
        <span className={`truncate mr-2 ${selected ? 'text-gray-900' : 'text-gray-500'}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-[100] w-full top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${opt.value === value ? 'bg-red-50 text-[#9B1C1C] font-semibold border-l-2 border-[#9B1C1C]' : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const NewsManager: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("portalUser") || "{}");
  
  if (user.role !== "Superuser") {
    return <UnderDevelopment />;
  }

  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Create Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  
  // Edit Form State
  const [editData, setEditData] = useState({ id: 0, title: '', category: '', content: '', existingImage: '' });
  const [editImage, setEditImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/news`);
      if (res.ok) setNews(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  // Filter Logic
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- HANDLERS ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return alert("Please select a category.");
    setLoading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/news`, { method: 'POST', body: formData });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setTitle(''); setCategory(''); setContent(''); setImage(null);
        fetchNews();
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const openEditModal = (item: any) => {
    setEditData({
      id: item.id,
      title: item.title,
      category: item.category,
      content: item.content,
      existingImage: item.image_url || ''
    });
    setEditImage(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('title', editData.title);
    formData.append('category', editData.category);
    formData.append('content', editData.content);
    if (editImage) formData.append('image', editImage);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/news/${editData.id}`, { method: 'PUT', body: formData });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchNews();
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/news/${id}`, { method: 'DELETE' });
      fetchNews();
    } catch (error) { console.error(error); }
  };

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <>
      
      {/* --- REFINED HEADER CONTROLS --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:flex-1 lg:max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search news titles or content..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className={`${inputClass} pl-10 shadow-sm`} 
            />
          </div>
          
          <div className="w-full sm:w-56 shrink-0">
            <CustomSelect 
              value={categoryFilter} 
              onChange={(val) => setCategoryFilter(val)} 
              options={[
                {value: 'All', label: 'All Categories'},
                {value: 'Academics', label: 'Academics'},
                {value: 'Campus Event', label: 'Campus Event'},
                {value: 'Announcement', label: 'Announcement'},
                {value: 'Achievement', label: 'Achievement'}
              ]}
            />
          </div>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="w-full sm:w-auto h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 text-sm font-medium rounded-md flex items-center justify-center transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Compose News
        </button>
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-10 md:pb-0">
        
        {/* --- MOBILE COMPACT VIEW (DOCKET CARDS) --- */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {filteredNews.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">
               {news.length === 0 ? 'No news articles published yet.' : 'No articles match your search.'}
             </div>
          ) : (
            filteredNews.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-hidden">
                
                {/* Mobile Cover Image */}
                {item.image_url && (
                  <div className="h-32 bg-gray-100 relative border-b border-gray-100 shrink-0">
                    <img src={`${import.meta.env.VITE_API_URL}${item.image_url}`} alt="News Cover" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* Mobile Docket Header */}
                <div className="px-4 py-3 flex justify-between items-start gap-3 border-b border-gray-50">
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9B1C1C] mb-1 truncate">{item.category}</span>
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{item.title}</h4>
                    <span className="text-xs text-gray-500 mt-1">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Mobile Actions Footer */}
                <div className="px-4 py-3 bg-gray-50/50 flex justify-end gap-2 border-t border-gray-100">
                  <button 
                    onClick={() => openEditModal(item)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors shadow-sm text-red-700 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- DESKTOP VIEW (FORMAL TABLE) --- */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3 font-semibold">Article Details</th>
              <th className="px-6 py-3 font-semibold w-40">Category</th>
              <th className="px-6 py-3 font-semibold w-32">Published Date</th>
              <th className="px-6 py-3 font-semibold w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {filteredNews.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium text-sm">
                {news.length === 0 ? 'No news articles published yet.' : 'No articles match your search or filter.'}
              </td></tr>
            ) : (
              filteredNews.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  
                  {/* Article Details Column */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-4">
                      {/* Optional Thumbnail */}
                      <div className="w-20 h-14 bg-gray-100 rounded border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center text-gray-400">
                        {item.image_url ? (
                          <img src={`${import.meta.env.VITE_API_URL}${item.image_url}`} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <Newspaper className="w-5 h-5 opacity-40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 leading-snug truncate mb-1">{item.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{item.content}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category Column */}
                  <td className="px-6 py-4 align-top pt-5">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                      {item.category}
                    </span>
                  </td>

                  {/* Date Column */}
                  <td className="px-6 py-4 align-top pt-5 text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-center align-top pt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => openEditModal(item)} 
                        className="p-1.5 rounded border border-transparent text-gray-400 hover:text-[#9B1C1C] hover:bg-white hover:border-gray-200 hover:shadow-sm transition-colors" 
                        title="Edit Article"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="p-1.5 rounded border border-transparent text-gray-400 hover:text-red-600 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- CREATE NEWS MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base flex items-center">
                <Newspaper className="w-5 h-5 mr-2 text-gray-500" /> Compose New Article
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 bg-white">
              <form id="createNewsForm" onSubmit={handleCreateSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Headline Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                    <CustomSelect 
                      value={category} 
                      onChange={(val) => setCategory(val)} 
                      options={[
                        {value: 'Academics', label: 'Academics'},
                        {value: 'Campus Event', label: 'Campus Event'},
                        {value: 'Announcement', label: 'Announcement'},
                        {value: 'Achievement', label: 'Achievement'}
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1 text-gray-400" /> Cover Image (Optional)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} ref={fileInputRef} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-[42px] px-3 border border-gray-300 border-dashed rounded-md flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4 mr-2 text-gray-400" /> {image ? image.name : 'Select Image'}
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Article Content</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={6} className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors resize-none"></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" form="createNewsForm" disabled={loading} className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-colors">
                {loading ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT NEWS MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base flex items-center">
                <Edit className="w-5 h-5 mr-2 text-gray-500" /> Edit Article
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 bg-white">
              <form id="editNewsForm" onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Headline Title</label>
                    <input type="text" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                    <CustomSelect 
                      value={editData.category} 
                      onChange={(val) => setEditData({...editData, category: val})} 
                      options={[
                        {value: 'Academics', label: 'Academics'},
                        {value: 'Campus Event', label: 'Campus Event'},
                        {value: 'Announcement', label: 'Announcement'},
                        {value: 'Achievement', label: 'Achievement'}
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1 text-gray-400" /> Replace Image (Optional)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files?.[0] || null)} ref={editFileInputRef} className="hidden" />
                    <button type="button" onClick={() => editFileInputRef.current?.click()} className="w-full h-[42px] px-3 border border-gray-300 border-dashed rounded-md flex items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4 mr-2 text-gray-400" /> 
                      {editImage ? editImage.name : editData.existingImage ? 'Replace current image' : 'Select Image'}
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Article Content</label>
                    <textarea value={editData.content} onChange={(e) => setEditData({...editData, content: e.target.value})} required rows={6} className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors resize-none"></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" form="editNewsForm" disabled={loading} className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-colors flex items-center">
                <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};