import React, { useState, useEffect, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Plus, Trash2, Calendar, Clock, DollarSign, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ServiceInput {
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    currency: string;
}

interface RequestModalProps {
    projectId: number;
    projectName: string;
    userEmail: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function RequestModal({
    projectId,
    projectName,
    userEmail,
    isOpen,
    onClose,
}: RequestModalProps) {
    const [services, setServices] = useState<ServiceInput[]>([
        { name: '', description: '', duration_minutes: 30, price: 50, currency: 'USD' },
    ]);

    const [operatingDays, setOperatingDays] = useState<number[]>([1, 2, 3, 4, 5]);

    const { data, setData, post, processing, errors, reset } = useForm({
        notification_email: userEmail || '',
        operating_hours: {
            start_time: '09:00',
            end_time: '17:00',
            days: [1, 2, 3, 4, 5],
        },
        services: services,
        notes: '',
    });

    useEffect(() => {
        if (userEmail && !data.notification_email) {
            setData('notification_email', userEmail);
        }
    }, [userEmail]);

    if (!isOpen) return null;

    const daysList = [
        { id: 1, label: 'Mon' },
        { id: 2, label: 'Tue' },
        { id: 3, label: 'Wed' },
        { id: 4, label: 'Thu' },
        { id: 5, label: 'Fri' },
        { id: 6, label: 'Sat' },
        { id: 7, label: 'Sun' },
    ];

    const toggleDay = (dayId: number) => {
        const updatedDays = operatingDays.includes(dayId)
            ? operatingDays.filter((d) => d !== dayId)
            : [...operatingDays, dayId].sort();
        setOperatingDays(updatedDays);
        setData('operating_hours', {
            ...data.operating_hours,
            days: updatedDays,
        });
    };

    const addServiceRow = () => {
        const updated = [
            ...services,
            { name: '', description: '', duration_minutes: 30, price: 0, currency: 'USD' },
        ];
        setServices(updated);
        setData('services', updated);
    };

    const removeServiceRow = (index: number) => {
        if (services.length <= 1) return;
        const updated = services.filter((_, i) => i !== index);
        setServices(updated);
        setData('services', updated);
    };

    const updateServiceField = (index: number, field: keyof ServiceInput, value: any) => {
        const updated = [...services];
        updated[index] = { ...updated[index], [field]: value };
        setServices(updated);
        setData('services', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/projects/${projectId}/booking-request`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                Request Booking Feature
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Configure your services and schedule for {projectName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Notification Email */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                            Booking Alert Notification Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                            <input
                                type="email"
                                required
                                value={data.notification_email}
                                onChange={(e) => setData('notification_email', e.target.value)}
                                placeholder="appointments@yourdomain.com"
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {errors.notification_email && (
                            <p className="text-xs text-red-500 mt-1">{errors.notification_email}</p>
                        )}
                    </div>

                    {/* Operating Hours & Days */}
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Default Operating Schedule</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={data.operating_hours.start_time}
                                    onChange={(e) =>
                                        setData('operating_hours', {
                                            ...data.operating_hours,
                                            start_time: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={data.operating_hours.end_time}
                                    onChange={(e) =>
                                        setData('operating_hours', {
                                            ...data.operating_hours,
                                            end_time: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                                Operating Days
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {daysList.map((day) => {
                                    const isSelected = operatingDays.includes(day.id);
                                    return (
                                        <button
                                            type="button"
                                            key={day.id}
                                            onClick={() => toggleDay(day.id)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                                isSelected
                                                    ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                                                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                                            }`}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Services and Pricing */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                Services & Pricing *
                            </label>
                            <button
                                type="button"
                                onClick={addServiceRow}
                                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Service
                            </button>
                        </div>

                        <div className="space-y-3">
                            {services.map((svc, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 relative space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Service Name (e.g. 60-Min Consultation)"
                                            value={svc.name}
                                            onChange={(e) => updateServiceField(idx, 'name', e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                        />
                                        {services.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeServiceRow(idx)}
                                                className="p-1.5 text-neutral-400 hover:text-red-500 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                                Duration (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                min={5}
                                                max={480}
                                                step={5}
                                                required
                                                value={svc.duration_minutes}
                                                onChange={(e) =>
                                                    updateServiceField(idx, 'duration_minutes', parseInt(e.target.value) || 30)
                                                }
                                                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                                Price ($ USD)
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                step={0.01}
                                                required
                                                value={svc.price}
                                                onChange={(e) =>
                                                    updateServiceField(idx, 'price', parseFloat(e.target.value) || 0)
                                                }
                                                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Optional description of this service..."
                                        value={svc.description}
                                        onChange={(e) => updateServiceField(idx, 'description', e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                            Additional Instructions or Notes (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Any special booking requirements or integration questions..."
                            className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-sm disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
