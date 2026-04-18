/**
 * useSubmitRequest — wired to real Laravel API.
 * Calls POST /resident/tickets and invalidates React Query cache.
 */

import { useState, useRef, useCallback } from 'react';
import { TICKET_CATEGORIES } from '../../../constants/tickets';
import { useSubmitTicket } from '../../../hooks/useTicketApi';
import { useTickets } from '../../../store/TicketStore';
import useAuthStore from '../../../stores/authStore';

export const WIZARD_STEPS = ['Category', 'Details', 'Location', 'Review'];

const INITIAL_FORM = {
  category:    '',
  description: '',
  location:    '',
  severity:    'Medium',
};

export function useSubmitRequest() {
  const { mutateAsync: submitToApi, isPending } = useSubmitTicket();
  const { notifyNewTicket } = useTickets();
  const { user } = useAuthStore();

  const [step,      setStep]      = useState(0);
  const [form,      setForm]      = useState(INITIAL_FORM);
  const [images,    setImages]    = useState([]);
  const [submitted, setSubmitted] = useState(null);
  const [error,     setError]     = useState(null);
  const fileInputRef              = useRef(null);

  const setField = useCallback((key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isStepValid = useCallback(() => {
    if (step === 0) return form.category !== '';
    if (step === 1) return form.description.length > 10;
    if (step === 2) return form.location.trim() !== '';
    return true;
  }, [step, form]);

  const addImages = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const newImgs = files
      .filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf')
      .slice(0, 5 - images.length)
      .map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name, size: f.size, type: f.type }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 5));
    if (e.target) e.target.value = '';
  }, [images.length]);

  const removeImage = useCallback((idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      addImages({ target: { files: e.dataTransfer.files, value: '' } });
    }
  }, [addImages]);

  const goNext = useCallback(() => {
    if (isStepValid() && step < WIZARD_STEPS.length - 1) setStep((s) => s + 1);
  }, [isStepValid, step]);

  const goBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const categoryLabel = TICKET_CATEGORIES.find(c => c.id === form.category)?.label || form.category;
      const title = `${categoryLabel} — ${form.location}`;

      const { data } = await submitToApi({
        title,
        description: form.description,
        category:    categoryLabel,
        location:    form.location,
        severity:    form.severity,
        images:      [], // file upload handled separately
      });

      const trackingId = data.data.trackingId;
      notifyNewTicket(trackingId, title);
      setSubmitted({ ...form, trackingId });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    }
  }, [form, submitToApi, notifyNewTicket]);

  const reset = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setStep(0);
    setForm(INITIAL_FORM);
    setImages([]);
    setSubmitted(null);
    setError(null);
  }, [images]);

  const getCategoryLabel = useCallback(() => {
    return TICKET_CATEGORIES.find((c) => c.id === form.category)?.label || form.category;
  }, [form.category]);

  return {
    step, form, images, submitted, error, isSubmitting: isPending,
    fileInputRef,
    setField, isStepValid,
    addImages, removeImage, handleDrop,
    goNext, goBack, handleSubmit, reset,
    getCategoryLabel,
  };
}
