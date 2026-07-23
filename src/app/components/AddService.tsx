import React, { useState, useEffect } from 'react';
import { useApp, Service } from '../context/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { NumericInput } from './ui/numeric-input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { ChevronLeft, CircleCheck, Check, Edit2, Plus, Trash2 } from 'lucide-react';
import { DatePickerInput } from './ui/date-picker';
import { motion, AnimatePresence } from 'motion/react';
import { itemsService, type Item } from '../../lib/services';

interface AddServiceProps {
  onSuccess?: () => void;
  reminderId?: string | null;
  editingServiceId?: string | null;
}

export const AddService: React.FC<AddServiceProps> = ({ onSuccess, reminderId, editingServiceId }) => {
  const { t, cars, addService, updateService, addReminder, deleteReminder, language, services, reminders } = useApp();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [rootItems, setRootItems] = useState<Item[]>([]);
  const [categoryItems, setCategoryItems] = useState<Item[]>([]);
  const [rootsLoading, setRootsLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [customItem, setCustomItem] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [mode, setMode] = useState<'completed' | 'reminder'>('completed');
  const [formData, setFormData] = useState<Partial<Omit<Service, 'id'>>>(({
    carId: '',
    type: 'general',
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    cost: 0,
    notes: '',
    serviceItems: [],
    nextServiceType: undefined,
    nextServiceValue: undefined,
    reminderNote: '',
  }));

  const selectedParentId = formData.type || rootItems[0]?.id || '';

  useEffect(() => {
    let cancelled = false;
    const loadRoots = async () => {
      setRootsLoading(true);
      try {
        const roots = await itemsService.listRoots();
        if (cancelled) return;
        setRootItems(roots);
        setFormData((prev) => {
          if (prev.type && roots.some((root) => root.id === prev.type)) return prev;
          return { ...prev, type: roots[0]?.id || '' };
        });
      } catch {
        if (!cancelled) setRootItems([]);
        toast.error('Failed to load service categories. Please try again.');
      } finally {
        if (!cancelled) setRootsLoading(false);
      }
    };
    loadRoots();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadItems = async () => {
      setItemsLoading(true);
      try {
        if (!selectedParentId) {
          if (!cancelled) setCategoryItems([]);
          return;
        }
        const items = await itemsService.listChildren(selectedParentId);
        if (!cancelled) setCategoryItems(items);
      } catch {
        if (!cancelled) setCategoryItems([]);
        toast.error('Failed to load service items. Please try again.');
      } finally {
        if (!cancelled) setItemsLoading(false);
      }
    };
    loadItems();
    return () => { cancelled = true; };
  }, [selectedParentId]);


  // Pre-fill data from a reminder and start at service item selection.
  useEffect(() => {
    if (reminderId) {
      const reminder = reminders.find(r => r.id === reminderId);
      if (reminder) {
        setFormData({
          carId: reminder.carId,
          type: reminder.type,
          date: new Date().toISOString().split('T')[0],
          mileage: 0,
          cost: 0,
          notes: '',
          serviceItems: [],
          nextServiceType: undefined,
          nextServiceValue: undefined,
          reminderNote: '',
        });
        setMode('completed');
        setStep(3);
      }
    }
  }, [reminderId, reminders]);

  // Pre-fill data from editing service
  useEffect(() => {
    if (editingServiceId) {
      const editingService = services.find(s => s.id === editingServiceId);
      if (editingService) {
        setFormData({
          carId: editingService.carId,
          type: editingService.type,
          date: editingService.date,
          mileage: editingService.mileage,
          cost: editingService.cost,
          notes: editingService.notes,
          serviceItems: editingService.serviceItems,
          nextServiceType: editingService.nextServiceType,
          nextServiceValue: editingService.nextServiceValue,
          reminderNote: editingService.reminderNote,
        });
        setSelectedItems(editingService.serviceItems || []);
        setMode('completed');
        setStep(3); // Skip mode selection and car/type (pre-filled)
      }
    }
  }, [editingServiceId, services]);

  // Reset selected items when service type changes
  useEffect(() => {
    if (!editingServiceId) {
      setSelectedItems([]);
    }
    setShowCustomInput(false);
    setCustomItem('');
  }, [formData.type, editingServiceId]);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const addCustomServiceItem = async () => {
    const name = customItem.trim();
    if (!name) return;
    const existing = categoryItems.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (existing) {
      setSelectedItems(prev => prev.includes(existing.id) ? prev : [...prev, existing.id]);
      setCustomItem('');
      setShowCustomInput(false);
      return;
    }
    try {
      const createdItem = await itemsService.create({ name, parentId: selectedParentId });
      setCategoryItems(prev => [...prev, createdItem]);
      setSelectedItems(prev => prev.includes(createdItem.id) ? prev : [...prev, createdItem.id]);
      setCustomItem('');
      setShowCustomInput(false);
    } catch {
      toast.error('Failed to create custom item. Please try again.');
    }
  };

  const editCustomServiceItem = async (item: Item) => {
    if (item.userId === null) return;
    const name = window.prompt(language === 'fa' ? 'نام مورد سفارشی' : 'Custom item name', item.name)?.trim();
    if (!name || name === item.name) return;
    try {
      const updated = await itemsService.update(item.id, { name });
      setCategoryItems((prev) => prev.map((current) => (current.id === item.id ? updated : current)));
    } catch {
      toast.error('Failed to update custom item. Please try again.');
    }
  };

  const deleteCustomServiceItem = async (item: Item) => {
    if (item.userId === null) return;
    if (!window.confirm(language === 'fa' ? 'این مورد حذف شود؟' : 'Delete this custom item?')) return;
    try {
      await itemsService.remove(item.id);
      setCategoryItems((prev) => prev.filter((current) => current.id !== item.id));
      setSelectedItems((prev) => prev.filter((id) => id !== item.id));
    } catch {
      toast.error('Failed to delete custom item. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      carId: '', type: rootItems[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      mileage: 0, cost: 0, notes: '',
      serviceItems: [], nextServiceType: undefined,
      nextServiceValue: undefined, reminderNote: '',
    });
    setStep(1);
    setMode('completed');
  };

  const selectedParentName = rootItems.find((root) => root.id === selectedParentId)?.name;

  const handleSubmit = async (overrides: Partial<Omit<Service, 'id'>> = {}) => {
    const submissionData = { ...formData, ...overrides };
    if (!submissionData.carId || !submissionData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingServiceId) {
        await updateService(editingServiceId, { ...submissionData, type: selectedParentId, typeName: selectedParentName, serviceItems: Array.from(new Set(selectedItems)) } as Omit<Service, 'id'>);
      } else {
        await addService({ ...submissionData, type: selectedParentId, typeName: selectedParentName, serviceItems: Array.from(new Set(selectedItems)) } as Omit<Service, 'id'>);
        if (reminderId) {
          await deleteReminder(reminderId);
        }
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch {
      toast.error('Failed to save service. Please try again.');
    }
  };

  const handleReminderSubmit = async () => {
    if (!formData.carId || !formData.type || !formData.nextServiceType || !formData.nextServiceValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addReminder({
        carId: formData.carId!,
        type: selectedParentId,
        reminderType: formData.nextServiceType!,
        reminderValue: formData.nextServiceValue!,
        reminderNote: formData.reminderNote || '',
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch {
      toast.error('Failed to save reminder. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/70">
        <div className="relative flex items-center justify-center px-4 py-4">
          {/* Back button - positioned at start (left for LTR, right for RTL) */}
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="absolute start-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronLeft className={`h-5 w-5 ${language === 'fa' ? 'rotate-180' : ''}`} />
            </button>
          )}
          {/* Title - always centered */}
          <h1 className="text-foreground font-semibold">{t('addService')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          {/* Step 1: Mode Selection (Only show when not editing/from reminder) */}
          {step === 1 && !editingServiceId && !reminderId && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-2">{language === 'fa' ? 'نوع ثبت' : 'Record Type'}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'fa'
                    ? 'لطفاً نوع ثبت را انتخاب کنید'
                    : 'Please select the type of record'}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setMode('completed');
                    setStep(2);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    mode === 'completed'
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    mode === 'completed' ? 'border-primary' : 'border-border/70'
                  }`}>
                    {mode === 'completed' && <div className="h-3 w-3 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 text-start">
                    <div className="font-medium">{t('recordCompletedService')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {language === 'fa' ? 'ثبت اطلاعات سرویس انجام شده' : 'Record completed service details'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMode('reminder');
                    setStep(2);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    mode === 'reminder'
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    mode === 'reminder' ? 'border-primary' : 'border-border/70'
                  }`}>
                    {mode === 'reminder' && <div className="h-3 w-3 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 text-start">
                    <div className="font-medium">{t('recordReminderOnly')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {language === 'fa' ? 'فقط ثبت یادآوری برای سرویس آتی' : 'Only record a reminder for future service'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Car and Service Type */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="car">{t('selectCar')}</Label>
                <select
                  id="car"
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-secondary border border-border/70 text-foreground"
                  value={formData.carId}
                  onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                >
                  <option value="">{t('selectCar')}</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.name} - {car.licensePlate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>{t('selectServiceType')}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {rootsLoading && (
                    <div className="col-span-2 p-4 rounded-xl bg-secondary text-sm text-muted-foreground">
                      {language === 'fa' ? 'در حال بارگذاری...' : 'Loading service categories...'}
                    </div>
                  )}
                  {rootItems.map((root) => (
                    <button
                      key={root.id}
                      onClick={() => setFormData({ ...formData, type: root.id })}
                      className={`py-3 px-4 rounded-xl border transition-all ${
                        selectedParentId === root.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                      }`}
                    >
                      {root.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep(3)}
                disabled={!formData.carId || !selectedParentId}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {t('nextStep')}
              </Button>
            </div>
          )}

          {/* Step 3: Service Items OR Reminder (based on mode) */}
          {step === 3 && mode === 'reminder' && (
            <div className="space-y-6">
              <h3 className="font-medium">{t('nextServiceReminder')}</h3>

              <div>
                <Label>{t('reminderType')}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={() => setFormData({ ...formData, nextServiceType: 'date', nextServiceValue: '' })}
                    className={`py-3 px-4 rounded-xl border transition-all ${
                      formData.nextServiceType === 'date'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                    }`}
                  >
                    {t('byDate')}
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, nextServiceType: 'mileage', nextServiceValue: 0 })}
                    className={`py-3 px-4 rounded-xl border transition-all ${
                      formData.nextServiceType === 'mileage'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                    }`}
                  >
                    {t('byMileage')}
                  </button>
                </div>
              </div>

              {formData.nextServiceType === 'date' && (
                <div>
                  <Label htmlFor="nextDate">{t('serviceDate')}</Label>
                  <DatePickerInput
                    value={formData.nextServiceValue as string}
                    onChange={(date) => setFormData({ ...formData, nextServiceValue: date })}
                    language={language}
                    className="mt-2"
                  />
                </div>
              )}

              {formData.nextServiceType === 'mileage' && (
                <div>
                  <Label htmlFor="nextMileage">{t('carMileage')}</Label>
                  <NumericInput
                    id="nextMileage"
                    value={formData.nextServiceValue as number}
                    onChange={(value) => setFormData({ ...formData, nextServiceValue: value })}
                    className="mt-2"
                  />
                </div>
              )}

              {formData.nextServiceType && (
                <div>
                  <Label htmlFor="reminderNote">{t('reminderNote')}</Label>
                  <Textarea
                    id="reminderNote"
                    value={formData.reminderNote}
                    onChange={(e) => setFormData({ ...formData, reminderNote: e.target.value })}
                    className="mt-2"
                    rows={2}
                    placeholder={language === 'fa' ? 'مثلاً: تعویض روغن و فیلتر' : 'e.g., Oil change and filter'}
                  />
                </div>
              )}

              <Button
                onClick={handleReminderSubmit}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!formData.nextServiceType || !formData.nextServiceValue}
              >
                {t('save')}
              </Button>
            </div>
          )}

          {/* Step 3: Service Items (only for completed mode) */}
          {step === 3 && mode === 'completed' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-foreground mb-1">{t('selectServiceItems')}</h3>
                <p className="text-sm text-muted-foreground">{t('serviceItemsOptional')}</p>
              </div>

              {/* Predefined Items */}
              <div className="space-y-2">
                {itemsLoading && (
                  <div className="p-4 rounded-xl bg-secondary text-sm text-muted-foreground">
                    {language === 'fa' ? 'در حال بارگذاری...' : 'Loading service items...'}
                  </div>
                )}
                {categoryItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-foreground'
                          : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary border-primary' : 'border-border/70'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                      </div>
                      <span className="flex-1 text-start">{item.name}</span>
                      {item.userId && (
                        <span className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                          <button type="button" onClick={() => editCustomServiceItem(item)} className="p-1 rounded hover:bg-accent" aria-label={language === 'fa' ? 'ویرایش' : 'Edit'}>
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => deleteCustomServiceItem(item)} className="p-1 rounded hover:bg-accent" aria-label={language === 'fa' ? 'حذف' : 'Delete'}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </span>
                      )}
                    </button>
                  );
                })}
                
              </div>

              {/* Add Custom Item */}
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/70 text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('addCustomItem')}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    placeholder={t('customItemPlaceholder')}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomServiceItem();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={addCustomServiceItem}
                    className="bg-primary hover:bg-primary/90"
                    disabled={!customItem.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomItem('');
                    }}
                    variant="outline"
                  >
                    {t('cancel')}
                  </Button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedItems([]);
                    setFormData({ ...formData, serviceItems: [] });
                    setStep(4);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t('skipItems')}
                </Button>
                <Button
                  onClick={() => {
                    setFormData({ ...formData, serviceItems: selectedItems });
                    setStep(4);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {t('nextStep')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Service Details */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="date">{t('serviceDate')}</Label>
                <DatePickerInput
                  value={formData.date || ''}
                  onChange={(date) => setFormData({ ...formData, date })}
                  language={language}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="mileage">{t('carMileage')}</Label>
                <NumericInput
                  id="mileage"
                  value={formData.mileage}
                  onChange={(value) => setFormData({ ...formData, mileage: value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="cost">{t('serviceCost')}</Label>
                <NumericInput
                  id="cost"
                  value={formData.cost}
                  onChange={(value) => setFormData({ ...formData, cost: value })}
                  className="mt-2"
                  allowDecimal={true}
                />
              </div>

              <div>
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-2"
                  rows={3}
                  placeholder={t('notes')}
                />
              </div>

              <Button
                onClick={() => setStep(5)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {t('nextStep')}
              </Button>
            </div>
          )}

          {/* Step 5: Reminder */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="font-medium">{t('nextServiceReminder')}</h3>

              <div>
                <Label>{t('reminderType')}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={() => setFormData({ ...formData, nextServiceType: 'date', nextServiceValue: '' })}
                    className={`py-3 px-4 rounded-xl border transition-all ${
                      formData.nextServiceType === 'date'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                    }`}
                  >
                    {t('byDate')}
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, nextServiceType: 'mileage', nextServiceValue: 0 })}
                    className={`py-3 px-4 rounded-xl border transition-all ${
                      formData.nextServiceType === 'mileage'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary border-border/70 text-foreground hover:border-primary/50'
                    }`}
                  >
                    {t('byMileage')}
                  </button>
                </div>
              </div>

              {formData.nextServiceType === 'date' && (
                <div>
                  <Label htmlFor="nextDate">{t('serviceDate')}</Label>
                  <DatePickerInput
                    value={formData.nextServiceValue as string}
                    onChange={(date) => setFormData({ ...formData, nextServiceValue: date })}
                    language={language}
                    className="mt-2"
                  />
                </div>
              )}

              {formData.nextServiceType === 'mileage' && (
                <div>
                  <Label htmlFor="nextMileage">{t('carMileage')}</Label>
                  <NumericInput
                    id="nextMileage"
                    value={formData.nextServiceValue as number}
                    onChange={(value) => setFormData({ ...formData, nextServiceValue: value })}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Reminder Note - only show if a reminder type is selected */}
              {formData.nextServiceType && (
                <div>
                  <Label htmlFor="reminderNote">{t('reminderNote')}</Label>
                  <Textarea
                    id="reminderNote"
                    value={formData.reminderNote}
                    onChange={(e) => setFormData({ ...formData, reminderNote: e.target.value })}
                    className="mt-2"
                    rows={2}
                    placeholder={language === 'fa' ? 'مثلاً: تعویض روغن و فیلتر' : 'e.g., Oil change and filter'}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    handleSubmit({ nextServiceType: undefined, nextServiceValue: undefined, reminderNote: '' });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t('skipReminder')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={formData.nextServiceType && !formData.nextServiceValue}
                >
                  {t('save')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ 
                duration: 0.5, 
                type: "spring", 
                stiffness: 200,
                damping: 20
              }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 150 }}
                  className="h-24 w-24 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-lg"
                >
                  <CircleCheck className="h-14 w-14 text-primary-foreground" strokeWidth={2.5} />
                </motion.div>
                {/* Pulse ring effect */}
                <motion.div
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-success"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
