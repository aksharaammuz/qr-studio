/* ==========================================
   QRStudio - Application Logic & QR Generation
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --------------------------------------------------
    // 1. Theme Configuration & Toggle
    // --------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // Load stored theme or default to dark
    const storedTheme = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', storedTheme);
    updateThemeToggleIcon(storedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggleIcon(newTheme);
        
        // Slightly adapt active QR preview background if it's set to automatic theme sync
        if (currentPreset === 'neon' || currentPreset === 'minimal' || currentPreset === 'professional') {
            applyPreset(currentPreset);
        }
    });

    function updateThemeToggleIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }


    // --------------------------------------------------
    // 2. Initializing QR Code Styling Library
    // --------------------------------------------------
    let qrCode = null;
    let selectedLogo = null;
    let currentPreset = 'professional';
    let currentFormat = 'text';

    // Base URL for previews
    const baseHref = window.location.href.split('?')[0].replace('index.html', '');
    const previewBaseUrl = baseHref.endsWith('/') ? `${baseHref}preview.html` : `${baseHref}/preview.html`;

    // Default configuration options
    const qrOptions = {
        width: 300,
        height: 300,
        type: "svg",
        data: "Welcome to QRStudio!",
        image: "",
        dotsOptions: {
            color: "#0f172a",
            type: "square"
        },
        backgroundOptions: {
            color: "#ffffff"
        },
        imageOptions: {
            crossOrigin: "anonymous",
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 5
        },
        cornersSquareOptions: {
            color: "#0f172a",
            type: "square"
        },
        cornersDotOptions: {
            color: "#0f172a",
            type: "square"
        }
    };

    // Initialize QR Code Styling instance
    try {
        qrCode = new QRCodeStyling(qrOptions);
        qrCode.append(document.getElementById("canvas-qr-code"));
    } catch (e) {
        console.error("Failed to initialize qr-code-styling:", e);
    }

    // Secondary decorative instance for Hero visual
    try {
        const heroQr = new QRCodeStyling({
            width: 180,
            height: 180,
            data: "https://qrstudio.app",
            dotsOptions: {
                color: "#6366f1",
                type: "classy",
                gradient: {
                    type: "linear",
                    rotation: 45,
                    colorStops: [
                        { offset: 0, color: "#6366f1" },
                        { offset: 1, color: "#f43f5e" }
                    ]
                }
            },
            backgroundOptions: {
                color: "#ffffff"
            },
            cornersSquareOptions: {
                color: "#6366f1",
                type: "extra-rounded"
            },
            cornersDotOptions: {
                color: "#f43f5e",
                type: "dot"
            }
        });
        heroQr.append(document.getElementById("hero-qr-placeholder"));
    } catch (e) {
        console.error("Hero QR load error:", e);
    }


    // --------------------------------------------------
    // 3. QR Formatting Forms & Switcher
    // --------------------------------------------------
    const formatCards = document.querySelectorAll('.format-card');
    const formContainer = document.getElementById('dynamic-form-container');

    // Templates dictionary for form inputs
    const formTemplates = {
        text: `
            <div class="form-group">
                <label for="input-text">Your Text Message</label>
                <textarea class="form-control" id="input-text" placeholder="Type plain text message, logs, or values here...">Hello from QRStudio!</textarea>
            </div>
        `,
        url: `
            <div class="form-group">
                <label for="input-url">Website URL</label>
                <input type="url" class="form-control" id="input-url" placeholder="https://example.com" value="https://google.com">
            </div>
        `,
        phone: `
            <div class="form-group">
                <label for="input-phone">Phone Number</label>
                <input type="tel" class="form-control" id="input-phone" placeholder="+91 81118 25125" value="+918111825125">
            </div>
        `,
        whatsapp: `
            <div class="form-group">
                <label for="input-wa-phone">WhatsApp Number (with country code, no +)</label>
                <input type="tel" class="form-control" id="input-wa-phone" placeholder="918111825125" value="918111825125">
            </div>
            <div class="form-group">
                <label for="input-wa-msg">Pre-filled Chat Message (Optional)</label>
                <textarea class="form-control" id="input-wa-msg" placeholder="Hello! I am scanning your QR code.">Hi, I'd like to get in touch!</textarea>
            </div>
        `,
        email: `
            <div class="form-group">
                <label for="input-email-to">Recipient Email Address</label>
                <input type="email" class="form-control" id="input-email-to" placeholder="hello@example.com" value="contact@qrstudio.app">
            </div>
            <div class="form-group">
                <label for="input-email-sub">Subject Line</label>
                <input type="text" class="form-control" id="input-email-sub" placeholder="Inquiry regarding services" value="Hi QRStudio team">
            </div>
            <div class="form-group">
                <label for="input-email-body">Email Body Content</label>
                <textarea class="form-control" id="input-email-body" placeholder="Write message template...">I scanned your QR code and wanted to connect.</textarea>
            </div>
        `,
        wifi: `
            <div class="form-group">
                <label for="input-wifi-ssid">Network Name (SSID)</label>
                <input type="text" class="form-control" id="input-wifi-ssid" placeholder="My Home Network" value="QRStudio_Guest">
            </div>
            <div class="form-group">
                <label for="input-wifi-pass">Network Password</label>
                <input type="password" class="form-control" id="input-wifi-pass" placeholder="Network password keys" value="studioPass">
            </div>
            <div class="form-group">
                <label for="input-wifi-type">Security Encryption</label>
                <select class="form-control" id="input-wifi-type">
                    <option value="WPA" selected>WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Unsecured (None)</option>
                </select>
            </div>
        `,
        social: `
            <div class="form-group">
                <label for="input-social-ig">Instagram URL</label>
                <input type="url" class="form-control" id="input-social-ig" placeholder="https://instagram.com/username" value="https://instagram.com">
            </div>
            <div class="form-group">
                <label for="input-social-li">LinkedIn Profile URL</label>
                <input type="url" class="form-control" id="input-social-li" placeholder="https://linkedin.com/in/username" value="https://linkedin.com">
            </div>
            <div class="form-group">
                <label for="input-social-yt">YouTube Channel</label>
                <input type="url" class="form-control" id="input-social-yt" placeholder="https://youtube.com/@channel" value="https://youtube.com">
            </div>
        `,
        pdf: `
            <div class="form-group">
                <label for="input-pdf-url">PDF Cloud URL (Recommended for scanning)</label>
                <input type="url" class="form-control" id="input-pdf-url" placeholder="https://drive.google.com/file/.../view" value="https://drive.google.com">
                <span class="logo-info-text" style="margin-top: 0.25rem; display: block;">Host your PDF on Google Drive, Dropbox, or OneDrive and paste the shareable link.</span>
            </div>
            <div class="form-group" style="margin-top: 1rem; border-top: 1px dashed var(--border-color); padding-top: 1rem;">
                <label for="input-pdf-file">Or Upload File (Stores in browser session)</label>
                <input type="file" class="form-control" id="input-pdf-file" accept="application/pdf,image/*">
            </div>
        `,
        resume: `
            <h4 style="margin-bottom:1rem; font-size:1rem; color:var(--primary);">Personal Details</h4>
            <div class="form-group">
                <label for="res-name">Full Name</label>
                <input type="text" class="form-control" id="res-name" value="Akshara A">
            </div>
            <div class="form-group">
                <label for="res-title">Professional Title</label>
                <input type="text" class="form-control" id="res-title" value="Creative Product Director">
            </div>
            <div class="form-group">
                <label for="res-email">Email Address</label>
                <input type="email" class="form-control" id="res-email" value="contact@qrstudio.app">
            </div>
            <div class="form-group">
                <label for="res-phone">Phone Number</label>
                <input type="tel" class="form-control" id="res-phone" value="+91 81118 25125">
            </div>
            
            <h4 style="margin:1.5rem 0 1rem 0; font-size:1rem; color:var(--primary);">Experience & Profile</h4>
            <div class="form-group">
                <label for="res-summary">Professional Summary</label>
                <textarea class="form-control" id="res-summary">High-end product designer specialized in building premium glassmorphism interfaces, HSL-tailored color systems, and modern CSS components.</textarea>
            </div>
            <div class="form-group">
                <label for="res-skills">Skills (comma-separated)</label>
                <input type="text" class="form-control" id="res-skills" value="UI UX Design, CSS Grid & Flexbox, JavaScript, Creative Styling, Product Mapping">
            </div>
            <div class="form-group">
                <label for="res-job-title">Job Position</label>
                <input type="text" class="form-control" id="res-job-title" value="Lead UX Architect">
            </div>
            <div class="form-group">
                <label for="res-job-company">Company</label>
                <input type="text" class="form-control" id="res-job-company" value="Studio Nexus Inc.">
            </div>
            <div class="form-group">
                <label for="res-job-dates">Employment Dates</label>
                <input type="text" class="form-control" id="res-job-dates" value="2023 - Present">
            </div>
            <div class="form-group">
                <label for="res-job-desc">Job Description</label>
                <textarea class="form-control" id="res-job-desc">Spearheaded responsive front-end frameworks and coordinated layout visual mockups for client launches.</textarea>
            </div>

            <h4 style="margin:1.5rem 0 1rem 0; font-size:1rem; color:var(--primary);">Education</h4>
            <div class="form-group">
                <label for="res-edu-degree">Degree & Major</label>
                <input type="text" class="form-control" id="res-edu-degree" value="B.Sc. in Digital Media Design">
            </div>
            <div class="form-group">
                <label for="res-edu-school">School / University</label>
                <input type="text" class="form-control" id="res-edu-school" value="State Tech Design Academy">
            </div>
            <div class="form-group">
                <label for="res-edu-year">Graduation Year</label>
                <input type="text" class="form-control" id="res-edu-year" value="2021">
            </div>
        `,
        menu: `
            <div class="form-group">
                <label for="menu-restaurant">Restaurant Name</label>
                <input type="text" class="form-control" id="menu-restaurant" value="THE BRASSERIE">
            </div>
            <div class="form-group">
                <label for="menu-subtitle">Subtitle / Category</label>
                <input type="text" class="form-control" id="menu-subtitle" value="Gourmet Dining & Fine Drinks">
            </div>

            <h4 style="margin:1.5rem 0 1rem 0; font-size:1rem; color:var(--primary);">Menu Items</h4>
            <div id="menu-items-list-container">
                <!-- Individual menu items go here -->
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-add-menu-item" style="width: 100%; margin-top: 1rem;">
                <i class="fa-solid fa-plus"></i> Add Menu Item
            </button>
        `
    };

    // Keep track of Menu Items dynamically in state
    let menuItems = [
        { name: "Artisanal Toast", description: "Sourdough toast with organic berries and ricotta cheese.", price: "$12.00", category: "Appetizers", type: "veg" },
        { name: "Avocado Benedict", description: "Poached free-range eggs on toasted brioche with fresh avocado salsa.", price: "$16.50", category: "Main Course", type: "veg" },
        { name: "Crispy Duck Leg", description: "Slow-roasted duck leg served with sweet potato purée and orange glaze.", price: "$28.00", category: "Main Course", type: "non-veg" }
    ];

    // Swapper functionality
    formatCards.forEach(card => {
        card.addEventListener('click', () => {
            formatCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const format = card.getAttribute('data-format');
            currentFormat = format;
            loadForm(format);

            // Auto-traverse to conversion/customizer section
            const customizerEl = document.getElementById('customizer');
            if (customizerEl) {
                customizerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Update hash for consistent navigation
            window.location.hash = 'customizer';
        });
    });


    // Render active form
    function loadForm(format) {
        formContainer.innerHTML = formTemplates[format];
        
        // Additional handler bindings for special forms
        if (format === 'menu') {
            renderMenuItemsList();
            document.getElementById('btn-add-menu-item').addEventListener('click', () => {
                menuItems.push({ name: "", description: "", price: "", category: "Main Course", type: "none" });
                renderMenuItemsList();
                generateQRData();
            });
        }
        
        if (format === 'pdf') {
            const pdfFileInput = document.getElementById('input-pdf-file');
            pdfFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 1.5 * 1024 * 1024) {
                        alert("File is too large. For optimal QR scanning, upload files under 1MB.");
                        pdfFileInput.value = '';
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        // Generate local viewer link in browser using base64
                        document.getElementById('input-pdf-url').value = evt.target.result;
                        generateQRData();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Attach global input listener to update QR code automatically on changes
        const formInputs = formContainer.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('input', generateQRData);
        });
        
        // Initial compile
        generateQRData();
    }

    // Menu Card Items Rendering
    function renderMenuItemsList() {
        const listContainer = document.getElementById('menu-items-list-container');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        menuItems.forEach((item, index) => {
            const itemBox = document.createElement('div');
            itemBox.className = 'menu-item-edit-box';
            itemBox.style.cssText = "background: rgba(0,0,0,0.1); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; position: relative;";
            
            itemBox.innerHTML = `
                <button class="remove-menu-item-btn" data-index="${index}" style="position:absolute; top:8px; right:8px; border:none; background:none; color:var(--accent-light); cursor:pointer; font-size:1rem;" aria-label="Remove item">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <div class="form-group" style="margin-bottom:0.75rem;">
                    <label>Item Name</label>
                    <input type="text" class="form-control item-name-in" data-index="${index}" value="${item.name}" placeholder="Espresso Macchiato">
                </div>
                <div class="form-group" style="margin-bottom:0.75rem;">
                    <label>Category (Section)</label>
                    <input type="text" class="form-control item-cat-in" data-index="${index}" value="${item.category}" placeholder="Beverages">
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; margin-bottom:0.75rem;">
                    <div class="form-group" style="margin-bottom:0;">
                        <label>Price</label>
                        <input type="text" class="form-control item-price-in" data-index="${index}" value="${item.price}" placeholder="$4.50">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label>Dietary Style</label>
                        <select class="form-control item-type-in" data-index="${index}">
                            <option value="none" ${item.type === 'none' ? 'selected' : ''}>None</option>
                            <option value="veg" ${item.type === 'veg' ? 'selected' : ''}>Vegetarian</option>
                            <option value="non-veg" ${item.type === 'non-veg' ? 'selected' : ''}>Non-Vegetarian</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>Description</label>
                    <textarea class="form-control item-desc-in" data-index="${index}" placeholder="Double espresso shot topped with frothed milk...">${item.description}</textarea>
                </div>
            `;
            
            listContainer.appendChild(itemBox);
        });

        // Add event listeners to newly rendered elements
        listContainer.querySelectorAll('.remove-menu-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                menuItems.splice(idx, 1);
                renderMenuItemsList();
                generateQRData();
            });
        });

        listContainer.querySelectorAll('.item-name-in').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(input.getAttribute('data-index'));
                menuItems[idx].name = input.value;
                generateQRData();
            });
        });
        
        listContainer.querySelectorAll('.item-cat-in').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(input.getAttribute('data-index'));
                menuItems[idx].category = input.value;
                generateQRData();
            });
        });

        listContainer.querySelectorAll('.item-price-in').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(input.getAttribute('data-index'));
                menuItems[idx].price = input.value;
                generateQRData();
            });
        });

        listContainer.querySelectorAll('.item-type-in').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(select.getAttribute('data-index'));
                menuItems[idx].type = select.value;
                generateQRData();
            });
        });

        listContainer.querySelectorAll('.item-desc-in').forEach(textarea => {
            textarea.addEventListener('input', (e) => {
                const idx = parseInt(textarea.getAttribute('data-index'));
                menuItems[idx].description = textarea.value;
                generateQRData();
            });
        });
    }

    // Compile inputs and construct QR text payload
    function generateQRData() {
        let textPayload = "Welcome to QRStudio!";
        
        switch (currentFormat) {
            case 'text':
                const txt = document.getElementById('input-text');
                textPayload = txt ? txt.value : "Welcome to QRStudio!";
                break;
                
            case 'url':
                const url = document.getElementById('input-url');
                textPayload = url ? url.value : "https://qrstudio.app";
                break;
                
            case 'phone':
                const phone = document.getElementById('input-phone');
                textPayload = phone ? `tel:${phone.value.trim()}` : "tel:+918111825125";
                break;
                
            case 'whatsapp':
                const waNum = document.getElementById('input-wa-phone');
                const waMsg = document.getElementById('input-wa-msg');
                if (waNum) {
                    const encodedMsg = encodeURIComponent(waMsg ? waMsg.value : "");
                    textPayload = `https://wa.me/${waNum.value.trim()}?text=${encodedMsg}`;
                }
                break;
                
            case 'email':
                const mTo = document.getElementById('input-email-to');
                const mSub = document.getElementById('input-email-sub');
                const mBody = document.getElementById('input-email-body');
                if (mTo) {
                    textPayload = `mailto:${mTo.value.trim()}?subject=${encodeURIComponent(mSub ? mSub.value : "")}&body=${encodeURIComponent(mBody ? mBody.value : "")}`;
                }
                break;
                
            case 'wifi':
                const wSSID = document.getElementById('input-wifi-ssid');
                const wPass = document.getElementById('input-wifi-pass');
                const wType = document.getElementById('input-wifi-type');
                if (wSSID) {
                    textPayload = `WIFI:S:${wSSID.value};T:${wType ? wType.value : "WPA"};P:${wPass ? wPass.value : ""};;`;
                }
                break;
                
            case 'social':
                const sIg = document.getElementById('input-social-ig');
                const sLi = document.getElementById('input-social-li');
                const sYt = document.getElementById('input-social-yt');
                // Compile multiple social links into a beautiful landing summary or just default to Instagram
                textPayload = (sIg && sIg.value) ? sIg.value : ((sLi && sLi.value) ? sLi.value : "https://instagram.com");
                break;
                
            case 'pdf':
                const pdf = document.getElementById('input-pdf-url');
                textPayload = pdf ? pdf.value : "https://drive.google.com";
                break;
                
            case 'resume':
                // Serialize all fields, encode to Base64, build redirect link
                const resumeData = {
                    name: document.getElementById('res-name')?.value || '',
                    title: document.getElementById('res-title')?.value || '',
                    email: document.getElementById('res-email')?.value || '',
                    phone: document.getElementById('res-phone')?.value || '',
                    summary: document.getElementById('res-summary')?.value || '',
                    skills: document.getElementById('res-skills')?.value || '',
                    jobTitle: document.getElementById('res-job-title')?.value || '',
                    jobCompany: document.getElementById('res-job-company')?.value || '',
                    jobDates: document.getElementById('res-job-dates')?.value || '',
                    jobDesc: document.getElementById('res-job-desc')?.value || '',
                    eduDegree: document.getElementById('res-edu-degree')?.value || '',
                    eduSchool: document.getElementById('res-edu-school')?.value || '',
                    eduYear: document.getElementById('res-edu-year')?.value || ''
                };
                try {
                    // Safe UTF-8 Base64 serialization
                    const jsonStr = JSON.stringify(resumeData);
                    const b64 = btoa(encodeURIComponent(jsonStr));
                    textPayload = `${previewBaseUrl}?type=resume&data=${b64}`;
                } catch (e) {
                    console.error("Resume serialization error:", e);
                }
                break;
                
            case 'menu':
                const menuData = {
                    restaurant: document.getElementById('menu-restaurant')?.value || '',
                    subtitle: document.getElementById('menu-subtitle')?.value || '',
                    items: menuItems
                };
                try {
                    const jsonStr = JSON.stringify(menuData);
                    const b64 = btoa(encodeURIComponent(jsonStr));
                    textPayload = `${previewBaseUrl}?type=menu&data=${b64}`;
                } catch (e) {
                    console.error("Menu serialization error:", e);
                }
                break;
        }

        // Apply new payload
        if (qrCode) {
            qrOptions.data = textPayload;
            qrCode.update(qrOptions);
            
            // Sync live output inside Mockup overlays (requires waiting 100ms for library redraw)
            setTimeout(syncMockupQRImages, 150);
        }
    }


    // --------------------------------------------------
    // 4. Customizer Logic: Presets, Shapes, & Colors
    // --------------------------------------------------
    const presetBtns = document.querySelectorAll('.preset-btn');
    const colorFore = document.getElementById('color-foreground');
    const colorForeHex = document.getElementById('color-foreground-hex');
    const colorBack = document.getElementById('color-background');
    const colorBackHex = document.getElementById('color-background-hex');
    const enableGrad = document.getElementById('enable-gradient');
    const gradBox = document.getElementById('gradient-controls-box');
    const colorGradTo = document.getElementById('color-gradient-to');
    const colorGradToHex = document.getElementById('color-gradient-to-hex');
    const gradType = document.getElementById('gradient-type');
    const qrDotStyle = document.getElementById('qr-dot-style');
    const qrCornerStyle = document.getElementById('qr-corner-style');

    // Color Pickers <-> Hex Inputs Syncing
    function syncColorPickers(picker, hexInput) {
        picker.addEventListener('input', () => {
            hexInput.value = picker.value.toUpperCase();
            updateQRDesign();
        });
        hexInput.addEventListener('input', () => {
            if (hexInput.value.match(/^#[0-9A-F]{6}$/i)) {
                picker.value = hexInput.value;
                updateQRDesign();
            }
        });
    }

    syncColorPickers(colorFore, colorForeHex);
    syncColorPickers(colorBack, colorBackHex);
    syncColorPickers(colorGradTo, colorGradToHex);

    // Gradient toggle visibility
    enableGrad.addEventListener('change', () => {
        if (enableGrad.checked) {
            gradBox.classList.remove('hidden');
        } else {
            gradBox.classList.add('hidden');
        }
        updateQRDesign();
    });

    gradType.addEventListener('change', updateQRDesign);
    qrDotStyle.addEventListener('change', updateQRDesign);
    qrCornerStyle.addEventListener('change', updateQRDesign);

    // Presets Click Handler
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const presetName = btn.getAttribute('data-preset');
            currentPreset = presetName;
            applyPreset(presetName);
        });
    });

    function applyPreset(preset) {
        const isDarkTheme = root.getAttribute('data-theme') === 'dark';
        
        switch (preset) {
            case 'professional':
                // Deep Navy on White
                colorFore.value = "#0f172a";
                colorForeHex.value = "#0F172A";
                colorBack.value = "#ffffff";
                colorBackHex.value = "#FFFFFF";
                enableGrad.checked = false;
                gradBox.classList.add('hidden');
                qrDotStyle.value = "square";
                qrCornerStyle.value = "square";
                break;
                
            case 'minimal':
                // Matte Black on White/Transparent
                colorFore.value = "#000000";
                colorForeHex.value = "#000000";
                colorBack.value = "#ffffff";
                colorBackHex.value = "#FFFFFF";
                enableGrad.checked = false;
                gradBox.classList.add('hidden');
                qrDotStyle.value = "rounded";
                qrCornerStyle.value = "dot";
                break;
                
            case 'neon':
                // Pink-to-Purple Neon Glow on Obsidian
                colorFore.value = "#a855f7";
                colorForeHex.value = "#A855F7";
                colorBack.value = isDarkTheme ? "#070a13" : "#fafafa";
                colorBackHex.value = isDarkTheme ? "#070A13" : "#FAFAFA";
                enableGrad.checked = true;
                gradBox.classList.remove('hidden');
                colorGradTo.value = "#f43f5e";
                colorGradToHex.value = "#F43F5E";
                gradType.value = "linear";
                qrDotStyle.value = "dots";
                qrCornerStyle.value = "dot";
                break;
                
            case 'cute':
                // Pastel Rose Pink on warm Cream
                colorFore.value = "#fb7185";
                colorForeHex.value = "#FB7185";
                colorBack.value = "#fdfaf6";
                colorBackHex.value = "#FDFAF6";
                enableGrad.checked = false;
                gradBox.classList.add('hidden');
                qrDotStyle.value = "extra-rounded";
                qrCornerStyle.value = "extra-rounded";
                break;
        }
        
        updateQRDesign();
    }

    // Process options change and trigger draw
    function updateQRDesign() {
        if (!qrCode) return;

        // 1. Setup Dot Patterns
        const dotsOptions = {
            type: qrDotStyle.value
        };

        if (enableGrad.checked) {
            dotsOptions.gradient = {
                type: gradType.value,
                rotation: 45,
                colorStops: [
                    { offset: 0, color: colorFore.value },
                    { offset: 1, color: colorGradTo.value }
                ]
            };
            dotsOptions.color = undefined;
        } else {
            dotsOptions.color = colorFore.value;
            dotsOptions.gradient = undefined;
        }

        // 2. Setup background
        const backgroundOptions = {
            color: colorBack.value
        };

        // 3. Setup corners options
        const cornersSquareOptions = {
            type: qrCornerStyle.value,
            color: colorFore.value
        };
        const cornersDotOptions = {
            type: qrCornerStyle.value === 'square' ? 'square' : 'dot',
            color: colorFore.value
        };

        // If gradient, match corners colors to the start/end options
        if (enableGrad.checked) {
            cornersSquareOptions.color = colorFore.value;
            cornersDotOptions.color = colorGradTo.value;
        }

        // 4. Center logo option
        const logoPath = selectedLogo ? selectedLogo : "";

        // Merge back into qrOptions
        qrOptions.dotsOptions = dotsOptions;
        qrOptions.backgroundOptions = backgroundOptions;
        qrOptions.cornersSquareOptions = cornersSquareOptions;
        qrOptions.cornersDotOptions = cornersDotOptions;
        qrOptions.image = logoPath;

        // Apply changes
        qrCode.update(qrOptions);
        
        // Sync mockup QR image previews
        setTimeout(syncMockupQRImages, 150);
    }


    // --------------------------------------------------
    // 5. Logo Placement & File Reader
    // --------------------------------------------------
    const logoUploadBtn = document.getElementById('logo-upload-trigger');
    const logoFileInput = document.getElementById('logo-file-input');
    const logoBadge = document.getElementById('logo-preview-badge');
    const logoFilename = document.getElementById('logo-filename');
    const removeLogoBtn = document.getElementById('remove-logo-btn');

    logoUploadBtn.addEventListener('click', () => logoFileInput.click());
    
    logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                selectedLogo = event.target.result;
                logoFilename.textContent = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
                logoBadge.classList.remove('hidden');
                updateQRDesign();
            };
            reader.readAsDataURL(file);
        }
    });

    removeLogoBtn.addEventListener('click', () => {
        selectedLogo = null;
        logoFileInput.value = '';
        logoBadge.classList.add('hidden');
        updateQRDesign();
    });


    // --------------------------------------------------
    // 6. Action Button Downloads & Copy Linking
    // --------------------------------------------------
    const btnDownloadPng = document.getElementById('btn-download-png');
    const btnDownloadSvg = document.getElementById('btn-download-svg');
    const btnCopyLink = document.getElementById('btn-copy-link');

    btnDownloadPng.addEventListener('click', () => {
        if (qrCode) {
            qrCode.download({ name: "qr-studio-code", extension: "png" });
        }
    });

    btnDownloadSvg.addEventListener('click', () => {
        if (qrCode) {
            qrCode.download({ name: "qr-studio-code", extension: "svg" });
        }
    });

    btnCopyLink.addEventListener('click', () => {
        navigator.clipboard.writeText(qrOptions.data).then(() => {
            const origText = btnCopyLink.innerHTML;
            btnCopyLink.innerHTML = `<i class="fa-solid fa-check"></i> Link Copied!`;
            setTimeout(() => {
                btnCopyLink.innerHTML = origText;
            }, 2000);
        }).catch(err => {
            console.error("Copy Link Failed:", err);
            alert("Scan link details: \n\n" + qrOptions.data);
        });
    });


    // --------------------------------------------------
    // 7. Real-Life Mockups Syncer
    // --------------------------------------------------
    const mockupTabBtns = document.querySelectorAll('.mockup-tab-btn');
    const mockupDisplays = document.querySelectorAll('.mockup-display');

    mockupTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mockupTabBtns.forEach(b => b.classList.remove('active'));
            mockupDisplays.forEach(d => d.classList.remove('active'));
            
            btn.classList.add('active');
            const mockupName = btn.getAttribute('data-mockup');
            document.getElementById(`mockup-${mockupName}`).classList.add('active');
        });
    });

    // Extract QR code canvas visual and overlay inside mockup image placeholders
    function syncMockupQRImages() {
        const svgElem = document.querySelector('#canvas-qr-code svg');
        const qrCanvas = document.querySelector('#canvas-qr-code canvas');
        if (!svgElem && !qrCanvas) return;
        
        try {
            // Convert svg or canvas element to dataUrl image representation
            let dataUrl = "";
            
            // Note: qr-code-styling renders as SVG element by default under options.type = "svg"
            // Or canvas elements. Let's make sure we export correctly:
            const svgElem = document.querySelector('#canvas-qr-code svg');
            
            if (svgElem) {
                // If it's SVG, serialize to Base64 dataUrl
                const svgString = new XMLSerializer().serializeToString(svgElem);
                const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                dataUrl = URL.createObjectURL(svgBlob);
            } else if (qrCanvas) {
                // If it's a Canvas element
                dataUrl = qrCanvas.toDataURL("image/png");
            }

            if (dataUrl) {
                const mockupImages = document.querySelectorAll('.mockup-qr-image');
                mockupImages.forEach(img => {
                    img.src = dataUrl;
                });
            }
        } catch (err) {
            console.error("Syncing QR to mockup canvases failed:", err);
        }
    }


    // --------------------------------------------------
    // 8. Accordion Toggles (FAQs)
    // --------------------------------------------------
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other FAQ items
            faqItems.forEach(fi => fi.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });


    // --------------------------------------------------
    // 9. Scroll Animations Observer
    // --------------------------------------------------
    const animateElements = document.querySelectorAll('.scroll-fade');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });
        
        animateElements.forEach(el => observer.observe(el));
    } else {
        // Fallback if IntersectionObserver is not supported
        animateElements.forEach(el => el.classList.add('appear'));
    }


    // --------------------------------------------------
    // 10. Startup Initialization
    // --------------------------------------------------
    // Load text form as active by default
    loadForm('text');
    
    // Apply styling options
    applyPreset('professional');
});
