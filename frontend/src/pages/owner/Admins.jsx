import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Search } from 'lucide-react';

const Admins = () => {
  useEffect(() => {
    document.title = "Manajemen Admin - CSGMS";
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Akun Admin</h1>
          <p className="text-foreground/70 text-xs">Kelola akun admin cabang yang dapat mengakses sistem.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm shadow-[0_0_15px_rgba(255,42,42,0.3)]">
          <Plus className="w-3 h-3" />
          Tambah Admin
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-card p-3 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2 h-4 w-4 text-foreground/50" />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            className="pl-9 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs w-full focus:ring-primary focus:border-primary text-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-foreground/80">
            <thead className="text-xs text-foreground uppercase bg-background border-b border-border">
              <tr>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Bergabung Sejak</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-background/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Admin Satu</div>
                      <div className="text-[10px] text-foreground/50 flex items-center gap-1 mt-0.5">
                        <Shield className="w-3 h-3" /> Admin Staff
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">admin1@combatstrength.com</div>
                  <div className="text-foreground/60 text-[10px]">081234567891</div>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">Aktif</span>
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  15 Jan 2023
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="text-blue-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button className="text-red-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Nonaktifkan">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors opacity-75">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/50 font-bold">
                      R
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Rudi (Eks Admin)</div>
                      <div className="text-[10px] text-foreground/50 flex items-center gap-1 mt-0.5">
                        <Shield className="w-3 h-3" /> Admin Staff
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-foreground">rudi@combatstrength.com</div>
                  <div className="text-foreground/60 text-[10px]">081234567892</div>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-foreground/10 text-foreground/60 px-2 py-0.5 rounded text-[10px] font-medium border border-border">Nonaktif</span>
                </td>
                <td className="px-4 py-3 text-foreground/70">
                  01 Mar 2023
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="text-blue-500 hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button className="text-foreground/50 hover:text-foreground/80 p-1.5 rounded-lg hover:bg-foreground/10 transition-colors" title="Aktifkan Kembali">
                      <Shield className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admins;
