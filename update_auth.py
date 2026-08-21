import re

with open("src/components/AuthModal.tsx", "r") as f:
    content = f.read()

content = content.replace('bg-[#141414]', 'bg-[var(--color-bg-light)]')
content = content.replace('bg-[#0A0A0A]', 'bg-white')
content = content.replace('text-white overflow-y-auto', 'text-[var(--color-ink)] overflow-y-auto')
content = content.replace('text-white/30', 'text-slate-400')
content = content.replace('text-white/40', 'text-slate-500')
content = content.replace('text-white', 'text-[var(--color-ink)]')
# Re-fix the icon/svg texts if needed (Wait, some lucide icons might inherit text color, so text-[var(--color-ink)] is fine)
content = content.replace('border-white/10', 'border-[var(--color-border-light)]')
content = content.replace('border-white/30', 'border-[var(--color-primary)]/50')
content = content.replace('bg-white text-black', 'bg-[var(--color-primary)] text-white')
content = content.replace('hover:bg-white/5', 'hover:bg-slate-100')
content = content.replace('hover:bg-white/90', 'hover:bg-slate-900')
content = content.replace('bg-black/60', 'bg-slate-900/40')

with open("src/components/AuthModal.tsx", "w") as f:
    f.write(content)
