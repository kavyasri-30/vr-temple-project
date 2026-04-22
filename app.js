// Scene descriptions and hotspot definitions
const scenesConfig = {
    entrance: {
        title: "Temple Entrance",
        description: "Welcome to the sacred grounds. Look for the pulsing navigation points to move inward.",
        hotspots: [
            { target: "left1", position: "-1.2 -1 -4", label: "Enter Left Path", direction: "left" }
        ]
    },

    left1: {
        title: "Entrance Path - Left",
        description: "Walking along the left corridor of the temple complex.",
        hotspots: [
            { target: "left3", position: "-1.5 -1 -4", label: "Continue Forward", direction: "up" },
            { target: "entrance", position: "0 -1 4", label: "Back to Entrance", direction: "down" }
        ]
    },

    left3: {
        title: "Sacred Garden Path",
        description: "The path narrows as we approach the main temple structure.",
        hotspots: [
            { target: "left4", position: "-1.5 -1 -4", label: "Main Path", direction: "up" },
            { target: "left1", position: "1.5 -1 4", label: "Go Back", direction: "down" }
        ]
    },

    left4: {
        title: "Temple Courtyard",
        description: "A wide open area where devotees gather and perform rituals.",
        hotspots: [
            { target: "left5", position: "-1.2 -1 -4", label: "Outer Sanctum", direction: "up" },
            { target: "left3", position: "1.2 -1 4", label: "Inner Garden", direction: "down" }
        ]
    },

    left5: {
        title: "Outer Sanctum Archway",
        description: "The entrance to the inner sanctuary of the temple.",
        hotspots: [
            { target: "right6", position: "1.8 -1 -4", label: "Sanctum Garden", direction: "right" },
            { target: "left4", position: "-1.2 -1 4", label: "Return to Courtyard", direction: "down" }
        ]
    },

    right6: {
        title: "Sanctum Garden - North",
        description: "A quiet area for meditation near the main shrine.",
        hotspots: [
            { target: "right7", position: "1.8 -1 -4", label: "Inner Sanctum Area", direction: "right" },
            { target: "left5", position: "-1.5 -1 4", label: "Outer Sanctum", direction: "down" }
        ]
    },

    right7: {
        title: "Inner Sanctum Approach",
        description: "The final path leading to the main Deity chamber.",
        hotspots: [
            { target: "main8", position: "0 -1 -4", label: "The Main Hall", direction: "up" },
            { target: "right6", position: "0 -1 4", label: "Sanctum Garden", direction: "down" }
        ]
    },

    main8: {
        title: "The Main Hall (Mahamandapam)",
        description: "The grand assembly hall where the main rituals are performed.",
        hotspots: [
            { target: "god", position: "0 -1 -3", label: "View the Deity", direction: "up" },
            { target: "left3", position: "-2 -1 4", label: "Garden Path", direction: "left" },
            { target: "right7", position: "2 -1 4", label: "Inner Sanctum", direction: "right" }
        ]
    },

    god: {
        title: "The Divine Deity",
        description: "The sacred inner chamber containing the golden idol of Venkateshwara.",
        hotspots: [
            { target: "main8", position: "0 -1 4", label: "Return to Hall", direction: "down" }
        ]
    }

};


// Component to handle auto-rotation of the camera when idle
AFRAME.registerComponent('auto-rotate', {
    schema: {
        speed: { type: 'number', default: 0.05 },
        enabled: { type: 'boolean', default: true }
    },
    tick: function () {
        if (!this.data.enabled) return;
        const el = this.el;
        const rotation = el.getAttribute('rotation');
        rotation.y += this.data.speed;
        el.setAttribute('rotation', rotation);
    }
});

// Component to create a pulsing ring effect (Panoee style)
AFRAME.registerComponent('pulsing-ring', {
    init: function () {
        const el = this.el;
        const ring = document.createElement('a-ring');
        ring.setAttribute('radius-inner', '0.4');
        ring.setAttribute('radius-outer', '0.45');
        ring.setAttribute('color', '#f39c12');
        ring.setAttribute('opacity', '0.6');
        ring.setAttribute('rotation', '-90 0 0');
        
        // Pulse animation for the ring
        ring.setAttribute('animation', {
            property: 'scale',
            to: '1.8 1.8 1.8',
            dur: 2000,
            easing: 'easeOutQuad',
            loop: true
        });
        
        ring.setAttribute('animation__opacity', {
            property: 'material.opacity',
            from: 0.6,
            to: 0,
            dur: 2000,
            easing: 'easeOutQuad',
            loop: true
        });
        
        el.appendChild(ring);
    }
});

// Component to handle loading screen logic
AFRAME.registerComponent('loading-manager', {
    init: function () {
        const sceneEl = this.el;
        const loadingScreen = document.getElementById('loading-screen');

        // When all assets are loaded
        sceneEl.addEventListener('loaded', function () {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Enable auto-rotate after loading
                    document.querySelector('[camera]').setAttribute('auto-rotate', 'speed: 0.03');
                }, 1000);
            }, 500); // Small delay to ensure render is smooth
        });

        // Handle entering/exiting VR to toggle reticle display
        sceneEl.addEventListener('enter-vr', function () {
            // Show reticle when in VR mode for headset targeting
            document.getElementById('vr-cursor').setAttribute('visible', 'true');
            document.getElementById('info-panel').classList.add('hidden');
            document.getElementById('controls-hint').style.display = 'none';
            document.getElementById('top-nav').style.display = 'none';
            // Disable auto-rotate in VR
            document.querySelector('[camera]').setAttribute('auto-rotate', 'enabled: false');
        });

        sceneEl.addEventListener('exit-vr', function () {
            // Hide reticle when exiting VR mode
            if (!AFRAME.utils.device.checkHeadsetConnected()) {
                document.getElementById('vr-cursor').setAttribute('visible', 'false');
            }
            document.getElementById('info-panel').classList.remove('hidden');
            document.getElementById('controls-hint').style.display = 'block';
            document.getElementById('top-nav').style.display = 'flex';
            // Re-enable auto-rotate
            document.querySelector('[camera]').setAttribute('auto-rotate', 'enabled: true');
        });
    }
});

// Component to handle info point interactive popups
AFRAME.registerComponent('info-nav', {
    schema: {
        title: { type: 'string', default: 'Info' },
        desc: { type: 'string', default: 'Details...' },
        imgTarget: { type: 'string', default: '' }
    },

    init: function () {
        const el = this.el;
        const data = this.data;
        const modal = document.getElementById('info-modal');
        const mTitle = document.getElementById('modal-title');
        const mDesc = document.getElementById('modal-desc');
        const mImg = document.getElementById('modal-img');

        el.addEventListener('click', function () {
            // Populate modal
            mTitle.textContent = data.title;
            mDesc.textContent = data.desc;

            if (data.imgTarget) {
                const imgSrc = document.querySelector(data.imgTarget).getAttribute('src');
                mImg.setAttribute('src', imgSrc);
                mImg.classList.remove('hidden');
            } else {
                mImg.classList.add('hidden');
            }

            // Show modal
            modal.classList.remove('hidden');

            // Disable camera look controls temporarily if not in VR
            if (!AFRAME.utils.device.checkHeadsetConnected()) {
                document.querySelector('[camera]').components['look-controls'].pause();
            }
        });
    }
});

// Component to handle hotspot navigation
AFRAME.registerComponent('hotspot-nav', {
    schema: {
        target: { type: 'string' }
    },

    init: function () {
        const el = this.el;
        const data = this.data;
        const sky = document.getElementById('vr-sky');
        const container = document.getElementById('hotspots-container');

        el.addEventListener('click', function () {
            // Play teleport sound locally generated
            playTeleportSound();

            // Initiate fade out
            sky.emit('fade-out');

            // Wait for fade out to complete before changing scene
            setTimeout(() => {
                // Change the sky image
                sky.setAttribute('src', `#${data.target}`);

                // Update the hotspots
                updateScene(data.target, container);

                // Fade back in
                sky.emit('fade-in');
            }, 500); // Must match fade duration
        });
    }
});

function updateScene(sceneId, container) {
    // Clear existing hotspots
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const sceneData = scenesConfig[sceneId];
    if (!sceneData) return;

    // Stop auto-rotate temporarily during transition
    const camera = document.querySelector('[camera]');
    if (camera) camera.setAttribute('auto-rotate', 'enabled: false');

    // Create new hotspots
    sceneData.hotspots.forEach(hotspot => {
        const hsParent = document.createElement('a-entity');
        hsParent.setAttribute('position', hotspot.position);
        hsParent.setAttribute("look-at", "[camera]");

        const hsEl = document.createElement('a-image');
        
        // Select the arrow icon based on direction
        const arrowId = hotspot.direction ? `arrow-${hotspot.direction}` : 'point-nav';
        hsEl.setAttribute('src', `#${arrowId}`);
        hsEl.setAttribute('class', 'hotspot clickable');
        hsEl.setAttribute('width', '0.6'); // Arrows look better slightly smaller
        hsEl.setAttribute('height', '0.6');
        hsEl.setAttribute('hotspot-nav', `target: ${hotspot.target}`);

        // Add pulsing ring component
        hsEl.setAttribute('pulsing-ring', '');

        // Click animation
        hsEl.setAttribute('animation__click', 'property: scale; to: 0.6 0.6 0.6; dur: 150; startEvents: click');

        // Tooltip Label
        const labelText = hotspot.label || `Go to ${hotspot.target}`;
        
        const labelEntity = document.createElement('a-entity');
        labelEntity.setAttribute('position', '0 -0.8 0');
        labelEntity.setAttribute('text', `value: ${labelText}; align: center; width: 4; color: #FFF; font: roboto`);
        
        const bgEl = document.createElement('a-plane');
        bgEl.setAttribute('width', '1.8');
        bgEl.setAttribute('height', '0.4');
        bgEl.setAttribute('color', 'black');
        bgEl.setAttribute('opacity', '0.7');
        bgEl.setAttribute('position', '0 0 -0.01');
        labelEntity.appendChild(bgEl);
        
        hsParent.appendChild(hsEl);
        hsParent.appendChild(labelEntity);
        container.appendChild(hsParent);
    });

    // Create new info points
    if (sceneData.infoPoints) {
        sceneData.infoPoints.forEach(info => {
            const infoEl = document.createElement('a-image');
            infoEl.setAttribute('src', '#info-icon');
            infoEl.setAttribute('class', 'info-point clickable');
            infoEl.setAttribute('position', info.position);
            infoEl.setAttribute('look-at', '[camera]');
            infoEl.setAttribute('width', '0.6');
            infoEl.setAttribute('height', '0.6');
            infoEl.setAttribute('info-nav', `title: ${info.title}; desc: ${info.desc}; imgTarget: ${info.imgTarget}`);
            infoEl.setAttribute('animation', 'property: scale; to: 1.1 1.1 1.1; dir: alternate; loop: true; dur: 1000');

            container.appendChild(infoEl);
        });
    }

    // Update UI info panel
    const infoPanel = document.getElementById('info-panel');
    const infoTitle = document.getElementById('info-title');
    const infoDesc = document.getElementById('info-desc');

    // Hide briefly for transition
    infoPanel.classList.add('hidden');

    setTimeout(() => {
        infoTitle.textContent = sceneData.title || `Scene: ${sceneId}`;
        infoDesc.textContent = sceneData.description || 'Enjoy the 360 view.';
        infoPanel.classList.remove('hidden');
        
        // Re-enable auto-rotate after transition
        if (camera) camera.setAttribute('auto-rotate', 'enabled: true');
    }, 500);
}

// Global UI Event Listeners
document.addEventListener('DOMContentLoaded', () => {

    // Audio Toggle Logic
    const audioBtn = document.getElementById('audio-btn');
    const bgAudio = document.getElementById('ambient-audio');

    if (audioBtn && bgAudio) {
        audioBtn.addEventListener('click', () => {
            if (bgAudio.paused) {
                bgAudio.play().catch(e => console.log("Audio play failed:", e));
                audioBtn.textContent = '🔊 Audio On';
            } else {
                bgAudio.pause();
                audioBtn.textContent = '🔇 Audio Off';
            }
        });
    }

    // Modal Close Logic
    const closeModalBtn = document.getElementById('close-modal');
    const infoModal = document.getElementById('info-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            infoModal.classList.add('hidden');
            // Re-enable camera if not in VR
            if (!AFRAME.utils.device.checkHeadsetConnected()) {
                document.querySelector('[camera]').components['look-controls'].play();
            }
        });
    }

    // Side Menu Logic
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu');
    const sideMenu = document.getElementById('side-menu');
    const locationList = document.getElementById('location-list');

    if (menuBtn && sideMenu) {
        menuBtn.addEventListener('click', () => {
            sideMenu.classList.remove('hidden');
        });

        closeMenuBtn.addEventListener('click', () => {
            sideMenu.classList.add('hidden');
        });

        // Handle menu clicks
        locationList.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                const targetId = e.target.getAttribute('data-target');
                const sky = document.getElementById('vr-sky');
                const container = document.getElementById('hotspots-container');

                // Fade and swap
                sky.emit('fade-out');
                sideMenu.classList.add('hidden');

                setTimeout(() => {
                    sky.setAttribute('src', `#${targetId}`);
                    updateScene(targetId, container);
                    sky.emit('fade-in');
                }, 500);
            }
        });
    }

    // Fullscreen Logic
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log(`Error attempting to enable full-screen mode: ${err.message}`);
                });
                fullscreenBtn.textContent = '⛶ Exit Fullscreen';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fullscreenBtn.textContent = '⛶ Fullscreen';
                }
            }
        });
    }

    // VR Mode Button Logic
    const vrBtn = document.getElementById('vr-btn');
    if (vrBtn) {
        vrBtn.addEventListener('click', () => {
            const sceneEl = document.querySelector('a-scene');
            if (sceneEl.enterVR) {
                sceneEl.enterVR().catch(err => {
                    console.log('Error entering VR:', err);
                    alert("Please ensure you are on a mobile device to use VR Box mode.");
                });
            }
        });
    }

    // Share API Logic (keeping function in case needed)

    // Initial Scene Setup
    const initialScene = 'entrance';
    const container = document.getElementById('hotspots-container');
    if (container) {
        updateScene(initialScene, container);
    }
});

// Helper for generating an instant sound effect without fetching files
function playTeleportSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); // Hz
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        // Ignore if AudioContext is unsupported or blocked
    }
}
