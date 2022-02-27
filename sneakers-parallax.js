// import Rellax from 'rellax';
// Importing a freezed version of Rellax with custom addition.
// See: vendors/rellax-1-12-1.js, search for "Custom comment"
import Rellax from '../../vendors/rellax-1-12-1.js';
import getRandomInt from '../helpers/getRandomInt';
import { eventEmitter } from "../helpers";

export default {
    init($el) {
        this.$el    = $el;
        this.rellax = null;
        
        // this.bindMethods();
        // this.addEvents();

        //Sets this.screenMode initial value
        this.initMatchMedia();

        this.duplicateMoonWalkingImage(4);

        this.screenMode === 'max968' ? this.initMobileParallaxes() : this.initDesktopParallaxes();
    },

    initMatchMedia() {
        const mql = [
            {rule: window.matchMedia("(max-width: 968px)"), screenMode: 'max968'},
            {rule: window.matchMedia("(min-width: 969px)"), screenMode: 'min969'}
        ];

        mql.forEach(mql => {
            if(mql.rule.matches){
                this.screenMode = mql.screenMode; 
            }

            mql.rule.addListener((e) => this.matchMediaChangeHandler(e, mql));
        });
    },

    bindMethods() {
        //
    },

    addEvents() {
        //
    },

    matchMediaChangeHandler(e, mql) {
        if(e.matches){
            this.screenMode = mql.screenMode;
            this.screenMode === 'max968' ? this.initMobileParallaxes() : this.initDesktopParallaxes();
        }
    },

    duplicateMoonWalkingImage(dupNumber) {
        const domImageWrapper = this.$el.querySelector('.container__moonwalking-img-wrapper');
        
        let i = 0;

        while (i < dupNumber) {
            const dupDomImageWrapper = domImageWrapper.cloneNode(true);

            dupDomImageWrapper.setAttribute('data-rellax-speed', getRandomInt(1, dupNumber + 1));
            domImageWrapper.insertAdjacentElement('afterend', dupDomImageWrapper);

            i++;
        }
    },

    initMobileParallaxes() {
        console.log('initMobileParallaxes()');
        this.rellax && this.rellax.destroy();

        this.rellax = new Rellax(this.$el.querySelectorAll('.rellax-pills'), {
            center: true
        });
    },

    initDesktopParallaxes() {
        console.log('initDesktopParallaxes()');
        this.rellax && this.rellax.destroy();

        this.rellax = new Rellax(this.$el.querySelectorAll('.rellax-pills'), {
            // wrapper:'.container__columns #tab0',
            center: true
        });
    }
};