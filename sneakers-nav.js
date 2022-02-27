import gsap from "gsap";
import scrollToY from '../helpers/scrollToY';
import isOutOfViewport from '../helpers/isOutOfViewport';
import { debounce } from "../helpers";

export default {
    init() {
        this.$containerColumns = document.querySelector('.container__columns');
        this.$tabs             = this.$containerColumns.querySelectorAll('section.card');
        this.columnsRaf        = null;

        this.bindMethods();

        //Sets this.screenMode initial value
        this.initMatchMedia();

        this.debouncedResizeHandler = debounce(this.resizeHandler, 150);

        this.addEvents();
        this.resizeHandler();
        this.displayOnClick();

        if (this.screenMode === 'min969') {
            this.initRequestAnimationFrame();
        }
    },

    bindMethods() {
        this.resizeHandler = this.resizeHandler.bind(this);
        this.rafCallback = this.rafCallback.bind(this);
    },

    addEvents() {
        window.addEventListener('resize', this.debouncedResizeHandler);
    },

    resizeHandler(e) {
        console.log('resizeHandler()');

        if (window.innerWidth > 968) {
            this.updateColumnsContainerHeightDesktop();
        } else {
            this.updateContainerColumnsHeightMobile();
        }
    },

    initRequestAnimationFrame() {
        this.columnsRaf = window.requestAnimationFrame(this.rafCallback);
    },

    rafCallback() {
        const containerColumnsTopIsOut    = isOutOfViewport(this.$containerColumns).top;
        const containerColumnsBottomIsOut = isOutOfViewport(this.$containerColumns).bottom;
        const containerColumnsTopIsIn     = !containerColumnsTopIsOut;
        const containerColumnsBottomIsIn  = !containerColumnsBottomIsOut;

        // The top of $containerColumns IS in the viewport
        if (containerColumnsTopIsIn) {
            [...this.$tabs].map(tab => {
                tab.classList.contains('pin-to-bottom') && tab.classList.remove('pin-to-bottom');
                tab.classList.contains('pin-to-bottom-abs') && tab.classList.remove('pin-to-bottom-abs');
                tab.getAttribute('data-page-y-offset') && tab.removeAttribute('data-page-y-offset');
            });
        }

        // the top and bottom of $containerColumns are out
        if (containerColumnsTopIsOut && containerColumnsBottomIsOut) {
            [...this.$tabs].map(tab => {
                const tabBottomIsIn  = !isOutOfViewport(tab).bottom;
                const tabIsPinned    = tab.classList.contains('pin-to-bottom');
                const tabIsPinnedAbs = tab.classList.contains('pin-to-bottom-abs');
                const tabYoffset     = tab.getAttribute('data-page-y-offset') ? parseInt(tab.getAttribute('data-page-y-offset'), 10) : null;
                
                if (tabBottomIsIn && !tabIsPinned) {
                    tab.classList.add('pin-to-bottom');
                    !tab.getAttribute('data-page-y-offset') && tab.setAttribute('data-page-y-offset', window.pageYOffset);
                }

                if (tabIsPinnedAbs && window.pageYOffset > tabYoffset) {
                    tab.classList.contains('pin-to-bottom-abs') && tab.classList.remove('pin-to-bottom-abs');
                } else if (!tabIsPinnedAbs && window.pageYOffset < tabYoffset) {
                    tab.classList.contains('pin-to-bottom') && tab.classList.remove('pin-to-bottom');
                }
            });
        }

        // the top of $containerColumns is out, and the bottom is in
        if (containerColumnsTopIsOut && containerColumnsBottomIsIn) {
            [...this.$tabs].map(tab => {
                !tab.classList.contains('pin-to-bottom-abs') && tab.classList.add('pin-to-bottom-abs');
            });
        }

        this.columnsRaf = window.requestAnimationFrame(this.rafCallback);
    },

    destroyRequestAnimationFrame() {
        console.log('destroyRequestAnimationFrame(): ', this.columnsRaf);
        window.cancelAnimationFrame(this.columnsRaf);
    },

    initMatchMedia() {
        const mql = [
            { rule: window.matchMedia("(max-width: 968px)"), screenMode: 'max968' },
            { rule: window.matchMedia("(min-width: 969px)"), screenMode: 'min969' }
        ];

        mql.forEach(mql => {
            if (mql.rule.matches) {
                this.screenMode = mql.screenMode;
            }

            mql.rule.addListener((e) => this.matchMediaChangeHandler(e, mql));
        });
    },

    matchMediaChangeHandler(e, mql) {
        if (e.matches) {
            this.screenMode = mql.screenMode;
            this.screenMode === 'min969' ? this.initRequestAnimationFrame() : this.destroyRequestAnimationFrame();
        }
    },

    updateContainerColumnsHeightMobile() {
        const activeCard = this.$containerColumns.querySelector('section.card.active');

        this.$containerColumns.style.height = activeCard.querySelector('.container__blcks').getBoundingClientRect().height + 80 + 'px';
    },

    updateColumnsContainerHeightDesktop() {
        const $highestTab = [...this.$tabs].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];

        this.$containerColumns.style.height = $highestTab.getBoundingClientRect().height + 'px';
    },

    displayOnClick() {
        let titles = Array.from(document.querySelectorAll('.navigation__mobile ul li'));

        titles.map(title => {
            title.addEventListener('click', (e) => {
                const { currentTarget } = e;

                let left;
                let indice = currentTarget.getAttribute('data-tabtitle');

                document.querySelector('section.active').classList.remove('active');
                document.querySelector('#tab' + indice).classList.add('active');
                document.querySelector('.navigation__mobile ul li.active').classList.remove('active');

                currentTarget.classList.add('active');

                switch (indice) {
                    case '0':
                        left = '0%';
                        break;
                    case '1':
                        left = '-100%';
                        break;
                    case '2':
                        left = '-200%';
                }

                gsap.to(".container__columns", .4, {
                    ease: 'power2',
                    left: left,
                    onStart: () => {
                        const headerHeight = document.querySelector('.site_header').getBoundingClientRect().height;
                        const delta = 15;

                        scrollToY({
                            el: document,
                            offset: document.querySelector(".wrapper__sneakers").offsetTop - headerHeight - delta,
                            duration: 400
                        });
                    },
                    onComplete: () => {
                        // console.log('seakers-nav.js - gsap -> onComplete');
                        this.updateContainerColumnsHeightMobile();
                    }
                });
            });
        });
    }
};