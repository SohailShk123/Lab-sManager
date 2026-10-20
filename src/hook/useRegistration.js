import { useState, useEffect, useRef } from 'react';

export function useRegistration() {
  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    patientName: '',
    age: '',
    gender: 'Male',
    doctor: 'SELF',
    totalAmount: 0,
    discount: 0,
    paidAmount: 0,
    mobile: ''
  });

  const [availableTests, setAvailableTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [lastBookingId, setLastBookingId] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mobile, setMobile] = useState('');

  const nameRef = useRef(null);
  const api = window.electronAPI || window.api;

  const loadDoctors = async () => {
    if (api?.getDoctors) {
      try {
        const docs = await api.getDoctors();
        setDoctorList(docs || []);
      } catch (err) {
        console.error("Doctors load error:", err);
      }
    }
  };

  useEffect(() => {
    const loadTests = async () => {
      if (api?.getTests) {
        try {
          const tests = await api.getTests();
          setAvailableTests(tests || []);
        } catch (err) {
          console.error("Tests load error:", err);
        }
      }
    };
    loadTests();
    loadDoctors();
    if (nameRef.current) nameRef.current.focus();
  }, []);

  useEffect(() => {
    const total = selectedTests.reduce((sum, t) => sum + Number(t.cost || 0), 0);
    setFormData((prev) => ({
      ...prev,
      totalAmount: total,
      paidAmount: Math.max(0, total - Number(prev.discount || 0))
    }));
  }, [selectedTests, formData.discount]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const elements = Array.from(document.querySelectorAll('.fast-field'));
      const idx = elements.indexOf(e.target);
      if (idx !== -1 && idx + 1 < elements.length) {
        elements[idx + 1].focus();
        if (elements[idx + 1].select) elements[idx + 1].select();
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTest = (test) => {
    const exists = selectedTests.some(
      (t) => (t.id && t.id === test.id) || t.name.toUpperCase() === test.name.toUpperCase()
    );
    if (!exists) setSelectedTests((prev) => [...prev, test]);
    setSearchQuery('');
  };

  const removeTest = (index) => {
    setSelectedTests((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setSelectedTests([]);
    setLastBookingId(null);
    setFormData({
      bookingDate: new Date().toISOString().split('T')[0],
      patientName: '',
      age: '',
      gender: 'Male',
      doctor: 'SELF',
      totalAmount: 0,
      discount: 0,
      paidAmount: 0,
      mobile: ''
    });
    if (nameRef.current) nameRef.current.focus();
  };
const saveBookingToDB = async () => {
    if (!formData.patientName.trim()) {
      alert("Please enter Patient Name!");
      return null;
    }
    if (selectedTests.length === 0) {
      alert("Please select at least one test!");
      return null;
    }
    try {
      // 👇 FIX YAHAN HAI: tests field strictly JSON.stringify() me bheji jayegi
      const testNamesArray = selectedTests.map((t) => t.name.toUpperCase());
      
      const payload = {
        ...formData,
        tests: JSON.stringify(testNamesArray) // 👈 Database isko string/array samajh kar save karega
      };
      
      if (api?.saveBooking) {
        const res = await api.saveBooking(payload);
        if (res?.success) {
          setLastBookingId(res.bookingId);
          return res.bookingId;
        }
        alert("Error: " + res?.error);
        return null;
      }
      const mockId = Date.now().toString().slice(-5);
      setLastBookingId(mockId);
      return mockId;
    } catch (err) {
      alert("Error saving: " + err);
      return null;
    }
  };

  const balance = formData.totalAmount - (Number(formData.discount) || 0) - (Number(formData.paidAmount) || 0);

  return {
    formData,
    setFormData,
    availableTests,
    searchQuery,
    setSearchQuery,
    selectedTests,
    lastBookingId,
    doctorList,
    isDoctorModalOpen,
    setIsDoctorModalOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    nameRef,
    balance,
    handleKeyDown,
    handleInputChange,
    addTest,
    removeTest,
    loadDoctors,
    resetForm,
    saveBookingToDB
  };
}