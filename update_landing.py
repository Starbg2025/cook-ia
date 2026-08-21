import re

with open("src/components/LandingPage.tsx", "r") as f:
    content = f.read()

# Replace the fake render div
old_div = """<div 
                    className="w-full"
                    dangerouslySetInnerHTML={{
                      // Dirty trick just to render the fake HTML from the code strings
                      __html: demoTemplates[activeDemo].code
                        .replace(/import .*;/, '')
                        .replace(/export default function .*\(\) {/, '')
                        .replace(/const .* = .*;/g, '')
                        .replace(/return \(/, '')
                        .replace(/\);\n}/, '')
                        // Replace some React specific syntax to render purely for demo
                        .replace(/className=/g, 'class=')
                        .replace(/style={{[^}]+}}/g, '')
                        .replace(/\{kpis\.revenue\.toLocaleString\(\)\}/g, '32 450')
                        .replace(/\{kpis\.growth\}/g, '18.4')
                        .replace(/\{products\.map[^\)]+\)\)}/g, '<div class="p-4 bg-white border rounded-xl"><h4 class="text-sm font-bold">Produit Demo</h4><p class="text-xs font-mono mt-1">120€</p></div>')
                        .replace(/\{tab\}/g, '')
                        .replace(/onClick=\{[^\}]+\}/g, '')
                        .replace(/\{cart\}/g, '0')
                    }}
                   />"""

new_div = """<div className="w-full">
                    {activeDemo === 'saas' && (
                      <div className="p-6 bg-[var(--color-card-light)] border border-[var(--color-border-light)] rounded-2xl text-[var(--color-ink)]">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <span className="text-xs font-mono text-[var(--color-accent-blue)]">REVENU MENSUEL</span>
                            <h2 className="text-3xl font-display font-bold mt-1">€32,450</h2>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
                            +18.4%
                          </span>
                        </div>
                        <div className="h-24 w-full bg-[#F9F9F8] rounded-xl p-3 border border-[var(--color-border-light)] flex items-end gap-1.5">
                          {[40, 55, 35, 70, 65, 85, 95, 80, 110, 125].map((val, i) => (
                            <div key={i} className="flex-1 bg-[var(--color-accent-blue)] opacity-50 hover:opacity-100 rounded-t transition-all" style={{ height: f"{val}%" }} />
                          ))}
                        </div>
                      </div>
                    )}
                    {activeDemo === 'ecommerce' && (
                      <div className="p-6 bg-[var(--color-card-light)] border border-[var(--color-border-light)] rounded-2xl text-[var(--color-ink)]">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-light)] pb-4">
                          <h3 className="text-sm font-bold font-display">ATELIER 2026</h3>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold">
                            <ShoppingBag size={14} /> Panier (0)
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#F9F9F8] border border-[var(--color-border-light)] rounded-xl">
                            <h4 className="text-sm font-bold truncate">Chemise Oxford</h4>
                            <p className="text-[var(--color-accent-earth)] text-xs font-mono font-bold mt-1">120€</p>
                            <button className="w-full mt-3 py-2 bg-white border border-[var(--color-border-light)] text-[var(--color-primary)] rounded-lg text-xs font-semibold">Ajouter</button>
                          </div>
                          <div className="p-4 bg-[#F9F9F8] border border-[var(--color-border-light)] rounded-xl">
                            <h4 className="text-sm font-bold truncate">Veste Moleskine</h4>
                            <p className="text-[var(--color-accent-earth)] text-xs font-mono font-bold mt-1">240€</p>
                            <button className="w-full mt-3 py-2 bg-white border border-[var(--color-border-light)] text-[var(--color-primary)] rounded-lg text-xs font-semibold">Ajouter</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeDemo === 'portfolio' && (
                      <div className="p-8 bg-[var(--color-card-light)] border border-[var(--color-border-light)] rounded-2xl text-[var(--color-ink)]">
                        <div className="mb-8">
                          <h3 className="text-2xl font-editorial font-bold italic">Benit Madimba</h3>
                          <p className="text-[var(--color-accent-earth)] text-xs font-mono uppercase mt-2 tracking-widest">Ingénieur & Designer</p>
                        </div>
                        <div className="space-y-4">
                          <div className="group flex justify-between items-end border-b border-[var(--color-border-light)] pb-2">
                            <div><h4 className="font-bold text-sm">Système de Design</h4><p className="text-xs text-slate-500 mt-1">Architecture Frontend</p></div>
                            <ExternalLink size={14} className="text-slate-400 mb-1" />
                          </div>
                          <div className="group flex justify-between items-end border-b border-[var(--color-border-light)] pb-2">
                            <div><h4 className="font-bold text-sm">Plateforme SaaS</h4><p className="text-xs text-slate-500 mt-1">Application Complète</p></div>
                            <ExternalLink size={14} className="text-slate-400 mb-1" />
                          </div>
                        </div>
                      </div>
                    )}
                   </div>"""

content = content.replace(old_div, new_div.replace('f"{val}%"', '`${val}%`'))

with open("src/components/LandingPage.tsx", "w") as f:
    f.write(content)
