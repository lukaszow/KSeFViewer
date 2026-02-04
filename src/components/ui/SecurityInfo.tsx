import React from 'react';
import { ShieldCheck, Lock, EyeOff, Code, CheckCircle2 } from 'lucide-react';

/**
 * SecurityInfo Component
 * Displays professional security assurance to build user trust.
 * Based on "Option 3" (Auditory Style) with trust checkboxes.
 */
const SecurityInfo: React.FC = () => {
  const trustPoints = [
    { icon: <Lock className="w-5 h-5" />, text: "Przetwarzanie lokalne (No Server-Side)" },
    { icon: <ShieldCheck className="w-5 h-5" />, text: "Pełna zgodność z wymogami RODO" },
    { icon: <EyeOff className="w-5 h-5" />, text: "Brak logowania treści faktur" },
    { icon: <Code className="w-5 h-5" />, text: "Transparentny kod Open Source" },
  ];

  return (
    <section className="max-w-4xl mx-auto mt-12 p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nota o bezpieczeństwie i prywatności
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            Architektura systemu <strong>CzytajKSEF.pl</strong> została zaprojektowana w oparciu 
            o model <em>Zero-Knowledge</em>. Nie gromadzimy, nie przetwarzamy ani nie logujemy 
            treści udostępnianych plików XML. Narzędzie służy wyłącznie do interpretacji lokalnej 
            kodu faktury na czytelny format wizualny, zapewniając najwyższy standard ochrony 
            tajemnicy przedsiębiorstwa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-6">
        {trustPoints.map((point, index) => (
          <div key={index} className="flex items-center gap-3 text-slate-700">
            <span className="text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-sm font-medium">{point.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SecurityInfo;