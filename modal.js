// import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock/lib/bodyScrollLock.min.js';

export default class modal {
    constructor() {
        this.attributes = [
            {
                attr: 'class',
                value: 'component-modal hidden'
            },
            {
                attr: 'role',
                value: 'dialog'
            },
            {
                attr: 'aria-labelledby',
                value: 'test'
            }
        ];
        this.body = document.querySelector('body');

        this.handleCloseModal = (e) => {
            this.closeModal(e);
        };

        this.handleDestroyModal = (e) => {
            this.destroyModal(e);
        };

        this.handleKeyDown = (e) => {
            let activeElement = document.activeElement,
                focusable     = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
                { length }    = focusable,
                { key }   = e;
                
            //catch keyboardnavigation into popin
            if (e.shiftKey && key == 'Tab' && activeElement === focusable[0]) {
                focusable[length - 1].focus();
                e.preventDefault();

                return;

            } else if (key == 'Tab' && activeElement === focusable[length - 1]) {
                focusable[0].focus();
                e.preventDefault();

                return;
            }


            if (!activeElement || activeElement !== this.closeButton) {
                let pressEnterEvent = new CustomEvent('pressEnter', {
                    detail: {
                        keyPress: e.key
                    }
                });
                window.dispatchEvent(pressEnterEvent);

                return;
            }
            
            
            if ( e instanceof KeyboardEvent && e.key !== "Enter" ) return;

            this.handleCloseModal(e);
        };
    }

    buildModal(template, titleCloseButton, callback = false) {
        this.openingModalButton = document.activeElement;
        this.modal = document.createElement('div');
        this.attributes.map(attribute => this.modal.setAttribute(attribute.attr, attribute.value));
        this.modal.innerHTML = `
        <div role="document" class="component-wrapper">
            <button type="button" class="component-modal__close" title="${titleCloseButton}">
            <span aria-hidden="true"></span>
            <span class="a11y">Close button</span>
            </button>
            <h1 class="a11y" id="title_id">Title of the window</h1>
            ${template}
        </div>`;

        this.openModal(callback);

    }

    openModal(callback) {
        let header = document.querySelector('header');
        this.body.insertBefore(this.modal, header);
        
        this.closeButton = this.modal.querySelector('.component-modal__close');

        // _utils.lockScroll();
        disableBodyScroll();

        this.modal.classList.remove('hidden');

        this.closeButton.focus();
        this.closeButton.addEventListener('click', this.handleCloseModal);
        document.addEventListener('keydown', this.handleKeyDown);

        if (callback) {
            callback();
        }

        // event for the close btn of the modal to be able to handle keydown Enter
        // this.modal.querySelector(".maz-modal-close").addEventListener("keydown", (e) => {

        //     if ( e.key === "Enter" ) {
        //         e.target.click();
        //     }

        // });

    }

    closeModal(e) {
        // _utils.unlockScroll();
        enableBodyScroll();

        this.modal.addEventListener('transitionend', this.handleDestroyModal);

        this.closeButton.removeEventListener('click', this.handleCloseModal);

        document.removeEventListener('keydown', this.handleKeyDown);

        this.modal.classList.add('hidden');

        setTimeout(() => {
            // put back focus on the openingButton
            this.openingModalButton.focus();
        }, 0);
    }

    destroyModal() {
        this.modal.removeEventListener('transitionend', this.handleDestroyModal);
        this.modal.remove();
    }
}
