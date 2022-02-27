export default {
    init($el) {
        console.log("insta loaded 43");
        this.screenPressed = false; 
        this.screenReleased = true;
        this.isScrolling = false;
        this.$el = $el;
        this.touchSlide();
        this.rafId = null; 
        
        this.$el.addEventListener('contextmenu', event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        });
    },
    touchSlide(){
        const slideElements = this.$el.querySelectorAll(".caroussel__insta .caroussel__insta-element");
        const progressBarElements = this.$el.querySelectorAll(".caroussel__cart-nav .progress-bar");
        let clicked = false;
        let touchDuration = 400;   
        let indexes = {i: 0, index: 0 };
        
        window.addEventListener("DOMContentLoaded", () => {
            if(slideElements[0]) {
                    let Media = slideElements[0].querySelector('.media');
                    if(!Media.src && Media){
                    Media.src = Media.getAttribute('data-src-media');
                    Media.removeAttribute('data-notloaded');
                }
            }
            this.loadNextMedia(slideElements, {i: 0, index: 0});
          });

          window.addEventListener("scroll" , () => { 
            this.isScrolling = true;
        });

        let observer = new IntersectionObserver( (entries, observer) => entries.forEach( entry => {
                if(entry.isIntersecting){
                    this.changeSlide(progressBarElements, slideElements, {i: 0, index: 0 });
                    observer.unobserve(entry.target);
                } 
    
            }), {
                threshold: .75
            });
        observer.observe(this.$el);
            
        // INDEXES : i = the one you clicked one, index = the one you arrive on.
        for (let i = 0; i < slideElements.length; i++) {
            const slideElement = slideElements[i];
            // TOUCH LISTENERS 
                slideElement.addEventListener("pointerdown", e => { 
                    e.preventDefault();
                    this.screenReleased = false; 
                    setTimeout(() => {
                        if(!this.screenReleased && !this.isScrolling){
                            this.screenPressed = true;
                        } else {
                            this.screenPressed = false;
                        }
                    }, touchDuration);
                });
                slideElement.addEventListener("pointerup" , e => { 
                    e.preventDefault();
                    this.screenReleased = true;
                    indexes = { i: i, index: i };  
                    this.isScrolling = false;              
                    if(this.screenPressed){
                        this.changeSlide(progressBarElements, slideElements, indexes);
                        this.screenPressed = false;
                        return;
                    }
                    if(clicked) return;
                    clicked = true;
                    
                    if(this.isSlideLeft(e)) {
                        this.previousSlide(progressBarElements, slideElements, indexes);
                    } else {
                        this.nextSlide(progressBarElements, slideElements, indexes);
                    }
                    
                      setTimeout(() => {
                          clicked = false; // this time out is here to prevent frenetik click
                      }, touchDuration);
                });
        }
    },
    isSlideLeft(e) {
            // e = Mouse click event.
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left; //x position within the element.
            if(x <= rect.width / 2) {
                return true;
            } else {
                return false;
            }
    },
    changeSlide(progressBarElements, slideElements, indexes) {
        slideElements.forEach( slide => {
                slide.classList.remove("active");
        });
        slideElements[indexes.index].classList.add("active");
        if(this.checkIfVideoType( slideElements[indexes.index])){
            this.videoPlay(this.checkIfVideoType(slideElements[indexes.index]), progressBarElements, slideElements, { i:indexes.i, index: indexes.index });
        } else {
            let timing;
            if( Number(slideElements[indexes.index].dataset.timing) >= 20) {
                timing = 20000;
            } else {
                timing =  Number(slideElements[indexes.index].dataset.timing) * 1000;
            }
             this.imgPlay(progressBarElements, slideElements, timing, {i: indexes.i, index: indexes.index});
        }
    },
    checkIfVideoType(slide) {
        let slideVideo = slide.querySelector("video");
        if(slideVideo) {
            return slideVideo;
        }
        return false;
    },
    resetAll(progressBarElements, slideElements, indexes){
        const videos = document.querySelectorAll(".caroussel__insta video");
        this.screenPressed = false;
        for (let i = 0; i < slideElements.length; i++) {
                let bar = progressBarElements[i];  
                let video  = videos[i]; 
                slideElements[i].setAttribute("data-playing", "false");
                cancelAnimationFrame(this.rafId);
                if(i < indexes.index && video) { 
                    video.pause(); 
                }       
                if(i < indexes.index) {
                        this.progressBar(bar, 100); 
                }
                if(i > indexes.index && video) {
                    video.pause();
                    this.progressBar(bar, 0);
                } 
                if(i > indexes.index) {
                        this.progressBar(bar, 0); 
                }
        }
        slideElements[indexes.index].setAttribute("data-playing", "true");
    },
    loadNextMedia(slideElements, indexes){
        if(slideElements[indexes.index + 1]) {
            let nextMedia = slideElements[indexes.index + 1].querySelector('.media');
            if(!nextMedia.src && nextMedia){
                nextMedia.src = nextMedia.getAttribute('data-src-media');
                nextMedia.removeAttribute('data-notloaded');
            }
        }
    },
    videoPlay(video, progressBarElements, slideElements, indexes){
        if(!this.screenPressed){
            video.currentTime = 0;
        }
        // FUNCTION LOAD MEDIA TO DO LATER
        this.loadNextMedia(slideElements, indexes);
        
        if(video.src){
            video.muted= true;
            video.play();
        } else {
            video.src = video.getAttribute('data-src-media');
            video.muted= true;
            video.addEventListener('canplaythrough', () => {
                let isPlaying = slideElements[indexes.index].getAttribute("data-playing");
                if(isPlaying === "true") {
                video.play();
                }
            }, false);
        }

        let percentDuration = (video.currentTime / Math.floor(video.duration)) * 100;

        video.addEventListener('timeupdate', () => {
            let isPlaying = slideElements[indexes.index].getAttribute("data-playing");
            if(isPlaying === "true"){
                percentDuration = (video.currentTime / Math.floor(video.duration)) * 100;
                this.progressBar(progressBarElements[indexes.index], percentDuration);
            }
            if(this.screenPressed ){ 
                video.pause();
            }
        });

        video.addEventListener("ended", () => {
            this.nextSlide(progressBarElements, slideElements, indexes);
        });
    },
    nextSlide(progressBarElements, slideElements, indexes) {
        if(indexes.index === slideElements.length - 1) {
            this.resetAll(progressBarElements, slideElements,{i: indexes.index, index: 0});
            this.changeSlide(progressBarElements, slideElements, {i:indexes.index, index: 0 });
        } else {
            this.resetAll(progressBarElements, slideElements, {i: indexes.i, index: indexes.index + 1});
            this.changeSlide(progressBarElements, slideElements, {i:indexes.i, index: indexes.index + 1 });
        }
    },
    previousSlide(progressBarElements, slideElements, indexes) {
        if(indexes.i === 0){ // CASE LEFT TOUCH AND FIRST POST
            this.resetAll(progressBarElements, slideElements, {i: indexes.i, index: indexes.i });
            this.changeSlide(progressBarElements, slideElements, {i: indexes.i, index: indexes.i });
        } else { // CASE LEFT TOUCH 
            this.resetAll(progressBarElements, slideElements, {i: indexes.i, index: indexes.i - 1 });
            this.changeSlide(progressBarElements, slideElements, {i: indexes.i, index: indexes.i - 1});
        }
    },
    imgPlay(progressBarElements, slideElements, timing = 4000, indexes ){
        if(this.screenPressed) {
           return;
        }

        // FUNCTION LOAD MEDIA TO DO LATER
        this.loadNextMedia(slideElements, indexes);

        let image = slideElements[indexes.index].querySelector('img');
        if(!image.src){
            image.src = image.getAttribute('data-src-media');
            image.removeAttribute('data-notloaded');
        }
        
        let startTime = performance.now(); 
        let elapsedTime = 0; 
        let pauseTime = false;
        
        const frame = () => {
            
            let isPlaying = slideElements[indexes.index].getAttribute("data-playing");
            if(isPlaying === "false" ) {
                cancelAnimationFrame(this.rafId);
                return;
            }
            if(this.screenPressed ) {
                if(!pauseTime){
                    pauseTime = true;
                    startTime = performance.now() - elapsedTime;
                }
            } 
            
            if(!pauseTime){
                    elapsedTime = performance.now() - startTime;
            } else {
                pauseTime = false;
            }
              
        
            if( elapsedTime >= timing ){
                this.progressBar(progressBarElements[indexes.index], 100);
                this.nextSlide(progressBarElements, slideElements, indexes);
            } else {
                const percent = elapsedTime / timing * 100;
                this.progressBar(progressBarElements[indexes.index], percent); // PROGRESS BAR A LA VALEUR TIMING 
                this.rafId = requestAnimationFrame(frame);
            }
        };
        this.rafId = requestAnimationFrame(frame);
    },
    progressBar(progressBarElement, timing) {
        progressBarElement.style.width = `${timing}%`;
    }
};
