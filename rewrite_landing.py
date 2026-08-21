import re

with open("src/components/LandingPage.tsx", "r") as f:
    content = f.read()

# 1. Remove Supabase metrics
content = re.sub(r"  // Real-time metrics from Supabase.*?(?=  // Demo tab state)", "", content, flags=re.DOTALL)
content = re.sub(r"  const \[sitesCount, setSitesCount\] = useState<number>\(14230\);\n  const \[activeUsersCount, setActiveUsersCount\] = useState<number>\(6\);\n  const \[latence, setLatence\] = useState<number>\(28\);\n", "", content)

# 2. Update background colors & text to match light theme
content = content.replace("bg-[#070A0F]", "bg-[var(--color-bg-light)]")
content = content.replace("bg-[#0B101A]", "bg-[var(--color-surface-light)]")
content = content.replace("text-white", "text-ink")
content = content.replace("text-slate-200", "text-slate-700")
content = content.replace("text-slate-300", "text-slate-600")
content = content.replace("text-slate-400", "text-slate-500")
content = content.replace("text-slate-500", "text-slate-400")
content = content.replace("border-white/[0.08]", "border-border-light")
content = content.replace("border-white/[0.12]", "border-border-light")
content = content.replace("border-white/10", "border-border-light")
content = content.replace("border-white/5", "border-border-light")
content = content.replace("bg-white/[0.04]", "bg-white")
content = content.replace("bg-white/[0.03]", "bg-white")
content = content.replace("bg-white/[0.02]", "bg-white")
content = content.replace("bg-white/[0.05]", "bg-white")
content = content.replace("shadow-white/5", "shadow-black/5")

# Change accent colors
content = content.replace("amber-500", "accent-blue")
content = content.replace("amber-400", "accent-blue")
content = content.replace("amber-300", "accent-blue")
content = content.replace("text-black", "text-white") # Since accent-blue button needs white text

with open("src/components/LandingPage.tsx", "w") as f:
    f.write(content)
