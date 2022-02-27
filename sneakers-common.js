import gsap from "gsap";
import scrollToY from '../helpers/scrollToY';
import isOutOfViewport from '../helpers/isOutOfViewport';
import { debounce } from "../helpers";

export default {
    init($el) {
        // window.scrollTo(0, 0);

        this.$el               = $el;
        this.$mainContainer    = document.getElementById('container');
        this.$mobileNavigation = document.querySelector('.navigation__mobile ul');
        this.$containerColumns = document.querySelector('.container__columns');
        this.$tabs             = this.$containerColumns.querySelectorAll('section.card');
        this.$allDropsWrapper  = document.getElementById('all-drops-wrapper');
        this.$contentCover     = document.querySelector('.contentCover');
        this.$siteHeader       = document.querySelector('.site_header');
        this.columnsRaf        = null;

        this.bindMethods();

        this.debouncedResizeHandler = debounce(this.resizeHandler, 250);

        this.addEvents();

        //Sets this.screenMode initial value
        this.initMatchMedia();

        if (this.screenMode === 'min969') {
            this.initRequestAnimationFrame();
            this.updateColumnsContainerHeightDesktop();
        }

        this.orderDropItems();

        this.waitForYtos()
            .then(() => {
                this.$el.addEventListener('click', this.ytosClickHandler);
            });

        window.setPinOffsets = this.setPinOffsets.bind(this);
    },

    bindMethods() {
        this.ytosClickHandler = this.ytosClickHandler.bind(this);
        this.scrollToHandler  = this.scrollToHandler.bind(this);
        this.resizeHandler    = this.resizeHandler.bind(this);
        this.rafCallback      = this.rafCallback.bind(this);
        this.loadHandler      = this.loadHandler.bind(this);
        this.mobileNavHandler = this.mobileNavHandler.bind(this);
    },

    addEvents() {
        this.$el.addEventListener('click', this.scrollToHandler);
        window.addEventListener('resize', this.debouncedResizeHandler);

        if (window.innerWidth > 968) {
            window.addEventListener('load', this.loadHandler);
        } else {
            this.$mobileNavigation.addEventListener('click', this.mobileNavHandler);
        }
    },

    loadHandler(e) {
        e && window.removeEventListener('load', this.loadHandler);

        this.updateColumnsContainerHeightDesktop();
        this.setPinOffsets();
    },

    resizeHandler(e) {
        console.log('sneakers-common.js ~ resizeHandler()');

        if (window.innerWidth > 968) {
            this.updateColumnsContainerHeightDesktop();
            this.setPinOffsets();
        } else {
            this.updateContainerColumnsHeightMobile();
            this.clearPinOffsets();
        }
    },

    matchMediaChangeHandler(e, mql) {
        if (e.matches) {
            this.screenMode = mql.screenMode;

            if (this.screenMode === 'min969') {
                this.initRequestAnimationFrame();
                this.$mobileNavigation.removeEventListener('click', this.mobileNavHandler);
                
            } else {
                this.destroyRequestAnimationFrame();
                this.$mobileNavigation.addEventListener('click', this.mobileNavHandler);
            }
        }
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

    getHighestTab() {
        return [...this.$tabs].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
   },

    getSmallestTabs() {
        const sortedArray = [...this.$tabs].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height);

        sortedArray.shift();

        return sortedArray;
    },

    setPinOffsets() {
        console.log('setPinOffsets(): ', this.getSmallestTabs());

        this.getSmallestTabs().map(tab => {
            const tabHeight          = tab.getBoundingClientRect().height;
            const contentCoverHeight = this.$contentCover.getBoundingClientRect().height;
            // const siteHeaderHeight   = this.$siteHeader.getBoundingClientRect().height;

            const delta                  = window.innerHeight - contentCoverHeight;
            const mainContainerTopMargin = 65 //value when the header is fixed and the body doesn't have the class .promotion_bar_open

            tab.setAttribute('data-pin-offset', Math.floor(tabHeight - delta + 65));
        });
    },

    clearPinOffsets() {
        this.getSmallestTabs().map(tab => tab.removeAttribute('data-pin-offset'));
    },

    updateContainerColumnsHeightMobile() {
        const activeCard = this.$containerColumns.querySelector('section.card.active');

        this.$containerColumns.style.height = activeCard.querySelector('.container__blcks').getBoundingClientRect().height + 80 + 'px';
    },

    updateColumnsContainerHeightDesktop(e) {
        const $highestTab = this.getHighestTab();

        this.$containerColumns.style.height = $highestTab.getBoundingClientRect().height + 'px';
    },

    initRequestAnimationFrame() {
        this.columnsRaf = window.requestAnimationFrame(this.rafCallback);
    },

    destroyRequestAnimationFrame() {
        console.log('destroyRequestAnimationFrame(): ', this.columnsRaf);
        window.cancelAnimationFrame(this.columnsRaf);
    },

    rafCallback() {
        const containerColumnsTopIsOut    = isOutOfViewport(this.$containerColumns).top;
        const containerColumnsBottomIsOut = isOutOfViewport(this.$containerColumns).bottom;
        const containerColumnsTopIsIn     = !containerColumnsTopIsOut;
        const containerColumnsBottomIsIn  = !containerColumnsBottomIsOut;

        if (containerColumnsTopIsIn) {
            this.getSmallestTabs().map(tab => {
                tab.classList.contains('pin-to-bottom') && tab.classList.remove('pin-to-bottom');
                tab.classList.contains('pin-to-bottom-abs') && tab.classList.remove('pin-to-bottom-abs');
            });
        }

        if (containerColumnsTopIsOut && containerColumnsBottomIsOut) {
            this.getSmallestTabs().map(tab => {
                // const tabBottomIsIn  = !isOutOfViewport(tab).bottom;
                // const tabIsPinned    = tab.classList.contains('pin-to-bottom');
                // const tabIsPinnedAbs = tab.classList.contains('pin-to-bottom-abs');
                const tabPinOffset   = tab.getAttribute('data-pin-offset');

                if (window.pageYOffset > tabPinOffset) {
                    !tab.classList.contains('pin-to-bottom') && tab.classList.add('pin-to-bottom');
                } else {
                    tab.classList.contains('pin-to-bottom') && tab.classList.remove('pin-to-bottom');
                }
            });
        }

        if (containerColumnsBottomIsIn) {
            this.getSmallestTabs().map(tab => {
                !tab.classList.contains('pin-to-bottom-abs') && tab.classList.add('pin-to-bottom-abs');
                !tab.classList.contains('pin-to-bottom') && tab.classList.add('pin-to-bottom');
            });
        } else {
            this.getSmallestTabs().map(tab => {
                tab.classList.contains('pin-to-bottom-abs') && tab.classList.remove('pin-to-bottom-abs');
            });
        }

        this.columnsRaf = window.requestAnimationFrame(this.rafCallback);
    },

    mobileNavHandler({target}) {
        console.log('mobileNavHandler(): ', target);
        const indice = target.getAttribute('data-tabtitle');

        if (!indice || target.classList.contains('active')) {
            console.log('RETURN');
            return;
        }

        let left;

        document.querySelector('section.active').classList.remove('active');
        document.querySelector('#tab' + indice).classList.add('active');
        document.querySelector('.navigation__mobile ul li.active').classList.remove('active');

        target.classList.add('active');

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
                const delta = 50;

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
    },

    waitForYtos() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (window.yTos && typeof window.yTos.notify === "function") {
                    clearInterval(interval);
                    resolve();
                }
            }, 250);
        });
    },

    scrollToHandler(e) {
        const scrollToId = e.target.getAttribute('data-scroll-to');

        if (!scrollToId) {
            return;
        }

        const elDistanceToTop = window.pageYOffset + document.querySelector(scrollToId).getBoundingClientRect().top;
        const headerHeight = document.querySelector('.site_header').getBoundingClientRect().height;

        let delta = 15;

        scrollToY({
            el: document,
            offset: elDistanceToTop - headerHeight - delta,
            duration: 400
        });
    },

    ytosClickHandler(e) {
        e.preventDefault();

        const ytosPid = e.target.getAttribute('data-ytos-pid');

        if (!ytosPid) {
            return;
        }

        window.yTos.notify(
            'Site::Mazarine::GetSingleItem', { code10: ytosPid }
        );

        console.warn("Call to yTos.notify - Site::Mazarine::GetSingleItem");
    },

    // current, upcoming, previous
    orderDropItems(lang) {
        lang = lang || 'gb';

        const $upcomingDrops = this.$allDropsWrapper.querySelectorAll('.container__upcoming-drop');

        console.log('upcomingDrops: ', $upcomingDrops);

        fetch(`/${lang}/balmain/datetime`)
            .then(response => response.json())
            .then(({ date: serverTimestamp }) => {
                // the date retrieved from the server is a UNIX timestamp (reasons in seconds)
                // A JavaScript date reasons in milliseconds.
                const currentServerDate = new Date(serverTimestamp * 1000);

                [...$upcomingDrops].map((drop, index) => {
                    const dropTimestamp   = parseInt(drop.getAttribute('data-release-date'), 10);
                    const dropReleaseDate = new Date(dropTimestamp * 1000);
                    const dropIsInThePast = (currentServerDate - dropReleaseDate) > 0;

                    // If the upcoming drop has a release date before the current server time:
                    // 1) put it at the top of the list
                    // 2) apply the correct class (container__upcoming-drop) and remove the other one (container__upcoming-drop)
                    // 3) keep the correct text content (remove the rest)
                    if (dropIsInThePast) {
                        console.log('Moving the drop to the top!');

                        drop.classList.add('container__current-drop');
                        drop.classList.remove('container__upcoming-drop');
                        drop.classList.add('was-upcoming-drop');

                        drop.setAttribute('data-drop-type', 'current');

                        const upcomingDropTexts          = drop.querySelector('.upcoming-drop-texts');
                        const upcomingDropImageLandscape = drop.querySelector('.drops__img--landscape');

                        upcomingDropTexts.parentNode.removeChild(upcomingDropTexts);
                        upcomingDropImageLandscape.parentNode.removeChild(upcomingDropImageLandscape);

                        this.$allDropsWrapper.insertAdjacentElement('afterbegin', drop);
                    } else {
                        // No treatment needed, the drop remains of type "upcoming"
                        // Just do some minor cleaning.
                        const currentDropTexts          = drop.querySelector('.current-drop-texts');
                        const upcomingDropImagePortrait = drop.querySelector('.drops__img--portrait');
                        const buttonUpcoming            = drop.querySelector('.drops__btn-small');

                        currentDropTexts.parentNode.removeChild(currentDropTexts);
                        upcomingDropImagePortrait.parentNode.removeChild(upcomingDropImagePortrait);
                        if (buttonUpcoming !== null) {
                            buttonUpcoming.parentNode.removeChild(buttonUpcoming);
                        }
                    }
                });
            });
    }
};