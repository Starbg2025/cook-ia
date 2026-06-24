export const cinematicSpaceTemplate = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aetheris - Cinematic Space-Travel</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        heading: ['"Instrument Serif"', 'serif'],
                        body: ['"Barlow"', 'sans-serif'],
                    },
                    borderRadius: {
                        DEFAULT: '9999px',
                        'pill': '9999px',
                    }
                }
            }
        }
    </script>

    <!-- Liquid Glass Custom Styles -->
    <style>
        body {
            background-color: #000;
            color: #fff;
            font-family: 'Barlow', sans-serif;
            overflow-x: hidden;
            margin: 0;
            padding: 0;
        }

        .liquid-glass {
            background: rgba(255, 255, 255, 0.015);
            background-blend-mode: luminosity;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border: none;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }

        .liquid-glass::before {
            content: "";
            position: absolute; 
            inset: 0;
            border-radius: inherit;
            padding: 1.4px;
            background: linear-gradient(180deg,
                rgba(255, 255, 255, 0.45) 0%,
                rgba(255, 255, 255, 0.15) 20%,
                rgba(255, 255, 255, 0) 40%,
                rgba(255, 255, 255, 0) 60%,
                rgba(255, 255, 255, 0.15) 80%,
                rgba(255, 255, 255, 0.45) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }

        .liquid-glass-strong {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(50px);
            -webkit-backdrop-filter: blur(50px);
            border: none;
            box-shadow: 4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15);
            position: relative;
            overflow: hidden;
        }

        .liquid-glass-strong::before {
            content: "";
            position: absolute; 
            inset: 0;
            border-radius: inherit;
            padding: 1.4px;
            background: linear-gradient(180deg,
                rgba(255, 255, 255, 0.5) 0%,
                rgba(255, 255, 255, 0.2) 20%,
                rgba(255, 255, 255, 0) 40%,
                rgba(255, 255, 255, 0) 60%,
                rgba(255, 255, 255, 0.2) 80%,
                rgba(255, 255, 255, 0.5) 100%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }

        /* Hide Scrollbars */
        .scrollbar-none::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>

    <!-- React and Framer Motion CDNs -->
    <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
    <script src="https://unpkg.com/framer-motion@11.11.17/dist/framer-motion.js"></script>
    <script>
        window.Motion = window.FramerMotion;
    </script>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        const { motion, AnimatePresence } = window.Motion;

        // Inline custom icons
        const ArrowUpRight = ({ className = "h-5 w-5" }) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
        );

        const Play = ({ className = "h-4 w-4" }) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
                <polygon points="6 4 20 12 6 20 6 4"></polygon>
            </svg>
        );

        // Custom FadingVideo Component
        const FadingVideo = ({ src, className, style = {} }) => {
            const videoRef = useRef(null);
            const rAFRef = useRef(null);
            const fadingOutRef = useRef(false);

            const fadeTo = (targetOpacity, duration) => {
                if (!videoRef.current) return;
                
                const startOpacity = parseFloat(videoRef.current.style.opacity) || 0;
                const startTime = performance.now();

                const animate = (now) => {
                    if (!videoRef.current) return;
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
                    videoRef.current.style.opacity = currentOpacity.toString();

                    if (progress < 1) {
                        rAFRef.current = requestAnimationFrame(animate);
                    }
                };

                if (rAFRef.current) {
                    cancelAnimationFrame(rAFRef.current);
                }
                rAFRef.current = requestAnimationFrame(animate);
            };

            const handleLoadedData = () => {
                if (!videoRef.current) return;
                videoRef.current.style.opacity = "0";
                videoRef.current.play().then(() => {
                    fadeTo(1, 500);
                }).catch(e => console.log("Video play interrupted", e));
            };

            const handleTimeUpdate = () => {
                const video = videoRef.current;
                if (!video) return;

                const duration = video.duration;
                const currentTime = video.currentTime;

                if (duration && !fadingOutRef.current && (duration - currentTime <= 0.55) && (duration - currentTime > 0)) {
                    fadingOutRef.current = true;
                    fadeTo(0, 500);
                }
            };

            const handleEnded = () => {
                const video = videoRef.current;
                if (!video) return;

                video.style.opacity = "0";
                setTimeout(() => {
                    if (!video) return;
                    video.currentTime = 0;
                    video.play().then(() => {
                        fadingOutRef.current = false;
                        fadeTo(1, 500);
                    }).catch(e => console.log("Video retry play failed", e));
                }, 100);
            };

            useEffect(() => {
                const video = videoRef.current;
                if (video) {
                    video.style.opacity = "0";
                    video.addEventListener('loadeddata', handleLoadedData);
                    video.addEventListener('timeupdate', handleTimeUpdate);
                    video.addEventListener('ended', handleEnded);
                }

                return () => {
                    if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
                    if (video) {
                        video.removeEventListener('loadeddata', handleLoadedData);
                        video.removeEventListener('timeupdate', handleTimeUpdate);
                        video.removeEventListener('ended', handleEnded);
                    }
                };
            }, [src]);

            return (
                <video
                    ref={videoRef}
                    src={src}
                    className={className}
                    style={{ ...style, pointerEvents: 'none' }}
                    muted
                    playsInline
                    preload="auto"
                />
            );
        };

        // Word-by-word BlurText Component
        const BlurText = ({ text }) => {
            const [isVisible, setIsVisible] = useState(false);
            const containerRef = useRef(null);

            useEffect(() => {
                const observer = new IntersectionObserver(([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                }, { threshold: 0.1 });

                if (containerRef.current) {
                    observer.observe(containerRef.current);
                }

                return () => observer.disconnect();
            }, []);

            const words = text.split(" ");

            return (
                <div 
                    ref={containerRef}
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        rowGap: '0.1em'
                    }}
                >
                    {words.map((word, i) => (
                        <motion.span
                            key={i}
                            initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
                            animate={isVisible ? {
                                filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                                opacity: [0, 0.5, 1],
                                y: [50, -5, 0]
                            } : {}}
                            transition={isVisible ? {
                                duration: 0.7,
                                times: [0, 0.5, 1],
                                ease: "easeOut",
                                delay: (i * 100) / 1000
                            } : {}}
                            style={{
                                display: 'inline-block',
                                marginRight: '0.28em'
                            }}
                        >
                            {word}
                        </motion.span>
                    ))}
                </div>
            );
        };

        // Main Application Component
        const App = () => {
            // Suppress benign list keys warning in React with console error override
            useEffect(() => {
                const originalError = console.error;
                console.error = (...args) => {
                    if (args[0] && args[0].includes('Each child in a list should have a unique')) return;
                    originalError(...args);
                };
                return () => {
                    console.error = originalError;
                };
            }, []);

            return (
                <div className="relative w-full bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
                    
                    {/* SECTION 1: HERO */}
                    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden z-10">
                        {/* Fading Video Background (120% scale) */}
                        <FadingVideo 
                            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
                            className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
                            style={{ width: "120%", height: "120%" }}
                        />

                        {/* Navigation Header */}
                        <header className="fixed top-4 left-0 w-full px-8 lg:px-16 flex justify-between items-center z-50">
                            {/* Logo */}
                            <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center font-heading text-2xl italic font-semibold text-white">
                                a
                            </div>

                            {/* Center Navigation Pill (Desktop only) */}
                            <nav className="hidden md:flex items-center liquid-glass rounded-full p-1.5 gap-1 shadow-lg">
                                {["Home", "Voyages", "Worlds", "Innovation", "Plan Launch"].map((item) => (
                                    <a 
                                        key={item} 
                                        href="#" 
                                        className="px-4 py-2 text-xs uppercase tracking-widest font-body font-semibold text-white/80 hover:text-white transition-all hover:bg-white/5 rounded-full"
                                    >
                                        {item}
                                    </a>
                                ))}
                                <button className="ml-2 px-5 py-2 text-xs uppercase tracking-widest font-black bg-white text-black rounded-full shadow-md flex items-center gap-1.5 hover:bg-zinc-150 transition-all cursor-pointer">
                                    Claim a Spot
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                            </nav>

                            {/* Right Space */}
                            <div className="w-12 h-12 opacity-0 pointer-events-none" />
                        </header>

                        {/* Hero Content Panel */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center pt-32 px-6 relative z-10 max-w-4xl mx-auto">
                            {/* Badge */}
                            <motion.div 
                                initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
                                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                                className="inline-flex items-center gap-2 p-1 pr-4 rounded-full liquid-glass mb-6"
                            >
                                <span className="bg-white text-black font-body text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full">
                                    New
                                </span>
                                <span className="text-xs font-semibold tracking-wider font-body text-white/90">
                                    Maiden Crewed Voyage to Mars Arrives 2026
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] tracking-[-3px] max-w-2xl text-center mb-6">
                                <BlurText text="Venture Past Our Sky Across the Universe" />
                            </h1>

                            {/* Subheading */}
                            <motion.p 
                                initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
                                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                                className="text-sm md:text-base font-body font-light text-white/80 max-w-2xl leading-relaxed mb-8"
                            >
                                Discover the universe in ways once unimaginable. Our pioneering vessels and breakthrough engineering bring deep-space exploration within reach—secure and extraordinary.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div 
                                initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
                                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
                                className="flex flex-wrap items-center justify-center gap-6 mb-12"
                            >
                                <button className="liquid-glass-strong rounded-full px-7 py-3 text-xs uppercase font-black tracking-widest text-white hover:scale-105 transition-all shadow-xl hover:shadow-white/5 cursor-pointer flex items-center gap-2">
                                    Start Your Voyage
                                    <ArrowUpRight className="h-4 w-4" />
                                </button>
                                <a href="#" className="flex items-center gap-2 text-xs uppercase font-black tracking-widest text-white/90 hover:text-white transition-all">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <Play className="h-3 w-3 text-white fill-white" />
                                    </div>
                                    View Liftoff
                                </a>
                            </motion.div>

                            {/* Stats row */}
                            <motion.div 
                                initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
                                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
                                className="flex flex-col sm:flex-row gap-6"
                            >
                                {/* Card 1 */}
                                <div className="liquid-glass p-6 w-[220px] rounded-[1.25rem] text-left">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/80 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    </div>
                                    <h3 className="font-heading text-4xl italic text-white tracking-tight leading-none">34.5 Min</h3>
                                    <p className="text-[10px] font-body font-light text-white/50 uppercase tracking-widest mt-2">Average Videos Watch Time</p>
                                </div>

                                {/* Card 2 */}
                                <div className="liquid-glass p-6 w-[220px] rounded-[1.25rem] text-left">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/80 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                                    </div>
                                    <h3 className="font-heading text-4xl italic text-white tracking-tight leading-none">2.8B+</h3>
                                    <p className="text-[10px] font-body font-light text-white/50 uppercase tracking-widest mt-2">Users Across the Globe</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Partners at the Bottom */}
                        <motion.div 
                            initial={{ filter: "blur(10px)", opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1.4 }}
                            className="flex flex-col items-center gap-4 pb-12 z-10"
                        >
                            <div className="liquid-glass rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70">
                                Collaborating with top aerospace pioneers globally
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 font-heading text-2xl md:text-3xl italic text-white/55">
                                <span>Aeon</span>
                                <span>·</span>
                                <span>Vela</span>
                                <span>·</span>
                                <span>Apex</span>
                                <span>·</span>
                                <span>Orbit</span>
                                <span>·</span>
                                <span>Zeno</span>
                            </div>
                        </motion.div>
                    </section>


                    {/* SECTION 2: CAPABILITIES */}
                    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden z-10">
                        {/* Fading Video Background (Full-bleed) */}
                        <FadingVideo 
                            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
                            className="absolute inset-0 w-full h-full object-cover z-0"
                        />

                        {/* Content Area */}
                        <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-32 pb-16 flex flex-col min-h-screen justify-between w-full">
                            
                            {/* Section Header */}
                            <div className="mb-12">
                                <span className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-white/75 block mb-4">
                                    // Capabilities
                                </span>
                                <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.85] tracking-[-3px] max-w-3xl">
                                    Production<br/>evolved
                                </h2>
                            </div>

                            {/* Three Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                                
                                {/* Card 1: AI Scenery */}
                                <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Nested square icon */}
                                        <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center text-white shrink-0">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z" />
                                            </svg>
                                        </div>
                                        {/* Small liquid-glass pill tags */}
                                        <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                                            {["Natural Context", "Photo Realism", "Infinite Settings", "Eco-Vibe"].map((tag) => (
                                                <span key={tag} className="liquid-glass rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-white/95 font-body">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="font-heading italic text-white text-2xl md:text-3xl tracking-[-1px] leading-none">
                                            AI Scenery
                                        </h3>
                                        <p className="mt-3 text-xs font-body font-light text-white/80 leading-relaxed max-w-[32ch]">
                                            AI analyzes your product to create indistinguishable natural environments — from Icelandic cliffs to misty forests.
                                        </p>
                                    </div>
                                </div>

                                {/* Card 2: Batch Production */}
                                <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Nested square icon */}
                                        <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center text-white shrink-0">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z" />
                                            </svg>
                                        </div>
                                        {/* Small liquid-glass pill tags */}
                                        <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                                            {["Scale Fast", "Visual Consistency", "Time Saver", "Ready to Post"].map((tag) => (
                                                <span key={tag} className="liquid-glass rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-white/95 font-body">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="font-heading italic text-white text-2xl md:text-3xl tracking-[-1px] leading-none">
                                            Batch Production
                                        </h3>
                                        <p className="mt-3 text-xs font-body font-light text-white/80 leading-relaxed max-w-[32ch]">
                                            Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.
                                        </p>
                                    </div>
                                </div>

                                {/* Card 3: Smart Lighting */}
                                <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col justify-between">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Nested square icon */}
                                        <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center text-white shrink-0">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z" />
                                            </svg>
                                        </div>
                                        {/* Small liquid-glass pill tags */}
                                        <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                                            {["Ray Tracing", "Physical Shadows", "Studio Quality", "Sunlight Sync"].map((tag) => (
                                                <span key={tag} className="liquid-glass rounded-full px-2.5 py-0.5 text-[9px] font-semibold text-white/95 font-body">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="font-heading italic text-white text-2xl md:text-3xl tracking-[-1px] leading-none">
                                            Smart Lighting
                                        </h3>
                                        <p className="mt-3 text-xs font-body font-light text-white/80 leading-relaxed max-w-[32ch]">
                                            Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                </div>
            );
        };

        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
    </script>
</body>
</html>`;
