import React, { useState } from 'react';
import { api } from '../services/api.js';
import { X } from 'lucide-react';

const AddMemberForm = ({ onClose, onMemberAdded, planOptions = [] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+252-61-123-4567',
    planId: '', // Required
    dateOfBirth: '',
    registrationFee: '', // Optional
    paymentMethod: 'cash', // Payment method
    // New fields for device integration & tracking
    registeredAt: new Date().toISOString().slice(0,10),
    external_person_id: '',
    photo_url: '',
    face_id: '' // Auto-generated face ID
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Stop camera when component unmounts
  React.useEffect(() => {
    return () => {
      try {
        if (cameraStream) {
          cameraStream.getTracks().forEach(t => t.stop());
        }
      } catch (_) {}
    };
  }, [cameraStream]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.planId) {
      newErrors.planId = 'Please select a membership plan';
    }
    
    // Photo is required for face ID
    if (!snapshotDataUrl && !formData.photo_url) {
      newErrors.photo = 'Photo is required for face identification';
    }

    // Optional field validation (only if provided)
    if (formData.registrationFee && isNaN(Number(formData.registrationFee))) {
      newErrors.registrationFee = 'Registration fee must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique face ID for this member
      const faceId = `FACE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // If no photo_url provided but snapshot available, upload it
      let photoUrl = formData.photo_url;
      if (!photoUrl && snapshotDataUrl) {
        const base64 = snapshotDataUrl;
        try {
          const uploadRes = await api.post('/uploads/base64', { imageBase64: base64 });
          const uploadJson = uploadRes?.data;
          if (uploadJson?.success && uploadJson?.data?.url) {
            photoUrl = uploadJson.data.url;
          }
        } catch (_) {}
      } else if (!photoUrl && canvasRef.current && videoRef.current && videoRef.current.videoWidth) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        try {
          const uploadRes = await api.post('/uploads/base64', { imageBase64: base64 });
          const uploadJson = uploadRes?.data;
          if (uploadJson?.success && uploadJson?.data?.url) {
            photoUrl = uploadJson.data.url;
          }
        } catch (_) {}
      }
      
      // Prepare data for submission
      const memberData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        planId: formData.planId,
        dateOfBirth: formData.dateOfBirth || null,
        // Optional fields removed
        registrationFee: formData.registrationFee ? Number(formData.registrationFee) : 0,
        paymentMethod: formData.paymentMethod || 'cash',
        // New backend fields
        registered_at: formData.registeredAt,
        external_person_id: formData.external_person_id || undefined,
        photo_url: photoUrl || formData.photo_url || snapshotDataUrl || undefined,
        face_id: faceId // Auto-generated face ID for recognition
      };
      
      console.log('📸 Submitting member with photo_url:', memberData.photo_url);

      await onMemberAdded(memberData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to create member. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Member ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Member ID
          </label>
          <input 
            type="text" 
            value="Auto-generated by DB" 
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" 
          />
        </div>

        {/* First Name - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name *
          </label>
          <input 
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name *
          </label>
          <input 
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
          )}
        </div>

        

        {/* Phone - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone *
          </label>
          <input 
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
          )}
        </div>

        {/* Membership Type - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Membership Type *
          </label>
          <select 
            name="planId"
            value={formData.planId}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.planId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">Select a plan</option>
            {planOptions.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          {errors.planId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.planId}</p>
          )}
        </div>

        {/* Date of Registration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date of Registration
          </label>
          <input 
            name="registeredAt"
            type="date"
            value={formData.registeredAt}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Registration Fee - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Registration Fee ($)
          </label>
          <input 
            name="registrationFee"
            type="number"
            value={formData.registrationFee}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.registrationFee ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="e.g. 10"
            min="0"
            step="0.01"
          />
          {errors.registrationFee && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.registrationFee}</p>
          )}
        </div>

            {/* Payment Method - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="EVC-PLUS">EVC-PLUS</option>
                <option value="E-DAHAB">E-DAHAB</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

        {/* External Person ID (Device Person no.) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            External Person ID (Device Person no.)
          </label>
          <input 
            name="external_person_id"
            type="text"
            value={formData.external_person_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g. 712"
          />
        </div>

        {/* Photo capture - Required for Face ID */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Photo <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Required for Face ID)</span>
          </label>
          <div className="flex items-center gap-3">
            <video ref={videoRef} className="w-36 h-24 bg-black rounded object-cover" autoPlay playsInline muted />
            {snapshotDataUrl ? (
              <img src={snapshotDataUrl} alt="Snapshot" className="w-36 h-24 rounded object-cover border border-gray-200 dark:border-gray-600" />
            ) : (
              <div className="w-36 h-24 rounded bg-gray-100 dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500">
                No snapshot
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={async () => {
              try {
                if (cameraStream) {
                  try { cameraStream.getTracks().forEach(t => t.stop()); } catch (_) {}
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setCameraStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
              } catch (e) { /* ignore */ }
            }} className="px-3 py-1 rounded bg-gray-600 text-white">Open Camera</button>
            <button type="button" onClick={async () => {
              if (canvasRef.current && videoRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                try {
                  const data = canvas.toDataURL('image/jpeg', 0.9);
                  setSnapshotDataUrl(data);
                  console.log('📸 Snapshot taken, uploading...');
                  
                  // Auto-upload and fill photo_url
                  setUploadingPhoto(true);
                  try {
                    const uploadRes = await api.post('/uploads/base64', { imageBase64: data });
                    const uploadJson = uploadRes?.data;
                    if (uploadJson?.success && uploadJson?.data?.url) {
                      setFormData(prev => ({ ...prev, photo_url: uploadJson.data.url }));
                      console.log('✅ Photo uploaded successfully:', uploadJson.data.url);
                    }
                  } catch (error) {
                    console.error('❌ Photo upload failed:', error);
                  }
                  setUploadingPhoto(false);
                  // Stop camera after snapshot
                  try { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()); } catch (_) {}
                } catch (error) {
                  console.error('❌ Snapshot failed:', error);
                }
              }
            }} className="px-3 py-1 rounded bg-blue-600 text-white">Take Snapshot</button>
          </div>
          <div>
            <input name="photo_url" type="url" value={formData.photo_url} onChange={handleInputChange} placeholder="https://.../member.jpg" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            <p className="text-xs text-gray-500 mt-1">
              <strong>Face ID:</strong> This photo will be automatically saved and used for face recognition. 
              {uploadingPhoto ? ' Uploading photo…' : ' Take a clear snapshot for best recognition.'}
            </p>
            {errors.photo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.photo}</p>
            )}
          </div>
        </div>

      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{isSubmitting ? 'Creating...' : 'Create Member'}</span>
        </button>
      </div>
    </form>
  );
};

export default AddMemberForm;
