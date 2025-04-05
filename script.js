document.addEventListener('DOMContentLoaded', () => {
    const imageContainer = document.getElementById('imageContainer');
    const images = Array.from(document.querySelectorAll('.floating-image'));
    const imageCount = images.length;
    let mouseX = 0;
    let mouseY = 0;
    let lastMoveTime = Date.now();
    let dropTimeout;
    let isDroped = false;
    let lastOrderChangeTime = 0;
    let shouldChangeOrder = false; // Flag to track if order should change
    
    // Track mouse position history for wave effect
    const positionHistory = [];
    const historyLength = 20; // Length of the tail
    
    // Configuration for slower image changes
    const orderChangeInterval = 300; // Minimum time between order changes (in milliseconds)
    
    // Set initial positions for images
    images.forEach((img, index) => {
        img.style.zIndex = imageCount - index; // Reverse order so first image is on top
        
        gsap.set(img, {
            x: -1000,
            y: -1000,
            rotation: Math.random() * 20 - 10, // Random slight rotation
            scale: 1, // Initial scale
        });
    });
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        lastMoveTime = Date.now();
        
        // Only set flag to change order if enough time has passed since last change
        const currentTime = Date.now();
        if (currentTime - lastOrderChangeTime > orderChangeInterval) {
            shouldChangeOrder = true;
            lastOrderChangeTime = currentTime;
        }
        
        // Add current position to history
        positionHistory.unshift({ x: mouseX, y: mouseY, time: Date.now() });
        
        // Limit history length
        if (positionHistory.length > historyLength) {
            positionHistory.pop();
        }
        
        // If images were dropped, bring them back up
        if (isDroped) {
            bringImagesBack();
        }
        
        // Clear existing timeout and set a new one
        clearTimeout(dropTimeout);
        dropTimeout = setTimeout(dropImages, 500);
    });
    
    // Animation loop
    function animateImages() {
        // Only animate if not dropped
        if (!isDroped) {
            // Check if mouse has moved and we should change order
            if (shouldChangeOrder) {
                // Shuffle the z-index of images
                const shuffledIndices = [...Array(imageCount).keys()]
                    .sort(() => Math.random() - 0.5)
                    .map(i => imageCount - i); // Higher values appear on top
                
                // Apply new z-indices to create visual layering effect
                images.forEach((img, index) => {
                    img.style.zIndex = shuffledIndices[index];
                });
                
                // Reset the flag after changing order
                shouldChangeOrder = false;
            }
            
            // Ensure we have position history
            if (positionHistory.length > 0) {
                images.forEach((img, index) => {
                    // Calculate position in the tail based on index
                    // First image follows the cursor, others follow points in history
                    const positionIndex = Math.min(Math.floor(index * (historyLength / imageCount)), positionHistory.length - 1);
                    const targetPosition = positionHistory[positionIndex] || positionHistory[positionHistory.length - 1];
                    
                    // Calculate wave effect parameters
                    const timeSinceRecord = Date.now() - targetPosition.time;
                    const waveAmplitude = 15; // Wave height
                    const waveFrequency = 0.005; // Wave frequency
                    
                    // Create wave-like motion with sine function
                    // const waveOffset = Math.sin(timeSinceRecord * waveFrequency) * waveAmplitude;
                    const waveOffset = 0;
                    
                    // Use a consistent scale for all images
                    const scaleValue = 1.5;
                    
                    // Animate to follow the wave pattern
                    gsap.to(img, {
                        x: targetPosition.x + waveOffset,
                        y: targetPosition.y + waveOffset * 0.5, // Less vertical wave
                        rotation: waveOffset * 0.5, // Slight rotation based on wave
                        scale: scaleValue,
                        duration: 0.3, // Faster response for smoother tail
                        ease: "power1.out"
                    });
                });
            }
        }
        
        requestAnimationFrame(animateImages);
    }
    
    // Start animation loop
    animateImages();
    
    // Function to drop images to the bottom
    function dropImages() {
        if (!isDroped) {
            isDroped = true;
            
            images.forEach((img, index) => {
                gsap.to(img, {
                    y: window.innerHeight + 100, // Move below the viewport
                    rotation: Math.random() * 60 - 30, // Random rotation while falling
                    scale: 1.5, // Use consistent scale when dropping
                    duration: 1 + Math.random() * 0.5,
                    ease: "faded.out",
                    opacity: 0,
                    delay: index * 0.1 // Staggered drop
                });
            });
        }
    }
    
    // Function to bring images back when mouse moves again
    function bringImagesBack() {
        isDroped = false;
        
        // Reset position history when bringing images back
        positionHistory.length = 0;
        positionHistory.unshift({ x: mouseX, y: mouseY, time: Date.now() });
        
        // Set flag to change order when images come back
        shouldChangeOrder = true;
        lastOrderChangeTime = Date.now(); // Reset the timer when bringing images back
        
        images.forEach((img, index) => {
            // Use a consistent scale for all images
            const scaleValue = 1.5;
            
            gsap.to(img, {
                x: mouseX,
                y: mouseY,
                rotation: 0,
                scale: scaleValue,
                duration: 0.8,
                ease: "back.out(0.7)",
                opacity: 1
            });
        });
    }
});