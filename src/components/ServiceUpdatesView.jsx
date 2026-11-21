import React, { useState, useRef } from 'react';
import {
  Car, Phone, Share2, Camera, CheckCircle2, Clock, Sparkles,
  Plus, Trash2, Eye, FileText, ArrowRight, ShieldCheck, Droplets,
  ExternalLink, X, ChevronRight, Check, AlertCircle, Image as ImageIcon
} from 'lucide-react';
import {
  WASH_STAGES, COATING_STAGES, getServiceUpdateMessage,
  saveServiceJob, deleteServiceJob, updateServiceJobStage, formatDisplayDate
} from '../utils/storage';

export default function ServiceUpdatesView({
  jobs = [],
  onUpdateJobs,
  settings,
  customers = [],
  onGenerateBillFromJob,
  onShowToast,
  isGuest = false
}) {
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'wash' | 'coating' | 'ready'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  // Form State for New / Edit Job Card
  const [customerName, setCustomerName] = useState('');
  const [titlePrefix, setTitlePrefix] = useState('Mr:');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [serviceCategory, setServiceCategory] = useState('wash'); // 'wash' | 'coating'
  const [serviceType, setServiceType] = useState('Premium Foam Wash & Steam Clean');
  const [estimatedTime, setEstimatedTime] = useState('Today 6:30 PM');
  const [assignedTechnician, setAssignedTechnician] = useState('Car Wash Lead');
  const [notes, setNotes] = useState('');
  const [jobPhotos, setJobPhotos] = useState([]);

  const fileInputRef = useRef(null);

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    const isCoating = (job.serviceCategory || '').toLowerCase() === 'coating' || 
      (job.serviceType || '').toLowerCase().includes('coating') || 
      (job.serviceType || '').toLowerCase().includes('ppf');
    const stages = isCoating ? COATING_STAGES : WASH_STAGES;
    const isReady = job.currentStageIndex >= stages.length - 1;

    if (filterCategory === 'wash') return !isCoating;
    if (filterCategory === 'coating') return isCoating;
    if (filterCategory === 'ready') return isReady;
    return true;
  });

  // Open Intake Modal
  const handleOpenIntakeModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setCustomerName(job.customerName || '');
      setTitlePrefix(job.titlePrefix || 'Mr:');
      setCustomerPhone(job.customerPhone || '');
      setVehicleNumber(job.vehicleNumber || '');
      setVehicleMake(job.vehicleMake || '');
      setServiceCategory(job.serviceCategory || 'wash');
      setServiceType(job.serviceType || 'Premium Foam Wash');
      setEstimatedTime(job.estimatedTime || 'Today 6:30 PM');
      setAssignedTechnician(job.assignedTechnician || 'Car Wash Lead');
      setNotes(job.notes || '');
      setJobPhotos(job.photos || []);
    } else {
      setEditingJob(null);
      setCustomerName('');
      setTitlePrefix('Mr:');
      setCustomerPhone('');
      setVehicleNumber('');
      setVehicleMake('');
      setServiceCategory('wash');
      setServiceType('Premium Foam Wash & Steam Clean');
      setEstimatedTime('Today 6:30 PM');
      setAssignedTechnician('Car Wash Lead');
      setNotes('');
      setJobPhotos([]);
    }
    setIsModalOpen(true);
  };

  // Select from existing customer
  const handleSelectCustomer = (e) => {
    const custId = e.target.value;
    if (!custId) return;
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setCustomerName(cust.name || '');
      setTitlePrefix(cust.titlePrefix || 'Mr:');
      setCustomerPhone(cust.phone || '');
      setVehicleNumber(cust.vehicleNumber || '');
      setVehicleMake(cust.vehicleMake || '');
    }
  };

  // Upload Photo handler
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 900;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.65);

          setJobPhotos(prev => [
            ...prev,
            {
              id: `photo-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              url: compressed,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              tag: 'Intake'
            }
          ]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Save Job Card
  const handleSaveJob = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !vehicleNumber.trim()) {
      alert('Please enter customer name and vehicle registration number.');
      return;
    }

    const jobData = {
      id: editingJob ? editingJob.id : `job-${Date.now()}`,
      customerName: customerName.trim(),
      titlePrefix: titlePrefix || 'Mr:',
      customerPhone: customerPhone.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleMake: vehicleMake.trim(),
      serviceCategory,
      serviceType: serviceType.trim(),
      currentStageIndex: editingJob ? editingJob.currentStageIndex : 0,
      estimatedTime: estimatedTime.trim(),
      assignedTechnician: assignedTechnician.trim(),
      notes: notes.trim(),
      photos: jobPhotos
    };

    const updated = saveServiceJob(jobData);
    onUpdateJobs(updated);
    setIsModalOpen(false);
    onShowToast?.(editingJob ? 'Job Card Updated' : `Vehicle ${jobData.vehicleNumber} Checked In!`);
  };

  // Advance or select stage
  const handleSetStage = (job, stageIdx) => {
    const updated = updateServiceJobStage(job.id, stageIdx);
    onUpdateJobs(updated);
    const isCoating = (job.serviceCategory || '').toLowerCase() === 'coating';
    const stages = isCoating ? COATING_STAGES : WASH_STAGES;
    const stageLabel = stages[stageIdx]?.label || 'Updated';
    onShowToast?.(`${job.vehicleNumber} status: ${stageLabel}`);
  };

  // Delete Job
  const handleDeleteJob = (jobId, vehNo) => {
    if (window.confirm(`Are you sure you want to remove job card for ${vehNo}?`)) {
      const updated = deleteServiceJob(jobId);
      onUpdateJobs(updated);
      onShowToast?.('Job card removed');
    }
  };

  // Send WhatsApp Update
  const handleSendWhatsAppUpdate = (job, stageIdx = job.currentStageIndex) => {
    const message = getServiceUpdateMessage(job, stageIdx, settings);
    const phone = (job.customerPhone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
    onShowToast?.(`WhatsApp opened with status update for ${job.customerName}`);
  };

  // Add in-progress photo to active job card
  const handleAddLivePhotoToJob = (job, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);

        const newPhotos = [
          ...(job.photos || []),
          {
            id: `photo-${Date.now()}`,
            url: compressed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tag: 'In-Progress'
          }
        ];

        const updated = saveServiceJob({ ...job, photos: newPhotos });
        onUpdateJobs(updated);
        onShowToast?.(`Photo added for ${job.vehicleNumber}`);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5 pb-24 max-w-6xl mx-auto animate-fadeIn select-none text-neutral-900">
      
      {/* 🌟 1. TOP HEADER & INTAKE ACTION (White & Black) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-neutral-300 p-5 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center">
              <Droplets size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black tracking-tight flex items-center gap-2 uppercase">
                Live Car Service Updates
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-mono font-bold">
                  {jobs.length} Active
                </span>
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                1-tap WhatsApp progress alerts, inspection photos & automatic invoice generation
              </p>
            </div>
          </div>
        </div>

        {!isGuest ? (
          <button
            onClick={() => handleOpenIntakeModal()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Plus size={16} />
            <span>Intake New Vehicle</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-bold flex items-center gap-1.5">
            <Eye size={14} />
            <span>Guest View Only</span>
          </div>
        )}
      </div>

      {/* 🌟 2. CATEGORY FILTER TABS (White & Black) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {[
          { id: 'all', label: `All Vehicles (${jobs.length})` },
          { id: 'wash', label: 'Car Wash Bay' },
          { id: 'coating', label: 'Coating & PPF Bay' },
          { id: 'ready', label: 'Ready for Delivery' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 font-bold ${
              filterCategory === tab.id
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-neutral-700 hover:text-black border border-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🌟 3. ACTIVE JOB CARDS LIST (White & Black) */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map(job => {
          const isCoating = (job.serviceCategory || '').toLowerCase() === 'coating' || 
            (job.serviceType || '').toLowerCase().includes('coating') || 
            (job.serviceType || '').toLowerCase().includes('ppf');
          const stages = isCoating ? COATING_STAGES : WASH_STAGES;
          const currentStage = stages[job.currentStageIndex] || stages[0];
          const isFinished = job.currentStageIndex >= stages.length - 1;
          const photos = job.photos || [];

          return (
            <div
              key={job.id}
              className="bg-white border border-neutral-300 hover:border-black rounded-2xl p-4 sm:p-5 shadow-sm transition space-y-4"
            >
              {/* Job Header: Customer, Vehicle, Call, WhatsApp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-base text-black tracking-tight">
                      {job.titlePrefix || 'Mr:'} {job.customerName}
                    </span>
                    <span className="text-xs bg-neutral-100 text-black border border-neutral-300 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                      {job.vehicleNumber}
                    </span>
                    <span className="text-xs text-neutral-600 font-bold">
                      {job.vehicleMake}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white font-mono">
                      {isCoating ? 'Coating & PPF' : 'Wash & Detail'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 flex items-center gap-2">
                    <span className="text-black font-bold">{job.serviceType}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-neutral-500 font-medium">
                      <Clock size={12} className="text-black" /> Est: {job.estimatedTime || 'Today'}
                    </span>
                  </p>
                </div>

                {/* Direct Contact Actions: Call, WhatsApp Update, Create Bill */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Phone Call */}
                  {job.customerPhone && (
                    <a
                      href={`tel:${job.customerPhone}`}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                      title={`Call ${job.customerName}`}
                    >
                      <Phone size={14} className="text-black" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  )}

                  {/* 1-Tap Send WhatsApp Status Update */}
                  <button
                    onClick={() => handleSendWhatsAppUpdate(job)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                    title="Send WhatsApp Live Status Message to Customer"
                  >
                    <Share2 size={14} />
                    <span>Send Update</span>
                  </button>

                  {/* 1-Tap Bill Generation Button */}
                  <button
                    onClick={() => onGenerateBillFromJob(job)}
                    className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                    title="Generate official A4 bill from this vehicle's data"
                  >
                    <FileText size={14} />
                    <span>Create Bill</span>
                  </button>

                  {/* Edit / Remove Job */}
                  <button
                    onClick={() => handleOpenIntakeModal(job)}
                    className="p-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-300 text-xs font-bold transition"
                    title="Edit Job Details"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteJob(job.id, job.vehicleNumber)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                    title="Delete Job Card"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* 4. VISUAL STEPPER: PROGRESS STAGES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                    Current Stage: <span className="text-black font-black uppercase">{currentStage.label}</span>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Tap any stage below to advance status
                  </span>
                </div>

                {/* Progress Bar & Stage Nodes */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {stages.map((stage, idx) => {
                    const isDone = idx < job.currentStageIndex;
                    const isCurrent = idx === job.currentStageIndex;

                    return (
                      <button
                        key={stage.id}
                        onClick={() => handleSetStage(job, idx)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left transition flex flex-col justify-between min-h-[58px] sm:min-h-[66px] relative group ${
                          isCurrent
                            ? 'bg-black text-white border-black ring-2 ring-neutral-300 shadow-sm'
                            : isDone
                            ? 'bg-neutral-100 border-neutral-300 text-black'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isCurrent
                              ? 'bg-white text-black'
                              : isDone
                              ? 'bg-black text-white'
                              : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            0{idx + 1}
                          </span>
                          {isDone ? (
                            <Check size={13} className="text-black" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          ) : null}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 mt-1">
                          {stage.short}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. PHOTOS SECTION: Vehicle Inspection Photos */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Camera size={14} className="text-black" /> Vehicle Photos ({photos.length})
                  </span>

                  {/* Add Photo Button */}
                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-black text-xs font-bold flex items-center gap-1 transition">
                    <Plus size={13} />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleAddLivePhotoToJob(job, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Thumbnails */}
                {photos.length > 0 ? (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {photos.map(p => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPhotoModal(p)}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-300 cursor-pointer flex-shrink-0 group hover:border-black transition shadow-sm"
                      >
                        <img src={p.url} alt="Vehicle Service" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white text-center font-mono py-0.5 truncate">
                          {p.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-500 italic">
                    No photos uploaded. Tap 'Upload Photo' to attach before/after wash photos.
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-300 space-y-3 shadow-sm">
            <Car size={36} className="mx-auto text-neutral-400" />
            <h3 className="text-base font-extrabold text-black">No Vehicles in this View</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Tap 'Intake New Vehicle' to add a car to the wash or detailing bay and start sending live WhatsApp updates.
            </p>
            <button
              onClick={() => handleOpenIntakeModal()}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
            >
              <Plus size={15} /> Intake Vehicle
            </button>
          </div>
        )}
      </div>

      {/* 4. MODAL: VEHICLE INTAKE & JOB CARD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-neutral-300 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-scaleUp text-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-black text-base text-black flex items-center gap-2 uppercase">
                <Car size={18} className="text-black" />
                {editingJob ? 'Edit Vehicle Job Card' : 'New Vehicle Intake'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              {/* Autofill from existing customer */}
              {customers.length > 0 && !editingJob && (
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Select Existing Customer (Optional)
                  </label>
                  <select
                    onChange={handleSelectCustomer}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-medium"
                  >
                    <option value="">-- Choose Existing Client --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.vehicleNumber} ({c.vehicleMake})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Title</label>
                  <select
                    value={titlePrefix}
                    onChange={(e) => setTitlePrefix(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-2 text-black font-bold"
                  >
                    <option value="Mr:">Mr:</option>
                    <option value="Mrs:">Mrs:</option>
                    <option value="Dr:">Dr:</option>
                    <option value="Rev Fr:">Rev Fr:</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Evan Punnen"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">WhatsApp Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9495365617"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-mono font-bold"
                />
              </div>

              {/* Vehicle Number & Make */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Vehicle Reg Number *</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. KL 05 AZ 4249"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Make & Model</label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="e.g. Hyundai Creta"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-medium"
                  />
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Service Bay Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setServiceCategory('wash');
                      setServiceType('Premium Foam Wash & Steam Clean');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      serviceCategory === 'wash'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:text-black'
                    }`}
                  >
                    <Droplets size={14} />
                    <span>Car Wash Bay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceCategory('coating');
                      setServiceType('Borophine 9H Ceramic Coating (3 Year)');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      serviceCategory === 'coating'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:text-black'
                    }`}
                  >
                    <ShieldCheck size={14} />
                    <span>Coating & PPF Bay</span>
                  </button>
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">Service Description</label>
                <input
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Premium Foam Wash / Ceramic Coating"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-medium"
                />
              </div>

              {/* Est Completion & Specialist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Estimated Completion</label>
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g. Today 6:30 PM"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">Assigned Specialist</label>
                  <input
                    type="text"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    placeholder="e.g. Arun / Detailing Lead"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-black font-medium"
                  />
                </div>
              </div>

              {/* Photos upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-neutral-700">Intake Inspection Photos</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-black font-bold hover:underline flex items-center gap-1"
                  >
                    <Camera size={13} /> + Upload Photo
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {jobPhotos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto p-2 bg-neutral-50 rounded-xl border border-neutral-300">
                    {jobPhotos.map(p => (
                      <div key={p.id} className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-300">
                        <img src={p.url} alt="Intake" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setJobPhotos(prev => prev.filter(x => x.id !== p.id))}
                          className="absolute top-0 right-0 p-0.5 bg-black/80 text-white rounded-bl"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-700 font-bold hover:bg-neutral-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs shadow-sm transition active:scale-95"
                >
                  {editingJob ? 'Update Job Card' : 'Save & Start Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. PHOTO FULL PREVIEW MODAL */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white border border-neutral-300 rounded-2xl overflow-hidden shadow-2xl text-black">
            <div className="flex items-center justify-between p-3 border-b border-neutral-200 bg-neutral-50">
              <span className="text-xs font-mono font-bold text-neutral-800">
                Vehicle Photo · {selectedPhotoModal.timestamp}
              </span>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="p-1 rounded-lg text-neutral-500 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-neutral-100 max-h-[75vh]">
              <img
                src={selectedPhotoModal.url}
                alt="Full Preview"
                className="max-h-[70vh] w-auto object-contain mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
