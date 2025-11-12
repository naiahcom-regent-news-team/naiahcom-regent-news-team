
        // Simulate loading progress
        const loadingBar = document.getElementById('loadingBar');
        const loadingText = document.getElementById('loadingText');
        const tickerText = document.getElementById('tickerText');
        const progressPercent = document.getElementById('progressPercent');
        
        // Sample news headlines for the ticker
        const headlines = [
            "Student Council elections happening next week",
            "Science Fair winners to be announced Friday",
            "Basketball team advances to regional finals",
            "New library resources now available to all students",
            "Upcoming parent-teacher conferences scheduled",
            "Art exhibition opens in the main hall this Monday",
            "School announces new scholarship opportunities",
            "Debate team wins state championship",
            "Spring musical auditions begin next month",
            "New STEM lab opening ceremony next Wednesday"
        ];
        
        let progress = 0;
        let currentHeadline = 0;
        
        // Update loading progress
        const updateProgress = () => {
            if (progress < 100) {
                // More realistic progress simulation
                let increment;
                if (progress < 30) {
                    increment = Math.random() * 5 + 1; // Slow at start
                } else if (progress < 70) {
                    increment = Math.random() * 8 + 2; // Faster in middle
                } else {
                    increment = Math.random() * 3 + 0.5; // Slower at end
                }
                
                progress += increment;
                if (progress > 100) progress = 100;
                
                loadingBar.style.width = `${progress}%`;
                progressPercent.textContent = `${Math.round(progress)}%`;
                
                // Update loading text based on progress
                if (progress < 20) {
                    loadingText.textContent = "Initializing news portal...";
                } else if (progress < 40) {
                    loadingText.textContent = "Loading latest articles...";
                } else if (progress < 60) {
                    loadingText.textContent = "Processing media content...";
                } else if (progress < 80) {
                    loadingText.textContent = "Finalizing setup...";
                } else {
                    loadingText.textContent = "Almost ready...";
                }
                
                // Change news headline every 12% progress
                if (Math.floor(progress / 12) > Math.floor((progress - increment) / 12)) {
                    tickerText.style.animation = 'none';
                    setTimeout(() => {
                        tickerText.textContent = headlines[currentHeadline];
                        tickerText.style.animation = 'tickerSlide 4s ease-in-out';
                        currentHeadline = (currentHeadline + 1) % headlines.length;
                    }, 100);
                }
                
                // Random interval to simulate real loading
                setTimeout(updateProgress, 150 + Math.random() * 250);
            } else {
                // Loading complete
                loadingText.textContent = "Ready!";
                tickerText.textContent = "Welcome to School News Team!";
                loadingBar.style.background = "linear-gradient(90deg, #2ecc71, #27ae60)";
                progressPercent.textContent = "100%";
                
                // Add completion animation
                document.querySelector('.loading-container').style.animation = "containerFade 0.8s ease-in-out";
                
                // Redirect immediately after loading
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 800);
            }
        };
        
        // Start the loading simulation
        setTimeout(updateProgress, 1200);
        
        // Initial headline display with animation
        tickerText.textContent = headlines[0];
        tickerText.style.animation = 'tickerSlide 4s ease-in-out';
    