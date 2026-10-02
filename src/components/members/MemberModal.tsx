import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, User, Phone, Mail, Award, Shirt, Calendar, DollarSign, FileText } from 'lucide-react';
import { Member, MemberStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
}

export const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, memberToEdit }) => {
  const { addMember, updateMember, settings, showToast } = useApp();

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('Ahli Biasa');
  const [jerseySize, setJerseySize] = useState('L');
  const [registeredDate, setRegisteredDate] = useState(`${settings.year}-01-01`);
  const [status, setStatus] = useState<MemberStatus>('AKTIF');
  const [monthlyFee, setMonthlyFee] = useState<number>(settings.defaultMonthlyFee);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSection, setActiveSection] = useState<'profil' | 'kelab'>('profil');

  const positions = [
    'Ahli Biasa',
    'Kapten Pasukan',
    'Naib Kapten',
    'AJK Kelab',
    'Setiausaha',
    'Bendahari',
    'Jurulatih / Coach',
    'Penasihat Kelab',
    'Pemain Utama ADC',
  ];

  const jerseySizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setNickname(memberToEdit.nickname || '');
      setPhone(memberToEdit.phone || '');
      setIcNumber(memberToEdit.icNumber || '');
      setEmail(memberToEdit.email || '');
      setPosition(memberToEdit.position || 'Ahli Biasa');
      setJerseySize(memberToEdit.jerseySize || 'L');
      setRegisteredDate(memberToEdit.registeredDate || `${settings.year}-01-01`);
      setStatus(memberToEdit.status || 'AKTIF');
      setMonthlyFee(memberToEdit.monthlyFee || settings.defaultMonthlyFee);
      setNotes(memberToEdit.notes || '');
    } else {
      setName('');
      setNickname('');
      setPhone('');
      setIcNumber('');
      setEmail('');
      setPosition('Ahli Biasa');
      setJerseySize('L');
      setRegisteredDate(`${settings.year}-01-01`);
      setStatus('AKTIF');
      setMonthlyFee(settings.defaultMonthlyFee);
      setNotes('');
    }
    setErrorMsg('');
  }, [memberToEdit, isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Nama ahli tidak boleh kosong. Sila masukkan nama penuh ahli.');
      return;
    }

    if (isNaN(monthlyFee) || monthlyFee <= 0) {
      setErrorMsg('Jumlah yuran bulanan tidak sah. Sila masukkan nilai positif dalam Ringgit Malaysia.');
      return;
    }

    try {
      if (memberToEdit) {
        await updateMember(memberToEdit.id, {
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          phone: phone.trim() || '-',
          icNumber: icNumber.trim() || undefined,
          email: email.trim() || undefined,
          position: position.trim() || 'Ahli Biasa',
          jerseySize: jerseySize || undefined,
          registeredDate,
          status,
          monthlyFee: Number(monthlyFee),
          notes: notes.trim(),
        });
      } else {
        await addMember({
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          phone: phone.trim() || '-',
          icNumber: icNumber.trim() || undefined,
          email: email.trim() || undefined,
          position: position.trim() || 'Ahli Biasa',
          jerseySize: jerseySize || undefined,
          registeredDate,
          status,
          monthlyFee: Number(monthlyFee),
          notes: notes.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg('Ralat semasa menyimpan maklumat ahli. Sila cuba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {memberToEdit ? 'Kemaskini Maklumat Ahli ADC' : 'Daftar Ahli Baharu ADC'}
                </h3>
                {memberToEdit && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    {memberToEdit.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {memberToEdit ? 'Nama & lain-lain maklumat ahli boleh dikemaskini bila-bila masa' : 'Masukkan butiran lengkap profil ahli kelab dart'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 bg-slate-900/60">
          <button
            type="button"
            onClick={() => setActiveSection('profil')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeSection === 'profil'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Profil & Hubungan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('kelab')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeSection === 'kelab'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>2. Peranan, Yuran & Catatan</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeSection === 'profil' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Penuh Ahli <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Muhammad Farhan bin Rosli"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gelaran / Nickname Dart (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Contoh: The Sniper, Oche Master"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. Telefon / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 012-3456789"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono-num"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    No. Kad Pengenalan / IC (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={icNumber}
                    onChange={(e) => setIcNumber(e.target.value)}
                    placeholder="Contoh: 900512-10-5544"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono-num"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emel Ahli (Pilihan)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Contoh: farhan@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('kelab')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
                >
                  Seterusnya: Peranan & Yuran →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Jawatan / Peranan dalam Kelab
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Saiz Jersi Rasmi ADC
                  </label>
                  <select
                    value={jerseySize}
                    onChange={(e) => setJerseySize(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    {jerseySizes.map((sz) => (
                      <option key={sz} value={sz}>
                        Saiz {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tarikh Daftar Kelab
                  </label>
                  <input
                    type="date"
                    value={registeredDate}
                    onChange={(e) => setRegisteredDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Keahlian
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MemberStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="TIDAK_AKTIF">TIDAK AKTIF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kadar Yuran (RM) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-num font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Tambahan Mengenai Ahli
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan mengenai pemain, regu dart, rekod kejohanan, waris kecemasan, dll."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <div className="flex items-center gap-2">
              {activeSection === 'kelab' && (
                <button
                  type="button"
                  onClick={() => setActiveSection('profil')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  ← Kembali ke Profil
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition"
              >
                <Save className="w-4 h-4" />
                <span>{memberToEdit ? 'Simpan Perubahan Maklumat' : 'Daftar Ahli Baharu'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
