import React from 'react';
import { ScanLine, Keyboard, UserCheck } from 'lucide-react';

const CheckIn = () => {
  return (
    <div className="flex flex-col h-full space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Check-in Member</h1>
        <p className="text-foreground/70 text-xs">Pindai QR Code member atau masukkan kode secara manual untuk check-in.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        
        {/* QR Scanner Mockup */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col items-center min-h-[350px]">
          <h2 className="text-sm font-bold text-foreground mb-6 w-full flex items-center gap-2 border-b border-border pb-2">
            <ScanLine className="w-4 h-4 text-primary" />
            Kamera Pemindai
          </h2>
          
          {/* Scanner Viewport */}
          <div className="relative w-full aspect-square max-w-[240px] sm:max-w-[280px] bg-black/20 rounded-2xl overflow-hidden border border-border/50 flex flex-col items-center justify-center shadow-inner mt-2">
            
            {/* Dark overlay backdrop to simulate camera view */}
            <div className="absolute inset-0 bg-background/5 backdrop-blur-[1px]" />
            
            {/* The Target Area with Corner Markers */}
            <div className="relative w-[70%] h-[70%] z-10">
              {/* Top Left */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
              {/* Top Right */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
              {/* Bottom Left */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
              {/* Bottom Right */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

              {/* Scanning animation line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_12px_rgba(225,29,72,1)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>

            {/* Instruction Text inside scanner */}
            <p className="absolute bottom-4 left-0 right-0 text-[10px] sm:text-xs text-white/70 font-medium text-center z-10 px-4">
              Arahkan QR Code ke dalam kotak
            </p>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-xs text-green-500/80 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Kamera Aktif (Mockup)
          </div>
        </div>

        {/* Manual Input */}
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-2">
            <Keyboard className="w-4 h-4 text-primary" />
            Input Manual
          </h2>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Kode Member</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: MBR-00123"
                  className="bg-background block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary text-sm text-foreground uppercase"
                />
                <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(255,42,42,0.3)] whitespace-nowrap">
                  Cari
                </button>
              </div>
            </div>

            {/* Mockup Result */}
            <div className="mt-6 p-4 border border-border rounded-xl bg-background/50 flex flex-col items-center justify-center py-8">
              <UserCheck className="w-12 h-12 text-foreground/20 mb-2" />
              <p className="text-xs text-foreground/50 text-center">Hasil pencarian member akan muncul di sini</p>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(250px); }
          100% { transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default CheckIn;
