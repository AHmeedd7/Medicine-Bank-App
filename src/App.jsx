import React, { useState, useEffect, useRef } from 'react';
import Logo from './assets/Logo.jpeg';
import { translations } from './translations';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ================= إضافة: تثبيت أيقونات Leaflet =================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ================= إضافة: مكون الخريطة التفاعلية =================
function LocationMarker({ setAddress, setMapPosition, mapPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMapPosition([lat, lng]);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) setAddress(data.display_name);
          else setAddress(`${lat}, ${lng}`);
        })
        .catch(() => setAddress(`${lat}, ${lng}`));
    }
  });
  return <Marker position={mapPosition} />;
}

// ================= إضافة: زر "اذهب للأعلى" =================
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  if (!isVisible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
    </button>
  );
}

export default function App() {
  // ----------------------------------------------------------------------
  // 1. الحالات الأصلية (لم نغيرها، فقط أضفنا حالات جديدة بعدها)
  // ----------------------------------------------------------------------
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const [isVisible, setIsVisible] = useState(false);
  
  // إضافة: نظام الإشعارات المنبثقة (Toast) بألوان مختلفة
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // حالات تسجيل الدخول وإنشاء الحساب
  const [currentScreen, setCurrentScreen] = useState('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [otpError, setOtpError] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubScreen, setHomeSubScreen] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  // تم التعديل: تغيير مصاريف الشحن من 50 إلى 10 جنيه
  const shippingCost = 10;

  const [donateQty, setDonateQty] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');

  // ---------- الحالات الجديدة (للتحسينات) ----------
  const [donatedMedicines, setDonatedMedicines] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [donationCategory, setDonationCategory] = useState('');
  const [address, setAddress] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyList] = useState(['صيدلية المنارة', 'صيدلية العزبي', 'جمعية الأورمان', 'جمعية رسالة', 'صيدلية النور']);
  const [mapPosition, setMapPosition] = useState([30.0444, 31.2357]);

  // إضافة: الوضع الليلي (Dark Mode)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // إضافة: فلاتر متقدمة في صفحة الطلب
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPrice, setFilterPrice] = useState('all'); // 'all', 'free', 'paid'

  // ----------------------------------------------------------------------
  // 2. الدوال الأساسية (نفسها تماماً مع تعديل بسيط لإعادة تعيين الفلاتر عند تبديل التبويب)
  // ----------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (currentScreen === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [currentScreen, timer]);

  const handleSwitch = (screen) => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentScreen(screen);
      setErrors({}); setPassword(''); setConfirmPassword(''); setOtp(['', '', '', '']); setOtpError(false);
      setActiveTab('home'); setHomeSubScreen('main'); setSelectedCategory(null); setShowNotif(false); setSearchQuery(''); setCart({}); setDonateQty(1);
      if (screen === 'login' || screen === 'signup') { setIsGuest(false); setShowGuestModal(false); }
      if (screen === 'otp') setTimer(60);
      setIsVisible(true);
    }, 400);
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    handleSwitch('home');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setHomeSubScreen('main');
    setSelectedCategory(null);
    setSearchQuery('');
    setFilterCategory('');   // إعادة تعيين الفلاتر
    setFilterPrice('all');
  };

  const requireAuthAction = (actionCallback) => {
    if (isGuest) setShowGuestModal(true);
    else actionCallback();
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) showToast(t.uploadSuccess + e.target.files[0].name);
  };

  const addToCart = (medId) => {
    setCart(prev => ({ ...prev, [medId]: (prev[medId] || 0) + 1 }));
    showToast(t.toastAddCart);
  };

  const decreaseCart = (medId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[medId] > 1) newCart[medId] -= 1;
      else delete newCart[medId];
      return newCart;
    });
  };

  const getCartTotalItems = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  // الأدوية الوهمية (أضفنا لها خاصية category)
  const dummyMedicines = [
    { id: 1, enName: "Panadol Extra - 24 Tablets", arName: "بانادول اكسترا - 24 قرص", exp: "10/2026", price: 45, img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80", category: "مسكنات" },
    { id: 2, enName: "Augmentin 1g - 14 Tablets", arName: "اوجمنتين 1 جم - 14 قرص", exp: "12/2025", price: 135, img: "https://images.unsplash.com/photo-1550572017-edb9b0af48b0?auto=format&fit=crop&w=300&q=80", category: "مضادات حيوية" },
    { id: 3, enName: "Insulin Mixtard 30 HM", arName: "أنسولين ميكستارد 30 حقن", exp: "05/2026", price: 60, img: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=300&q=80", category: "أمراض مزمنة" },
    { id: 4, enName: "Brufen 400mg - 30 Tablets", arName: "بروفين 400 مجم - 30 قرص", exp: "01/2027", price: 55, img: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80", category: "مسكنات" },
    { id: 5, enName: "Concor 5mg - 30 Tablets", arName: "كونكور 5 مجم - 30 قرص", exp: "11/2025", price: 40, img: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=300&q=80", category: "أمراض مزمنة" },
    { id: 6, enName: "Omeprazole 20mg - 14 Caps", arName: "اوميبرازول 20 مجم - 14 كبسولة", exp: "08/2026", price: 30, img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=300&q=80", category: "المعدة والهضم" },
  ];

  const allMedicines = [...dummyMedicines, ...donatedMedicines];

  const getCartOriginalTotal = () => {
    let total = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const med = allMedicines.find(m => m.id.toString() === id);
      if (med) total += med.price * qty;
    });
    return total;
  };

  // دالة التصفية المتقدمة (بحث، قسم، سعر)
  const filteredMedicines = allMedicines.filter(med => {
    if (searchQuery && !med.enName.toLowerCase().includes(searchQuery.toLowerCase()) && !med.arName.includes(searchQuery)) return false;
    if (filterCategory && med.category !== filterCategory) return false;
    if (filterPrice === 'free' && med.price !== 0) return false;
    if (filterPrice === 'paid' && med.price === 0) return false;
    return true;
  });

  // دوال OTP والتحقق (نفسها تماماً كما في الكود الأصلي)
  const verifyOtp = (codeArray) => {
    const code = codeArray.join('');
    if (code.length === 4) {
      setIsLoading(true); setOtpError(false);
      setTimeout(() => {
        setIsLoading(false);
        if (code === '1234') handleSwitch('newPassword');
        else { setOtpError(true); setOtp(['', '', '', '']); inputRefs[0].current.focus(); }
      }, 1500);
    }
  };
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp]; newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp); setOtpError(false);
    if (value && index < 3) inputRefs[index + 1].current.focus();
    if (value && index === 3) verifyOtp(newOtp);
  };
  const handleKeyDown = (index, e) => { if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs[index - 1].current.focus(); };
  const handlePaste = (e) => {
    e.preventDefault(); const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasteData) {
      const newOtp = [...otp]; for (let i = 0; i < pasteData.length; i++) newOtp[i] = pasteData[i];
      setOtp(newOtp); setOtpError(false); const focusIndex = pasteData.length < 4 ? pasteData.length : 3;
      inputRefs[focusIndex].current.focus(); if (pasteData.length === 4) verifyOtp(newOtp);
    }
  };

  const validate = () => {
    let notePad = {};
    if (currentScreen === 'signup' && !fullName) notePad.fullName = lang === 'en' ? "Required" : "مطلوب";
    if (currentScreen !== 'otp' && currentScreen !== 'newPassword' && currentScreen !== 'home') {
      if (!phone || phone.length !== 11) notePad.phone = lang === 'en' ? "11 digits" : "11 رقم";
    }
    if (currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'newPassword') {
      if (!password || password.length < 6) notePad.password = lang === 'en' ? "Min 6 chars" : "6 حروف على الأقل";
    }
    if (currentScreen === 'signup' || currentScreen === 'newPassword') {
      if (password !== confirmPassword) notePad.confirmPassword = lang === 'en' ? "No match" : "غير متطابق";
    }
    if (currentScreen === 'signup' && !termsAccepted) notePad.terms = t.acceptError;
    if (currentScreen === 'otp' && otp.join('').length < 4) notePad.otp = "Incomplete";
    setErrors(notePad);
    return Object.keys(notePad).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        if (currentScreen === 'forgot') handleSwitch('otp');
        else if (currentScreen === 'otp') verifyOtp(otp);
        else if (currentScreen === 'newPassword') { showToast(t.toastPass); handleSwitch('login'); }
        else if (currentScreen === 'login') { showToast(t.toastLogin); handleSwitch('home'); }
        else { showToast(t.toastLogin); if (currentScreen === 'signup') handleSwitch('login'); }
      }, 1500);
    }
  };  // ----------------------------------------------------------------------
  // 3. واجهة المستخدم الرئيسية (Home) مع جميع التحسينات
  // ----------------------------------------------------------------------
  if (currentScreen === 'home') {
    return (
      <div dir={t.dir} className={`fixed inset-0 font-sans transition-opacity duration-1000 flex flex-col ${darkMode ? 'dark' : ''}`}>
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animated-gradient {
            background: linear-gradient(135deg, #dbeafe, #d1fae5, #fef9c3);
            background-size: 200% 200%;
            animation: gradientShift 15s ease infinite;
          }
          .neumorph-card {
            box-shadow: 20px 20px 30px rgba(0,0,0,0.05), -10px -10px 20px rgba(255,255,255,0.7);
            transition: all 0.3s ease;
          }
          .neumorph-card:hover {
            box-shadow: 10px 10px 20px rgba(0,0,0,0.1), -5px -5px 10px rgba(255,255,255,0.5);
            transform: translateY(-3px);
          }
          .fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Toast متعدد الألوان */}
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold border ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'
          }`}>
            {toast.message}
          </div>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

        {/* Guest Modal (نفسه) */}
        {showGuestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-modal text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.guestModalTitle}</h3>
              <p className="text-sm text-gray-500 mb-6">{t.guestModalDesc}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowGuestModal(false)} className="flex-1 py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">{t.cancel}</button>
                <button onClick={() => handleSwitch('login')} className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition-all">{t.loginNow}</button>
              </div>
            </div>
          </div>
        )}

        {/* خلفيات زخرفية (نفسها) */}
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[320px] w-64 h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[150px] w-64 h-[600px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* الهيدر الثابت مع زر الوضع الليلي */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
          <div className="px-4 md:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => { setActiveTab('home'); setHomeSubScreen('main'); }} className="hover:scale-105 transition-transform">
                <img src={Logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
              </button>
              <div className="hidden sm:block">
                <p className="text-[11px] text-gray-400 font-bold">{t.hello} 👋</p>
                <h1 className="font-black text-gray-900 text-sm">{isGuest ? (lang === 'en' ? 'Guest' : 'زائر') : (fullName || "أحمد محمد")}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setHomeSubScreen('cart')} className="relative p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {getCartTotalItems() > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{getCartTotalItems()}</span>}
              </button>
              {/* زر الوضع الليلي */}
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-lg">
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold shadow-sm">{t.switchLang}</button>
              {isGuest && (
                <button onClick={() => handleSwitch('login')} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-600 shadow-sm">
                  {t.headerLogin}
                </button>
              )}
              <div className="relative">
                <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {notifications.length > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
                </button>
                {showNotif && (
                  <div className={`absolute ${t.dir === 'rtl' ? 'left-0' : 'right-0'} mt-4 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50`}>
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-100"><h3 className="font-bold text-gray-800 text-sm">{t.notifTitle}</h3></div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">{t.notifEmpty}</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><span className="text-xl">{notif.icon}</span></div>
                            <div><p className="text-sm text-gray-800 font-semibold">{notif.title}</p><p className="text-xs text-gray-500">{notif.message}</p><p className="text-[10px] text-gray-400 mt-1">{notif.time}</p></div>
                          </div>
                        ))
                      )}
                      <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer flex gap-3"><div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><p className="text-sm text-gray-600 leading-relaxed font-medium">{t.notifDonor}</p></div>
                      <div className="p-4 hover:bg-gray-50 transition cursor-pointer flex gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className="text-sm text-gray-600 leading-relaxed font-medium">{t.notifReq}</p></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <ScrollToTop />

        <div className={`flex-1 flex flex-col relative overflow-y-auto w-full hide-scrollbar ${homeSubScreen !== 'main' ? 'pb-6' : 'pb-24'} animated-gradient`}>
          
          {activeTab === 'home' && (
            <div className="w-full flex-1 flex flex-col">
              
              {/* الشاشة الرئيسية (main) - لم تتغير */}
              {homeSubScreen === 'main' && (
                <div className="flex-1 fade-in-up">
                  <div className="px-6 pt-10 pb-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-3">{t.heroTitle}</h2>
                    <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">{t.heroSubtitle}</p>
                  </div>
                  <div className="flex gap-4 md:gap-6 px-6 py-4 max-w-2xl mx-auto">
                    <button onClick={() => setHomeSubScreen('donate')} className="group flex-1 aspect-square bg-white border-2 border-emerald-100 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-400 flex flex-col items-center justify-center transition-all duration-300 active:scale-95">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3 animate-float-fast"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg></div>
                      <span className="font-bold text-gray-800 text-lg">{t.donateText}</span>
                    </button>
                    <button onClick={() => setHomeSubScreen('request')} className="group flex-1 aspect-square bg-white border-2 border-blue-100 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-400 flex flex-col items-center justify-center transition-all duration-300 active:scale-95">
                      <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 animate-float-slow"><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                      <span className="font-bold text-gray-800 text-lg">{t.requestText}</span>
                    </button>
                  </div>
                  <div className="px-6 py-6 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
                    {[
                      { val: '1.2k+', label: t.statsDonors, col: 'text-emerald-600' },
                      { val: '850+', label: t.statsRequests, col: 'text-blue-600' },
                      { val: '45+', label: t.statsCharities, col: 'text-purple-600' }
                    ].map((s, i) => (
                      <div key={i} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 text-center shadow-sm"><span className={`block text-xl font-black ${s.col} mb-0.5`}>{s.val}</span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{s.label}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* صفحة الطلب (Request) مع الفلاتر وتحسين البطاقات */}
              {homeSubScreen === 'request' && (
                <div className="w-full max-w-4xl mx-auto p-6 fade-in-up">
                  <button onClick={() => selectedCategory ? setSelectedCategory(null) : setHomeSubScreen('main')} className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors mb-6 bg-white/50 py-1.5 px-3 rounded-full w-fit shadow-sm border border-gray-200">
                    <svg className={`w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0 rtl:rotate-180`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t.backBtn}
                  </button>
                  {(!selectedCategory && searchQuery === '') ? (
                    <>
                      <h2 className="text-center font-bold text-xl md:text-2xl text-gray-800 mb-6 leading-tight">{t.requestTitle}</h2>
                      <div className="relative mb-6 max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full py-3.5 pr-12 pl-4 outline-none focus:border-blue-500 shadow-sm transition-all text-sm font-medium" placeholder={t.searchPlace} />
                      </div>
                      {/* الفلاتر المتقدمة */}
                      <div className="flex flex-wrap gap-3 justify-center mb-8">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <option value="">كل الأقسام</option>
                          <option value="مسكنات">مسكنات</option>
                          <option value="مضادات حيوية">مضادات حيوية</option>
                          <option value="أمراض مزمنة">أمراض مزمنة</option>
                          <option value="المعدة والهضم">المعدة والهضم</option>
                        </select>
                        <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                          <option value="all">كل الأسعار</option>
                          <option value="free">مجاني (تبرع)</option>
                          <option value="paid">مدفوع</option>
                        </select>
                      </div>
                      {/* قائمة الفئات (كما هي) */}
                      <div className="max-w-3xl mx-auto">
                        <h3 className="font-bold text-gray-700 text-sm mb-4">{t.searchCategory}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { name: t.catChronic, color: 'bg-red-50 hover:bg-red-100 border-red-100 text-red-500', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
                            { name: t.catAntibiotic, color: 'bg-orange-50 hover:bg-orange-100 border-orange-100 text-orange-500', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
                            { name: t.catPainkiller, color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100 text-yellow-600', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                            { name: t.catBaby, color: 'bg-pink-50 hover:bg-pink-100 border-pink-100 text-pink-500', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                            { name: t.catVitamins, color: 'bg-green-50 hover:bg-green-100 border-green-100 text-green-500', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                            { name: t.catSkin, color: 'bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-500', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
                            { name: t.catDiabetes, color: 'bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-500', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3s-4.5 3.97-4.5 9 2.015 9 4.5 9z" /></svg> },
                            { name: t.catStomach, color: 'bg-teal-50 hover:bg-teal-100 border-teal-100 text-teal-600', icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg> }
                          ].map((cat, idx) => (
                            <button key={idx} onClick={() => setSelectedCategory(cat.name)} className={`${cat.color} p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border shadow-sm hover:shadow transition-all active:scale-95`}><div className="mb-1">{cat.icon}</div><span className="font-bold text-[11px] text-gray-700 text-center leading-tight">{cat.name}</span></button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full max-w-4xl mx-auto">
                      {searchQuery !== '' && (
                        <div className="relative mb-6 max-w-2xl mx-auto">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-blue-200 rounded-full py-3.5 pr-12 pl-4 outline-none focus:border-blue-500 shadow-sm transition-all text-sm font-medium" placeholder={t.searchPlace} />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                        <h2 className="font-bold text-xl md:text-2xl text-gray-800">{searchQuery ? (lang === 'en' ? `Search Results: ${searchQuery}` : `نتائج البحث: ${searchQuery}`) : selectedCategory}</h2>
                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-bold">{filteredMedicines.length} {t.availableMeds}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMedicines.map((med) => (
                          <div key={med.id} className="neumorph-card bg-white rounded-2xl p-4 flex flex-col hover:shadow-xl transition-all duration-300">
                            <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                              <img src={med.img} onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Medicine'} className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300" alt={med.enName} />
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 leading-snug mb-1 min-h-[40px]">{lang === 'en' ? med.enName : med.arName}</h4>
                            <p className="text-xs text-gray-500 mb-1">{t.box}</p>
                            <p className="text-[11px] font-bold text-gray-400 mb-2">{t.expDate}: {med.exp}</p>
                            {med.isDonated && <p className="text-[10px] text-emerald-600 font-bold mb-2">تبرع مجاني</p>}
                            <div className="mt-auto">
                              {cart[med.id] ? (
                                <div className="flex items-center justify-between bg-white border border-blue-200 rounded-lg p-1 h-[42px]">
                                  <button onClick={() => addToCart(med.id)} className="w-8 h-full flex items-center justify-center bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg></button>
                                  <span className="font-black text-gray-800 text-sm px-2">{cart[med.id]}</span>
                                  <button onClick={() => decreaseCart(med.id)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">{cart[med.id] > 1 ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}</button>
                                </div>
                              ) : (
                                <button onClick={() => addToCart(med.id)} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 text-sm font-bold h-[42px] rounded-lg hover:bg-blue-100 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>{t.addBtn}</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* شاشة السلة (Cart) مع تغيير الشحن لـ 10 */}
              {homeSubScreen === 'cart' && (
                <div className="w-full max-w-3xl mx-auto p-6 fade-in-up">
                  <button onClick={() => setHomeSubScreen('main')} className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors mb-6 bg-white/50 py-1.5 px-3 rounded-full w-fit shadow-sm border border-gray-200">
                    <svg className={`w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0 rtl:rotate-180`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t.backBtn}
                  </button>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden neumorph-card">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-gray-800">{t.cartTitle}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">{getCartTotalItems()}</span>
                    </div>
                    <div className="p-4 md:p-6 flex flex-col gap-4">
                      {Object.keys(cart).length === 0 ? (
                        <div className="text-center py-10 text-gray-400 font-medium">
                          <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          <p>{t.cartEmpty}</p>
                        </div>
                      ) : (
                        Object.entries(cart).map(([id, qty]) => {
                          const med = allMedicines.find(m => m.id.toString() === id);
                          if (!med) return null;
                          return (
                            <div key={id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow gap-4">
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-1 border border-gray-100 overflow-hidden"><img src={med.img} onError={(e) => e.target.src = 'https://via.placeholder.com/80'} className="object-cover w-full h-full" alt={med.enName} /></div>
                                <div><h4 className="font-bold text-sm text-gray-900 leading-snug">{lang === 'en' ? med.enName : med.arName}</h4><p className="text-xs text-gray-500 mt-1">{t.box}</p></div>
                              </div>
                              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center bg-blue-50/50 border border-blue-100 rounded-lg p-1 h-[40px]">
                                  <button onClick={() => addToCart(med.id)} className="w-8 h-full flex items-center justify-center bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg></button>
                                  <span className="font-black text-gray-800 text-sm px-4">{qty}</span>
                                  <button onClick={() => decreaseCart(med.id)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">{qty > 1 ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}</button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {Object.keys(cart).length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50 p-6">
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center text-sm text-gray-500"><span>{lang === 'en' ? 'Medicines Original Price:' : 'إجمالي سعر الأدوية الأصلي:'}</span><span className="line-through">{getCartOriginalTotal()} {t.priceText}</span></div>
                          <div className="flex justify-between items-center text-sm text-gray-500"><span>{lang === 'en' ? 'Shipping Fees:' : 'مصاريف الشحن والتوصيل:'}</span><span className="font-bold text-gray-800">{shippingCost} {t.priceText}</span></div>
                          <div className="flex justify-between items-center text-base font-black text-gray-900 pt-3 border-t border-gray-200"><span>{lang === 'en' ? 'Total to Pay:' : 'الإجمالي المطلوب دفعه:'}</span><span className="text-emerald-600">{shippingCost} {t.priceText}</span></div>
                        </div>
                        <button onClick={() => requireAuthAction(() => { showToast(t.toastOrder); setCart({}); setHomeSubScreen('main'); })} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95">{t.checkoutBtn}</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* شاشة التبرع (Donate) مع الخريطة وزر الموقع الحالي المخصص */}
              {homeSubScreen === 'donate' && (
                <div className="w-full max-w-2xl mx-auto p-6 fade-in-up">
                  <button onClick={() => setHomeSubScreen('main')} className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors mb-6 bg-white/50 py-1.5 px-3 rounded-full w-fit shadow-sm border border-gray-200">
                    <svg className={`w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0 rtl:rotate-180`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t.backBtn}
                  </button>
                  <h2 className="text-center font-black text-2xl md:text-3xl text-emerald-600 mb-8 leading-tight">{t.donateHeader}</h2>
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6 neumorph-card">
                    {/* رفع الصورة */}
                    <div onClick={() => requireAuthAction(() => fileInputRef.current.click())} className="w-full h-40 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors group">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div><span className="text-sm font-bold text-emerald-700">{t.uploadBox}</span>
                    </div>

                    {/* القسم */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">القسم / التصنيف</label>
                      <select value={donationCategory} onChange={(e) => setDonationCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-colors text-sm">
                        <option value="">اختر القسم</option>
                        <option value={t.catChronic}>{t.catChronic}</option>
                        <option value={t.catAntibiotic}>{t.catAntibiotic}</option>
                        <option value={t.catPainkiller}>{t.catPainkiller}</option>
                        <option value={t.catBaby}>{t.catBaby}</option>
                        <option value={t.catVitamins}>{t.catVitamins}</option>
                        <option value={t.catSkin}>{t.catSkin}</option>
                        <option value={t.catDiabetes}>{t.catDiabetes}</option>
                        <option value={t.catStomach}>{t.catStomach}</option>
                      </select>
                    </div>

                    {/* اسم الدواء وتاريخ الصلاحية */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-xs font-bold text-gray-700 mb-2">{t.medNameLabel}</label><input type="text" id="medName" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-colors text-sm" placeholder={t.medNamePlace} /></div>
                      <div><label className="block text-xs font-bold text-gray-700 mb-2">{t.expLabel}</label><input type="text" id="expDate" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-colors text-sm" placeholder={t.expPlace} /></div>
                    </div>

                    {/* الكمية */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">{t.qtyLabel}</label>
                      <div className="flex items-center w-full max-w-[200px] bg-gray-50 border border-gray-200 rounded-xl p-1 h-[50px]">
                        <button type="button" onClick={() => donateQty > 1 && setDonateQty(donateQty - 1)} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg></button>
                        <span className="flex-1 text-center font-black text-gray-800 text-lg">{donateQty}</span>
                        <button type="button" onClick={() => setDonateQty(donateQty + 1)} className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg></button>
                      </div>
                    </div>

                    {/* طريقة التسليم */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-3">{t.deliveryLabel}</label>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${deliveryMethod === 'pickup' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:border-emerald-200'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === 'pickup' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                          <span className={`font-bold text-xs md:text-sm text-right ${deliveryMethod === 'pickup' ? 'text-emerald-800' : 'text-gray-600'}`}>{t.delPickup}</span>
                        </button>
                        <button type="button" onClick={() => setDeliveryMethod('dropoff')} className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${deliveryMethod === 'dropoff' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white hover:border-emerald-200'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deliveryMethod === 'dropoff' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                          <span className={`font-bold text-xs md:text-sm text-right ${deliveryMethod === 'dropoff' ? 'text-emerald-800' : 'text-gray-600'}`}>{t.delDropoff}</span>
                        </button>
                      </div>
                    </div>

                    {/* حقل العنوان مع الخريطة */}
                    {deliveryMethod === 'pickup' && (
                      <div className="animate-fade-in space-y-4">
                        <label className="block text-xs font-bold text-gray-700 mb-1">اختر موقعك على الخريطة</label>
                        <div style={{ height: '300px', width: '100%', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1rem' }}>
                          <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker setAddress={setAddress} setMapPosition={setMapPosition} mapPosition={mapPosition} />
                          </MapContainer>
                        </div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">العنوان التفصيلي</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-colors text-sm" placeholder="سيظهر العنوان تلقائياً أو اكتبه يدوياً" />
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const { latitude, longitude } = position.coords;
                                  setMapPosition([latitude, longitude]);
                                  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`)
                                    .then(res => res.json())
                                    .then(data => setAddress(data.display_name || `${latitude}, ${longitude}`))
                                    .catch(() => setAddress(`${latitude}, ${longitude}`));
                                },
                                () => showToast('تعذر تحديد الموقع، اختر من الخريطة', 'error')
                              );
                            } else showToast('المتصفح لا يدعم تحديد الموقع', 'error');
                          }}
                          className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-100 transition flex items-center gap-2"
                        >
                          📍 استخدم موقعي الحالي
                        </button>
                      </div>
                    )}

                    {/* حقل الصيدلية */}
                    {deliveryMethod === 'dropoff' && (
                      <div className="animate-fade-in">
                        <label className="block text-xs font-bold text-gray-700 mb-2">اسم الصيدلية / الجمعية</label>
                        <input type="text" list="pharmacyOptions" value={pharmacyName} onChange={(e) => setPharmacyName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 transition-colors text-sm" placeholder="اكتب أو اختر من القائمة" />
                        <datalist id="pharmacyOptions">{pharmacyList.map((ph, idx) => <option key={idx} value={ph} />)}</datalist>
                      </div>
                    )}

                    {/* زر إرسال التبرع */}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          const medNameInput = document.getElementById('medName').value;
                          const expDateInput = document.getElementById('expDate').value;
                          if (!medNameInput || !expDateInput || !donationCategory) {
                            showToast("من فضلك املأ جميع الحقول الأساسية (الاسم، الصلاحية، القسم)", 'error');
                            return;
                          }
                          if (deliveryMethod === 'pickup' && !address) {
                            showToast("من فضلك أدخل العنوان", 'error');
                            return;
                          }
                          if (deliveryMethod === 'dropoff' && !pharmacyName) {
                            showToast("من فضلك أدخل اسم الصيدلية/الجمعية", 'error');
                            return;
                          }

                          const newMed = {
                            id: Date.now(),
                            enName: medNameInput,
                            arName: medNameInput,
                            exp: expDateInput,
                            price: 0,
                            img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80",
                            category: donationCategory,
                            isDonated: true,
                            donorAddress: deliveryMethod === 'pickup' ? address : null,
                            pharmacy: deliveryMethod === 'dropoff' ? pharmacyName : null
                          };

                          setDonatedMedicines(prev => [...prev, newMed]);
                          setDonationHistory(prev => [...prev, {
                            id: Date.now(),
                            medName: medNameInput,
                            category: donationCategory,
                            date: new Date().toLocaleDateString('ar-EG'),
                            status: t.histDonorStatus,
                            type: 'donation'
                          }]);
                          setNotifications(prev => [...prev, {
                            id: Date.now(),
                            title: "تبرع جديد",
                            message: `تم التبرع بـ ${medNameInput} في قسم ${donationCategory}`,
                            time: new Date().toLocaleTimeString(),
                            read: false,
                            icon: "🎁"
                          }]);

                          showToast(t.toastDonate);
                          setDonationCategory('');
                          setAddress('');
                          setPharmacyName('');
                          setDonateQty(1);
                          document.getElementById('medName').value = '';
                          document.getElementById('expDate').value = '';
                          setHomeSubScreen('main');
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 text-base"
                      >
                        {t.submitDonate}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* تبويب السجل (History) */}
          {activeTab === 'history' && (
            <div className="w-full max-w-2xl mx-auto space-y-4 pt-4 p-6 fade-in-up">
              <h2 className="text-2xl font-black text-gray-800 mb-6">{t.historyTitle}</h2>
              {donationHistory.length === 0 && (
                <div className="text-center text-gray-400 py-8">لا توجد تبرعات حتى الآن</div>
              )}
              {donationHistory.map((donation) => (
                <div key={donation.id} className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors neumorph-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>
                    <div><h3 className="font-bold text-gray-900 text-base">{donation.medName}</h3><p className="text-xs text-gray-500">القسم: {donation.category}</p><p className="text-xs text-gray-400">{donation.date}</p></div>
                  </div>
                  <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-100">{donation.status}</span>
                </div>
              ))}
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-colors neumorph-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div><div><h3 className="font-bold text-gray-900 text-base">{t.histDonorTitle}</h3><p className="text-sm text-gray-500 mt-1">14 Oct, 2026</p></div></div><span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-100">{t.histDonorStatus}</span></div>
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border-2 border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors neumorph-card"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div><div><h3 className="font-bold text-gray-900 text-base">{t.histReqTitle}</h3><p className="text-sm text-gray-500 mt-1">12 Oct, 2026</p></div></div><span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100">{t.histReqStatus}</span></div>
            </div>
          )}

          {/* تبويب الملف الشخصي (Profile) */}
          {activeTab === 'profile' && (
            <div className="w-full max-w-lg mx-auto pt-4 p-6 flex flex-col items-center pb-24 fade-in-up">
              <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl mb-4 border-4 border-white">{fullName ? fullName.charAt(0).toUpperCase() : (isGuest ? "ز" : "أ")}</div>
              <h2 className="text-2xl font-black text-gray-900">{isGuest ? (lang === 'en' ? 'Guest' : 'زائر') : (fullName || "أحمد محمد")}</h2>
              <p className="text-base text-gray-500 mt-1 font-medium">{isGuest ? "---" : (phone || "01012345678")}</p>
              <div className="w-full flex gap-4 mt-8">
                <div className="flex-1 bg-white/90 p-5 rounded-3xl border-2 border-gray-100 shadow-sm text-center neumorph-card"><span className="block text-3xl font-black text-emerald-600 mb-1">{donationHistory.length + 12}</span><span className="text-xs text-gray-500 font-bold uppercase tracking-wide">{t.contributions}</span></div>
                <div className="flex-1 bg-white/90 p-5 rounded-3xl border-2 border-gray-100 shadow-sm text-center neumorph-card"><span className="block text-3xl font-black text-blue-600 mb-1">1</span><span className="text-xs text-gray-500 font-bold uppercase tracking-wide">{t.activeReqs}</span></div>
              </div>
              <div className="w-full mt-8 space-y-4">
                <button onClick={() => requireAuthAction(() => console.log('Edit profile'))} className="w-full bg-white/90 p-5 rounded-2xl border-2 border-gray-100 text-gray-800 font-bold text-base flex justify-between items-center hover:bg-gray-50 transition-colors shadow-sm">{t.editProfile}<svg className={`w-5 h-5 text-gray-400 ${t.dir === 'rtl' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
                <button onClick={() => handleSwitch('login')} className="w-full bg-red-50 p-5 rounded-2xl border-2 border-red-100 text-red-600 font-bold text-base flex justify-center items-center hover:bg-red-100 transition-colors shadow-sm">{t.logoutBtn}</button>
              </div>
            </div>
          )}
        </div>

        {/* القائمة السفلية (Bottom Navigation) */}
        {(homeSubScreen === 'main' || activeTab === 'history' || activeTab === 'profile') && (
          <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 h-[76px] flex justify-around items-center px-2 pb-safe z-50 fixed bottom-0 w-full">
            <button onClick={() => handleTabClick('home')} className={`flex flex-col items-center justify-center w-20 h-full gap-1 group transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <div className={`p-2 rounded-2xl transition-colors ${activeTab === 'home' ? 'bg-emerald-50' : 'group-hover:bg-gray-50'}`}><svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke={activeTab === 'home' ? 'none' : 'currentColor'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></div><span className="text-[11px] font-bold">{t.navHome}</span>
            </button>
            <button onClick={() => handleTabClick('history')} className={`flex flex-col items-center justify-center w-20 h-full gap-1 group transition-colors ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <div className={`p-2 rounded-2xl transition-colors ${activeTab === 'history' ? 'bg-blue-50' : 'group-hover:bg-gray-50'}`}><svg className="w-6 h-6" fill={activeTab === 'history' ? 'currentColor' : 'none'} stroke={activeTab === 'history' ? 'none' : 'currentColor'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></div><span className="text-[11px] font-bold">{t.navHistory}</span>
            </button>
            <button onClick={() => handleTabClick('profile')} className={`flex flex-col items-center justify-center w-20 h-full gap-1 group transition-colors ${activeTab === 'profile' ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
              <div className={`p-2 rounded-2xl transition-colors ${activeTab === 'profile' ? 'bg-gray-100' : 'group-hover:bg-gray-50'}`}><svg className="w-6 h-6" fill={activeTab === 'profile' ? 'currentColor' : 'none'} stroke={activeTab === 'profile' ? 'none' : 'currentColor'} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><span className="text-[11px] font-bold">{t.navProfile}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ================= شاشات تسجيل الدخول (الأصلية تماماً بدون تغيير) =================
  return (
    <div dir={t.dir} className="relative min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans transition-all duration-500 overflow-hidden">
      {/* Toast هنا أيضاً */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold border ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          toast.type === 'warning' ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'
        }`}>{toast.message}</div>
      </div>

      <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.3s ease-in-out; }`}</style>

      <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="absolute top-4 right-4 z-50 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">{t.switchLang}</button>

      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[320px] w-40 h-[600px] bg-blue-600/20 blur-[100px] rounded-full z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[150px] w-40 h-[600px] bg-emerald-500/10 blur-[100px] rounded-full z-0"></div>

      <div className={`relative z-10 max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        <div className="flex flex-col items-center mb-6">
          {(currentScreen === 'forgot' || currentScreen === 'otp' || currentScreen === 'newPassword') ? (
            <div className="w-14 h-14 bg-blue-500 mb-4 flex items-center justify-center border border-gray-800"><svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg></div>
          ) : <img src={Logo} alt="Logo" className="w-20 h-auto mb-4 rounded-lg" />}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentScreen === 'login' && t.welcome} {currentScreen === 'signup' && t.createTitle} {currentScreen === 'forgot' && t.forgotTitle} {currentScreen === 'otp' && t.otpTitle} {currentScreen === 'newPassword' && t.newPassTitle}
          </h2>
          <p className="text-sm text-gray-500 text-center px-4">
            {currentScreen === 'login' && t.subtext} {currentScreen === 'signup' && t.createSubtext} {currentScreen === 'forgot' && t.forgotSubtext} {currentScreen === 'otp' && t.otpSubtext} {currentScreen === 'newPassword' && t.newPassSubtext}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {currentScreen === 'signup' && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm outline-none transition-all ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} placeholder={t.namePlaceholder} /></div>{errors.fullName && <p className="text-xs text-red-500 mt-1 font-medium px-1">{errors.fullName}</p>}</div>
          )}

          {(currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'forgot') && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm outline-none transition-all ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} placeholder={currentScreen === 'signup' ? t.signUpPhonePlace : t.phonePlaceholder} /></div>{errors.phone && <p className="text-xs text-red-500 mt-1 font-medium px-1">{errors.phone}</p>}</div>
          )}

          {currentScreen === 'otp' && (
            <div className="flex flex-col items-center"><div className={`flex justify-center gap-4 py-4 ${otpError ? 'animate-shake' : ''}`} dir="ltr">{otp.map((digit, idx) => (<input key={idx} ref={inputRefs[idx]} type="text" value={digit} maxLength="1" onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleKeyDown(idx, e)} onPaste={handlePaste} className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all bg-gray-50 ${otpError ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900'}`} />))}</div><p className="text-[11px] text-gray-400 mt-[-5px]">{lang === 'en' ? "(Hint: use 1234 to verify)" : "(للتجربة: اكتب 1234)"}</p></div>
          )}

          {(currentScreen === 'login' || currentScreen === 'signup' || currentScreen === 'newPassword') && (
            <div><div className="flex items-center justify-between mb-1"><label className="block text-sm font-medium text-gray-700">{t.password}</label>{currentScreen === 'login' && <button type="button" onClick={() => handleSwitch('forgot')} className="text-sm text-blue-600 hover:text-blue-700">{t.forgot}</button>}</div><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`block w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-lg text-sm outline-none transition-all ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} placeholder={currentScreen === 'login' ? t.passPlaceholder : t.createPassPlace} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button></div>{errors.password && <p className="text-xs text-red-500 mt-1 font-medium px-1">{errors.password}</p>}</div>
          )}

          {(currentScreen === 'signup' || currentScreen === 'newPassword') && (
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t.confirmPass}</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-sm outline-none transition-all ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`} placeholder={t.confirmPassPlace} /></div>{errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium px-1">{errors.confirmPassword}</p>}</div>
          )}

          {currentScreen === 'signup' && (
            <div className="mb-4"><div className="flex items-center space-x-2 rtl:space-x-reverse"><input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-4 h-4 text-blue-600 rounded cursor-pointer" /><label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer select-none font-medium">{t.terms}</label></div>{errors.terms && <p className="text-[10px] text-red-500 mt-1 font-bold animate-pulse px-1">{errors.terms}</p>}</div>
          )}

          <button type="submit" disabled={isLoading} className={`w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold rounded-lg transition-all active:scale-95 duration-200 flex items-center justify-center hover:-translate-y-0.5 hover:shadow-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {isLoading ? (<><svg className="animate-spin h-5 w-5 mx-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>{t.loading}</span></>) : (<span>{currentScreen === 'login' && t.login} {currentScreen === 'signup' && t.signUp} {currentScreen === 'forgot' && t.sendCode} {currentScreen === 'otp' && t.confirmCode} {currentScreen === 'newPassword' && t.newPassBtn}</span>)}
          </button>
        </form>

        {currentScreen === 'login' && (
          <div className="mt-4 text-center">
            <button type="button" onClick={handleGuestLogin} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">{t.browseGuest}</button>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-center text-sm space-y-3">
          {currentScreen === 'otp' ? (
            <button type="button" disabled={timer > 0} onClick={() => {setTimer(60); setOtpError(false); setOtp(['','','','']);}} className={`font-medium transition-colors ${timer > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}>{timer > 0 ? `${t.resendText} ${timer}s` : t.resendLink}</button>
          ) : (
            (currentScreen === 'forgot' || currentScreen === 'newPassword') ? (
              <button type="button" onClick={() => handleSwitch('login')} className="text-gray-500 hover:text-gray-700 font-medium flex items-center transition-colors"><svg className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>{t.backToLogin}</button>
            ) : (
              <div><span className="text-gray-500 mx-2">{currentScreen === 'login' ? t.noAccount : t.haveAccount}</span><button type="button" onClick={() => handleSwitch(currentScreen === 'login' ? 'signup' : 'login')} className="text-blue-600 font-bold hover:underline">{currentScreen === 'login' ? t.createAccount : t.loginBack}</button></div>
            )
          )}
        </div>

      </div>
    </div>
  );
}