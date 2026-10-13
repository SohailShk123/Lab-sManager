import { useState, useEffect, useRef } from 'react';
import { TEST_CATALOG } from '../testCatalog';

export function useResultEntry(patient) {
  const [selectedTests, setSelectedTests] = useState(() => {
    if (patient.selectedTests && Array.isArray(patient.selectedTests)) {
      return patient.selectedTests;
    }
    if (typeof patient.selected_tests === 'string') {
      try { return JSON.parse(patient.selected_tests); } 
      catch (e) { return ['CBC']; }
    }
    return ['CBC']; 
  });

  const [testState, setTestState] = useState(() => {
    const initial = {};
    Object.keys(TEST_CATALOG).forEach((key) => {
      initial[key] = TEST_CATALOG[key].parameters.map(param => {
        if (param.isOption) {
          const initialValue = param.default !== undefined ? param.default : param.options[0];
          return { ...param, value: initialValue }; 
        }
        return { ...param }; 
      });
    });
    return initial;
  });

  const [comments, setComments] = useState('');
  const [showQR, setShowQR] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [allowAutoEdit, setAllowAutoEdit] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadSavedReport = async () => {
      if (patient?.id && window.electronAPI?.getReport) {
        try {
          setIsLoadingReport(true);
          const savedData = await window.electronAPI.getReport(patient.id);
          if (savedData && isMounted) {
            if (savedData.selectedTests?.length > 0) setSelectedTests(savedData.selectedTests);
            if (savedData.results && Object.keys(savedData.results).length > 0) {
              setTestState((prev) => ({ ...prev, ...savedData.results }));
            }
            if (savedData.comments) setComments(savedData.comments);
          }
        } catch (error) {
          console.error('Error loading report:', error);
        } finally {
          if (isMounted) setIsLoadingReport(false);
        }
      }
    };
    loadSavedReport();
    return () => { isMounted = false; };
  }, [patient?.id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const formElements = Array.from(document.querySelectorAll('input.tab-field:not([disabled]), select.tab-field'));
      const currentIndex = formElements.indexOf(e.target);
      if (currentIndex !== -1 && currentIndex + 1 < formElements.length) {
        formElements[currentIndex + 1].focus();
        if (formElements[currentIndex + 1].select) formElements[currentIndex + 1].select();
      }
    }
  };

  const handleParamChange = (testId, paramIndex, newValue) => {
    const updatedList = [...testState[testId]];
    updatedList[paramIndex].value = newValue;

    const getVal = (id) => {
      const itm = updatedList.find((p) => p.id === id);
      return itm && itm.value !== '' ? parseFloat(itm.value) : NaN;
    };
    const setVal = (id, val, decimals = 1) => {
      const itm = updatedList.find((p) => p.id === id);
      if (itm && !isNaN(val) && isFinite(val)) itm.value = val.toFixed(decimals);
    };

    if (testId === 'CBC') {
      const hb = getVal('hb'); const rbc = getVal('rbc'); const mcv = getVal('mcv');
      let pcv = getVal('pcv');
      if (!isNaN(hb) && !isNaN(rbc) && rbc > 0) setVal('mch', (hb / rbc) * 10, 2);
      if (!isNaN(rbc) && !isNaN(mcv)) { pcv = (rbc * mcv) / 10; setVal('pcv', pcv, 1); }
      if (!isNaN(hb) && !isNaN(pcv) && pcv > 0) setVal('mchc', (hb / pcv) * 100, 2);
    }
    if (testId === 'LFT') {
      const tb = getVal('tbili'); const db = getVal('dbili');
      if (!isNaN(tb) && !isNaN(db)) setVal('ibili', Math.max(0, tb - db), 2);
      const tp = getVal('tprotein'); const alb = getVal('albumin');
      if (!isNaN(tp) && !isNaN(alb)) {
        const glob = Math.max(0, tp - alb);
        setVal('globulin', glob, 2);
        if (glob > 0) setVal('ag_ratio', alb / glob, 2);
      }
    }
    if (testId === 'KFT') {
      const urea = getVal('urea');
      if (!isNaN(urea)) setVal('bun', urea / 2.14, 1);
    }
    if (testId === 'LIPID PROFILE') {
      const tg = getVal('tg'); const chol = getVal('chol'); const hdl = getVal('hdl');
      let vldl = NaN;
      if (!isNaN(tg)) { vldl = tg / 5; setVal('vldl', vldl, 1); }
      if (!isNaN(chol) && !isNaN(hdl) && !isNaN(vldl)) setVal('ldl', Math.max(0, chol - (hdl + vldl)), 1);
      if (!isNaN(chol) && !isNaN(hdl) && hdl > 0) setVal('chol_hdl', chol / hdl, 2);
    }
    if (testId === 'HBA1C') {
      const a1c = getVal('hba1c_val');
      if (!isNaN(a1c)) setVal('eag_val', 28.7 * a1c - 46.7, 0);
    }
    if (testId === 'PT / INR') {
      const ptTest = getVal('pt_test'); const ptCtrl = getVal('pt_control');
      if (!isNaN(ptTest) && !isNaN(ptCtrl) && ptCtrl > 0) setVal('pt_inr', ptTest / ptCtrl, 2);
    }
    setTestState({ ...testState, [testId]: updatedList });
  };

  const handleSaveOnly = async () => {
    try {
      setIsSaving(true);
      const payload = { patientId: patient.id, selectedTests, results: testState, comments };
      if (window.electronAPI?.saveReport) {
        const res = await window.electronAPI.saveReport(payload);
        if (res?.success) alert('Report database me successfully save ho gayi!');
        else alert('Error: ' + (res?.error || 'Failed to save'));
      } else {
        alert('Save successful (Browser Test Mode)');
      }
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    setShowPreviewModal(false);
    setTimeout(() => { window.print(); }, 400);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${patient.patientName}, aapki Prime Plus Pathology Lab report ready hai. Sample Date: ${patient.bookingDate}.`);
    window.open(`https://wa.me/91${patient.mobile || ''}?text=${text}`, '_blank');
  };

  const qrString = `LAB: PRIME PLUS | PID: 2026${patient.id || '101'} | PATIENT: ${patient.patientName} | TESTS: ${selectedTests.join(',')}`;

  return {
    selectedTests, setSelectedTests,
    testState, comments, setComments,
    showQR, setShowQR,
    showPreviewModal, setShowPreviewModal,
    isSaving, isLoadingReport,
    allowAutoEdit, setAllowAutoEdit,
    searchQuery, setSearchQuery,
    handleKeyDown, handleParamChange,
    handleSaveOnly, handlePrint, handleWhatsApp, qrString
  };
}