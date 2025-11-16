// Three.js Sphere Animation
let scene, camera, renderer, particles, geometry, material;
let particleCount = 2000;
let sphereRadius = 2;
let originalPositions = null;

// Voice Assistant UI Logic - declare variables early
let isListening = false;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 6;
    
    // Renderer setup
    const canvas = document.getElementById('sphere-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    
    // Create particle geometry
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    // Generate sphere positions
    for (let i = 0; i < particleCount * 3; i += 3) {
        const radius = sphereRadius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
    }
    
    // Store original positions for animation
    originalPositions = new Float32Array(positions);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle material
    material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.12,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    // Create particles
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.5;
    });
    
    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        
        // Rotate sphere
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;
        
        // Smooth mouse rotation
        particles.rotation.y += (targetRotationY - particles.rotation.y) * 0.05;
        particles.rotation.x += (targetRotationX - particles.rotation.x) * 0.05;
        
        // Pulsing effect
        const pulse = Math.sin(time * 2) * 0.1 + 1;
        particles.scale.set(pulse, pulse, pulse);
        
        // Animate individual particles for subtle breathing effect
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Get original position
            const origX = originalPositions[i];
            const origY = originalPositions[i + 1];
            const origZ = originalPositions[i + 2];
            
            // Calculate original radius
            const origLength = Math.sqrt(origX * origX + origY * origY + origZ * origZ);
            
            // Add wave effect
            const wave = Math.sin(time * 1.5 + i * 0.005) * 0.15;
            const newRadius = origLength + wave;
            
            // Scale position from origin
            if (origLength > 0) {
                positions[i] = (origX / origLength) * newRadius;
                positions[i + 1] = (origY / origLength) * newRadius;
                positions[i + 2] = (origZ / origLength) * newRadius;
            }
        }
        geometry.attributes.position.needsUpdate = true;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Click interaction for ripple effect
    canvas.addEventListener('click', () => {
        // Add a ripple effect
        particles.rotation.y += 0.5;
        particles.rotation.x += 0.3;
    });
}

// Voice Assistant UI Logic
const voiceButton = document.getElementById('voice-btn');
const chatMessages = document.getElementById('chat-messages');

// Click anywhere on screen to activate voice
document.addEventListener('click', (event) => {
    // Don't trigger if clicking on chat messages
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer && chatContainer.contains(event.target)) {
        return;
    }
    // Don't trigger if clicking on header
    const header = document.querySelector('.header');
    if (header && header.contains(event.target)) {
        return;
    }
    
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

// Keep button click functionality as backup
voiceButton.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

function startListening() {
    isListening = true;
    voiceButton.classList.add('active');
    addMessage('assistant', 'Listening... Speak now.');
    
    // Simulate voice recognition (replace with actual Web Speech API)
    setTimeout(() => {
        if (isListening) {
            const userMessage = 'Hello, how are you?'; // Simulated input
            addMessage('user', userMessage);
            setTimeout(() => {
                addMessage('assistant', 'I\'m doing well, thank you! How can I assist you today?');
            }, 1000);
            stopListening();
        }
    }, 2000);
}

function stopListening() {
    isListening = false;
    voiceButton.classList.remove('active');
}

function addMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize when page loads
window.addEventListener('load', () => {
    init();
});

