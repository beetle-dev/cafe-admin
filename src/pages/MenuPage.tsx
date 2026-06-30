import { useEffect, useRef, useState } from 'react';
import { Plus, Image, Search, Tag, X, Upload, GripVertical } from 'lucide-react';
import { getMenus, createMenu, updateMenu, getMenuCategories, createMenuCategory, updateMenuCategory } from '../api/menu';
import type { MenuResDto, MenuCategoryResDto } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Loading } from '../components/common/Loading';
import { useForm } from 'react-hook-form';

interface MenuForm {
  name: string;
  description: string;
  price: number;
  cost: number;
  menuCategoryId: number;
  isActive: boolean;
}

interface CategoryForm { name: string; sortOrder: number; }

export function MenuPage() {
  const [menus, setMenus] = useState<MenuResDto[]>([]);
  const [categories, setCategories] = useState<MenuCategoryResDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<number | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [editMenu, setEditMenu] = useState<MenuResDto | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const dragCatId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MenuForm>();
  const { register: regCat, handleSubmit: hsCat, reset: resetCat } = useForm<CategoryForm>();

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await getMenus({ page, size: 12, name: search || undefined, menuCategoryId: catFilter });
      if (res.data) {
        setMenus(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const res = await getMenuCategories().catch(() => null);
    if (res?.data) setCategories([...res.data.content].sort((a, b) => a.sortOrder - b.sortOrder));
  };

  useEffect(() => { fetchMenus(); }, [page, catFilter]);
  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    reset({ isActive: true });
    setImageFile(null);
    setImagePreview(null);
    setDeleteImage(false);
    setShowCreate(true);
  };
  const openEdit = (menu: MenuResDto) => {
    setEditMenu(menu);
    setImageFile(null);
    setImagePreview(menu.imageUrl ?? null);
    setDeleteImage(false);
    setShowCreate(true);
  };

  useEffect(() => {
    if (!showCreate || !editMenu) return;
    setValue('name', editMenu.name);
    setValue('description', editMenu.description);
    setValue('price', editMenu.price.toLocaleString() as unknown as number);
    setValue('cost', editMenu.cost ? editMenu.cost.toLocaleString() as unknown as number : 0);
    setValue('menuCategoryId', editMenu.menuCategoryId);
    setValue('isActive', editMenu.isActive);
  }, [showCreate, editMenu]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setDeleteImage(false);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleImageDelete = () => {
    setImageFile(null);
    setImagePreview(null);
    setDeleteImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const buildFormData = (data: MenuForm) => {
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('description', data.description ?? '');
    fd.append('price', String(data.price));
    fd.append('cost', String(data.cost ?? 0));
    fd.append('menuCategoryId', String(data.menuCategoryId));
    fd.append('isActive', String(data.isActive ?? true));
    if (imageFile) fd.append('image', imageFile);
    if (deleteImage) fd.append('deleteImage', 'true');
    return fd;
  };

  const onSubmit = async (data: MenuForm) => {
    setSaving(true);
    try {
      const fd = buildFormData(data);
      if (editMenu) {
        await updateMenu(editMenu.id, fd);
      } else {
        await createMenu(fd);
      }
      setShowCreate(false);
      setEditMenu(null);
      fetchMenus();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '저장에 실패했습니다.');
    } finally { setSaving(false); }
  };

  const onCreateCategory = async (data: CategoryForm) => {
    try {
      await createMenuCategory({ name: data.name, sortOrder: data.sortOrder, isActive: true });
      resetCat();
      fetchCategories();
      alert('카테고리가 생성되었습니다.');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '생성에 실패했습니다.');
    }
  };

  const handleSearch = () => { setPage(0); fetchMenus(); };

  const onToggleCategory = async (c: MenuCategoryResDto) => {
    const nextActive = !c.isActive;
    setCategories((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: nextActive } : x));
    try {
      await updateMenuCategory(c.id, { name: c.name, sortOrder: c.sortOrder, isActive: nextActive });
    } catch (e: unknown) {
      setCategories((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: c.isActive } : x));
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '변경에 실패했습니다.');
    }
  };

  const startEditCategory = (c: MenuCategoryResDto) => {
    setEditingCatId(c.id);
    setEditingCatName(c.name);
  };

  const saveEditCategory = async (c: MenuCategoryResDto) => {
    const name = editingCatName.trim();
    setEditingCatId(null);
    if (!name || name === c.name) return;
    setCategories((prev) => prev.map((x) => x.id === c.id ? { ...x, name } : x));
    try {
      await updateMenuCategory(c.id, { name, sortOrder: c.sortOrder, isActive: c.isActive });
    } catch (e: unknown) {
      setCategories((prev) => prev.map((x) => x.id === c.id ? { ...x, name: c.name } : x));
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '이름 변경에 실패했습니다.');
    }
  };

  const handleCatDrop = async (targetId: number) => {
    const sourceId = dragCatId.current;
    dragCatId.current = null;
    if (sourceId == null || sourceId === targetId) return;

    const prevCategories = categories;
    const reordered = [...categories];
    const fromIdx = reordered.findIndex((c) => c.id === sourceId);
    const toIdx = reordered.findIndex((c) => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const resequenced = reordered.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    setCategories(resequenced);

    try {
      await Promise.all(resequenced.map((c) =>
        updateMenuCategory(c.id, { name: c.name, sortOrder: c.sortOrder, isActive: c.isActive })
      ));
    } catch (e: unknown) {
      setCategories(prevCategories);
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '순서 변경에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">메뉴 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">메뉴 등록, 수정, 이미지 관리</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategory(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">
            <Tag size={15} /> 카테고리
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
            style={{ backgroundColor: '#3454D0' }}>
            <Plus size={15} /> 메뉴 추가
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => { setCatFilter(undefined); setPage(0); }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!catFilter ? 'bg-[#3454D0] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            전체
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => { setCatFilter(c.id); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${catFilter === c.id ? 'bg-[#3454D0] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="메뉴 이름 검색..." className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
        </div>
      </div>

      {loading ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menus.length === 0 ? (
              <div className="col-span-4 text-center py-16 text-gray-400">메뉴가 없습니다</div>
            ) : menus.map((menu) => (
              <div key={menu.id} onClick={() => openEdit(menu)}
                className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  {menu.imageUrl ? (
                    <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Image size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={menu.isActive ? 'success' : 'danger'}>
                      {menu.isActive ? '판매중' : '판매중지'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{menu.menuCategory}</p>
                  <p className="font-semibold text-gray-900 text-sm">{menu.name}</p>
                  {menu.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{menu.description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <p className="font-bold text-sm" style={{ color: '#3454D0' }}>{menu.price.toLocaleString()}원</p>
                    {menu.cost > 0 && <p className="text-xs text-gray-400">원가 {menu.cost.toLocaleString()}원</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm">
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setEditMenu(null); }}
        title={editMenu ? '메뉴 수정' : '메뉴 추가'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">메뉴 이름 *</label>
              <input {...register('name', { required: true })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
              {errors.name && <p className="text-red-500 text-xs mt-1">필수 입력</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">카테고리 *</label>
              <select {...register('menuCategoryId', { required: true, valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]">
                <option value="">선택</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.menuCategoryId && <p className="text-red-500 text-xs mt-1">필수 선택</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">설명</label>
            <textarea {...register('description')} rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">판매가 (원) *</label>
              <input type="text" inputMode="numeric" {...register('price', {
                required: true,
                setValueAs: (v) => Number(String(v).replace(/[^0-9]/g, '')) || 0,
                onChange: (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','); },
              })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">원가 (원)</label>
              <input type="text" inputMode="numeric" {...register('cost', {
                setValueAs: (v) => Number(String(v).replace(/[^0-9]/g, '')) || 0,
                onChange: (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','); },
              })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">이미지</label>
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100">
                    <Upload size={14} /> 변경
                  </button>
                  <button type="button" onClick={handleImageDelete}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500 rounded-lg text-sm font-medium text-white hover:bg-red-600">
                    <X size={14} /> 삭제
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#3454D0] hover:text-[#3454D0] transition-colors bg-gray-50">
                <Upload size={24} />
                <span className="text-sm">클릭하여 이미지 업로드</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} className="rounded" />
            <label htmlFor="isActive" className="text-sm text-gray-700">판매중</label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); setEditMenu(null); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">
              취소
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#3454D0' }}>
              {saving ? '저장중...' : '저장'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showCategory} onClose={() => setShowCategory(false)} title="카테고리 관리" size="sm">
        <div className="space-y-4">
          <form onSubmit={hsCat(onCreateCategory)} className="flex gap-2">
            <input {...regCat('name', { required: true })} placeholder="카테고리 이름"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            <input type="number" {...regCat('sortOrder', { valueAsNumber: true })} placeholder="순서"
              className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            <button type="submit" className="px-3 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#3454D0' }}>추가</button>
          </form>
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id}
                draggable
                onDragStart={() => { dragCatId.current = c.id; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleCatDrop(c.id)}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-grab active:cursor-grabbing">
                <GripVertical size={14} className="text-gray-400 shrink-0" />
                {editingCatId === c.id ? (
                  <input
                    autoFocus
                    value={editingCatName}
                    onChange={(e) => setEditingCatName(e.target.value)}
                    onBlur={() => saveEditCategory(c)}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingCatId(null); }}
                    className="flex-1 px-2 py-1 border border-[#3454D0] rounded-lg text-sm outline-none"
                  />
                ) : (
                  <span onClick={() => startEditCategory(c)}
                    className="flex-1 text-sm font-medium text-gray-900 cursor-text hover:underline">
                    {c.name}
                  </span>
                )}
                <button type="button" onClick={() => onToggleCategory(c)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                    c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                  <span className={`w-8 h-[18px] rounded-full relative transition-colors ${c.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${c.isActive ? 'left-[17px]' : 'left-0.5'}`} />
                  </span>
                  {c.isActive ? '활성' : '비활성'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
