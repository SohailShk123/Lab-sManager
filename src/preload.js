// oxlint-disable eslint-plugin-unicorn/no-empty-file
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");


const apiBridge = {
  saveBooking: (data) => ipcRenderer.invoke("save-booking", data),
  getBookings: () => ipcRenderer.invoke("get-bookings"),
  getTests: () => ipcRenderer.invoke("get-tests"),
  addTest: (data) => ipcRenderer.invoke("add-test", data),
  updateTest: (data) => ipcRenderer.invoke('update-test', data),
  deleteTest: (id) => ipcRenderer.invoke("delete-test", id),
  saveReport: (data) => ipcRenderer.invoke("save-report", data),
  getReport: (patientId) => ipcRenderer.invoke("get-report", patientId),
  getDoctors: () => ipcRenderer.invoke("get-doctors"),
  addDoctor: (docData) => ipcRenderer.invoke("add-doctor", docData),
  deleteDoctor: (doctorId) => ipcRenderer.invoke("delete-doctor", doctorId),
  getLabConfig: () => ipcRenderer.invoke("get-lab-config"),
  verifyLabId: (labId) => ipcRenderer.invoke("verify-and-save-lab-id", labId),
  getPatientHistory: (data) => ipcRenderer.invoke("get-patient-history", data),
  restoreFromCloud: () => ipcRenderer.invoke("restore-from-cloud"),
  importOldData: (rows) => ipcRenderer.invoke("import-old-data", rows)
};

// Dono names se expose karein
contextBridge.exposeInMainWorld("api", apiBridge);
contextBridge.exposeInMainWorld("electronAPI", apiBridge);