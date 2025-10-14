import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Clock, Users, TrendingUp, Search, QrCode, Camera, CheckCircle, LogOut, LogIn, X } from 'lucide-react';
import { apiService } from '../services/api.js';
import QrScanner from 'qr-scanner';

/**
 * Member Check-in/out System - Real-time member tracking and attendance
 */
const CheckIn = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentlyInGym, setCurrentlyInGym] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayStats, setTodayStats] = useState({
    totalCheckIns: 0,
    currentlyInside: 0,
    peakHour: '6:00 PM',
    averageStayTime: '1.5 hours'
  });
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const qrScannerRef = useRef(null);
  const videoRef = useRef(null);

  // Members from backend
  const [members, setMembers] = useState([]);

  // Load from backend
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await apiService.getMembers({ limit: 200 });
        const apiMembers = res?.data?.members || [];
        const formatted = apiMembers.map((m) => ({
          id: m.id,
          name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
          membershipId: `MEM${String(m.id).padStart(3, '0')}`,
          photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.first_name || 'M')}${encodeURIComponent(m.last_name || 'U')}`,
          membershipType: m.membership_type || 'Standard',
          status: (m.status || 'Active').toLowerCase(),
          phone: m.phone || ''
        }));
        setMembers(formatted);
      } catch (e) {
        console.error('Load members failed', e);
      }
    };

    const loadAttendance = async () => {
      try {
        const res = await apiService.getAttendance({ limit: 500 });
        const records = res?.data?.attendance || [];
        setAttendanceRecords(records);
        const inside = records
          .filter((a) => !a.check_out_time)
          .map((a) => ({
            attendanceId: a.id,
            memberId: a.member_id,
            name: `${a.first_name || ''} ${a.last_name || ''}`.trim() || `MEM${String(a.member_id).padStart(3, '0')}`,
            checkInTime: a.check_in_time,
            membershipType: 'Member',
            photo: a.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.first_name || 'M')}${encodeURIComponent(a.last_name || 'U')}`
          }));

        // Stats for today
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const totalToday = records.filter((r) => new Date(r.check_in_time) >= start).length;

        setCurrentlyInGym(inside);
        setTodayStats((prev) => ({
          ...prev,
          totalCheckIns: totalToday,
          currentlyInside: inside.length
        }));
      } catch (e) {
        console.error('Load attendance failed', e);
      }
    };

    loadMembers();
    loadAttendance();
  }, []);

  const exportCSV = () => {
    try {
      const headers = ['Member ID','Name','Event','Check In','Check Out','Photo URL'];
      const rows = attendanceRecords.map(r => [
        r.member_id,
        `${r.first_name || ''} ${r.last_name || ''}`.trim(),
        r.event || 'checkin',
        r.check_in_time || '',
        r.check_out_time || '',
        r.photo_url || ''
      ]);
      const csv = [headers.join(','), ...rows.map(x => x.map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const d = new Date();
      a.download = `attendance_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export CSV failed', e); }
  };

  const exportHTML = () => {
    try {
      const rows = attendanceRecords.map(r => `
        <tr>
          <td>${r.member_id}</td>
          <td>${(r.first_name||'') + ' ' + (r.last_name||'')}</td>
          <td>${r.event || 'checkin'}</td>
          <td>${r.check_in_time || ''}</td>
          <td>${r.check_out_time || ''}</td>
          <td>${r.photo_url ? `<img src="${r.photo_url}" alt="photo" style="height:40px;border-radius:6px;"/>` : ''}</td>
        </tr>`).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Attendance Log</title>
      <style>body{font-family:Arial;padding:16px;} table{width:100%;border-collapse:collapse} th,td{border:1px solid #e5e7eb;padding:8px;text-align:left} th{background:#f9fafb}</style>
      </head><body><h2>Attendance Log</h2><table><thead><tr><th>Member ID</th><th>Name</th><th>Event</th><th>Check In</th><th>Check Out</th><th>Photo</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      const done = () => { try { w.focus(); w.print(); } catch(e) {} setTimeout(() => { try { w.close(); URL.revokeObjectURL(url); } catch(e) {} }, 300); };
      if (w) { w.onload = done; setTimeout(done, 800); }
    } catch (e) { console.error('Export HTML failed', e); }
  };

  const handleCheckIn = async (member) => {
    try {
      const res = await apiService.createAttendance({ memberId: member.id });
      const att = res?.data?.attendance;
      const newEntry = {
        attendanceId: att?.id,
        memberId: member.id,
        name: member.name,
        checkInTime: att?.check_in_time || new Date().toISOString(),
        membershipType: member.membershipType,
        photo: member.photo
      };
      setCurrentlyInGym((prev) => [...prev, newEntry]);
      setTodayStats((prev) => ({
        ...prev,
        totalCheckIns: prev.totalCheckIns + 1,
        currentlyInside: prev.currentlyInside + 1
      }));
    } catch (e) {
      console.error('Check-in failed', e);
    }
  };

  const handleCheckOut = async (memberId) => {
    try {
      const entry = currentlyInGym.find((e) => e.memberId === memberId);
      if (entry?.attendanceId) {
        await apiService.updateAttendance(entry.attendanceId, { checkOutTime: new Date().toISOString() });
      }
      setCurrentlyInGym((prev) => prev.filter((e) => e.memberId !== memberId));
      setTodayStats((prev) => ({ ...prev, currentlyInside: Math.max(0, prev.currentlyInside - 1) }));
    } catch (e) {
      console.error('Check-out failed', e);
    }
  };

  const getTimeInGym = (checkInTime) => {
    const now = new Date();
    const checkIn = new Date(checkInTime);
    const diffMs = now - checkIn;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.phone || '').includes(searchTerm)
  );

  const isCheckedIn = (memberId) => {
    return currentlyInGym.some(entry => entry.memberId === memberId);
  };

  // QR Code Scanner Handler
  const handleQrScan = () => {
    setShowQrModal(true);
    setScanMessage('');
  };

  // Initialize QR Scanner when modal opens
  useEffect(() => {
    if (showQrModal && videoRef.current && !qrScannerRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        async (result) => {
          const decodedText = result.data;
          try {
            // Try to find member by ID or email
            const member = members.find(
              m => m.id.toString() === decodedText || 
                   m.membershipId === decodedText ||
                   m.email === decodedText
            );

            if (member) {
              if (isCheckedIn(member.id)) {
                setScanMessage(`${member.name} is already checked in!`);
              } else {
                await handleCheckIn(member);
                setScanMessage(`✓ ${member.name} checked in successfully!`);
                setTimeout(() => {
                  scanner.stop();
                  qrScannerRef.current = null;
                  setShowQrModal(false);
                }, 1500);
              }
            } else {
              setScanMessage('Member not found. Please try again.');
            }
          } catch (error) {
            console.error('QR scan error:', error);
            setScanMessage('Error checking in member. Please try again.');
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scanner.start().catch(err => {
        console.error('QR Scanner start error:', err);
        setScanMessage('Could not start camera. Please check permissions.');
      });

      qrScannerRef.current = scanner;
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current = null;
      }
    };
  }, [showQrModal, members]);

  const closeQrModal = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }
    setShowQrModal(false);
    setScanMessage('');
  };

  // Camera Scanner Handler (uses webcam for face/ID recognition simulation)
  const handleCameraScan = () => {
    setShowCameraModal(true);
    setScanMessage('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, this would use face recognition or OCR
    // For now, we'll show a message and let user select from recent members
    setScanMessage('Image uploaded. Select member from the list below:');
  };

  const handleQuickCheckIn = async (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      if (isCheckedIn(member.id)) {
        setScanMessage(`${member.name} is already checked in!`);
      } else {
        await handleCheckIn(member);
        setScanMessage(`✓ ${member.name} checked in successfully!`);
        setTimeout(() => {
          setShowCameraModal(false);
          setScanMessage('');
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Member Check-In/Out
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Real-time member attendance tracking system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Check-ins</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayStats.totalCheckIns}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Currently Inside</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayStats.currentlyInside}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.peakHour}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Stay Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.averageStayTime}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Search and Check-in */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Member Check-In</h2>
            <div className="flex space-x-2">
              <button 
                onClick={handleQrScan}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Scan QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button 
                onClick={handleCameraScan}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                title="Camera Scan"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={exportCSV}
                className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                title="Download CSV"
              >
                CSV
              </button>
              <button
                onClick={exportHTML}
                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                title="Print / Save as PDF"
              >
                Print
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Member List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-4">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.membershipId} • {member.membershipType}</p>
                  </div>
                </div>
                
                {isCheckedIn(member.id) ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Checked In</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn(member)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Check In</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Currently in Gym */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Currently in Gym</h2>
          
          {currentlyInGym.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No members currently checked in</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentlyInGym.map((entry) => (
                <div key={entry.memberId} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-4">
                    <img
                      src={entry.photo}
                      alt={entry.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{entry.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.membershipType} • {getTimeInGym(entry.checkInTime)} in gym
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCheckOut(entry.memberId)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Check Out</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scan QR Code</h3>
                <button 
                  onClick={closeQrModal}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="mb-4">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  style={{ maxHeight: '300px' }}
                ></video>
              </div>

              {scanMessage && (
                <div className={`p-3 rounded-lg text-center ${
                  scanMessage.includes('✓') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : scanMessage.includes('already')
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {scanMessage}
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                Position the QR code within the frame to scan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Camera Scan</h3>
                <button 
                  onClick={() => {
                    setShowCameraModal(false);
                    setScanMessage('');
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Upload Member Photo or ID
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {scanMessage && (
                <div className={`p-3 rounded-lg text-center mb-4 ${
                  scanMessage.includes('✓') 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : scanMessage.includes('already')
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {scanMessage}
                </div>
              )}

              <div className="border-t dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Quick Check-In
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members.slice(0, 10).map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleQuickCheckIn(member.id)}
                      disabled={isCheckedIn(member.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isCheckedIn(member.id)
                          ? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.membershipId}
                          </p>
                        </div>
                      </div>
                      {isCheckedIn(member.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <LogIn className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;
