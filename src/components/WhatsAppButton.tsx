import React, { useState, useEffect } from 'react';
import { getSiteWhatsApp } from '../utils/siteConfig';

export const WhatsAppButton: React.FC = () => {
  const [waNumber, setWaNumber] = useState(() => getSiteWhatsApp().clean);

  useEffect(() => {
    const handleUpdate = () => {
      setWaNumber(getSiteWhatsApp().clean);
    };
    window.addEventListener('horizon_whatsapp_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('horizon_whatsapp_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const whatsappUrl =
    `https://wa.me/${waNumber}?text=` +
    encodeURIComponent('Hi Ahsan, I would like to discuss a project with Horizon Digital Media.');

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-[#070D18] font-bold px-4 py-3 rounded-full flex items-center gap-2.5 shadow-2xl shadow-[#25D366]/35 transition-all transform hover:scale-105 wa-btn-pulse group"
      aria-label="Chat on WhatsApp with Horizon Digital Media"
      title="Direct WhatsApp Chat with Ahsan Yousaf"
    >
      <i className="fa-brands fa-whatsapp text-2xl group-hover:rotate-12 transition-transform"></i>
      <span className="hidden sm:inline font-sans text-sm font-semibold tracking-wide">
        WhatsApp
      </span>
    </a>
  );
};
