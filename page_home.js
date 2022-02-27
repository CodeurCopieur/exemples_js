import {
    EVENT_AD_RENDERED //'adRendered'
} from '../config/constants';

export default {
    //main#container.main-content
    init($el){
        this.$el           = $el;
        this.adComponents  = [...document.querySelectorAll('.component-ad')];
        this.smallMedia    = window.matchMedia('only screen and (max-width: 768px)');
        this.otherMedia    = window.matchMedia('only screen and (min-width: 769px)');
        this.oldMediaType  = '';
        this.reqCollection = [];
        this.elementsToAnim = [];
        
        //Bindings
        this.loadHandler       = this.loadHandler.bind(this);
        this.responsiveHandler = this.responsiveHandler.bind(this);

        document.addEventListener('DOMContentLoaded',  this.loadHandler);
    },

    loadHandler(e) {
        this.parallaxColumnFinder();
        this.elementsToAnim = [...this.$el.querySelectorAll('.parallax-column, .block-col-push__sticky--item .component-card')];

        // Moved outside the loadHandler
        this.responsiveHandler();
        window.addEventListener('resize', this.responsiveHandler);
    },

    parallaxColumnFinder() {
        let containerList = [...document.querySelectorAll('.block-col-push__container--list')];
        
        containerList.map(container => {
            let children          = container.querySelectorAll('.block-col-push__scrollable--list'),
                firstChildHeight  = children[0].getBoundingClientRect().height,
                secondChildHeight = children[1].getBoundingClientRect().height,
                index = firstChildHeight > secondChildHeight ? 0 : 1;
                
                children[index].parentNode.classList.add('parallax-column');    
        });
    },

    responsiveHandler() {
        if (this.smallMedia.matches) {
            if (this.oldMediaType === 'small-media') {
                return;
            }

            this.oldMediaType = 'small-media';
        } else {
            if (this.oldMediaType === 'other-media'){
                return;
            }

            this.oldMediaType = 'other-media';
        }

        if (typeof this.observer === 'object')  {
            this.observer.disconnect();
        }
        
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.map( entry => {
                if (entry.target.parentNode.classList.contains('block-col-push__sticky--item')) {
                    this.mobileStickyAnimationHandler(entry);
                } else if (entry.target.classList.contains('parallax-column')) {
                    this.parallaxColumnAnimationHandler(entry);
                }
            });
        });

        this.elementsToAnim.map(card => {
            this.observer.observe(card);
        });
    },

    mobileStickyAnimationHandler(entry) {
        if (entry.isIntersecting) {
            const parent = entry.target.parentNode.parentNode,
                  maskCollection = [...parent.querySelectorAll('.block-col-push__sticky--mask')];

            this.reqCollection.push({
                owner: entry.target,
                animation: window.requestAnimationFrame(this.mobileStickyAnimation.bind(this, entry.target, parent, maskCollection))
            });
        } else {
            this.cancelAnimationFrame(entry.target);
        }
    },

    mobileStickyAnimation(target, parent, maskCollection, shouldRequest = true) {
        if (!this.smallMedia.matches) {
            this.cancelAnimationFrame(target);
            return;
        }

        let {scrollY} = window,
            {height, top} = parent.getBoundingClientRect();

        let position = scrollY - (top + scrollY);

        let percentMoove = (position * 100 / height) * 2;

        if (percentMoove < 0) {
            percentMoove = 0;

        } else if(percentMoove > 100) {
            percentMoove = 100;   
        }

        if (top <= 0) {
            maskCollection.map(item => {
                let className = item.classList[1],
                    cssTransformValue = '';
    
                switch(className) {
                    case 'top':
                        cssTransformValue = `translateY(-${percentMoove}%)`;
                        break;
                    case 'right':
                        cssTransformValue = `translateX(${percentMoove}%)`;
                        break;
                    case 'bottom':
                        cssTransformValue = `translateY(${percentMoove}%)`;
                        break;
                    default:
                        cssTransformValue = `translateX(-${percentMoove}%)`; 
                }
    
                item.style.transform = cssTransformValue;
            });
        }

        this.reqCollection.map((item) => {
            if (item.owner === target && shouldRequest) {
                item.animation = requestAnimationFrame(this.mobileStickyAnimation.bind(this, target, parent, maskCollection));
            }
        });
    },

    parallaxColumnAnimationHandler(entry) {
        if (entry.isIntersecting) {
            this.reqCollection.push({
                owner: entry.target,
                animation: window.requestAnimationFrame(this.parallaxColumnAnimation.bind(this, entry.target))
            });
        } else {
            this.cancelAnimationFrame(entry.target);
        }
    },
    

    parallaxColumnAnimation(target) {
        if (this.smallMedia.matches) {
            this.cancelAnimationFrame(target);
            target.style.transform = 'translateY(0px)';
            return;
        }

        let {scrollY}                    = window,
            targetFirstChild             = target.firstElementChild,
            container                    = target.parentNode,
            scrollableReferenceContainer = container.querySelector('.block-col-push__container--list .block-col-push__scrollable:not(.parallax-column)'),
            firstLiHeight                = targetFirstChild.querySelector('li:first-child').getBoundingClientRect().height,
            lastLiParallax               = targetFirstChild.querySelector('li:last-child'),
            lastLiParallaxPosition       = lastLiParallax.offsetTop + lastLiParallax.getBoundingClientRect().height,
            lastLiReference              = scrollableReferenceContainer.querySelector('li:last-child'),
            lastLiReferencePosition      = lastLiReference.offsetTop + lastLiReference.getBoundingClientRect().height;  

        let containerBounding = container.getBoundingClientRect(),
            overflow          = lastLiParallaxPosition - lastLiReferencePosition,
            position          = scrollY + containerBounding.top,
            windowHeight      = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight; 
        
        let initialPosition         = position + firstLiHeight + 150,
            scrollPositionInParent  = scrollY + windowHeight - initialPosition,
            percentValue            = scrollPositionInParent * 100 / (containerBounding.height - firstLiHeight);

        percentValue = percentValue > 100 ? 100 : percentValue;

        let cssTransformValue = percentValue * overflow / 100;
        
        
        if ((scrollY + windowHeight) > position && ( scrollY + windowHeight) < initialPosition) {
            targetFirstChild.style.transform = `translateY(0px)`;
        } else if (initialPosition <= scrollY + windowHeight) {
            targetFirstChild.style.transform = `translateY(-${cssTransformValue}px)`;
        } else if (position > scrollY + windowHeight) {
            targetFirstChild.style.transform = `translateY(0)`;
        }

        this.reqCollection.map((item) => {
            if (item.owner === target) {
                item.animation =  window.requestAnimationFrame(this.parallaxColumnAnimation.bind(this, target));
            }
        });
    },

    cancelAnimationFrame(target) {
        this.reqCollection.map((item, index) => {
            if (item.owner === target) {
                cancelAnimationFrame(item.animation);

                this.reqCollection.splice(index, 1);
            }
        });
    }
};
